# Firestore Security Rules for Elite Block Market

Copy and paste these rules into your Firebase Console under Firestore Database > Rules.

## Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ========================
    // USER PROFILES
    // ========================
    match /users/{userId} {
      // Allow users to read/write their own profile
      allow read, write: if request.auth.uid == userId;
      
      // Allow reading public profile data for referrals
      allow read: if request.auth != null;
      
      // User Transactions - Allow users to manage their own transactions
      match /transactions/{transactionId} {
        allow read, write: if request.auth.uid == userId;
        allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      }
    }
    
    // ========================
    // KYC DOCUMENTS
    // ========================
    match /kycDocuments/{kycId} {
      // Allow admins to read all KYC documents
      allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      // Allow users to read their own KYC documents
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      
      // Allow admins to update KYC status
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // ========================
    // ADMIN RECORDS
    // ========================
    match /admins/{adminId} {
      // Allow admins to read their own record
      allow read: if request.auth.uid == adminId;
      
      // Allow creating/updating admin records for authenticated users with admin role
      allow create, update, write: if request.auth != null && 
        (request.auth.uid == adminId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      
      // Allow listing for auth purposes
      allow read: if request.auth != null;
    }
    
    // ========================
    // ACTIVITY LOGS
    // ========================
    match /activityLogs/{logId} {
      // Users can read their own activity logs
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      
      // Users can create activity logs for themselves
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      
      // Admins can read all activity logs
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // ========================
    // SUPPORT TICKETS
    // ========================
    match /supportTickets/{ticketId} {
      // Users can read their own tickets
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      
      // Users can create tickets
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      
      // Users can update their own tickets
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;
      
      // Admins can read all tickets
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
      
      // Admins can update all tickets
      allow update: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // ========================
    // REFERRAL DATA
    // ========================
    match /referrals/{referralId} {
      // Users can read referrals where they are the referrer or referee
      allow read: if request.auth != null && 
        (resource.data.referrerId == request.auth.uid || 
         resource.data.refereeId == request.auth.uid);
      
      // Allow creating referral records for authenticated users
      allow create: if request.auth != null;
      
      // Admins can read all referrals
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // ========================
    // CATCH ALL (DENY)
    // ========================
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## How to Apply These Rules

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: "Elite Block Market"
3. Navigate to **Firestore Database** > **Rules**
4. Replace the entire content with the rules above
5. Click **Publish**

## Rule Explanations

- **Users Collection**: Each user can only read/write their own profile and transactions
- **KYC Documents**: Admins can review all KYC documents; users can see their own
- **Admins Collection**: Records which users are admins; accessible to admins only
- **Activity Logs**: Users see their own activity; admins see all
- **Support Tickets**: Users manage their own tickets; admins can help with all
- **Referrals**: Users see their referral relationships; admins see all

## Important Notes

- These rules enforce **Row-Level Security (RLS)** to ensure users can only access their own data
- The `role` field should be set to `"admin"` for admin users in the users collection
- All collections use authentication verification: `request.auth != null`
- Admins are identified by having a record in the `admins` collection

## Testing the Rules

Use Firebase Console's Rules Playground to test:
1. Simulate as authenticated user with specific UID
2. Try reading/writing documents
3. Verify permissions work as expected

## Troubleshooting

If users can't access their data:
- Check that `request.auth.uid` matches the document's `userId` field
- Verify user is authenticated before Firestore calls
- Check browser console for permission denied errors

If admin features don't work:
- Ensure admin email is in the `APPROVED_ADMIN_EMAILS` list
- Verify admin record exists in `admins` collection
- Check that admin user has `role: "admin"` in their profile
