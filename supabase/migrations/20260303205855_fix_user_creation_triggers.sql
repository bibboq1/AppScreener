/*
  # Fix User Creation Triggers

  1. Changes
    - Consolidate multiple triggers into one unified trigger
    - Handle both email/password and OAuth sign-ups
    - Ensure user_profiles are created correctly for all auth methods
  
  2. Security
    - Maintain existing RLS policies
    - SECURITY DEFINER to ensure proper access
*/

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_oauth ON auth.users;

-- Drop existing functions
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS handle_oauth_signin();

-- Create unified function to handle all user creation scenarios
CREATE OR REPLACE FUNCTION handle_new_user_unified()
RETURNS TRIGGER AS $$
DECLARE
  user_count integer;
  new_role text;
  provider_name text;
  profile_exists boolean;
BEGIN
  -- Check if profile already exists
  SELECT EXISTS (
    SELECT 1 FROM user_profiles WHERE id = NEW.id
  ) INTO profile_exists;
  
  -- If profile exists, skip creation
  IF profile_exists THEN
    RETURN NEW;
  END IF;
  
  -- Count existing profiles
  SELECT COUNT(*) INTO user_count FROM user_profiles;
  
  -- First user becomes admin, others default to hiring_manager
  IF user_count = 0 THEN
    new_role := 'admin';
  ELSE
    new_role := 'hiring_manager';
  END IF;
  
  -- Get provider name
  provider_name := COALESCE(
    NEW.raw_app_meta_data->>'provider',
    'email'
  );

  -- Create user profile
  INSERT INTO user_profiles (id, email, full_name, role, auth_provider, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    new_role,
    provider_name,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user_unified: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create single trigger for all user creation
CREATE TRIGGER on_auth_user_created_unified
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_unified();