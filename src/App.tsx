import { AuthProvider } from './contexts/auth-context'
import { ThemeProvider } from './contexts/theme-context'
import { RootLayout } from './components/layout/root-layout'
import { ProtectedRoute } from './components/auth/protected-route'
import { Board } from './components/board/board'

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootLayout>
          <ProtectedRoute>
            <Board />
          </ProtectedRoute>
        </RootLayout>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
