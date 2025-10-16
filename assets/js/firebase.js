// ==========================================
// USER ROLE & PERMISSION MANAGEMENT
// ==========================================

const USER_ROLES = {
  ADMIN: 'admin',
  BOARD_REVIEWER: 'board_reviewer', 
  CEO: 'ceo'
};

const DEFAULT_PERMISSIONS = {
  [USER_ROLES.ADMIN]: {
    canViewAllReviews: true,
    canEditSettings: true,
    canExportData: true,
    canManageUsers: true,
    canViewAuditLogs: true,
    canDeleteData: true
  },
  [USER_ROLES.BOARD_REVIEWER]: {
    canViewAllReviews: true,
    canEditSettings: false,
    canExportData: true,
    canManageUsers: false,
    canViewAuditLogs: false,
    canDeleteData: false
  },
  [USER_ROLES.CEO]: {
    canViewAllReviews: false,
    canEditSettings: false,
    canExportData: false,
    canManageUsers: false,
    canViewAuditLogs: false,
    canDeleteData: false
  }
};

function setUserRole(uid, role) {
  const permissions = DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS[USER_ROLES.CEO];
  const userData = {
    role,
    permissions,
    updatedAt: new Date().toISOString(),
    isActive: true
  };
  
  return db.collection('users').doc(uid).set(userData, { merge: true });
}

function getUserRole(uid) {
  return db.collection('users').doc(uid).get().then(doc => 
    doc.exists ? doc.data().role : null
  );
}

function getUserData(uid) {
  return db.collection('users').doc(uid).get().then(doc => 
    doc.exists ? doc.data() : null
  );
}

function updateUserLoginInfo(uid, userAgent = null, ipAddress = null) {
  const updates = {
    lastLoginAt: new Date().toISOString(),
    loginCount: firebase.firestore.FieldValue.increment(1)
  };
  
  if (userAgent || ipAddress) {
    updates.metadata = {
      lastUserAgent: userAgent,
      lastIP: ipAddress,
      failedLoginAttempts: 0,
      lastFailedLoginAt: null
    };
  }
  
  return db.collection('users').doc(uid).set(updates, { merge: true });
}

function recordFailedLogin(email, userAgent = null, ipAddress = null) {
  // Find user by email and increment failed attempts
  return db.collection('users').where('email', '==', email).get()
    .then(snapshot => {
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        return userDoc.ref.set({
          metadata: {
            failedLoginAttempts: firebase.firestore.FieldValue.increment(1),
            lastFailedLoginAt: new Date().toISOString(),
            lastUserAgent: userAgent,
            lastIP: ipAddress
          }
        }, { merge: true });
      }
    });
}

function hasPermission(userData, permission) {
  return userData?.permissions?.[permission] === true;
}

function isAdmin(userData) {
  return userData?.role === USER_ROLES.ADMIN;
}

function isBoardReviewer(userData) {
  return userData?.role === USER_ROLES.BOARD_REVIEWER;
}

// ==========================================
// AUDIT LOGGING
// ==========================================

function logAuditEvent(action, actor, target = null, details = {}, outcome = 'success', errorMessage = null) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    actor: {
      uid: actor.uid,
      email: actor.email,
      role: actor.role
    },
    target,
    details: {
      ...details,
      ipAddress: details.ipAddress || null,
      userAgent: details.userAgent || null
    },
    outcome,
    errorMessage
  };
  
  return db.collection('audit_logs').add(logEntry);
}

// ==========================================
// ANALYTICS & REPORTING
// ==========================================

function getAnalyticsSummary(year = null) {
  const currentYear = year || new Date().getFullYear();
  return db.collection('analytics_cache').doc(`dashboard_${currentYear}`).get()
    .then(doc => doc.exists ? doc.data() : null);
}

function updateAnalyticsCache(year, stats) {
  return db.collection('analytics_cache').doc(`dashboard_${year}`).set({
    year,
    computedAt: new Date().toISOString(),
    stats
  });
}

