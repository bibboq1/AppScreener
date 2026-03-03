import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export function SSOButtons() {
  const { signInWithOAuth } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleOAuthSignIn = async (provider: 'google' | 'azure') => {
    setLoading(provider)
    setError(null)

    try {
      const { error } = await signInWithOAuth(provider)

      if (error) {
        if (error.message.includes('not enabled')) {
          setError(
            `${provider === 'google' ? 'Google' : 'BambooHR'} sign-in is not configured yet. Please configure it in the Supabase Dashboard or use email/password to sign in.`
          )
        } else {
          setError(error.message)
        }
        setLoading(null)
      }
    } catch (err) {
      setError(
        `${provider === 'google' ? 'Google' : 'BambooHR'} sign-in is not configured. Please use email/password to sign in.`
      )
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        size="lg"
        onClick={() => handleOAuthSignIn('google')}
        disabled={loading !== null}
      >
        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {loading === 'google' ? 'Connecting...' : 'Continue with Google'}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        size="lg"
        onClick={() => handleOAuthSignIn('azure')}
        disabled={loading !== null}
      >
        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none">
          <path d="M3 3h9v9H3V3z" fill="#F25022" />
          <path d="M13.5 3h9v9h-9V3z" fill="#7FBA00" />
          <path d="M3 13.5h9v9H3v-9z" fill="#00A4EF" />
          <path d="M13.5 13.5h9v9h-9v-9z" fill="#FFB900" />
        </svg>
        {loading === 'azure' ? 'Connecting...' : 'Continue with BambooHR'}
      </Button>

      {error && (
        <div className="rounded-[var(--radius-md)] p-3 bg-[var(--error)] bg-opacity-10 border border-[var(--error)] border-opacity-30 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-[var(--error)] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--error)]">{error}</p>
        </div>
      )}
    </div>
  )
}
