import { useAuth } from '@/contexts/auth-context'

export function AuthButton() {
  const { user, signInWithGoogle, signOut } = useAuth()

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <div className="flex items-center gap-4">
          <img
            src={user.photoURL || ''}
            alt={user.displayName || 'User'}
            className="w-8 h-8 rounded-full"
          />
          <button
            onClick={() => signOut()}
            className="text-sm px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={() => signInWithGoogle()}
          className="text-sm px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Sign In with Google
        </button>
      )}
    </div>
  )
}
