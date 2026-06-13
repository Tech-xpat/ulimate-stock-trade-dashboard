# Firebase Configuration Fix - Authentication Error

## Problem
The error "Illegal url for new iframe" is caused by **spaces in the Firebase project ID**, which is invalid. Firebase project IDs cannot contain spaces.

**Current (Incorrect) Config:**
```javascript
authDomain: "Elite Block Market.firebaseapp.com",  // ❌ Has spaces
projectId: "Elite Block Market",                   // ❌ Has spaces
storageBucket: "Elite Block Market.firebasestorage.app", // ❌ Has spaces
```

## Solution: Get Your Actual Firebase Project ID

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com)
2. Look for your project in the list
3. Click on your project to open it

### Step 2: Find Your Project ID
The project ID is shown in multiple places:

**Method A - Project Settings:**
1. Click the **⚙️ Settings icon** (top left, next to project name)
2. Select **Project Settings**
3. Under the "General" tab, find **Project ID** field
4. This is your actual project ID (usually lowercase, no spaces)

**Method B - Bottom of Sidebar:**
- Look at the very bottom left of Firebase Console
- Your project name is displayed
- Hover over it to see the actual project ID

**Example Project IDs:**
- `elite-block-market` (with hyphens)
- `eliteblockmarket` (no spaces)
- `my-crypto-app-123` (with hyphens and numbers)

### Step 3: Update Your Firebase Config

Once you have your actual project ID (let's say it's `elite-block-market`), update `/lib/firebase.ts`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCXVsPyVHAIzFsHOsOuppVG9IWPtOc0LH8",
  authDomain: "elite-block-market.firebaseapp.com",  // ✓ Correct format
  projectId: "elite-block-market",                   // ✓ Correct format
  storageBucket: "elite-block-market.firebasestorage.app", // ✓ Correct format
  messagingSenderId: "220545208853",
  appId: "1:220545208853:web:5b8d180688b1e048bd341c",
  measurementId: "G-HYCZTE5T1V",
}
```

**Important**: Replace `elite-block-market` with YOUR actual project ID!

### Step 4: Verify Authorized Domains

1. In Firebase Console, go to **Authentication** → **Settings** tab
2. Scroll to **Authorized domains**
3. Ensure these are added:
   - `localhost:3000` (development)
   - `127.0.0.1:3000` (local testing)
   - Your production domain (e.g., `elite-new-man.vercel.app`)

If they're not listed, click "Add domain" and add them.

### Step 5: Test Authentication

1. Restart your dev server: `pnpm dev`
2. Go to `http://localhost:3000/auth/login`
3. Test customer login
4. Go to `http://localhost:3000/admin/login`
5. Test admin Google login

## Format Reference

Firebase authDomain format: `{projectId}.firebaseapp.com`
Firebase storageBucket format: `{projectId}.firebasestorage.app`

Your actual Firebase project ID will NOT have spaces. If you see spaces in your Firebase Console project name, the project ID is different (usually lowercase with hyphens).

## Still Having Issues?

### Check Firebase Console Directly
1. Open your [Firebase Project Settings](https://console.firebase.google.com/project/_/settings/general)
2. Copy the exact **Project ID** value shown
3. Replace the projectId in your config with this exact value
4. The authDomain and storageBucket will auto-format correctly

### Common Issues
- Project ID with spaces → Always invalid, use the actual ID from Firebase Console
- Wrong API Key → May cause different error, but verify it matches
- Missing authorized domains → Add your domain in Firebase Console
- Popup blocker → Disable for localhost testing

## Contact Support
If you cannot find your Firebase project details:
1. Check your Firebase billing/account settings
2. Verify you're logged into the correct Google account
3. The project might be in a different Google account/organization
4. Check [All Firebase Projects](https://console.firebase.google.com/)
