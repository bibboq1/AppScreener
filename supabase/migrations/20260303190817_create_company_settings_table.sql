/*
  # Create Company Settings Table

  1. New Tables
    - `company_settings`
      - `id` (uuid, primary key)
      - `company_name` (text) - Optional company name
      - `logo_url` (text) - URL to uploaded logo image
      - `created_at` (timestamptz) - When settings were created
      - `updated_at` (timestamptz) - Last update timestamp
  
  2. Security
    - Enable RLS on `company_settings` table
    - Add policy for authenticated users to read settings
    - Add policy for admin users to update settings
  
  3. Notes
    - Single row table for global settings
    - Logo URL will point to Supabase Storage
*/

CREATE TABLE IF NOT EXISTS company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text DEFAULT 'Smart Talent Matcher',
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read company settings"
  ON company_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update company settings"
  ON company_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert company settings"
  ON company_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM company_settings LIMIT 1) THEN
    INSERT INTO company_settings (company_name) VALUES ('Smart Talent Matcher');
  END IF;
END $$;