import { type CandidateWithScores } from '@/lib/supabase'
import { getScoreColor } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, CheckCircle2, XCircle, TrendingUp, User, Mail, FileText } from 'lucide-react'

interface CandidateDetailProps {
  candidate: CandidateWithScores | null
  onClose: () => void
}

export function CandidateDetail({ candidate, onClose }: CandidateDetailProps) {
  if (!candidate) return null

  const primaryScore = candidate.match_scores?.find(s => s.is_primary)
  const alternativeMatches = candidate.match_scores
    ?.filter(s => !s.is_primary)
    .sort((a, b) => b.score - a.score) || []

  const parseProsConsFromReasoning = (reasoning: string) => {
    const lines = reasoning.split('\n').filter(l => l.trim())
    const pros: string[] = []
    const cons: string[] = []
    let currentSection: 'pros' | 'cons' | null = null

    lines.forEach(line => {
      const lower = line.toLowerCase()
      if (lower.includes('pros') || lower.includes('strengths') || lower.includes('strong')) {
        currentSection = 'pros'
      } else if (lower.includes('cons') || lower.includes('weaknesses') || lower.includes('gaps')) {
        currentSection = 'cons'
      } else if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
        const text = line.replace(/^[-•]\s*/, '').trim()
        if (currentSection === 'pros') pros.push(text)
        else if (currentSection === 'cons') cons.push(text)
      }
    })

    if (pros.length === 0 && cons.length === 0) {
      const sentences = reasoning.split(/[.!?]/).filter(s => s.trim())
      return {
        pros: sentences.slice(0, Math.ceil(sentences.length / 2)).map(s => s.trim()),
        cons: sentences.slice(Math.ceil(sentences.length / 2)).map(s => s.trim())
      }
    }

    return { pros, cons }
  }

  const primaryAnalysis = primaryScore ? parseProsConsFromReasoning(primaryScore.reasoning) : { pros: [], cons: [] }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="ml-auto relative z-50 w-full max-w-2xl bg-white shadow-2xl overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{candidate.name}</h2>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Mail className="h-3 w-3" />
                {candidate.email}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Primary Role Match</span>
                {primaryScore && (
                  <span className={`text-3xl font-bold ${getScoreColor(primaryScore.score)}`}>
                    {primaryScore.score}
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                {candidate.primary_job?.title || 'No primary role assigned'}
                {candidate.primary_job && (
                  <Badge variant="secondary" className="ml-2">
                    {candidate.primary_job.department}
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            {primaryScore && (
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-slate-700 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {primaryAnalysis.pros.length > 0 ? (
                      primaryAnalysis.pros.map((pro, idx) => (
                        <li key={idx} className="text-sm text-slate-600 pl-6 relative">
                          <span className="absolute left-0 top-1 w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          {pro}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-slate-600 pl-6 relative">
                        <span className="absolute left-0 top-1 w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        {primaryScore.reasoning}
                      </li>
                    )}
                  </ul>
                </div>

                {primaryAnalysis.cons.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-slate-700 mb-2 flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      Areas of Concern
                    </h4>
                    <ul className="space-y-1">
                      {primaryAnalysis.cons.map((con, idx) => (
                        <li key={idx} className="text-sm text-slate-600 pl-6 relative">
                          <span className="absolute left-0 top-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {alternativeMatches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Alternative Role Matches
                </CardTitle>
                <CardDescription>
                  Other positions where this candidate might excel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alternativeMatches.map((match) => (
                    <div
                      key={match.id}
                      className="border border-slate-200 rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">
                            {match.job_descriptions?.title || 'Unknown Role'}
                          </h4>
                        </div>
                        <span className={`text-2xl font-bold ${getScoreColor(match.score)}`}>
                          {match.score}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {match.reasoning}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                  {candidate.resume_text}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>BambooHR Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">BambooHR ID:</span>
                  <span className="font-medium">{candidate.bamboohr_id || 'Not synced'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Sync Status:</span>
                  <Badge variant={candidate.status === 'synced' ? 'default' : 'secondary'}>
                    {candidate.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
