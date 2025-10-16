# Demo Login Instructions

For testing the Next.js migration app locally, you can use Firebase Authentication. Here are the steps:

## Option 1: Use Firebase Console (Recommended for Testing)

1. Go to your Firebase Console: https://console.firebase.google.com/
2. Select your project
3. Navigate to **Authentication** > **Users**
4. Click **Add user**
5. Create a demo user:
   - Email: `demo@example.com`
   - Password: `Demo123!@#`

## Option 2: Use Firebase Email/Password Sign-Up

The app allows sign-up via the login form. You can:
1. Open the app at `http://localhost:3000`
2. Click the login form
3. Enter any email/password combination to create a new user
4. Firebase will automatically create the user account

## Testing Admin Access

To test the admin panel at `/admin`, you need to either:

### Method A: Update the Admin Check Logic
Edit `src/app/admin/page.tsx` and change:
```typescript
return user && user.email && user.email.endsWith('@yourcompany.com');
```

To use a demo email:
```typescript
return user && user.email && (user.email === 'demo@example.com' || user.email.endsWith('@yourcompany.com'));
```

### Method B: Use a Custom Email
1. Create a user with email `demo@yourcompany.com`
2. Password: `Demo123!@#`
3. Log in and navigate to `/admin`

## Demo User Credentials

| Role | Email | Password |
|------|-------|----------|
| User | demo@example.com | Demo123!@# |
| Admin | admin@yourcompany.com | Demo123!@# |

## Local Testing Steps

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:3000`

3. Login with demo credentials

4. To test admin panel:
   - Navigate to `http://localhost:3000/admin`
   - If using `demo@example.com`, update the admin check logic first
   - Or login with `admin@yourcompany.com`

## Firebase Configuration

Make sure your `.env.local` has valid Firebase credentials:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Troubleshooting

- **Login fails**: Ensure Firebase config in `.env.local` is correct
- **Admin page shows "Access denied"**: The email doesn't match the admin check. Update the logic or use `@yourcompany.com` email
- **Page doesn't load**: Check browser console for errors and Firebase Authentication settings
