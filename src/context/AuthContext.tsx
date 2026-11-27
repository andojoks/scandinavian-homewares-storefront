import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getBackend, type AuthUser } from '../services/backend'

export interface AuthContextValue {
  user: AuthUser | null
  role: 'admin' | null
  loading: boolean
  mode: 'demo' | 'firebase' | null
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (input: { name: string; email: string; password: string }) => Promise<void>
  signInWithGoogle: () => Promise<void>
  demoSignIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    user: AuthUser | null
    role: 'admin' | null
    loading: boolean
    mode: 'demo' | 'firebase' | null
  }>({
    user: null,
    role: null,
    loading: true,
    mode: null,
  })

  useEffect(() => {
    let unsub = () => {}
    let active = true

    getBackend().then((backend) => {
      if (active) {
        setState((prev) => ({ ...prev, mode: backend.mode }))
        unsub = backend.onAuthChange(({ user, role }) =>
          setState({ user, role, loading: false, mode: backend.mode }),
        )
      }
    })

    return () => {
      active = false
      unsub()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const backend = await getBackend()
    await backend.signIn(email, password)
  }, [])

  const signUp = useCallback(async (input: { name: string; email: string; password: string }) => {
    const backend = await getBackend()
    await backend.signUp(input)
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const backend = await getBackend()
    if (backend.signInWithGoogle) {
      await backend.signInWithGoogle()
    }
  }, [])

  const demoSignIn = useCallback(async () => {
    const backend = await getBackend()
    await backend.demoSignIn()
  }, [])

  const signOut = useCallback(async () => {
    const backend = await getBackend()
    await backend.signOut()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAdmin: state.role === 'admin',
      signIn,
      signUp,
      signInWithGoogle,
      demoSignIn,
      signOut,
    }),
    [state, signIn, signUp, signInWithGoogle, demoSignIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
