import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type JobDescription = {
  id: string
  title: string
  department: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Candidate = {
  id: string
  name: string
  email: string
  resume_text: string
  primary_job_id: string | null
  bamboohr_id: string | null
  status: string
  created_at: string
  updated_at: string
}

export type MatchScore = {
  id: string
  candidate_id: string
  job_id: string
  score: number
  reasoning: string
  is_primary: boolean
  created_at: string
}

export type CandidateWithScores = Candidate & {
  primary_job?: JobDescription
  match_scores?: (MatchScore & { job_descriptions?: JobDescription })[]
}
