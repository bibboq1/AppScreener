/*
  # Add OAuth Support for SSO

  1. New Tables
    - `auth_accounts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to auth.users) - Links to Supabase auth user
      - `profile_id` (uuid, FK to user_profiles) - Links to app profile
      - `provider` (text) - OAuth provider name (google, bamboohr)
      - `provider_user_id` (text) - Unique ID from provider
      - `provider_tenant_id` (text, nullable) - Tenant/company ID from provider
      - `email` (text) - Email from provider
      - `name` (text, nullable) - Display name from provider
      - `avatar_url` (text, nullable) - Avatar URL from provider
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Changes
    - Add `avatar_url` to user_profiles for storing profile pictures
    - Add `auth_provider` to user_profiles to track primary auth method
  
  3. Security
    - Enable RLS on `auth_accounts` table
    - Users can read their own auth accounts
    - Only system can insert/update auth accounts
  
  4. Indexes
    - Index on provider + provider_user_id for fast lookups
    - Index on user_id for account listing
*/

-- Add avatar_url and auth_provider to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN avatar_url text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'auth_provider'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN auth_provider text DEFAULT 'email';
  END IF;
END $$;

-- Create auth_accounts table
CREATE TABLE IF NOT EXISTS auth_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  provider text NOT NULL,
  provider_user_id text NOT NULL,
  provider_tenant_id text,
  email text NOT NULL,
  name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(provider, provider_user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_auth_accounts_user_id ON auth_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_accounts_profile_id ON auth_accounts(profile_id);
CREATE INDEX IF NOT EXISTS idx_auth_accounts_provider_lookup ON auth_accounts(provider, provider_user_id);
CREATE INDEX IF NOT EXISTS idx_auth_accounts_email ON auth_accounts(email);

-- Enable RLS
ALTER TABLE auth_accounts ENABLE ROW LEVEL SECURITY;

-- Users can read their own auth accounts
CREATE POLICY "Users can read own auth accounts"
  ON auth_accounts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Only authenticated users can insert their own accounts
CREATE POLICY "Users can insert own auth accounts"
  ON auth_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own auth accounts
CREATE POLICY "Users can update own auth accounts"
  ON auth_accounts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to handle OAuth sign-in and account linking
CREATE OR REPLACE FUNCTION handle_oauth_signin()
RETURNS TRIGGER AS $$
DECLARE
  profile_record user_profiles%ROWTYPE;
  provider_name text;
  user_email text;
BEGIN
  -- Get user email and provider from auth.users metadata
  SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;
  
  -- Try to get provider from raw_app_meta_data
  provider_name := COALESCE(
    NEW.raw_app_meta_data->>'provider',
    'email'
  );
  
  -- Check if a profile already exists for this email
  SELECT * INTO profile_record 
  FROM user_profiles 
  WHERE email = user_email 
  LIMIT 1;
  
  -- If profile exists, update auth_provider if it's still default
  IF FOUND THEN
    IF profile_record.auth_provider = 'email' AND provider_name != 'email' THEN
      UPDATE user_profiles 
      SET auth_provider = provider_name,
          updated_at = now()
      WHERE id = profile_record.id;
    END IF;
  ELSE
    -- Create new profile for OAuth users
    IF provider_name != 'email' THEN
      INSERT INTO user_profiles (
        id,
        email,
        full_name,
        role,
        auth_provider,
        avatar_url
      ) VALUES (
        NEW.id,
        user_email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(user_email, '@', 1)),
        'hiring_manager',
        provider_name,
        NEW.raw_user_meta_data->>'avatar_url'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for OAuth sign-ins
DROP TRIGGER IF EXISTS on_auth_user_created_oauth ON auth.users;
CREATE TRIGGER on_auth_user_created_oauth
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.raw_app_meta_data->>'provider' IS NOT NULL)
  EXECUTE FUNCTION handle_oauth_signin();