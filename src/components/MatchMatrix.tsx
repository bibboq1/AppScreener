import { useState, useEffect } from 'react'
import { supabase, type JobDescription, type Candidate, type MatchScore } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getScoreColor } from '@/lib/utils'
import { Grid3x3 } from 'lucide-react'

interface MatrixData {
  candidates: Candidate[]
  jobs: JobDescription[]
  scores: Map<string, number>
}

export function MatchMatrix() {
  const [matrixData, setMatrixData] = useState<MatrixData>({
    candidates: [],
    jobs: [],
    scores: new Map()
  })

  useEffect(() => {
    loadMatrixData()
  }, [])

  const loadMatrixData = async () => {
    const [candidatesResult, jobsResult, scoresResult] = await Promise.all([
      supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('job_descriptions')
        .select('*')
        .eq('is_active', true)
        .order('title'),
      supabase
        .from('match_scores')
        .select('*')
    ])

    if (candidatesResult.data && jobsResult.data && scoresResult.data) {
      const scoresMap = new Map<string, number>()
      scoresResult.data.forEach((score: MatchScore) => {
        scoresMap.set(`${score.candidate_id}-${score.job_id}`, score.score)
      })

      setMatrixData({
        candidates: candidatesResult.data,
        jobs: jobsResult.data.slice(0, 10),
        scores: scoresMap
      })
    }
  }

  const getScore = (candidateId: string, jobId: string): number | null => {
    return matrixData.scores.get(`${candidateId}-${jobId}`) || null
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Match Matrix</h2>
        <p className="text-slate-500 mt-1">High-level view of all candidate-to-role match scores</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Score Matrix</CardTitle>
          <CardDescription>
            {matrixData.candidates.length} candidates × {matrixData.jobs.length} active roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {matrixData.candidates.length === 0 || matrixData.jobs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Grid3x3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No data available</p>
              <p className="text-sm mt-1">Add job descriptions and candidates to see the match matrix</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-white border-r-2 border-slate-200 p-3 text-left text-sm font-semibold text-slate-700 min-w-[200px]">
                      Candidate
                    </th>
                    {matrixData.jobs.map((job) => (
                      <th
                        key={job.id}
                        className="border border-slate-200 p-3 text-left text-sm font-semibold text-slate-700 min-w-[140px]"
                      >
                        <div className="flex flex-col">
                          <span className="truncate">{job.title}</span>
                          <span className="text-xs font-normal text-slate-500">{job.department}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrixData.candidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-slate-50">
                      <td className="sticky left-0 z-10 bg-white border-r-2 border-slate-200 p-3 font-medium text-sm">
                        <div className="flex flex-col">
                          <span>{candidate.name}</span>
                          <span className="text-xs text-slate-500">{candidate.email}</span>
                        </div>
                      </td>
                      {matrixData.jobs.map((job) => {
                        const score = getScore(candidate.id, job.id)
                        return (
                          <td
                            key={job.id}
                            className="border border-slate-200 p-3 text-center"
                          >
                            {score !== null ? (
                              <div
                                className={`inline-flex items-center justify-center w-14 h-14 rounded-lg font-bold text-lg ${getScoreColor(score)}`}
                              >
                                {score}
                              </div>
                            ) : (
                              <span className="text-slate-300 text-sm">—</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-lg bg-green-50 text-green-700 flex items-center justify-center font-bold">
                80
              </div>
              <span className="text-sm text-slate-600">High Match (80-100)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-lg bg-yellow-50 text-yellow-700 flex items-center justify-center font-bold">
                65
              </div>
              <span className="text-sm text-slate-600">Medium Match (50-79)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-lg bg-red-50 text-red-700 flex items-center justify-center font-bold">
                35
              </div>
              <span className="text-sm text-slate-600">Low Match (0-49)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
