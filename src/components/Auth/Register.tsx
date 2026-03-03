import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface RegisterProps {
  onToggleMode: () => void
}

export function Register({ onToggleMode }: RegisterProps) {
  const { signUp } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
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
    setSuccess(false)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const { error } = await signUp(email, password, fullName)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => {
        onToggleMode()
      }, 2000)
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
              Create Account
            </CardTitle>
            <CardDescription className="text-center">
              Sign up to get started with {companyName}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

            {success && (
              <div className="rounded-[var(--radius-md)] p-3 bg-[var(--success)] bg-opacity-10 border border-[var(--success)] border-opacity-30 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[var(--success)] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[var(--success)]">
                  Account created successfully! Redirecting to login...
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || success} size="lg">
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>

            <div className="text-center text-sm">
              <span className="text-[var(--text-secondary)]">Already have an account? </span>
              <button
                type="button"
                onClick={onToggleMode}
                className="text-[var(--accent-violet)] font-medium hover:text-[var(--accent-magenta)] transition-micro hover:underline"
              >
                Sign in
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
