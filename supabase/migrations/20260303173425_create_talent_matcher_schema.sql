/*
  # Smart Talent Matcher Database Schema

  ## Overview
  This migration creates the complete database schema for the Smart Talent Matcher application,
  including job descriptions, candidates, and match scores with full RLS security.

  ## 1. New Tables

  ### `job_descriptions`
  - `id` (uuid, primary key) - Unique identifier for each job description
  - `title` (text) - Job title (e.g., "Senior Software Engineer")
  - `department` (text) - Department name (e.g., "Engineering")
  - `description` (text) - Full job description text
  - `is_active` (boolean) - Whether the job is currently active
  - `created_at` (timestamptz) - When the job was created
  - `updated_at` (timestamptz) - When the job was last updated

  ### `candidates`
  - `id` (uuid, primary key) - Unique identifier for each candidate
  - `name` (text) - Candidate's full name
  - `email` (text) - Candidate's email address
  - `resume_text` (text) - Full text of the candidate's resume
  - `primary_job_id` (uuid, foreign key) - The job they originally applied for
  - `bamboohr_id` (text) - External ID from BambooHR (nullable)
  - `status` (text) - Processing status (pending, analyzed, synced)
  - `created_at` (timestamptz) - When the candidate was added
  - `updated_at` (timestamptz) - When the candidate was last updated

  ### `match_scores`
  - `id` (uuid, primary key) - Unique identifier for each match score
  - `candidate_id` (uuid, foreign key) - Reference to the candidate
  - `job_id` (uuid, foreign key) - Reference to the job description
  - `score` (integer) - Match score (0-100)
  - `reasoning` (text) - AI-generated explanation for the score
  - `is_primary` (boolean) - Whether this is the primary role match
  - `created_at` (timestamptz) - When the score was calculated

  ## 2. Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage all data
  - Future enhancement: Add role-based access control for different user types

  ## 3. Important Notes
  - All tables use UUID primary keys for security and scalability
  - Timestamps use `timestamptz` for timezone awareness
  - Foreign key constraints ensure data integrity
  - Indexes added on frequently queried columns for performance
*/

-- Create job_descriptions table
CREATE TABLE IF NOT EXISTS job_descriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  department text NOT NULL,
  description text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  resume_text text NOT NULL,
  primary_job_id uuid REFERENCES job_descriptions(id) ON DELETE SET NULL,
  bamboohr_id text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create match_scores table
CREATE TABLE IF NOT EXISTS match_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES job_descriptions(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  reasoning text NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(candidate_id, job_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_candidates_primary_job ON candidates(primary_job_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_match_scores_candidate ON match_scores(candidate_id);
CREATE INDEX IF NOT EXISTS idx_match_scores_job ON match_scores(job_id);
CREATE INDEX IF NOT EXISTS idx_match_scores_score ON match_scores(score);
CREATE INDEX IF NOT EXISTS idx_job_descriptions_active ON job_descriptions(is_active);

-- Enable Row Level Security
ALTER TABLE job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_descriptions
CREATE POLICY "Authenticated users can view job descriptions"
  ON job_descriptions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert job descriptions"
  ON job_descriptions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update job descriptions"
  ON job_descriptions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete job descriptions"
  ON job_descriptions FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for candidates
CREATE POLICY "Authenticated users can view candidates"
  ON candidates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert candidates"
  ON candidates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update candidates"
  ON candidates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete candidates"
  ON candidates FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for match_scores
CREATE POLICY "Authenticated users can view match scores"
  ON match_scores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert match scores"
  ON match_scores FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update match scores"
  ON match_scores FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete match scores"
  ON match_scores FOR DELETE
  TO authenticated
  USING (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_job_descriptions_updated_at ON job_descriptions;
CREATE TRIGGER update_job_descriptions_updated_at
  BEFORE UPDATE ON job_descriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_candidates_updated_at ON candidates;
CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON candidates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
