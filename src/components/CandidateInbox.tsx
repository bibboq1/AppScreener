import { useState, useEffect } from 'react'
import { supabase, type CandidateWithScores } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { getScoreColor, getScoreBadgeColor } from '@/lib/utils'
import { Users, TrendingUp } from 'lucide-react'

interface CandidateInboxProps {
  onSelectCandidate: (candidate: CandidateWithScores) => void
}

export function CandidateInbox({ onSelectCandidate }: CandidateInboxProps) {
  const [candidates, setCandidates] = useState<CandidateWithScores[]>([])
  const [filteredCandidates, setFilteredCandidates] = useState<CandidateWithScores[]>([])
  const [minScore, setMinScore] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [jobs, setJobs] = useState<Array<{ id: string; title: string }>>([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [candidates, minScore, roleFilter])

  const loadData = async () => {
    const [candidatesResult, jobsResult] = await Promise.all([
      supabase
        .from('candidates')
        .select(`
          *,
          primary_job:job_descriptions!candidates_primary_job_id_fkey(id, title, department),
          match_scores(
            *,
            job_descriptions(id, title)
          )
        `)
        .order('created_at', { ascending: false }),
      supabase
        .from('job_descriptions')
        .select('id, title')
        .eq('is_active', true)
    ])

    if (candidatesResult.data) {
      setCandidates(candidatesResult.data as CandidateWithScores[])
    }

    if (jobsResult.data) {
      setJobs(jobsResult.data)
    }
  }

  const applyFilters = () => {
    let filtered = [...candidates]

    if (minScore) {
      const minScoreNum = parseInt(minScore)
      filtered = filtered.filter(candidate => {
        const primaryScore = candidate.match_scores?.find(s => s.is_primary)?.score || 0
        return primaryScore >= minScoreNum
      })
    }

    if (roleFilter) {
      filtered = filtered.filter(candidate => {
        return candidate.match_scores?.some(s => s.job_id === roleFilter)
      })
    }

    setFilteredCandidates(filtered)
  }

  const getPrimaryScore = (candidate: CandidateWithScores) => {
    return candidate.match_scores?.find(s => s.is_primary)?.score || 0
  }

  const getAlternativeFit = (candidate: CandidateWithScores) => {
    const scores = candidate.match_scores || []
    const primaryScore = getPrimaryScore(candidate)
    const alternativeScores = scores.filter(s => !s.is_primary && s.score > primaryScore)

    if (alternativeScores.length > 0) {
      const best = alternativeScores.sort((a, b) => b.score - a.score)[0]
      return {
        job: best.job_descriptions?.title || 'Unknown',
        score: best.score
      }
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Candidate Inbox</h2>
        <p className="text-slate-500 mt-1">Review and analyze incoming candidates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">High Matches (80+)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {candidates.filter(c => getPrimaryScore(c) >= 80).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Alternative Fits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {candidates.filter(c => getAlternativeFit(c) !== null).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Candidates</CardTitle>
          <CardDescription>Narrow down candidates by score or role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minScore">Minimum Score</Label>
              <Input
                id="minScore"
                type="number"
                placeholder="0-100"
                min="0"
                max="100"
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleFilter">Specific Role</Label>
              <Select
                id="roleFilter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Candidates</CardTitle>
          <CardDescription>
            Showing {filteredCandidates.length} of {candidates.length} candidates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Primary Role</TableHead>
                <TableHead>Primary Score</TableHead>
                <TableHead>Alternative Fit</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No candidates match your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((candidate) => {
                  const primaryScore = getPrimaryScore(candidate)
                  const alternativeFit = getAlternativeFit(candidate)

                  return (
                    <TableRow
                      key={candidate.id}
                      className="cursor-pointer"
                      onClick={() => onSelectCandidate(candidate)}
                    >
                      <TableCell className="font-medium">{candidate.name}</TableCell>
                      <TableCell>{candidate.email}</TableCell>
                      <TableCell>{candidate.primary_job?.title || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getScoreBadgeColor(primaryScore)}`} />
                          <span className={`font-semibold ${getScoreColor(primaryScore)}`}>
                            {primaryScore}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {alternativeFit ? (
                          <Badge variant="secondary" className="gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {alternativeFit.job} ({alternativeFit.score})
                          </Badge>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={candidate.status === 'analyzed' ? 'default' : 'secondary'}>
                          {candidate.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
