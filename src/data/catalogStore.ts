import { useSyncExternalStore } from 'react'
import { getBackend, HAS_FIREBASE, type Backend } from '../services/backend'
import {
  BUILT_IN_CATEGORIES,
  sortCategories,
  sortProducts,
  STARTER_PRODUCTS,
  type CategoryRecord,
  type CustomCategoryInput,
  type Product,
} from './product'

export interface ProductsSnapshot {
  products: Product[]
  byId: Record<string, Product>
  loaded: boolean
  error: (Error & { code?: string }) | null
}

export interface CategoriesSnapshot {
  categories: CategoryRecord[]
  byId: Record<string, CategoryRecord>
  loaded: boolean
  error: (Error & { code?: string }) | null
}

function readCachedArray<T>(key: string): T[] | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? 'null')
    return Array.isArray(parsed) ? (parsed as T[]) : null
  } catch {
    return null
  }
}

function writeCachedArray(key: string, items: unknown[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items))
  } catch {
    // Ignore cache quota errors
  }
}

function createLiveStore<TRaw, TState extends { loaded: boolean; error: unknown }>(
  buildState: (raw: TRaw[], loaded: boolean) => TState,
  initialItems: TRaw[],
  subscribeFn: (
    backend: Backend,
    onData: (items: TRaw[]) => void,
    onError: (err: Error & { code?: string }) => void,
  ) => () => void,
  onPersist?: (items: TRaw[]) => void,
) {
  let state = buildState(initialItems, false)
  const listeners = new Set<() => void>()
  let teardown: (() => void) | null = null

  const publish = (next: TState) => {
    state = next
    listeners.forEach((fn) => fn())
  }

  const connect = () => {
    let active = true
    let unsub = () => {}

    getBackend().then((backend) => {
      if (active) {
        unsub = subscribeFn(
          backend,
          (items) => {
            onPersist?.(items)
            publish(buildState(items, true))
          },
          (err) => publish({ ...state, loaded: true, error: err }),
        )
      }
    })

    teardown = () => {
      active = false
      unsub()
      teardown = null
    }
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener)
      if (!teardown) connect()
      return () => {
        listeners.delete(listener)
        if (!listeners.size) teardown?.()
      }
    },
    get: () => state,
  }
}

const CATALOG_CACHE_KEY = 'kvist:catalog'

function buildProductsState(raw: Product[], loaded: boolean): ProductsSnapshot {
  const products = sortProducts(raw)
  return {
    products,
    byId: Object.fromEntries(products.map((p) => [p.id, p])),
    loaded,
    error: null,
  }
}

const isBrowser = typeof window !== 'undefined'

const publicCatalogStore = createLiveStore<Product, ProductsSnapshot>(
  buildProductsState,
  isBrowser
    ? (readCachedArray<Product>(CATALOG_CACHE_KEY) ?? (HAS_FIREBASE ? [] : STARTER_PRODUCTS))
    : [],
  (backend, onData, onError) =>
    backend.subscribeProducts({ includeDrafts: false }, onData, onError),
  (items) => writeCachedArray(CATALOG_CACHE_KEY, items),
)

const adminCatalogStore = createLiveStore<Product, ProductsSnapshot>(
  buildProductsState,
  [],
  (backend, onData, onError) => backend.subscribeProducts({ includeDrafts: true }, onData, onError),
)

export function useCatalog(): ProductsSnapshot {
  return useSyncExternalStore(
    publicCatalogStore.subscribe,
    publicCatalogStore.get,
    publicCatalogStore.get,
  )
}

export function useAdminCatalog(): ProductsSnapshot {
  return useSyncExternalStore(
    adminCatalogStore.subscribe,
    adminCatalogStore.get,
    adminCatalogStore.get,
  )
}

const CATEGORIES_CACHE_KEY = 'kvist:categories-cache'

function buildCategoriesState(raw: CustomCategoryInput[], loaded: boolean): CategoriesSnapshot {
  const categories: CategoryRecord[] = [
    ...BUILT_IN_CATEGORIES,
    ...sortCategories(raw).map((c) => ({ ...c, builtIn: false })),
  ]
  return {
    categories,
    byId: Object.fromEntries(categories.map((c) => [c.id, c])),
    loaded,
    error: null,
  }
}

const categoriesStore = createLiveStore<CustomCategoryInput, CategoriesSnapshot>(
  buildCategoriesState,
  isBrowser ? (readCachedArray<CustomCategoryInput>(CATEGORIES_CACHE_KEY) ?? []) : [],
  (backend, onData, onError) => backend.subscribeCategories(onData, onError),
  (items) => writeCachedArray(CATEGORIES_CACHE_KEY, items),
)

export function useCategories(): CategoriesSnapshot {
  return useSyncExternalStore(categoriesStore.subscribe, categoriesStore.get, categoriesStore.get)
}
