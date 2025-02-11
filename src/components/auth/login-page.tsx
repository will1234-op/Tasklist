import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'

export function LoginPage() {
  const { signInWithGoogle } = useAuth()

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-background">
      <div className="w-full max-w-sm space-y-6 p-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">
            Sign in to manage your tasks
          </p>
        </div>
        <Button
          className="w-full"
          onClick={signInWithGoogle}
        >
          Continue with Google
        </Button>
      </div>
    </div>
  )
}
