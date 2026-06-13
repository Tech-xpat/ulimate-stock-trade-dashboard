# Quick Firebase Fix - 2 Minutes

## The Error
```
Error: Illegal url for new iframe - https://elite%20block%20market.firebaseapp.com/__/auth/iframe?...
```
**Cause**: Spaces in Firebase project ID (`%20` is a space in URLs)

## The Fix

### 1. Find Your Project ID (30 seconds)
- Open https://console.firebase.google.com
- Click your project
- Click ⚙️ Settings (top left)
- Copy **Project ID** (e.g., `elite-block-market`)

### 2. Update Your Config (1 minute)
Edit `/lib/firebase.ts`:

```javascript
// Change FROM this:
const firebaseConfig = {
  authDomain: "Elite Block Market.firebaseapp.com",  // ❌ Wrong
  projectId: "Elite Block Market",                   // ❌ Wrong
  storageBucket: "Elite Block Market.firebasestorage.app", // ❌ Wrong
  // ... rest stays the same
}

// TO this (using your actual project ID):
const firebaseConfig = {
  authDomain: "elite-block-market.firebaseapp.com",  // ✓ Correct
  projectId: "elite-block-market",                   // ✓ Correct
  storageBucket: "elite-block-market.firebasestorage.app", // ✓ Correct
  // ... rest stays the same
}
```

**Replace `elite-block-market` with YOUR actual project ID from Firebase Console!**

### 3. Add Authorized Domains (30 seconds)
1. Firebase Console → Authentication → Settings
2. Click "Add domain"
3. Add: `localhost:3000`
4. Add your production domain (e.g., `elite-new-man.vercel.app`)

### 4. Restart & Test (30 seconds)
```bash
# Kill current server and restart
pnpm dev
```

Test:
- http://localhost:3000/auth/login
- http://localhost:3000/admin/login

## Done! ✓

If still not working:
- Check that you copied the EXACT project ID from Firebase Console
- No spaces in the project ID
- Authorized domains include `localhost:3000`
- Browser cache cleared (Ctrl+Shift+Delete)