function calculateSubmissionStats(submissions) {
  const stats = {
    totalSubmissions: submissions.length,
    submissionsByMonth: {},
    averageCompletionTime: 0,
    kpiAverages: {},
    completionRates: {
      overall: 0,
      bySection: {}
    }
  };
  
  if (submissions.length === 0) return stats;
  
  // Group by month
  submissions.forEach(sub => {
    const date = new Date(sub.submittedAt || sub.timestamp);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    stats.submissionsByMonth[monthKey] = (stats.submissionsByMonth[monthKey] || 0) + 1;
    
    // Calculate KPI averages
    if (sub.analytics?.kpiAverages) {
      Object.entries(sub.analytics.kpiAverages).forEach(([kpi, rating]) => {
        if (!stats.kpiAverages[kpi]) stats.kpiAverages[kpi] = [];
        stats.kpiAverages[kpi].push(rating);
      });
    }
  });
  
  // Average KPI scores
  Object.keys(stats.kpiAverages).forEach(kpi => {
    const ratings = stats.kpiAverages[kpi];
    stats.kpiAverages[kpi] = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  });
  
  return stats;
}

// ==========================================
// SYSTEM SETTINGS
// ==========================================

function getSystemSettings() {
  return db.collection('system_settings').doc('general').get()
    .then(doc => doc.exists ? doc.data() : getDefaultSystemSettings());
}

function updateSystemSettings(updates) {
  return db.collection('system_settings').doc('general').set(updates, { merge: true });
}

function getDefaultSystemSettings() {
  return {
    activeReviewYear: new Date().getFullYear(),
    activeReviewVersion: "v2.0",
    maintenanceMode: false,
    emailNotifications: {
      enabled: true,
      adminEmails: [],
      notifyOnSubmission: true,
      notifyOnUserRegistration: true
    },
    backupSettings: {
      autoBackupEnabled: false,
      backupFrequency: "weekly",
      lastBackupAt: null,
      backupLocation: "backups/"
    }
  };
}

// ==========================================
// NOTIFICATION SYSTEM
// ==========================================

function createNotification(type, title, message, recipients = [], data = {}) {
  const notification = {
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    isRead: false,
    recipients,
    data,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
  };
  
  return db.collection('notifications').add(notification);
}

