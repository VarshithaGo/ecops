import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import keycloak from './keycloak'
import { LoginPage } from '../pages/LoginPage'

interface AuthState {
  loading: boolean
  authenticated: boolean
  token: string | undefined
  userId: string | undefined
  username: string
  roles: string[]
  logout: () => void
}

const AuthContext = createContext<AuthState>({
  loading: true,
  authenticated: false,
  token: undefined,
  userId: undefined,
  username: '',
  roles: [],
  logout: () => {},
})

const C = { angst: '#0A0A0A', bark: '#33312F', charcoal: '#726E68', ashes: '#B7B4AE' }

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', background: C.angst,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ fontSize: 36, fontWeight: 800, color: C.ashes, letterSpacing: '-0.02em' }}>e-Cops</div>
      <div style={{ width: 32, height: 2, background: C.bark, borderRadius: 2 }} />
      <div style={{ fontSize: 11, color: C.charcoal, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
        Connecting…
      </div>
    </div>
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialized = useRef(false)
  const [state, setState] = useState<Omit<AuthState, 'logout'>>({
    loading: true,
    authenticated: false,
    token: undefined,
    userId: undefined,
    username: '',
    roles: [],
  })

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    keycloak
      .init({ onLoad: 'check-sso', pkceMethod: 'S256', checkLoginIframe: false })
      .then((authenticated) => {
        const parsed = keycloak.tokenParsed as Record<string, unknown>
        const roles: string[] = (parsed?.realm_access as { roles?: string[] })?.roles ?? []
        const username = (parsed?.preferred_username as string) ?? ''
        setState({ loading: false, authenticated, token: keycloak.token, userId: keycloak.subject, username, roles })
      })
      .catch((err) => {
        console.error('Keycloak init failed:', err)
        setState((prev) => ({ ...prev, loading: false }))
      })

    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).then(() => {
        setState((prev) => ({ ...prev, token: keycloak.token }))
      })
    }
  }, [])

  if (state.loading) return <LoadingScreen />
  if (!state.authenticated) return <LoginPage />

  return (
    <AuthContext.Provider value={{ ...state, logout: () => keycloak.logout() }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
