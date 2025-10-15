# Admin Database Schema Design

## Firestore Collections

### 1. `users` Collection
Enhanced user management with roles and metadata.

```javascript
{
  uid: "user123",
  email: "user@example.com",
  displayName: "User Name",
  role: "admin" | "board_reviewer" | "ceo",
  createdAt: "2025-10-15T10:00:00.000Z",
  updatedAt: "2025-10-15T10:00:00.000Z",
  lastLoginAt: "2025-10-15T10:00:00.000Z",
  loginCount: 15,
  isActive: true,
  permissions: {
    canViewAllReviews: true,
    canEditSettings: true,
    canExportData: true,
    canManageUsers: true
  },
  metadata: {
    lastIP: "192.168.1.1",
    lastUserAgent: "Mozilla/5.0...",
    failedLoginAttempts: 0,
    lastFailedLoginAt: null
  }
}
```

### 2. `submissions` Collection (Enhanced)
Extended to include audit metadata and analytics fields.

```javascript
{
  uid: "user123",
  userEmail: "ceo@reap.org.nz",
  userDisplayName: "CEO Name",
  timestamp: "2025-10-15T10:00:00.000Z",
  submittedAt: "2025-10-15T10:00:00.000Z",
  reviewYear: 2025,
  reviewVersion: "v2.0",
  data: { /* review form data */ },
  metadata: {
    submissionIP: "192.168.1.1",
    userAgent: "Mozilla/5.0...",
    deviceInfo: "Desktop",
    submissionDuration: 1800, // seconds
    editCount: 5,
    lastEditedAt: "2025-10-15T09:45:00.000Z"
  },
  analytics: {
    sectionCompletionRates: {
      "part-1": 100,
      "part-2": 95,
      // ...
    },
    kpiAverages: {
      communication: 4.2,
      leadership: 3.8,
      // ...
    },
    totalKPIs: 12,
    goalCount: 6
  },
  lastCsvPath: "reviews/user123/submission_2025.csv",
  lastCsvUploadedAt: "2025-10-15T10:05:00.000Z",
  lastCsvFileName: "ceo_review_2025.csv"
}
```

### 3. `drafts` Collection (Enhanced)
Similar structure to submissions but for work-in-progress reviews.

### 4. `audit_logs` Collection
Comprehensive audit trail for all admin actions.

```javascript
{
  id: "log123",
  timestamp: "2025-10-15T10:00:00.000Z",
  action: "REVIEW_VIEWED" | "DATA_EXPORTED" | "USER_ROLE_CHANGED" | "SETTINGS_UPDATED" | "LOGIN_SUCCESS" | "LOGIN_FAILED",
  actor: {
    uid: "admin123",
    email: "admin@reap.org.nz",
    role: "admin"
  },
  target: {
    type: "review" | "user" | "system",
    id: "target123",
    email: "target@example.com" // if applicable
  },
  details: {
    oldValue: "previous_value",
    newValue: "new_value",
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0...",
    additionalData: {}
  },
  outcome: "success" | "failed",
  errorMessage: null // if outcome is failed
}
```

### 5. `system_settings` Collection
Configuration and system-wide settings.

```javascript
{
  id: "general",
  activeReviewYear: 2025,
  activeReviewVersion: "v2.0",
  maintenanceMode: false,
  emailNotifications: {
    enabled: true,
    adminEmails: ["admin@reap.org.nz"],
    notifyOnSubmission: true,
    notifyOnUserRegistration: true
  },
  backupSettings: {
    autoBackupEnabled: true,
    backupFrequency: "weekly",
    lastBackupAt: "2025-10-15T00:00:00.000Z",
    backupLocation: "backups/"
  },
  reviewTemplate: {
    version: "v2.0",
    sections: {
      // Template configuration
    },
    kpiCategories: [
      {
        id: "communication",
        name: "Communication & Stakeholder Relations",
        weight: 1.0
      },
      // ...
    ]
  }
}
```

### 6. `analytics_cache` Collection
Pre-computed analytics for dashboard performance.

