/*
# Create shared app settings

1. New Tables
- `app_settings`
- `id` (integer, fixed singleton key)
- `api_key` (text, Brevo API key used by this app)
- `sender_name` (text, configured Brevo sender name)
- `sender_email` (text, configured Brevo sender email)
- `subject` (text, default email subject)
- `email_template` (text, default email body template)
- `created_at` and `updated_at` (timestamps)

2. Changes
- Adds one shared settings record so the app can restore the Brevo configuration across browser sessions and devices.
- Adds an automatic timestamp update for edits.

3. Security
- Enables row-level security on `app_settings`.
- Allows the existing no-account app to read and update only the fixed singleton settings record through the anon and authenticated Data API roles.
- No user-owned data or auth tables are created because the current application login is local rather than Supabase authentication.

4. Important Notes
- The current app already sends the Brevo API key from the browser. This migration preserves that existing behavior while making the saved settings shared.
- A future move to Supabase email authentication should replace the singleton access policy with authenticated, owner-scoped policies before using this table for multiple independent users.
*/

CREATE TABLE IF NOT EXISTS public.app_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  api_key text NOT NULL DEFAULT '',
  sender_name text NOT NULL DEFAULT '',
  sender_email text NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT 'Payout Statement Update',
  email_template text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow app settings read" ON public.app_settings;
CREATE POLICY "Allow app settings read"
ON public.app_settings FOR SELECT
TO anon, authenticated
USING (id = 1);

DROP POLICY IF EXISTS "Allow app settings insert" ON public.app_settings;
CREATE POLICY "Allow app settings insert"
ON public.app_settings FOR INSERT
TO anon, authenticated
WITH CHECK (id = 1);

DROP POLICY IF EXISTS "Allow app settings update" ON public.app_settings;
CREATE POLICY "Allow app settings update"
ON public.app_settings FOR UPDATE
TO anon, authenticated
USING (id = 1)
WITH CHECK (id = 1);

DROP POLICY IF EXISTS "Allow app settings delete" ON public.app_settings;
CREATE POLICY "Allow app settings delete"
ON public.app_settings FOR DELETE
TO anon, authenticated
USING (id = 1);

CREATE OR REPLACE FUNCTION public.set_app_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_app_settings_updated_at ON public.app_settings;
CREATE TRIGGER set_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.set_app_settings_updated_at();

INSERT INTO public.app_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;