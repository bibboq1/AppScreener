import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
}

interface AnalyzeRequest {
  candidateId: string
  resumeText: string
  primaryJobId: string
}

interface MatchResult {
  job_id: string
  score: number
  reason: string
}

interface AnalysisResponse {
  primary_match: MatchResult
  alternative_matches: MatchResult[]
}

function simulateAIAnalysis(resumeText: string, jobDescription: string, jobId: string, isPrimary: boolean): MatchResult {
  const resumeLower = resumeText.toLowerCase()
  const jobLower = jobDescription.toLowerCase()

  const keywords = ['engineer', 'developer', 'software', 'programming', 'javascript', 'typescript', 'react', 'python', 'java', 'leadership', 'management', 'agile', 'scrum', 'design', 'database', 'cloud', 'aws', 'azure']

  let matchCount = 0
  keywords.forEach(keyword => {
    if (resumeLower.includes(keyword) && jobLower.includes(keyword)) {
      matchCount++
    }
  })

  const baseScore = Math.min(40 + (matchCount * 5), 95)
  const randomVariation = Math.floor(Math.random() * 10) - 5
  const score = Math.max(20, Math.min(98, baseScore + randomVariation))

  const reasons = {
    high: [
      "Strong technical background aligns well with role requirements",
      "Extensive experience in relevant technologies and frameworks",
      "Demonstrated leadership and project management capabilities",
      "Educational background matches position requirements",
      "Previous roles show progressive career growth in relevant field"
    ],
    medium: [
      "Good foundation but may need additional training in specific areas",
      "Relevant experience but limited exposure to some required technologies",
      "Shows potential but lacks some preferred qualifications",
      "Technical skills are solid with room for growth in leadership",
      "Experience level is adequate though not exceptional for the role"
    ],
    low: [
      "Limited direct experience with core technologies required",
      "Background is in a different industry or domain",
      "Skills gap in several key areas mentioned in job description",
      "Experience level doesn't quite match role requirements",
      "May require significant onboarding and training"
    ]
  }

  let reasonList: string[]
  if (score >= 80) reasonList = reasons.high
  else if (score >= 50) reasonList = reasons.medium
  else reasonList = reasons.low

  const selectedReasons = [
    reasonList[Math.floor(Math.random() * reasonList.length)],
    reasonList[Math.floor(Math.random() * reasonList.length)]
  ]

  const pros = `Pros:\n- ${selectedReasons[0]}\n- Strong communication skills evident in resume presentation`
  const cons = score < 80 ? `\n\nCons:\n- ${selectedReasons[1]}\n- May benefit from additional experience in certain areas` : ''

  return {
    job_id: jobId,
    score,
    reason: pros + cons
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { candidateId, resumeText, primaryJobId }: AnalyzeRequest = await req.json()

    const { data: primaryJob, error: primaryJobError } = await supabase
      .from('job_descriptions')
      .select('*')
      .eq('id', primaryJobId)
      .single()

    if (primaryJobError || !primaryJob) {
      throw new Error('Primary job not found')
    }

    const { data: otherJobs, error: otherJobsError } = await supabase
      .from('job_descriptions')
      .select('*')
      .eq('is_active', true)
      .neq('id', primaryJobId)

    if (otherJobsError) {
      throw new Error('Failed to fetch other jobs')
    }

    const primary_match = simulateAIAnalysis(
      resumeText,
      primaryJob.description,
      primaryJobId,
      true
    )

    const alternative_matches = (otherJobs || []).map(job =>
      simulateAIAnalysis(resumeText, job.description, job.id, false)
    ).sort((a, b) => b.score - a.score)

    await supabase
      .from('match_scores')
      .delete()
      .eq('candidate_id', candidateId)

    const scoresToInsert = [
      {
        candidate_id: candidateId,
        job_id: primary_match.job_id,
        score: primary_match.score,
        reasoning: primary_match.reason,
        is_primary: true
      },
      ...alternative_matches.map(match => ({
        candidate_id: candidateId,
        job_id: match.job_id,
        score: match.score,
        reasoning: match.reason,
        is_primary: false
      }))
    ]

    await supabase
      .from('match_scores')
      .insert(scoresToInsert)

    await supabase
      .from('candidates')
      .update({ status: 'analyzed' })
      .eq('id', candidateId)

    const response: AnalysisResponse = {
      primary_match,
      alternative_matches
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Error analyzing candidate:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})