function getNotifications(userEmail, limit = 50) {
  return db.collection('notifications')
    .where('recipients', 'array-contains', userEmail)
    .where('expiresAt', '>', new Date().toISOString())
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get()
    .then(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
}

function markNotificationAsRead(notificationId) {
  return db.collection('notifications').doc(notificationId).update({
    isRead: true
  });
}

// ==========================================
// DATA EXPORT TRACKING
// ==========================================

function trackExport(type, parameters, requestedBy) {
  const exportRecord = {
    type,
    requestedBy: {
      uid: requestedBy.uid,
      email: requestedBy.email
    },
    requestedAt: new Date().toISOString(),
    status: 'processing',
    parameters,
    downloadCount: 0
  };
  
  return db.collection('exports').add(exportRecord);
}

function updateExportStatus(exportId, status, filePath = null, fileSize = null) {
  const updates = {
    status,
    completedAt: new Date().toISOString()
  };
  
  if (filePath) updates.filePath = filePath;
  if (fileSize) updates.fileSize = fileSize;
  
  return db.collection('exports').doc(exportId).update(updates);
}

function recordExportDownload(exportId) {
  return db.collection('exports').doc(exportId).update({
    downloadCount: firebase.firestore.FieldValue.increment(1),
    lastDownloadedAt: new Date().toISOString()
  });
}


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA64oOlYODhYwXawZ8BDjU9uoZK7pn_aKQ",
  authDomain: "studio-8276146072-e2bec.firebaseapp.com",
  projectId: "studio-8276146072-e2bec",
  storageBucket: "studio-8276146072-e2bec.firebasestorage.app",
  messagingSenderId: "462550604907",
  appId: "1:462550604907:web:e19504133d5cb4bc12252e"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
// const storage = firebase.storage(); // No longer needed - using Firestore only

// Helper: get review doc ref for current user and collection
function getReviewDocRef(uid, collection) {
  return db.collection(collection).doc(uid);
}

// Login

function loginWithEmail(email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}

// Sign Up
function signUpWithEmail(email, password) {
  return auth.createUserWithEmailAndPassword(email, password);
}

// Logout
function logout() {
  return auth.signOut();
}

function sendPasswordReset(email) {
  return auth.sendPasswordResetEmail(email);
}

// ==========================================
// NEW CLEAN REVIEW STORAGE SYSTEM
// ==========================================

// NEW DATA STRUCTURE:
// {
//   id: "user-uid",
//   metadata: {
//     userEmail: "user@example.com", 
//     timestamp: "2025-10-15T...",
//     status: "draft" | "submitted",
//     version: "2.0"
//   },
//   sections: {
//     "part-1": { successes: "...", "not-well": "...", etc. },
//     "part-2": { challenges: [...], lastYearGoals: [...] },
//     // ... other sections
//   },
//   completion: {
//     completed: 6,
//     total: 7, 
//     percentage: 85.7
//   }
// }

// Map form fields to their respective sections
const FIELD_TO_SECTION_MAP = {
  'successes': 'part-1',
  'not-well': 'part-1', 
  'comparative-reflection': 'part-1',
  'challenges': 'part-2',
  'lastYearGoals': 'part-2',
  'kpis': 'part-2',
  'jdAlignment': 'part-3',
  'strategicPriorities': 'part-4',
  'strengths': 'part-5',
  'limitations': 'part-5',
  'pdUndertaken': 'part-5',
  'pdNeeded': 'part-5',
  'futureGoals': 'part-6',
  'boardRequests': 'part-7'
};

// Calculate completion based on section data
function calculateCompletion(sections) {
  let completed = 0;
  const total = 7;
  
  // Part 1: Performance Reflection
  if ((sections['part-1']?.successes && sections['part-1'].successes.trim()) ||
      (sections['part-1']?.['not-well'] && sections['part-1']['not-well'].trim()) ||
      (sections['part-1']?.['comparative-reflection'] && sections['part-1']['comparative-reflection'].trim())) {
    completed++;
  }
  
  // Part 2: Previous Goals & KPIs  
  if ((sections['part-2']?.challenges && sections['part-2'].challenges.length > 0) ||
      (sections['part-2']?.lastYearGoals && sections['part-2'].lastYearGoals.length > 0) ||
      (sections['part-2']?.kpis && sections['part-2'].kpis.length > 0)) {
    completed++;
  }
  
  // Part 3: JD Alignment
  if (sections['part-3']?.jdAlignment && sections['part-3'].jdAlignment.length > 0) {
    completed++;
  }
  
  // Part 4: Strategic Priorities
  if (sections['part-4']?.strategicPriorities && sections['part-4'].strategicPriorities.length > 0) {
    completed++;
  }
  
  // Part 5: Personal Assessment
  if ((sections['part-5']?.strengths && sections['part-5'].strengths.trim()) ||
      (sections['part-5']?.limitations && sections['part-5'].limitations.trim()) ||
      (sections['part-5']?.pdUndertaken && sections['part-5'].pdUndertaken.length > 0) ||
      (sections['part-5']?.pdNeeded && sections['part-5'].pdNeeded.length > 0)) {
    completed++;
  }
  
  // Part 6: Future Focus
  if (sections['part-6']?.futureGoals && sections['part-6'].futureGoals.length > 0) {
    completed++;
  }
  
  // Part 7: Board Dialogue
  if (sections['part-7']?.boardRequests && sections['part-7'].boardRequests.length > 0) {
    completed++;
  }
  
  return {
    completed,
    total,
    percentage: Math.round((completed / total) * 100 * 10) / 10
  };
}

// Convert flat form data to structured sections
function organizeBySections(flatData) {
  const sections = {
    'part-1': {},
    'part-2': {},
    'part-3': {},
    'part-4': {},
    'part-5': {},
    'part-6': {},
    'part-7': {}
  };
  
  // Organize fields by their sections
  for (const [fieldName, value] of Object.entries(flatData)) {
    const sectionId = FIELD_TO_SECTION_MAP[fieldName];
    if (sectionId) {
      sections[sectionId][fieldName] = value;
    }
  }
  
  return sections;
}

// Save a review (draft or submission)
function saveReview(uid, flatFormData, status = 'draft') {
  const user = auth.currentUser;
  const sections = organizeBySections(flatFormData);
  const completion = calculateCompletion(sections);
  
  const reviewData = {
    uid: uid,
    metadata: {
      userEmail: user?.email || null,
      userDisplayName: user?.displayName || null,
      timestamp: new Date().toISOString(),
      status: status, // 'draft' or 'submitted'
      version: '2.0'
    },
    sections,
    completion
  };
  
  const collection = status === 'submitted' ? 'submissions' : 'drafts';
  
  // Save with UID as document ID for both drafts and submissions
  // This allows Firestore rules to work with isOwner() check
  return getReviewDocRef(uid, collection).set(reviewData, { merge: false });
}

// Load a review (from drafts or submissions)
function loadReview(uid, status = 'draft') {
  const collection = status === 'submitted' ? 'submissions' : 'drafts';
  return getReviewDocRef(uid, collection).get().then(doc => doc.exists ? doc.data() : null);
}

// Delete a review 
function deleteReview(uid, status = 'draft') {
  const collection = status === 'submitted' ? 'submissions' : 'drafts';
  return getReviewDocRef(uid, collection).delete();
}

// Convert structured sections back to flat data for form population
function flattenSections(sections) {
  const flatData = {};
  for (const [sectionId, sectionData] of Object.entries(sections || {})) {
    for (const [fieldName, value] of Object.entries(sectionData || {})) {
      flatData[fieldName] = value;
    }
  }
  return flatData;
}

// Save CSV data directly to Firestore instead of Storage
function saveCsvToFirestore(uid, filename, csvString) {
  const user = auth.currentUser;
  const payload = {
    uid,
    filename,
    csvData: csvString,
    createdAt: new Date().toISOString(),
    userEmail: user?.email || null,
    fileSize: csvString.length
  };
  
  return db.collection('csv_backups').doc(`${uid}_${filename}`).set(payload);
}

function updateReviewMetadata(uid, collection, updates = {}) {
  const user = auth.currentUser;
  const payload = {
    uid,
    userEmail: user?.email || null,
    userDisplayName: user?.displayName || null,
    lastUpdatedAt: new Date().toISOString(),
    ...updates
  };
  return getReviewDocRef(uid, collection).set(payload, { merge: true });
}

// Auth state listener
auth.onAuthStateChanged(user => {
  window.onFirebaseAuthStateChanged && window.onFirebaseAuthStateChanged(user);
});

// Expose helpers globally
window.firebaseHelpers = {
  // Authentication
  loginWithEmail,
  signUpWithEmail,
  logout,
  sendPasswordReset,
  
  // Review Data - NEW CLEAN SYSTEM
  saveReview,
  loadReview,
  deleteReview,
  flattenSections,
  calculateCompletion,
  organizeBySections,
  saveCsvToFirestore,
  updateReviewMetadata,
  
  // User Management
  setUserRole,
  getUserRole,
  getUserData,
  updateUserLoginInfo,
  recordFailedLogin,
  hasPermission,
  isAdmin,
  isBoardReviewer,
  
  // Audit Logging
  logAuditEvent,
  
  // Analytics
  getAnalyticsSummary,
  updateAnalyticsCache,
  calculateSubmissionStats,
  
  // System Settings
  getSystemSettings,
  updateSystemSettings,
  
  // Notifications
  createNotification,
  getNotifications,
  markNotificationAsRead,
  
  // Export Tracking
  trackExport,
  updateExportStatus,
  recordExportDownload,
  
  // Constants
  USER_ROLES,
  DEFAULT_PERMISSIONS,
  
  // Firebase instances
  auth,
  db
};
