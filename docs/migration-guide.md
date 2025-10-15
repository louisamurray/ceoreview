# Database Migration Guide

## Overview

This guide covers migrating from the legacy CEO review system to the new comprehensive admin system with enhanced Firestore collections and role-based access control.

## Migration Steps

### 1. Pre-Migration Checklist

- [ ] Backup existing Firestore data
- [ ] Verify current submissions and drafts collections
- [ ] Note current admin users (from whitelist)
- [ ] Test local development environment

### 2. Database Seeding

**Run the seeding script to create new collections:**

```bash
# Start local server
npm run serve

# Open seeding tool
# Visit: http://localhost:8080/seed.html
# Click "Seed Database"
```

**What gets created:**
- `system_settings` collection with default configuration
- Enhanced `users` collection with role-based permissions
- `analytics_cache` collection for dashboard performance
- `audit_logs` collection for compliance tracking
- `notifications` collection for system alerts

### 3. User Migration

**Migrate existing admin users:**

1. **Identify current admins** from `window.ADMIN_EMAIL_WHITELIST`
2. **Create user records** in new `users` collection:

```javascript
// For each admin email, create user record
await firebase.firestore().collection('users').add({
  email: 'admin@example.com',
  role: 'admin',
  displayName: 'Admin Name',
  isActive: true,
  permissions: {
    canViewAllReviews: true,
    canEditSettings: true,
    canExportData: true,
    canManageUsers: true,
    canViewAuditLogs: true,
    canDeleteData: true
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});
```

### 4. Data Enhancement

**Enhance existing submissions with analytics:**

```javascript
// Add analytics to existing submissions
const submissions = await firebase.firestore().collection('submissions').get();

submissions.forEach(async (doc) => {
  const data = doc.data();
  
  // Calculate KPI averages from existing data
  const kpiAverages = calculateKpiAveragesFromData(data.data);
  
  // Add analytics metadata
  await doc.ref.update({
    reviewYear: new Date(data.submittedAt || data.timestamp).getFullYear(),
    analytics: {
      kpiAverages,
      sectionCompletionRates: calculateCompletionRates(data.data),
      totalKPIs: Object.keys(kpiAverages).length
    },
    metadata: {
      migrated: true,
      migrationDate: new Date().toISOString()
    }
  });
});
```

### 5. Security Rules Update

**Update Firestore security rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Enhanced user access
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && 
        (request.auth.uid == userId || hasRole(request.auth.uid, 'admin'));
    }
    
    // Admin-only collections
    match /audit_logs/{logId} {
      allow read, write: if hasRole(request.auth.uid, 'admin');
    }
    
    match /system_settings/{settingId} {
      allow read: if hasRole(request.auth.uid, ['admin', 'board_reviewer']);
      allow write: if hasRole(request.auth.uid, 'admin');
    }
    
    // Reviews with role-based access
    match /submissions/{submissionId} {
      allow read: if request.auth != null && 
        (request.auth.uid == submissionId || 
         hasRole(request.auth.uid, ['admin', 'board_reviewer']));
      allow write: if request.auth != null && request.auth.uid == submissionId;
    }
    
    // Helper function
    function hasRole(uid, roles) {
      let userData = get(/databases/$(database)/documents/users/$(uid)).data;
      return request.auth != null && 
        userData.role != null && 
        (roles is string ? userData.role == roles : userData.role in roles);
    }
  }
}
```

## Post-Migration Verification

### 1. Test Admin Access

- [ ] Admin users can access `/admin.html`
- [ ] Dashboard displays correctly with metrics
- [ ] User management functions work
- [ ] Review management shows existing data

### 2. Test Permissions

- [ ] Board reviewers have read-only access
- [ ] CEOs can only see their own data
- [ ] Admin functions are restricted appropriately

### 3. Test Data Integrity

- [ ] All existing submissions are visible
- [ ] CSV exports still work
- [ ] PDF generation functions correctly
- [ ] Search and filtering work

### 4. Test Audit Logging

- [ ] Admin actions are logged
- [ ] Audit logs are accessible to admins only
- [ ] Log export functions work

## Rollback Plan

If migration issues occur:

### 1. Immediate Rollback

**Disable new collections:**
```javascript
// Remove new collections if needed
const collections = ['audit_logs', 'system_settings', 'analytics_cache', 'notifications'];
for (const collection of collections) {
  const snapshot = await firebase.firestore().collection(collection).get();
  snapshot.docs.forEach(doc => doc.ref.delete());
}
```

### 2. Restore Legacy Admin

- Revert to legacy `admin.html` and `admin.js`
- Use original admin whitelist system
- Disable role-based access controls

### 3. Data Recovery

- Restore from pre-migration Firestore backup
- Verify all existing submissions intact
- Test core review functionality

## Monitoring

### Key Metrics to Watch

1. **User Access** - Monitor login success rates
2. **Data Integrity** - Verify no data loss
3. **Performance** - Check dashboard load times
4. **Error Rates** - Monitor console errors
5. **Audit Coverage** - Ensure all actions logged

### Health Checks

**Daily checks for first week:**
```javascript
// Check system health
await firebase.firestore().collection('system_settings').doc('general').get();
await firebase.firestore().collection('users').where('isActive', '==', true).get();
await firebase.firestore().collection('audit_logs').orderBy('timestamp', 'desc').limit(10).get();
```

## Troubleshooting

### Common Migration Issues

**Permissions Error:**
- Verify Firestore security rules updated
- Check user roles in `users` collection
- Ensure authentication working

**Missing Data:**
- Verify seeding completed successfully
- Check all required collections exist
- Confirm system_settings document present

**Admin Access Denied:**
- Check user email in `users` collection
- Verify role set to 'admin'
- Confirm permissions object populated

**Performance Issues:**
- Monitor analytics_cache updates
- Check for inefficient queries
- Verify indexes created properly

### Support Contacts

For migration assistance:
1. Check browser console for errors
2. Review Firestore rules and data
3. Test with known working account
4. Document specific error messages

## Post-Migration Cleanup

After successful migration and testing:

1. **Archive old admin whitelist** references
2. **Update documentation** with new procedures
3. **Train admin users** on new interface
4. **Schedule regular backups** of new collections
5. **Monitor system performance** and optimize as needed

This migration establishes a robust, scalable admin system with comprehensive governance oversight capabilities.