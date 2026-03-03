# Smart Talent Matcher

An intelligent candidate matching system for BambooHR with OAuth/SSO support.

## Authentication

This application supports multiple authentication methods:

### Email/Password Authentication
Users can sign up and sign in using email and password credentials.

### Single Sign-On (SSO)

#### Google OAuth 2.0
To enable Google sign-in:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client ID"
5. Configure the OAuth consent screen if prompted
6. Set application type to "Web application"
7. Add authorized redirect URIs:
   - `https://wkjrfjuxmjlqskdrpoqc.supabase.co/auth/v1/callback`
8. Copy the Client ID and Client Secret
9. In your Supabase Dashboard:
   - Navigate to Authentication > Providers
   - Enable Google provider
   - Paste your Client ID and Client Secret
   - Save changes

#### BambooHR OAuth 2.0 (Azure AD)
To enable BambooHR sign-in via Azure AD:

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Enter application name (e.g., "Smart Talent Matcher")
5. Set redirect URI:
   - Platform: Web
   - URI: `https://wkjrfjuxmjlqskdrpoqc.supabase.co/auth/v1/callback`
6. Click "Register"
7. Copy the "Application (client) ID"
8. Go to "Certificates & secrets" > "New client secret"
9. Create a secret and copy its value
10. In your Supabase Dashboard:
    - Navigate to Authentication > Providers
    - Enable Azure provider
    - Paste your Client ID and Client Secret
    - Set Azure Tenant URL (e.g., `https://login.microsoftonline.com/YOUR_TENANT_ID`)
    - Save changes

### Account Linking
When a user signs in with OAuth and their email matches an existing account, the OAuth provider is automatically linked to that account. Users can then use either authentication method to access their account.

### Security Features
- PKCE flow for OAuth
- CSRF protection
- Secure, httpOnly cookies for session management
- Automatic token refresh
- Email verification (configurable)

## Environment Variables

Required environment variables are already configured in `.env`:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

OAuth providers are configured directly in the Supabase Dashboard (not via environment variables).

## Development

```bash
npm install
npm run dev
```

## Building

```bash
npm run build
```