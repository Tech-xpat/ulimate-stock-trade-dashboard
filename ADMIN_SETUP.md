# Admin Setup Guide

## Security Configuration

### Environment Variables Required

Add these to your `.env.local` or Vercel project settings:

```env
# Admin emails (comma-separated list)
ADMIN_EMAILS=ultimatestckstrade@gmail.com,empiredigitalsworldwide@gmail.com

# Firebase configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Important Security Changes

### What Changed

1. **Removed Hardcoded Admin Emails**: Previously, admin emails were hardcoded in `auth-service.ts` and visible in the frontend code
2. **Moved to Environment Variables**: Admin emails are now stored server-side in environment variables
3. **Server-Side Verification**: Admin status is verified on the backend via the `/api/admin/check-admin` endpoint
4. **Removed Default Admin Balance**: New users no longer get automatic balance; admins must be set in the database

### How Admin Access Works Now

1. User logs in with their email
2. Frontend calls `/api/admin/check-admin` with Firebase auth token
3. Backend verifies the token and checks user email against `ADMIN_EMAILS`
4. Only if user email is in the admin list, they get access to admin dashboard

## Next Steps (Security)

### Immediate TODO:
- [ ] Set `ADMIN_EMAILS` environment variable in Vercel project settings
- [ ] Remove the Firebase API key from your code once deployed
- [ ] Enable Firestore Security Rules (see SECURITY.md)

### TODO for Full Implementation:
- [ ] Set up Firebase Admin SDK in your API routes
- [ ] Implement token verification in `/api/admin/check-admin` 
- [ ] Add Firestore rules to prevent unauthorized access
- [ ] Implement audit logging for admin actions
- [ ] Set up rate limiting on sensitive endpoints

## To Deploy

1. Go to your Vercel project settings
2. Add the environment variables
3. Deploy the branch
