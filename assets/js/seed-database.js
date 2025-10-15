// ==========================================
// FIRESTORE DATABASE SEEDING SCRIPT
// ==========================================

// This script initializes the Firestore database with essential data
// for the REAP Marlborough CEO Review admin system

const seedData = {
  // System settings with default configuration
  systemSettings: {
    id: 'general',
    activeReviewYear: 2025,
    activeReviewVersion: 'v2.0',
    maintenanceMode: false,
    emailNotifications: {
      enabled: true,
      adminEmails: ['louisa@whiringa.com'],
      notifyOnSubmission: true,
      notifyOnUserRegistration: true
    },
    backupSettings: {
      autoBackupEnabled: false,
      backupFrequency: 'weekly',
      lastBackupAt: null,
      backupLocation: 'backups/'
    },
    reviewTemplate: {
      version: 'v2.0',
      sections: {
        'part-1': 'Performance Reflection',
        'part-2': 'Review of Previous Goals & KPIs',
        'part-3': 'Job Description Alignment',
        'part-4': 'Strategic Priorities (2022–2024)',
        'part-5': 'Personal Assessment & Development',
        'part-6': 'Future Focus (Next 12 Months)',
        'part-7': 'Dialogue with the Board'
      },
      kpiCategories: [
        {
          id: 'communication',
          name: 'Communication & Stakeholder Relations',
          weight: 1.0
        },
        {
          id: 'leadership',
          name: 'Leadership & Team Management',
          weight: 1.0
        },
        {
          id: 'financial',
          name: 'Financial Management & Oversight',
          weight: 1.0
        },
        {
          id: 'strategic',
          name: 'Strategic Planning & Vision',
          weight: 1.0
        },
        {
          id: 'governance',
          name: 'Governance & Compliance',
          weight: 1.0
        },
        {
          id: 'innovation',
          name: 'Innovation & Change Management',
          weight: 1.0
        }
      ]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Default admin user (Louisa)
  defaultAdmin: {
    email: 'louisa@whiringa.com',
    role: 'admin',
    displayName: 'Louisa Murray',
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
    updatedAt: new Date().toISOString(),
    lastLoginAt: null,
    loginCount: 0,
    metadata: {
      failedLoginAttempts: 0,
      lastFailedLoginAt: null,
      lastIP: null,
      lastUserAgent: null
    }
  },

  // Initial analytics cache for current year
  analyticsCache: {
    id: 'dashboard_2025',
    year: 2025,
    computedAt: new Date().toISOString(),
    stats: {
      totalSubmissions: 0,
      totalDrafts: 0,
      averageCompletionTime: 0,
      submissionsByMonth: {},
      kpiAverages: {},
      completionRates: {
        overall: 0,
        bySection: {}
      },
      yearOverYearComparison: {}
    }
  },

  // Sample notification
  initialNotification: {
    type: 'system',
    title: 'Admin System Initialized',
    message: 'The REAP Marlborough CEO Review admin system has been successfully set up and is ready for use.',
    timestamp: new Date().toISOString(),
    isRead: false,
    recipients: ['louisa@whiringa.com'],
    data: {
      version: 'v2.0',
      setupDate: new Date().toISOString()
    },
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
  },

  // Initial audit log entry
  initialAuditLog: {
    timestamp: new Date().toISOString(),
    action: 'SYSTEM_INITIALIZED',
    actor: {
      uid: 'system',
      email: 'system',
      role: 'system'
    },
    target: {
      type: 'system',
      id: 'database'
    },
    details: {
      version: 'v2.0',
      collections: ['users', 'system_settings', 'analytics_cache', 'notifications', 'audit_logs'],
      setupDate: new Date().toISOString()
    },
    outcome: 'success',
    errorMessage: null
  }
};

// Function to seed the database
async function seedFirestore() {
  console.log('🌱 Starting Firestore database seeding...');
  
  try {
    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
      throw new Error('Firebase is not loaded. Make sure to include Firebase SDK.');
    }

    const db = firebase.firestore();
    const batch = db.batch();

    // 1. Create system_settings document
    console.log('📋 Creating system settings...');
    const settingsRef = db.collection('system_settings').doc(seedData.systemSettings.id);
    batch.set(settingsRef, seedData.systemSettings);

    // 2. Create default admin user
    console.log('👤 Creating default admin user...');
    const adminRef = db.collection('users').doc(); // Auto-generate ID
    batch.set(adminRef, seedData.defaultAdmin);

    // 3. Create analytics cache
    console.log('📊 Initializing analytics cache...');
    const analyticsRef = db.collection('analytics_cache').doc(seedData.analyticsCache.id);
    batch.set(analyticsRef, seedData.analyticsCache);

    // 4. Create initial notification
    console.log('🔔 Adding initial notification...');
    const notificationRef = db.collection('notifications').doc();
    batch.set(notificationRef, seedData.initialNotification);

    // 5. Create initial audit log
    console.log('📝 Creating initial audit log...');
    const auditRef = db.collection('audit_logs').doc();
    batch.set(auditRef, seedData.initialAuditLog);

    // Commit all changes
    await batch.commit();

    console.log('✅ Database seeding completed successfully!');
    console.log('📋 Created collections:');
    console.log('   - system_settings (1 document)');
    console.log('   - users (1 admin user)');
    console.log('   - analytics_cache (1 document)');
    console.log('   - notifications (1 document)');
    console.log('   - audit_logs (1 document)');
    console.log('');
    console.log('🎉 Admin system is ready to use!');
    console.log('🔗 Access the admin panel at: /admin.html');
    console.log('👤 Default admin: louisa@whiringa.com');

    return true;

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    console.error('Details:', error.message);
    return false;
  }
}

// Function to check if database is already seeded
async function checkIfSeeded() {
  try {
    const db = firebase.firestore();
    const settingsDoc = await db.collection('system_settings').doc('general').get();
    return settingsDoc.exists;
  } catch (error) {
    console.error('Error checking database state:', error);
    return false;
  }
}

// Function to reset database (for development only!)
async function resetDatabase() {
  if (!confirm('⚠️  This will DELETE ALL admin data! Are you sure? This action cannot be undone.')) {
    return false;
  }

  console.log('🗑️  Resetting database...');
  
  try {
    const db = firebase.firestore();
    const collections = ['system_settings', 'users', 'analytics_cache', 'notifications', 'audit_logs'];

    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).get();
      const batch = db.batch();
      
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log(`   Cleared ${collectionName} collection`);
    }

    console.log('✅ Database reset completed');
    return true;

  } catch (error) {
    console.error('❌ Database reset failed:', error);
    return false;
  }
}

// Export functions for use in browser console or other scripts
if (typeof window !== 'undefined') {
  window.seedFirestore = seedFirestore;
  window.checkIfSeeded = checkIfSeeded;
  window.resetDatabase = resetDatabase; // Development only!
}

// Auto-run seeding if called directly
if (typeof window !== 'undefined' && window.location.pathname.includes('seed')) {
  document.addEventListener('DOMContentLoaded', async () => {
    const alreadySeeded = await checkIfSeeded();
    
    if (alreadySeeded) {
      console.log('🌱 Database already seeded. Use resetDatabase() to clear and re-seed.');
      console.log('ℹ️  Available functions:');
      console.log('   - seedFirestore() - Seed the database');
      console.log('   - checkIfSeeded() - Check if already seeded');
      console.log('   - resetDatabase() - Reset all data (DANGEROUS!)');
    } else {
      console.log('🌱 Database not seeded. Starting automatic seeding...');
      await seedFirestore();
    }
  });
}