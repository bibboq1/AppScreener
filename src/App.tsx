import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Login } from '@/components/Auth/Login'
import { Register } from '@/components/Auth/Register'
import { AuthCallback } from '@/components/Auth/AuthCallback'
import { JobLibrary } from '@/components/JobLibrary'
import { CandidateInbox } from '@/components/CandidateInbox'
import { MatchMatrix } from '@/components/MatchMatrix'
import { CandidateDetail } from '@/components/CandidateDetail'
import { SimulateWebhook } from '@/components/SimulateWebhook'
import { Connections } from '@/components/Connections'
import { UserManagement } from '@/components/UserManagement'
import { CompanySettings } from '@/components/CompanySettings'
import { type CandidateWithScores, supabase } from '@/lib/supabase'
import { Briefcase, Users, Grid3x3, Zap, Settings, UsersRound, LogOut, User, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type View = 'jobs' | 'inbox' | 'matrix' | 'simulate' | 'connections' | 'users' | 'company'

function Dashboard() {
  const { profile, signOut } = useAuth()
  const [currentView, setCurrentView] = useState<View>('jobs')
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateWithScores | null>(null)
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

  const allNavigation = [
    { id: 'jobs' as View, name: 'Job Library', icon: Briefcase, roles: ['admin', 'recruiter', 'hiring_manager'] },
    { id: 'inbox' as View, name: 'Candidate Inbox', icon: Users, roles: ['admin', 'recruiter', 'hiring_manager'] },
    { id: 'matrix' as View, name: 'Match Matrix', icon: Grid3x3, roles: ['admin', 'recruiter', 'hiring_manager'] },
    { id: 'simulate' as View, name: 'Simulate Webhook', icon: Zap, roles: ['admin', 'recruiter'] },
    { id: 'users' as View, name: 'User Management', icon: UsersRound, roles: ['admin'] },
    { id: 'connections' as View, name: 'Connections', icon: Settings, roles: ['admin'] },
    { id: 'company' as View, name: 'Company Settings', icon: Building2, roles: ['admin'] },
  ]

  const navigation = allNavigation.filter(item =>
    profile?.role && item.roles.includes(profile.role)
  )

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-slate-900 text-white'
      case 'recruiter':
        return 'bg-blue-600 text-white'
      case 'hiring_manager':
        return 'bg-green-600 text-white'
      default:
        return 'bg-slate-500 text-white'
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] opacity-30 pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[var(--accent-violet)] via-transparent to-transparent blur-[120px]" />
      </div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] opacity-20 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-tr from-[var(--accent-cyan)] via-transparent to-transparent blur-[100px]" />
      </div>

      <header className="surface-2 border-b border-[var(--border-subtle)] sticky top-0 z-40 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 gap-4">
            <div className="flex items-center gap-3">
              {companyLogo && (
                <div className="w-10 h-10 rounded-[var(--radius-md)] border border-[var(--border-subtle)] surface-1 p-1.5 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    src={companyLogo}
                    alt="Company logo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{companyName}</h1>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">Intelligent candidate matching for BambooHR</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 surface-1 px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)]">
                <User className="h-4 w-4 text-[var(--accent-violet)]" />
                <div className="text-left">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{profile?.full_name}</p>
                  <Badge className={`text-xs mt-1 ${getRoleBadgeColor(profile?.role || '')}`}>
                    {profile?.role?.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
          <nav className="flex space-x-2 mt-4 overflow-x-auto pb-px">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-[var(--radius-md)] transition-smooth whitespace-nowrap ${
                    isActive
                      ? 'surface-1 text-[var(--text-primary)] border-b-2 border-[var(--accent-violet)] glow-violet'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-1)] hover:bg-opacity-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {currentView === 'jobs' && <JobLibrary />}
        {currentView === 'inbox' && (
          <CandidateInbox onSelectCandidate={setSelectedCandidate} />
        )}
        {currentView === 'matrix' && <MatchMatrix />}
        {currentView === 'simulate' && <SimulateWebhook />}
        {currentView === 'users' && <UserManagement />}
        {currentView === 'connections' && <Connections />}
        {currentView === 'company' && <CompanySettings />}
      </main>

      {selectedCandidate && (
        <CandidateDetail
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  )
}

function AuthFlow() {
  const { user, loading } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [isCallback, setIsCallback] = useState(false)

  useEffect(() => {
    if (window.location.pathname === '/auth/callback') {
      setIsCallback(true)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-violet)] mx-auto glow-violet"></div>
          <p className="mt-4 text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    )
  }

  if (isCallback) {
    return <AuthCallback />
  }

  if (!user) {
    return isLogin ? (
      <Login onToggleMode={() => setIsLogin(false)} />
    ) : (
      <Register onToggleMode={() => setIsLogin(true)} />
    )
  }

  return <Dashboard />
}

function App() {
  return (
    <AuthProvider>
      <AuthFlow />
    </AuthProvider>
  )
}

export default App
