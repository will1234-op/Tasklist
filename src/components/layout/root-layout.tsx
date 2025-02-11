import { useTheme } from '@/contexts/theme-context'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { useAuth } from '@/contexts/auth-context'

interface RootLayoutProps {
  children: React.ReactNode
}

export function RootLayout({ children }: RootLayoutProps) {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()

  return (
    <div className={theme}>
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <div className="flex items-center gap-4">
              <a className="flex items-center space-x-2" href="/">
                <span className="font-bold">Task Board</span>
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
              {user && <SignOutButton />}
            </div>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  )
}
