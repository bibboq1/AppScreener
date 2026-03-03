import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { SSOButtons } from './SSOButtons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

interface LoginProps {
  onToggleMode: () => void
}

export function Login({ onToggleMode }: LoginProps) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState('Smart Talent Matcher')

  useEffect(() => {
    loadCompanySettings()
  }, [])

  const loadCompanySettings = async () => {
    const { data } = await supabase
      .from('company_settings')
      .select('logo_url, company_name')
      .limit(1)
      .maybeSingle()

    if (data) {
      setCompanyLogo(data.logo_url)
      setCompanyName(data.company_name || 'Smart Talent Matcher')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)] px-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] opacity-30 pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[var(--accent-violet)] via-transparent to-transparent blur-[120px]" />
      </div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] opacity-20 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-tr from-[var(--accent-cyan)] via-transparent to-transparent blur-[100px]" />
      </div>

      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="space-y-4">
          {companyLogo && (
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] surface-2 p-3 flex items-center justify-center overflow-hidden">
                <img
                  src={companyLogo}
                  alt="Company logo"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          )}
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center bg-gradient-primary bg-clip-text text-transparent">
              {companyName}
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to your account to continue
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <SSOButtons />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[var(--border-subtle)]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[var(--surface-2)] px-2 text-[var(--text-muted)]">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

              {error && (
                <div className="rounded-[var(--radius-md)] p-3 bg-[var(--error)] bg-opacity-10 border border-[var(--error)] border-opacity-30 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-[var(--error)] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[var(--error)]">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading} size="lg">
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="text-center text-sm">
                <span className="text-[var(--text-secondary)]">Don't have an account? </span>
                <button
                  type="button"
                  onClick={onToggleMode}
                  className="text-[var(--accent-violet)] font-medium hover:text-[var(--accent-magenta)] transition-micro hover:underline"
                >
                  Sign up
                </button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
