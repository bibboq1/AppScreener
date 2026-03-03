/*
  # Authentication and Role-Based Access Control Schema

  ## Overview
  This migration creates a comprehensive authentication system with role-based access control.
  It extends Supabase Auth with custom user profiles and role management.

  ## 1. New Tables

  ### `user_profiles`
  - `id` (uuid, primary key) - Links to auth.users.id
  - `email` (text) - User's email address
  - `full_name` (text) - User's full name
  - `role` (text) - User role: 'admin', 'recruiter', 'hiring_manager'
  - `is_active` (boolean) - Whether the user account is active
  - `invited_by` (uuid) - ID of the admin who invited this user
  - `created_at` (timestamptz) - When the user was created
  - `updated_at` (timestamptz) - When the user was last updated

  ### `user_invitations`
  - `id` (uuid, primary key) - Unique identifier for the invitation
  - `email` (text) - Email address of the invited user
  - `role` (text) - Role assigned to the user
  - `invited_by` (uuid) - Admin who sent the invitation
  - `invitation_token` (text) - Unique token for the invitation
  - `status` (text) - 'pending', 'accepted', 'expired'
  - `expires_at` (timestamptz) - When the invitation expires
  - `created_at` (timestamptz) - When the invitation was created

  ## 2. Security
  - Enable RLS on all new tables
  - Admins can manage all users and invitations
  - Recruiters and hiring managers can view their own profile
  - Public can view user profiles (for collaboration features)

  ## 3. Important Notes
  - First user registered becomes admin automatically
  - Admins can invite new users with specific roles
  - Role hierarchy: admin > recruiter > hiring_manager
  - Invitation tokens expire after 7 days
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'recruiter', 'hiring_manager')),
  is_active boolean DEFAULT true,
  invited_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_invitations table
CREATE TABLE IF NOT EXISTS user_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'recruiter', 'hiring_manager')),
  invited_by uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  invitation_token text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_user_invitations_status ON user_invitations(status);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Anyone can view user profiles"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can insert user profiles"
  ON user_profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR NOT EXISTS (SELECT 1 FROM user_profiles LIMIT 1)
  );

CREATE POLICY "Admins can update any user profile"
  ON user_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete user profiles"
  ON user_profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for user_invitations
CREATE POLICY "Admins can view all invitations"
  ON user_invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can create invitations"
  ON user_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update invitations"
  ON user_invitations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete invitations"
  ON user_invitations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile after signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count integer;
  new_role text;
BEGIN
  SELECT COUNT(*) INTO user_count FROM user_profiles;
  
  -- First user becomes admin, others default to hiring_manager
  IF user_count = 0 THEN
    new_role := 'admin';
  ELSE
    new_role := 'hiring_manager';
  END IF;

  INSERT INTO user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    new_role
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_id AND role = 'admin' AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM user_profiles
  WHERE id = user_id AND is_active = true;
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
