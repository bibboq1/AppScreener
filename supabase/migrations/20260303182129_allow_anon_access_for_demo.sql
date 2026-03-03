/*
  # Allow Anonymous Access for Demo

  ## Overview
  This migration updates RLS policies to allow anonymous (anon) access for the demo application.
  In production, you would want to implement proper authentication.

  ## Changes
  - Update all RLS policies to allow both authenticated and anon users
  - This enables the application to work without requiring user authentication

  ## Important Notes
  - This is suitable for demo/testing purposes
  - In production, implement proper authentication and restrict access to authenticated users only
*/

-- Drop existing policies for job_descriptions
DROP POLICY IF EXISTS "Authenticated users can view job descriptions" ON job_descriptions;
DROP POLICY IF EXISTS "Authenticated users can insert job descriptions" ON job_descriptions;
DROP POLICY IF EXISTS "Authenticated users can update job descriptions" ON job_descriptions;
DROP POLICY IF EXISTS "Authenticated users can delete job descriptions" ON job_descriptions;

-- Create new policies for job_descriptions allowing anon access
CREATE POLICY "Allow all to view job descriptions"
  ON job_descriptions FOR SELECT
  USING (true);

CREATE POLICY "Allow all to insert job descriptions"
  ON job_descriptions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all to update job descriptions"
  ON job_descriptions FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all to delete job descriptions"
  ON job_descriptions FOR DELETE
  USING (true);

-- Drop existing policies for candidates
DROP POLICY IF EXISTS "Authenticated users can view candidates" ON candidates;
DROP POLICY IF EXISTS "Authenticated users can insert candidates" ON candidates;
DROP POLICY IF EXISTS "Authenticated users can update candidates" ON candidates;
DROP POLICY IF EXISTS "Authenticated users can delete candidates" ON candidates;

-- Create new policies for candidates allowing anon access
CREATE POLICY "Allow all to view candidates"
  ON candidates FOR SELECT
  USING (true);

CREATE POLICY "Allow all to insert candidates"
  ON candidates FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all to update candidates"
  ON candidates FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all to delete candidates"
  ON candidates FOR DELETE
  USING (true);

-- Drop existing policies for match_scores
DROP POLICY IF EXISTS "Authenticated users can view match scores" ON match_scores;
DROP POLICY IF EXISTS "Authenticated users can insert match scores" ON match_scores;
DROP POLICY IF EXISTS "Authenticated users can update match scores" ON match_scores;
DROP POLICY IF EXISTS "Authenticated users can delete match scores" ON match_scores;

-- Create new policies for match_scores allowing anon access
CREATE POLICY "Allow all to view match scores"
  ON match_scores FOR SELECT
  USING (true);

CREATE POLICY "Allow all to insert match scores"
  ON match_scores FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all to update match scores"
  ON match_scores FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all to delete match scores"
  ON match_scores FOR DELETE
  USING (true);

-- Drop existing policies for bamboohr_connections
DROP POLICY IF EXISTS "Authenticated users can view connections" ON bamboohr_connections;
DROP POLICY IF EXISTS "Authenticated users can insert connections" ON bamboohr_connections;
DROP POLICY IF EXISTS "Authenticated users can update connections" ON bamboohr_connections;
DROP POLICY IF EXISTS "Authenticated users can delete connections" ON bamboohr_connections;

-- Create new policies for bamboohr_connections allowing anon access
CREATE POLICY "Allow all to view connections"
  ON bamboohr_connections FOR SELECT
  USING (true);

CREATE POLICY "Allow all to insert connections"
  ON bamboohr_connections FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all to update connections"
  ON bamboohr_connections FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all to delete connections"
  ON bamboohr_connections FOR DELETE
  USING (true);
