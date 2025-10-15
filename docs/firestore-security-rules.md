# Firestore Security Rules Documentation

## Overview

The Firestore security rules provide comprehensive access control for the REAP Marlborough CEO Review application, supporting both the legacy admin system and the new role-based access control (RBAC) system.

## Security Model

### Authentication Requirements
- All data access requires Firebase Authentication
- Users must be signed in with valid email/password
- Inactive users are denied access to all resources

### Role-Based Access Control

**Roles:**
- `admin` - Full system access, user management, data modification
- `board_reviewer` - Read-only access to all reviews, export capabilities
- `ceo` - Access to personal reviews only

**Legacy Compatibility:**
- Email whitelist system (`louisa@whiringa.com`) maintained for backward compatibility
- Automatic admin privileges for whitelisted emails
- Graceful fallback when role system isn't initialized

## Rule Structure

### Helper Functions

```javascript
// Authentication checks
isSignedIn()              // User is authenticated
isOwner(userId)          // User owns the resource
isActiveUser()           // User account is active

// Legacy admin system
isLegacyAdmin()          // Email in whitelist

// Role-based access
getUserRole()            // Get user's role from users collection
hasRole(role)           // Check specific role
hasAnyRole(roles)       // Check multiple roles
isAdmin()               // Admin via legacy or role system
isBoardReviewer()       // Board reviewer role
canViewAllReviews()     // Admin or board reviewer

// Permission checks
hasPermission(perm)     // Check specific permission
```

### Collection Rules

#### Core Review Collections

**`/drafts/{userId}`**
- **Read/Write**: Document owner (active users only)
- **Read**: Admins and board reviewers
- **Delete**: Admins with `canDeleteData` permission

**`/submissions/{userId}`**
- **Read/Write**: Document owner (active users only)  
- **Read**: Admins and board reviewers
- **Delete**: Admins with `canDeleteData` permission

#### User Management

**`/users/{userId}`**
- **Read**: Document owner
- **Write**: Document owner (limited fields - cannot change role/permissions/active status)
- **Full Access**: Admins with `canManageUsers` permission
- **Create**: Admins with `canManageUsers` permission

#### Admin System Collections

**`/system_settings/{settingId}`**
- **Read**: Admins and board reviewers
- **Write**: Admins with `canEditSettings` permission

**`/analytics_cache/{cacheId}`**
- **Read**: Admins and board reviewers  
- **Write**: Admins only

**`/audit_logs/{logId}`**
- **Read**: Admins with `canViewAuditLogs` permission
- **Create**: Any authenticated user (for logging actions)
- **Write**: Admins only (for log management)

**`/notifications/{notificationId}`**
- **Read**: Users listed in notification recipients
- **Write/Create**: Admins only

**`/exports/{exportId}`**
- **Read**: Export requester or admins/board reviewers
- **Create**: Users with `canExportData` permission
- **Write**: Admins only

## Permission System

### Admin Permissions
```javascript
{
  canViewAllReviews: true,
  canEditSettings: true,
  canExportData: true,
  canManageUsers: true,
  canViewAuditLogs: true,
  canDeleteData: true
}
```

### Board Reviewer Permissions
```javascript
{
  canViewAllReviews: true,
  canExportData: true,
  canEditSettings: false,
  canManageUsers: false,
  canViewAuditLogs: false,
  canDeleteData: false
}
```

### CEO Permissions
```javascript
{
  canViewAllReviews: false,
  canExportData: false,
  canEditSettings: false,
  canManageUsers: false,
  canViewAuditLogs: false,
  canDeleteData: false
}
```

## Security Features

### Data Protection
- **Ownership Validation**: Users can only access their own reviews
- **Role Enforcement**: Strict role-based access to admin functions
- **Permission Granularity**: Fine-grained permission checking
- **Active User Requirement**: Inactive users denied all access

### Audit Trail
- All users can create audit log entries (for action tracking)
- Only admins can modify or delete audit logs
- Comprehensive logging of all sensitive operations

### Legacy Support
- Maintains compatibility with existing admin whitelist
- Graceful degradation when role system not initialized
- Automatic privilege escalation for whitelisted admins

## Deployment Instructions

### Deploy to Firebase

1. **Using Firebase CLI:**
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Using Firebase Console:**
   - Go to Firestore Database > Rules
   - Copy the contents of `firestore.rules`
   - Publish the rules

### Testing Rules

**Local Testing:**
```bash
firebase emulators:start --only firestore
npm run test:security  # If security tests are implemented
```

**Production Testing:**
```javascript
// Test basic access
await firebase.firestore().collection('submissions').get();

// Test admin functions
await firebase.firestore().collection('users').get();

// Test permissions
await firebase.firestore().collection('audit_logs').get();
```

## Storage Rules (Complementary)

For Firebase Storage (CSV exports), use these rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /reviews/{userId}/{fileName} {
      allow read: if request.auth != null && 
        (request.auth.uid == userId || isAdmin());
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /backups/{fileName} {
      allow read, write: if isAdmin();
    }
    
    match /exports/{userId}/{fileName} {
      allow read: if request.auth != null && 
        (request.auth.uid == userId || canViewAllReviews());
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Migration Considerations

### From Legacy System
1. **Rules are backward compatible** - existing admin access maintained
2. **No data migration required** - rules adapt to existing data structure
3. **Gradual rollout supported** - legacy and new systems work together

### Role Assignment
```javascript
// Migrate legacy admins to role-based system
const legacyAdmins = ["louisa@whiringa.com"];

legacyAdmins.forEach(async (email) => {
  const userQuery = await firebase.firestore()
    .collection('users')
    .where('email', '==', email)
    .get();
    
  if (userQuery.empty) {
    // Create admin user record
    await firebase.firestore().collection('users').add({
      email,
      role: 'admin',
      isActive: true,
      permissions: { /* admin permissions */ }
    });
  }
});
```

## Troubleshooting

### Common Issues

**Access Denied Errors:**
1. Check user authentication status
2. Verify user role in `users` collection
3. Confirm user `isActive` status
4. Check specific permission flags

**Permission Debugging:**
```javascript
// Check current user's role and permissions
const userData = await firebase.firestore()
  .collection('users')
  .doc(firebase.auth().currentUser.uid)
  .get();
  
console.log('User data:', userData.data());
```

**Rule Testing:**
```javascript
// Test specific rule conditions
const testAccess = async () => {
  try {
    await firebase.firestore().collection('audit_logs').get();
    console.log('Audit log access: GRANTED');
  } catch (error) {
    console.log('Audit log access: DENIED', error.message);
  }
};
```

### Security Validation

**Regular Checks:**
1. **Audit user roles** - Ensure appropriate access levels
2. **Review permissions** - Verify granular controls working
3. **Test edge cases** - Inactive users, missing roles, etc.
4. **Monitor access patterns** - Check for unusual activity

**Security Best Practices:**
- Regularly review and update admin user list
- Monitor audit logs for suspicious activity
- Test rules after any changes
- Use principle of least privilege
- Keep role assignments current with organizational changes

This comprehensive security model ensures proper governance oversight while maintaining data protection and user privacy in the CEO review system.