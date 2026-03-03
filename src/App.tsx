import { useState } from 'react'
import { JobLibrary } from '@/components/JobLibrary'
import { CandidateInbox } from '@/components/CandidateInbox'
import { MatchMatrix } from '@/components/MatchMatrix'
import { CandidateDetail } from '@/components/CandidateDetail'
import { SimulateWebhook } from '@/components/SimulateWebhook'
import { type CandidateWithScores } from '@/lib/supabase'
import { Briefcase, Users, Grid3x3, Zap } from 'lucide-react'

type View = 'jobs' | 'inbox' | 'matrix' | 'simulate'

function App() {
  const [currentView, setCurrentView] = useState<View>('jobs')
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateWithScores | null>(null)

  const navigation = [
    { id: 'jobs' as View, name: 'Job Library', icon: Briefcase },
    { id: 'inbox' as View, name: 'Candidate Inbox', icon: Users },
    { id: 'matrix' as View, name: 'Match Matrix', icon: Grid3x3 },
    { id: 'simulate' as View, name: 'Simulate Webhook', icon: Zap },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Smart Talent Matcher</h1>
              <p className="text-sm text-slate-500">Intelligent candidate matching for BambooHR</p>
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

export default App
