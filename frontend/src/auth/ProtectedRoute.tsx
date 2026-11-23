import { useAuth } from './AuthProvider'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  roles: string[]
}

export function ProtectedRoute({ children, roles }: Props) {
  const { loading, authenticated, roles: userRoles } = useAuth()

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>

  if (!authenticated) return null

  if (roles.length > 0 && !roles.some((r) => userRoles.includes(r))) {
    return <div style={{ padding: 32 }}>Access denied: insufficient role.</div>
  }

  return <>{children}</>
}
