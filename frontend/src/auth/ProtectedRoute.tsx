import { useAuth } from './AuthProvider'
import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

interface Props {
  children: ReactNode
  roles: string[]
}

export function ProtectedRoute({ children, roles }: Props) {
  const { loading, authenticated, roles: userRoles } = useAuth()

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>

  if (!authenticated) return null

  // If the user's role can't access this route (e.g. landed here after
  // re-login), send them to their home dashboard rather than a dead end.
  if (roles.length > 0 && !roles.some((r) => userRoles.includes(r))) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
