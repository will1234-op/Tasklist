import { type ReactNode } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { LoginPage } from './login-page'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth()

  if (!user) {
    return <LoginPage />
  }

  return <>{children}</>
}
