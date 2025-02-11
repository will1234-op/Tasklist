import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'

export function SignOutButton() {
  const { signOut } = useAuth()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={signOut}
      className="h-9 w-9"
    >
      <LogOut className="h-4 w-4" />
      <span className="sr-only">Sign out</span>
    </Button>
  )
}
