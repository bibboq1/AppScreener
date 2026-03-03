/*
  # Add BambooHR Connections Table

  ## Overview
  This migration creates a table to store BambooHR API connection credentials
  and configuration settings for the Smart Talent Matcher integration.

  ## 1. New Tables

  ### `bamboohr_connections`
  - `id` (uuid, primary key) - Unique identifier for the connection
  - `company_domain` (text) - BambooHR company subdomain (e.g., "mycompany")
  - `api_key` (text) - Encrypted BambooHR API key
  - `is_active` (boolean) - Whether this connection is currently active
  - `webhook_enabled` (boolean) - Whether webhooks are configured
  - `sync_enabled` (boolean) - Whether automatic sync is enabled
  - `last_sync_at` (timestamptz) - When the last sync occurred
  - `created_at` (timestamptz) - When the connection was created
  - `updated_at` (timestamptz) - When the connection was last updated

  ## 2. Security
  - Enable RLS on the connections table
  - Add policies for authenticated users to manage connections
  - API keys are stored (in production these should be encrypted)

  ## 3. Important Notes
  - Only one active connection should exist at a time
  - API keys should be encrypted at rest in production
  - Webhook URL will be generated based on Edge Function endpoint
*/

-- Create bamboohr_connections table
CREATE TABLE IF NOT EXISTS bamboohr_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_domain text NOT NULL,
  api_key text NOT NULL,
  is_active boolean DEFAULT true,
  webhook_enabled boolean DEFAULT false,
  sync_enabled boolean DEFAULT false,
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for active connection lookups
CREATE INDEX IF NOT EXISTS idx_bamboohr_connections_active ON bamboohr_connections(is_active);

-- Enable Row Level Security
ALTER TABLE bamboohr_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bamboohr_connections
CREATE POLICY "Authenticated users can view connections"
  ON bamboohr_connections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert connections"
  ON bamboohr_connections FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update connections"
  ON bamboohr_connections FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete connections"
  ON bamboohr_connections FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_bamboohr_connections_updated_at ON bamboohr_connections;
CREATE TRIGGER update_bamboohr_connections_updated_at
  BEFORE UPDATE ON bamboohr_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one active connection
CREATE OR REPLACE FUNCTION ensure_single_active_connection()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE bamboohr_connections
    SET is_active = false
    WHERE id != NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce single active connection
DROP TRIGGER IF EXISTS enforce_single_active_connection ON bamboohr_connections;
CREATE TRIGGER enforce_single_active_connection
  BEFORE INSERT OR UPDATE ON bamboohr_connections
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION ensure_single_active_connection();
