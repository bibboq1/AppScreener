import { useState } from 'react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Login } from '@/components/Auth/Login'
import { Register } from '@/components/Auth/Register'
import { JobLibrary } from '@/components/JobLibrary'
import { CandidateInbox } from '@/components/CandidateInbox'
import { MatchMatrix } from '@/components/MatchMatrix'
import { CandidateDetail } from '@/components/CandidateDetail'
import { SimulateWebhook } from '@/components/SimulateWebhook'
import { Connections } from '@/components/Connections'
import { UserManagement } from '@/components/UserManagement'
import { type CandidateWithScores } from '@/lib/supabase'
import { Briefcase, Users, Grid3x3, Zap, Settings, UsersRound, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type View = 'jobs' | 'inbox' | 'matrix' | 'simulate' | 'connections' | 'users'

function Dashboard() {
  const { profile, signOut } = useAuth()
  const [currentView, setCurrentView] = useState<View>('jobs')
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateWithScores | null>(null)

  const allNavigation = [
    { id: 'jobs' as View, name: 'Job Library', icon: Briefcase, roles: ['admin', 'recruiter', 'hiring_manager'] },
    { id: 'inbox' as View, name: 'Candidate Inbox', icon: Users, roles: ['admin', 'recruiter', 'hiring_manager'] },
    { id: 'matrix' as View, name: 'Match Matrix', icon: Grid3x3, roles: ['admin', 'recruiter', 'hiring_manager'] },
    { id: 'simulate' as View, name: 'Simulate Webhook', icon: Zap, roles: ['admin', 'recruiter'] },
    { id: 'users' as View, name: 'User Management', icon: UsersRound, roles: ['admin'] },
    { id: 'connections' as View, name: 'Connections', icon: Settings, roles: ['admin'] },
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
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Smart Talent Matcher Dashboard</h1>
              <p className="text-sm text-slate-500">Intelligent candidate matching for BambooHR</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-500" />
                    <p className="text-sm font-medium text-slate-900">{profile?.full_name}</p>
                  </div>
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
          <nav className="flex space-x-1 mt-4">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                    isActive
                      ? 'bg-slate-50 text-slate-900 border-b-2 border-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'jobs' && <JobLibrary />}
        {currentView === 'inbox' && (
          <CandidateInbox onSelectCandidate={setSelectedCandidate} />
        )}
        {currentView === 'matrix' && <MatchMatrix />}
        {currentView === 'simulate' && <SimulateWebhook />}
        {currentView === 'users' && <UserManagement />}
        {currentView === 'connections' && <Connections />}
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    )
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
