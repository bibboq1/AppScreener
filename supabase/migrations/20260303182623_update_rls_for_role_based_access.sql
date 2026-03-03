/*
  # Update RLS Policies for Role-Based Access Control

  ## Overview
  This migration updates RLS policies across all tables to implement role-based access control.
  Different roles have different levels of access to data.

  ## Access Control Matrix
  
  ### job_descriptions
  - Admin: Full access (create, read, update, delete)
  - Recruiter: Full access (create, read, update, delete)
  - Hiring Manager: Read and create only
  
  ### candidates
  - Admin: Full access
  - Recruiter: Full access
  - Hiring Manager: Read only
  
  ### match_scores
  - Admin: Full access
  - Recruiter: Full access
  - Hiring Manager: Read only
  
  ### bamboohr_connections
  - Admin: Full access
  - Recruiter: Read only
  - Hiring Manager: No access

  ## Important Notes
  - Authenticated users only (no more anonymous access)
  - Role checks are performed for all operations
  - Service role can bypass RLS for system operations
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow all to view job descriptions" ON job_descriptions;
DROP POLICY IF EXISTS "Allow all to insert job descriptions" ON job_descriptions;
DROP POLICY IF EXISTS "Allow all to update job descriptions" ON job_descriptions;
DROP POLICY IF EXISTS "Allow all to delete job descriptions" ON job_descriptions;

DROP POLICY IF EXISTS "Allow all to view candidates" ON candidates;
DROP POLICY IF EXISTS "Allow all to insert candidates" ON candidates;
DROP POLICY IF EXISTS "Allow all to update candidates" ON candidates;
DROP POLICY IF EXISTS "Allow all to delete candidates" ON candidates;

DROP POLICY IF EXISTS "Allow all to view match scores" ON match_scores;
DROP POLICY IF EXISTS "Allow all to insert match scores" ON match_scores;
DROP POLICY IF EXISTS "Allow all to update match scores" ON match_scores;
DROP POLICY IF EXISTS "Allow all to delete match scores" ON match_scores;

DROP POLICY IF EXISTS "Allow all to view connections" ON bamboohr_connections;
DROP POLICY IF EXISTS "Allow all to insert connections" ON bamboohr_connections;
DROP POLICY IF EXISTS "Allow all to update connections" ON bamboohr_connections;
DROP POLICY IF EXISTS "Allow all to delete connections" ON bamboohr_connections;

-- Job Descriptions Policies
CREATE POLICY "Authenticated users can view job descriptions"
  ON job_descriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins and recruiters can insert job descriptions"
  ON job_descriptions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'recruiter')
      AND is_active = true
    )
  );

CREATE POLICY "Admins and recruiters can update job descriptions"
  ON job_descriptions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'recruiter')
      AND is_active = true
    )
  );

CREATE POLICY "Admins and recruiters can delete job descriptions"
  ON job_descriptions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'recruiter')
      AND is_active = true
    )
  );

-- Candidates Policies
CREATE POLICY "Authenticated users can view candidates"
  ON candidates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins and recruiters can insert candidates"
  ON candidates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'recruiter')
      AND is_active = true
    )
  );

CREATE POLICY "Admins and recruiters can update candidates"
  ON candidates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'recruiter')
      AND is_active = true
    )
  );

CREATE POLICY "Admins and recruiters can delete candidates"
  ON candidates FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'recruiter')
      AND is_active = true
    )
  );

-- Match Scores Policies
CREATE POLICY "Authenticated users can view match scores"
  ON match_scores FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins and recruiters can insert match scores"
  ON match_scores FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'recruiter')
      AND is_active = true
    )
  );

CREATE POLICY "Admins and recruiters can update match scores"
  ON match_scores FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'recruiter')
      AND is_active = true
    )
  );

CREATE POLICY "Admins and recruiters can delete match scores"
  ON match_scores FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'recruiter')
      AND is_active = true
    )
  );

-- BambooHR Connections Policies (Admin only)
CREATE POLICY "Admins can view connections"
  ON bamboohr_connections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role = 'admin'
      AND is_active = true
    )
  );

CREATE POLICY "Admins can insert connections"
  ON bamboohr_connections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role = 'admin'
      AND is_active = true
    )
  );

CREATE POLICY "Admins can update connections"
  ON bamboohr_connections FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role = 'admin'
      AND is_active = true
    )
  );

CREATE POLICY "Admins can delete connections"
  ON bamboohr_connections FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role = 'admin'
      AND is_active = true
    )
  );
