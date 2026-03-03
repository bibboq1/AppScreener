# Testing Guide

## Test Account

A test admin account has been created for you:

**Email:** `admin@test.com`
**Password:** `password123`

This account has full admin privileges and can:
- Access all features of the application
- Manage users
- Configure company settings
- View all candidates and jobs

## Creating Additional Test Accounts

### Option 1: Use the Registration Form

1. Click "Sign up" on the login page
2. Fill in the form with:
   - Full Name: Your test name
   - Email: Any valid email format
   - Password: At least 6 characters
   - Confirm Password: Same as password
3. Click "Sign Up"
4. The account will be created immediately (no email confirmation required)

### Option 2: Use the Admin Panel

1. Log in with the admin account above
2. Click the "Users" menu item in the left sidebar
3. Click "Invite User"
4. Fill in the user details and select a role
5. The user will be created instantly

## Testing SSO (Google & BambooHR)

The SSO buttons are visible on the login page, but require configuration:

### To Test Google SSO:

1. Set up OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/)
2. Configure redirect URI: `https://wkjrfjuxmjlqskdrpoqc.supabase.co/auth/v1/callback`
3. Enable Google provider in your [Supabase Dashboard](https://wkjrfjuxmjlqskdrpoqc.supabase.co)
4. Add your Google Client ID and Secret
5. Click "Continue with Google" on the login page

### To Test BambooHR/Azure SSO:

1. Set up app registration in [Azure Portal](https://portal.azure.com/)
2. Configure the same redirect URI as above
3. Enable Azure provider in Supabase Dashboard
4. Add your Azure Client ID, Secret, and Tenant URL
5. Click "Continue with BambooHR" on the login page

**Note:** Until the OAuth providers are configured in Supabase, the SSO buttons will show an error when clicked. This is expected behavior.

## Known Issues

- Email confirmation is disabled by default for testing
- OAuth providers require manual configuration in Supabase Dashboard
- First registered user automatically becomes admin

## User Roles

- **Admin**: Full access to all features, can manage users
- **Recruiter**: Can manage candidates and jobs
- **Hiring Manager**: Can view candidates and provide feedback