```javascript
{
  id: "dashboard_2025",
  year: 2025,
  computedAt: "2025-10-15T06:00:00.000Z",
  stats: {
    totalSubmissions: 45,
    totalDrafts: 12,
    averageCompletionTime: 1650, // seconds
    submissionsByMonth: {
      "2025-01": 8,
      "2025-02": 12,
      // ...
    },
    kpiAverages: {
      communication: 4.1,
      leadership: 3.9,
      // ...
    },
    completionRates: {
      overall: 87.5,
      bySection: {
        "part-1": 95.2,
        "part-2": 89.1,
        // ...
      }
    },
    yearOverYearComparison: {
      2024: {
        totalSubmissions: 38,
        averageKPI: 3.7
      }
    }
  }
}
```

### 7. `notifications` Collection
System notifications and alerts.

```javascript
{
  id: "notif123",
  type: "submission" | "system" | "admin_action",
  title: "New Review Submission",
  message: "CEO review submitted by user@example.com",
  timestamp: "2025-10-15T10:00:00.000Z",
  isRead: false,
  recipients: ["admin@reap.org.nz"],
  data: {
    submissionId: "sub123",
    userEmail: "ceo@reap.org.nz"
  },
  expiresAt: "2025-11-15T10:00:00.000Z"
}
```

### 8. `exports` Collection
Track data exports and downloads.

```javascript
{
  id: "export123",
  type: "csv" | "pdf" | "full_backup",
  requestedBy: {
    uid: "admin123",
    email: "admin@reap.org.nz"
  },
  requestedAt: "2025-10-15T10:00:00.000Z",
  completedAt: "2025-10-15T10:02:00.000Z",
  status: "completed" | "processing" | "failed",
  parameters: {
    year: 2025,
    includeUsers: ["user1", "user2"],
    format: "csv",
    sections: ["all"]
  },
  filePath: "exports/admin123/full_export_2025-10-15.csv",
  fileSize: 1024576, // bytes
  downloadCount: 3,
  lastDownloadedAt: "2025-10-15T11:00:00.000Z"
}
```

## Security Rules Enhancement

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own user document
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && 
        (request.auth.uid == userId || 
         hasRole(request.auth.uid, 'admin'));
    }
    
    // Admin-only collections
    match /audit_logs/{logId} {
      allow read, write: if hasRole(request.auth.uid, 'admin');
    }
    
    match /system_settings/{settingId} {
      allow read: if hasRole(request.auth.uid, ['admin', 'board_reviewer']);
      allow write: if hasRole(request.auth.uid, 'admin');
    }
    
    // Reviews access based on role
    match /submissions/{submissionId} {
      allow read: if request.auth != null && 
        (request.auth.uid == submissionId || 
         hasRole(request.auth.uid, ['admin', 'board_reviewer']));
      allow write: if request.auth != null && request.auth.uid == submissionId;
    }
    
    match /drafts/{draftId} {
      allow read, write: if request.auth != null && request.auth.uid == draftId;
      allow read: if hasRole(request.auth.uid, 'admin'); // Admin can view drafts
    }
    
    // Helper function to check user roles
    function hasRole(uid, roles) {
      let userRoles = resource.data.role;
      return request.auth != null && 
        userRoles != null && 
        (roles is string ? userRoles == roles : userRoles in roles);
    }
  }
}
```

## Performance Considerations

1. **Indexed Fields**: Create composite indexes for common queries
2. **Pagination**: Implement cursor-based pagination for large datasets
3. **Caching**: Use analytics_cache collection for dashboard metrics
4. **Batch Operations**: Use Firestore batch writes for bulk operations
5. **Storage Optimization**: Archive old submissions to separate collection

## Migration Strategy

1. **Phase 1**: Add new fields to existing collections with default values
2. **Phase 2**: Create new collections (audit_logs, system_settings, etc.)
3. **Phase 3**: Migrate existing data to new schema
4. **Phase 4**: Update security rules and deploy new admin interface