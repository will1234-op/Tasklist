import { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { AuthButton } from '@/components/auth/auth-button'

interface RootLayoutProps {
  children: React.ReactNode
}

export function RootLayout({ children }: RootLayoutProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <div className="mr-4 flex">
              <a className="mr-6 flex items-center space-x-2" href="/">
                <span className="font-bold sm:inline-block">
                  Task Management
                </span>
              </a>
            </div>
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
              <AuthButton />
              <nav className="flex items-center">
                <button
                  onClick={toggleTheme}
                  className="w-9 px-0 hover:bg-accent hover:text-accent-foreground"
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
              </nav>
            </div>
          </div>
        </header>
        <main className="container py-6">
          {children}
        </main>
      </div>
    </DndProvider>
  )
}
