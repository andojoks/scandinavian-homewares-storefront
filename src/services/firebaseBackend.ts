import { initializeApp } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
} from 'firebase/auth'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'
import type { Order } from '../data/generate'
import {
  BUILT_IN_CATEGORY_IDS,
  STARTER_PRODUCTS,
  type CustomCategoryInput,
  type Product,
} from '../data/product'
import { resizeImageToWebp } from '../lib/image'
import { createOrderNumber, type Backend } from './backend'

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
})

const auth = getAuth(app)
const db = getFirestore(app)
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
const storage = storageBucket ? getStorage(app) : null

const codedError = (code: string) => Object.assign(new Error(code), { code })

export const backend: Backend = {
  mode: 'firebase',

  onAuthChange(cb) {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        cb({ user: null, role: null })
        return
      }
      let role: 'admin' | null = null
      try {
        const snap = await getDoc(doc(db, 'users', fbUser.uid))
        if (snap.exists() && snap.data()?.role === 'admin') {
          role = 'admin'
        }
      } catch {
        // Ignore profile lookup errors
      }
      cb({
        user: {
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Customer',
          email: fbUser.email || '',
        },
        role,
      })
    })
  },

  async signIn(email, password) {
    await signInWithEmailAndPassword(auth, email.trim(), password)
  },

  async signUp({ name, email, password }) {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
    await updateProfile(cred.user, { displayName: name.trim() })
    await setDoc(doc(db, 'users', cred.user.uid), {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      createdAt: Date.now(),
    })
  },

  async signInWithGoogle() {
    const provider = new GoogleAuthProvider()
    const cred = await signInWithPopup(auth, provider)
    const userDoc = doc(db, 'users', cred.user.uid)
    const snap = await getDoc(userDoc)
    if (!snap.exists()) {
      await setDoc(userDoc, {
        name: cred.user.displayName || 'Customer',
        email: cred.user.email || '',
        createdAt: Date.now(),
      })
    }
  },

  async demoSignIn() {
    throw codedError('auth/invalid-login')
  },

  async signOut() {
    await fbSignOut(auth)
  },

  async placeOrder({ user, items, total, shipping }) {
    const payload: Omit<Order, 'id'> = {
      number: createOrderNumber(),
      uid: user.uid,
      customer: shipping.name || user.name,
      email: user.email,
      city: shipping.city,
      address: shipping.address,
      delivery: shipping.delivery,
      payment: shipping.payment,
      items,
      itemCount: items.reduce((sum, i) => sum + i.qty, 0),
      total,
      status: 'paid',
      createdAt: Date.now(),
    }
    const docRef = await addDoc(collection(db, 'orders'), payload)
    return { id: docRef.id, ...payload }
  },

  subscribeOrders({ uid } = {}, onData, onError) {
    const base = collection(db, 'orders')
    const q = uid
      ? query(base, where('uid', '==', uid), orderBy('createdAt', 'desc'))
      : query(base, orderBy('createdAt', 'desc'))
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }))
        onData(list)
      },
      (err) => onError?.(err),
    )
  },

  async subscribe(email) {
    const normalized = email.trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(normalized)) throw codedError('auth/invalid-email')
    await setDoc(doc(db, 'subscribers', normalized), {
      email: normalized,
      createdAt: Date.now(),
    })
  },

  async updateOrderStatus(orderId, status) {
    await updateDoc(doc(db, 'orders', orderId), { status })
  },

  subscribeProducts({ includeDrafts = false } = {}, onData, onError) {
    const base = collection(db, 'products')
    const q = includeDrafts ? query(base) : query(base, where('status', '==', 'active'))
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }))
        onData(list)
      },
      (err) => onError?.(err),
    )
  },

  async createProduct(product) {
    const refDoc = doc(db, 'products', product.id)
    const existing = await getDoc(refDoc)
    if (existing.exists()) throw codedError('product/exists')
    await setDoc(refDoc, { ...product, updatedAt: Date.now() })
  },

  async updateProduct(id, patch) {
    await updateDoc(doc(db, 'products', id), { ...patch, updatedAt: Date.now() })
  },

  async deleteProduct(id) {
    await deleteDoc(doc(db, 'products', id))
  },

  async importStarterCatalog() {
    const batch = writeBatch(db)
    for (const product of STARTER_PRODUCTS) {
      batch.set(doc(db, 'products', product.id), { ...product, updatedAt: Date.now() })
    }
    await batch.commit()
  },

  subscribeCategories(onData, onError) {
    return onSnapshot(
      collection(db, 'categories'),
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CustomCategoryInput, 'id'>),
        }))
        onData(list)
      },
      (err) => onError?.(err),
    )
  },

  async createCategory(category) {
    if (BUILT_IN_CATEGORY_IDS.includes(category.id)) throw codedError('category/exists')
    const refDoc = doc(db, 'categories', category.id)
    const snap = await getDoc(refDoc)
    if (snap.exists()) throw codedError('category/exists')
    await setDoc(refDoc, { ...category, updatedAt: Date.now() })
  },

  async renameCategory(id, name) {
    await updateDoc(doc(db, 'categories', id), { name, updatedAt: Date.now() })
  },

  async deleteCategory(id, moveToCategoryId) {
    if (BUILT_IN_CATEGORY_IDS.includes(id)) throw codedError('permission-denied')
    const usedSnap = await getDocs(query(collection(db, 'products'), where('category', '==', id)))
    const batch = writeBatch(db)
    if (!usedSnap.empty) {
      if (!moveToCategoryId || moveToCategoryId === id) throw codedError('category/in-use')
      usedSnap.docs.forEach((d) => {
        batch.update(d.ref, { category: moveToCategoryId, updatedAt: Date.now() })
      })
    }
    batch.delete(doc(db, 'categories', id))
    await batch.commit()
  },

  async uploadProductImage(file) {
    if (!storage) throw codedError('no-bucket')
    const blob = await resizeImageToWebp(file, 1000, 0.86)
    const storageRef = ref(storage, `products/${crypto.randomUUID()}.webp`)
    await uploadBytes(storageRef, blob, { contentType: 'image/webp' })
    return getDownloadURL(storageRef)
  },
}
