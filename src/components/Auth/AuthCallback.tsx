import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export function AuthCallback() {
  const { user, profile } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Completing sign in...')

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user && profile) {
        setStatus('success')
        setMessage('Successfully signed in! Redirecting...')
        setTimeout(() => {
          window.location.href = '/'
        }, 1500)
      } else if (!user) {
        setStatus('error')
        setMessage('Authentication failed. Please try again.')
        setTimeout(() => {
          window.location.href = '/login'
        }, 3000)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [user, profile])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)] px-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] opacity-30 pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[var(--accent-violet)] via-transparent to-transparent blur-[120px]" />
      </div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] opacity-20 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-tr from-[var(--accent-cyan)] via-transparent to-transparent blur-[100px]" />
      </div>

      <Card className="w-full max-w-md relative z-10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {status === 'loading' && 'Processing...'}
            {status === 'success' && 'Welcome!'}
            {status === 'error' && 'Error'}
          </CardTitle>
          <CardDescription className="text-center">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            {status === 'loading' && (
              <Loader2 className="h-12 w-12 text-[var(--accent-violet)] animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="h-12 w-12 text-[var(--success)]" />
            )}
            {status === 'error' && (
              <AlertCircle className="h-12 w-12 text-[var(--error)]" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
