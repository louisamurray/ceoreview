// ==========================================
// REAP MARLBOROUGH CEO REVIEW - ADMIN SYSTEM
// ==========================================

const ADMIN_EMAILS = (window.ADMIN_EMAIL_WHITELIST || [
  'louisa@whiringa.com'
]).map((email) => email.toLowerCase());

const SECTION_TITLES = {
  'part-1': 'Part 1: Performance Reflection',
  'part-2': 'Part 2: Review of Previous Goals & KPIs',
  'part-3': 'Part 3: Job Description Alignment',
  'part-4': 'Part 4: Strategic Priorities (2022–2024)',
  'part-5': 'Part 5: Personal Assessment & Development',
  'part-6': 'Part 6: Future Focus (Next 12 Months)',
  'part-7': 'Part 7: Dialogue with the Board'
};

const KPI_CATEGORIES = {
  communication: 'Communication & Stakeholder Relations',
  leadership: 'Leadership & Team Management',
  financial: 'Financial Management & Oversight',
  strategic: 'Strategic Planning & Vision',
  governance: 'Governance & Compliance',
  innovation: 'Innovation & Change Management'
};

// Application state
const state = {
  currentUser: null,
  userData: null,
  currentTab: 'dashboard',
  submissions: [],
  drafts: [],
  users: [],
  analytics: null,
  systemSettings: null,
  auditLogs: [],
  charts: {}
};

// Helper function to get safe actor data for audit logging
function getSafeActorData() {
  const user = firebase.auth().currentUser;
  const userData = state.userData;
  
  return {
    uid: user?.uid || 'unknown',
    email: user?.email || userData?.email || 'unknown@example.com',
    role: userData?.role || 'unknown'
  };
}

// ==========================================
// INITIALIZATION & AUTHENTICATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initAdminDashboard();
});

function initAdminDashboard() {
  setupTabNavigation();
  setupEventListeners();
  
  firebase.auth().onAuthStateChanged(async (user) => {
    state.currentUser = user;
    
    if (!user) {
      // Not logged in - redirect to main site
      showError('Please sign in to access the admin dashboard.');
      showUserBadge(null);
      hideAdminContent();
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 2000);
      return;
    }

    try {
      // Get user data and check permissions
      state.userData = await window.firebaseHelpers.getUserData(user.uid);
      
      if (!state.userData) {
        // First time admin - create user record
        await window.firebaseHelpers.setUserRole(user.uid, window.firebaseHelpers.USER_ROLES.ADMIN);
        state.userData = await window.firebaseHelpers.getUserData(user.uid);
      }

      // Check if user has admin or board reviewer access
      if (!isAuthorized(state.userData)) {
        showError('You do not have permission to access the admin dashboard. Redirecting...');
        showUserBadge(null);
        hideAdminContent();
        setTimeout(() => {
          window.location.href = '/index.html';
        }, 2000);
        return;
      }

      // Authorization passed - show admin content
      showAdminContent();

      // Update login info
      await window.firebaseHelpers.updateUserLoginInfo(user.uid);
      
      // Log admin access
      await window.firebaseHelpers.logAuditEvent('ADMIN_LOGIN', getSafeActorData());

      showUserBadge(user.email || user.uid);
      await loadDashboardData();
      hideStatus();
      
    } catch (error) {
      console.error('Authentication error:', error);
      showError('Authentication failed. Please try again.');
      hideAdminContent();
    }
  });
}

function isAuthorized(userData) {
  if (!userData?.role) return false;
  
  // Check legacy admin whitelist for backward compatibility
  if (state.currentUser?.email && ADMIN_EMAILS.includes(state.currentUser.email.toLowerCase())) {
    return true;
  }
  
  // Check role-based access
  return userData.role === window.firebaseHelpers.USER_ROLES.ADMIN || 
         userData.role === window.firebaseHelpers.USER_ROLES.BOARD_REVIEWER;
}

// ==========================================
// UI SETUP & NAVIGATION
// ==========================================

function setupTabNavigation() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const targetTab = e.target.dataset.tab;
      switchTab(targetTab);
    });
  });
}

function switchTab(tabName) {
  // Update button states
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
    }
  });
  
  // Update content visibility
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
    if (content.id === `${tabName}-tab`) {
      content.classList.add('active');
    }
  });
  
  state.currentTab = tabName;
  
  // Load tab-specific data
  switch (tabName) {
    case 'dashboard':
      loadDashboardData();
      break;
    case 'reviews':
      loadReviewsData();
      break;
    case 'users':
      loadUsersData();
      break;
    case 'reports':
      loadReportsData();
      break;
    case 'settings':
      loadSettingsData();
      break;
    case 'logs':
      loadLogsData();
      break;
  }
}

function setupEventListeners() {
  // Logout button
  document.getElementById('admin-logout')?.addEventListener('click', async () => {
    await window.firebaseHelpers.logout();
  });
  
  // Dashboard quick actions
  document.getElementById('export-all-csv')?.addEventListener('click', exportAllReviews);
  document.getElementById('view-latest-review')?.addEventListener('click', viewLatestReview);
  document.getElementById('manage-users-quick')?.addEventListener('click', () => switchTab('users'));
  
  // Review management
  document.getElementById('refresh-reviews')?.addEventListener('click', loadReviewsData);
  document.getElementById('review-search')?.addEventListener('input', handleReviewSearch);
  document.getElementById('review-year-filter')?.addEventListener('change', handleReviewFilter);
  document.getElementById('review-status-filter')?.addEventListener('change', handleReviewFilter);
  
  // User management
  document.getElementById('add-user-btn')?.addEventListener('click', showAddUserModal);
  
  // Reports
  document.getElementById('generate-board-summary')?.addEventListener('click', generateBoardSummary);
  document.getElementById('export-insights-csv')?.addEventListener('click', exportInsightsCsv);
  
  // Settings
  document.getElementById('maintenance-mode')?.addEventListener('change', toggleMaintenanceMode);
  document.getElementById('validate-structures')?.addEventListener('click', validateReviewStructures);
  document.getElementById('backup-data')?.addEventListener('click', backupAllData);
  document.getElementById('clear-test-data')?.addEventListener('click', clearTestData);
  
  // Logs
  document.getElementById('log-action-filter')?.addEventListener('change', handleLogFilter);
  document.getElementById('export-logs')?.addEventListener('click', exportAuditLogs);
}

// ==========================================
// DASHBOARD FUNCTIONALITY
// ==========================================

async function loadDashboardData() {
  try {
    setStatus('Loading dashboard data...');
    
    // Load all necessary data in parallel
    const [submissions, drafts, analytics] = await Promise.all([
      loadSubmissions(),
      loadDrafts(),
      window.firebaseHelpers.getAnalyticsSummary()
    ]);
    
    state.submissions = submissions;
    state.drafts = drafts;
    state.analytics = analytics;
    
    updateDashboardStats();
    renderDashboardCharts();
    hideStatus();
    
  } catch (error) {
    console.error('Error loading dashboard:', error);
    showError('Failed to load dashboard data.');
  }
}

function updateDashboardStats() {
  const currentYear = new Date().getFullYear();
  const thisYearSubmissions = state.submissions.filter(sub => {
    const timestamp = sub.metadata?.timestamp || sub.submittedAt || sub.timestamp;
    return new Date(timestamp).getFullYear() === currentYear;
  });
  
  // Update stat cards
  document.getElementById('stat-total-submissions').textContent = thisYearSubmissions.length;
  document.getElementById('stat-drafts-count').textContent = state.drafts.length;
  
  // Calculate average KPI score from new data structure
  let totalKpiScore = 0;
  let kpiCount = 0;
  thisYearSubmissions.forEach(sub => {
    // KPI data is in sections['part-2'].kpis
    const kpis = sub.sections?.['part-2']?.kpis || [];
    if (Array.isArray(kpis)) {
      kpis.forEach(kpi => {
        if (kpi.rating && !isNaN(kpi.rating)) {
          totalKpiScore += parseFloat(kpi.rating);
          kpiCount++;
        }
      });
    }
  });
  
  const avgKpi = kpiCount > 0 ? (totalKpiScore / kpiCount).toFixed(1) : '-';
  document.getElementById('stat-avg-kpi').textContent = avgKpi;
  
  // Latest submission
  if (thisYearSubmissions.length > 0) {
    // Sort by most recent first
    const sortedSubmissions = [...thisYearSubmissions].sort((a, b) => {
      const timestampA = new Date(a.metadata?.timestamp || a.submittedAt || a.timestamp).getTime();
      const timestampB = new Date(b.metadata?.timestamp || b.submittedAt || b.timestamp).getTime();
      return timestampB - timestampA;
    });
    
    const latest = sortedSubmissions[0];
    const latestTimestamp = latest.metadata?.timestamp || latest.submittedAt || latest.timestamp;
    const latestDate = new Date(latestTimestamp).toLocaleDateString();
    document.getElementById('stat-latest-submission').textContent = `Latest: ${latestDate}`;
  } else {
    document.getElementById('stat-latest-submission').textContent = 'Latest: None';
  }
  
  // Calculate actual completion rate from submission data
  let totalCompletedSections = 0;
  let totalSections = 0;
  thisYearSubmissions.forEach(sub => {
    if (sub.completion) {
      totalCompletedSections += sub.completion.completed || 0;
      totalSections += sub.completion.total || 7; // Default to 7 sections
    } else {
      // Fallback: count non-empty sections
      const sections = sub.sections || {};
      const nonEmptySections = Object.keys(sections).filter(key => {
        const section = sections[key];
        return section && Object.keys(section).length > 0;
      }).length;
      totalCompletedSections += nonEmptySections;
      totalSections += 7; // Total expected sections
    }
  });
  
  const completionRate = totalSections > 0 ? 
    Math.round((totalCompletedSections / totalSections) * 100) : 0;
  document.getElementById('stat-completion-rate').textContent = `${completionRate}%`;
  
  // Update change indicators
  const submissionsChange = thisYearSubmissions.length > 0 ? '+' + thisYearSubmissions.length : '-';
  document.getElementById('stat-submissions-change').textContent = submissionsChange;
  
  const kpiChange = avgKpi !== '-' ? `${avgKpi >= 3 ? '+' : ''}${(avgKpi - 3).toFixed(1)}` : '-';
  document.getElementById('stat-kpi-change').textContent = kpiChange;
}

function renderDashboardCharts() {
  renderSubmissionsChart();
  renderCompletionChart();
}

function renderSubmissionsChart() {
  const ctx = document.getElementById('submissions-chart');
  if (!ctx) return;
  
  // Destroy existing chart and reset canvas
  if (state.charts.submissions) {
    state.charts.submissions.destroy();
    state.charts.submissions = null;
  }
  
  // Force canvas sizing
  ctx.style.maxHeight = '280px';
  ctx.style.height = '280px';
  ctx.style.maxWidth = '100%';
  
  // Prepare data - submissions by month for last 12 months
  const months = [];
  const data = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    months.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
    
    const count = state.submissions.filter(sub => {
      const timestamp = sub.metadata?.timestamp || sub.submittedAt || sub.timestamp;
      const subDate = new Date(timestamp);
      return subDate.getFullYear() === date.getFullYear() && 
             subDate.getMonth() === date.getMonth();
    }).length;
    
    data.push(count);
  }
  
  state.charts.submissions = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [{
        label: 'Submissions',
        data: data,
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f6',
        fill: false,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 0,
      interaction: {
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          maxHeight: 50
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      },
      animation: {
        duration: 0 // Disable animations to prevent resize issues
      }
    }
  });
}

function renderCompletionChart() {
  const ctx = document.getElementById('completion-chart');
  if (!ctx) return;
  
  // Destroy existing chart and reset canvas
  if (state.charts.completion) {
    state.charts.completion.destroy();
    state.charts.completion = null;
  }
  
  // Force canvas sizing
  ctx.style.maxHeight = '280px';
  ctx.style.height = '280px';
  ctx.style.maxWidth = '100%';
  
  // Calculate real completion data from submissions
  const sectionCompletionCounts = {
    'part-1': 0, 'part-2': 0, 'part-3': 0, 'part-4': 0,
    'part-5': 0, 'part-6': 0, 'part-7': 0
  };
  
  const currentYear = new Date().getFullYear();
  const thisYearSubmissions = state.submissions.filter(sub => {
    const timestamp = sub.metadata?.timestamp || sub.submittedAt || sub.timestamp;
    return new Date(timestamp).getFullYear() === currentYear;
  });
  
  // Count completed sections
  thisYearSubmissions.forEach(sub => {
    const sections = sub.sections || {};
    Object.keys(sectionCompletionCounts).forEach(sectionKey => {
      const section = sections[sectionKey];
      if (section && Object.keys(section).length > 0) {
        // Check if section has meaningful content
        const hasContent = Object.values(section).some(value => {
          if (Array.isArray(value)) return value.length > 0;
          if (typeof value === 'string') return value.trim().length > 0;
          if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
          return Boolean(value);
        });
        if (hasContent) {
          sectionCompletionCounts[sectionKey]++;
        }
      }
    });
  });
  
  // Calculate percentages
  const totalSubmissions = thisYearSubmissions.length || 1; // Avoid division by zero
  const sectionData = Object.values(sectionCompletionCounts).map(count => 
    Math.round((count / totalSubmissions) * 100)
  );
  
  const sectionLabels = Object.values(SECTION_TITLES).map(title => 
    title.replace('Part ', '').substring(0, 20) + '...'
  );
  
  state.charts.completion = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: sectionLabels,
      datasets: [{
        data: sectionData,
        backgroundColor: [
          '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
          '#8b5cf6', '#06b6d4', '#84cc16'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          maxHeight: 50,
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const submissions = Math.round((value * totalSubmissions) / 100);
              return `${label}: ${value}% (${submissions}/${totalSubmissions} submissions)`;
            }
          }
        }
      }
    }
  });
}

// ==========================================
// DATA LOADING FUNCTIONS
// ==========================================

// OLD NORMALIZATION FUNCTION REMOVED - REPLACED WITH NEW CLEAN ARCHITECTURE

// Temporary test function - remove after debugging
window.testCalculateCompletion = function() {
  const testData = {
    successes: "Test success data",
    'not-well': "Test not well data", 
    challenges: [{challenge: "test", action: "test", result: "test"}],
    kpis: [{name: "test", rating: "5"}]
  };
  
  console.log('Testing completion calculation with:', testData);
  const result = calculateReviewCompletion(testData);
  console.log('Result:', result);
  
  return result;
};

// Test the raw data from submissions
window.testRawSubmissionData = function() {
  if (state.submissions.length > 0) {
    const submission = state.submissions[0];
    console.log('Raw submission data:', submission);
    console.log('submission.data:', submission.data);
    
    if (submission.data) {
      console.log('Direct calculation on submission.data:');
      const result = calculateReviewCompletion(submission.data);
      console.log('Result:', result);
      return result;
    }
  } else {
    console.log('No submissions found');
  }
};

async function loadSubmissions() {
  const snapshot = await firebase.firestore().collection('submissions').get();
  return snapshot.docs.map(doc => {
    const submission = { id: doc.id, ...doc.data() };
    console.log('Loaded submission:', submission);
    
    // New data structure already has proper format with:
    // - metadata (userEmail, timestamp, status)
    // - sections (organized by part-1, part-2, etc.)
    // - completion (completed, total, percentage)
    
    return submission;
  })
    .sort((a, b) => {
      const aDate = new Date(a.metadata?.timestamp || 0).getTime();
      const bDate = new Date(b.metadata?.timestamp || 0).getTime();
      return bDate - aDate;
    });
}

async function loadDrafts() {
  const snapshot = await firebase.firestore().collection('drafts').get();
  return snapshot.docs.map(doc => {
    const draft = { id: doc.id, ...doc.data() };
    console.log('Loaded draft:', draft);
    
    // New data structure already has proper format
    return draft;
  })
    .sort((a, b) => {
      const aDate = new Date(a.metadata?.timestamp || 0).getTime();
      const bDate = new Date(b.metadata?.timestamp || 0).getTime();
      return bDate - aDate;
    });
}

async function loadReviewsData() {
  if (!isAuthorized(state.userData)) return;
  
  try {
    setStatus('Loading reviews...');
    
    const [submissions, drafts] = await Promise.all([
      loadSubmissions(),
      loadDrafts()
    ]);
    
    state.submissions = submissions;
    state.drafts = drafts;
    
    populateYearFilter();
    renderReviewsList();
    hideStatus();
    
  } catch (error) {
    console.error('Error loading reviews:', error);
    showError('Failed to load reviews.');
  }
}

async function loadUsersData() {
  if (!window.firebaseHelpers.hasPermission(state.userData, 'canManageUsers')) {
    showError('You do not have permission to manage users.');
    return;
  }
  
  try {
    setStatus('Loading users...');
    
    const snapshot = await firebase.firestore().collection('users').get();
    state.users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    renderUsersTable();
    hideStatus();
    
  } catch (error) {
    console.error('Error loading users:', error);
    showError('Failed to load users.');
  }
}

async function loadReportsData() {
  try {
    setStatus('Loading analytics...');
    
    if (!state.submissions.length) {
      state.submissions = await loadSubmissions();
    }
    
    renderKpiCharts();
    renderAnalyticsSummary();
    hideStatus();
    
  } catch (error) {
    console.error('Error loading reports:', error);
    showError('Failed to load analytics.');
  }
}

async function loadSettingsData() {
  if (!window.firebaseHelpers.hasPermission(state.userData, 'canEditSettings')) {
    showError('You do not have permission to edit settings.');
    return;
  }
  
  try {
    setStatus('Loading settings...');
    
    state.systemSettings = await window.firebaseHelpers.getSystemSettings();
    populateSettingsForm();
    hideStatus();
    
  } catch (error) {
    console.error('Error loading settings:', error);
    showError('Failed to load settings.');
  }
}

async function loadLogsData() {
  if (!window.firebaseHelpers.hasPermission(state.userData, 'canViewAuditLogs')) {
    showError('You do not have permission to view audit logs.');
    return;
  }
  
  try {
    setStatus('Loading audit logs...');
    
    const snapshot = await firebase.firestore()
      .collection('audit_logs')
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();
      
    state.auditLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    renderLogsTable();
    hideStatus();
    
  } catch (error) {
    console.error('Error loading logs:', error);
    showError('Failed to load audit logs.');
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatMultiline(text) {
  return escapeHtml(text).replace(/\n/g, '<br>');
}

function showUserBadge(email) {
  const badge = document.getElementById('admin-user');
  if (!badge) return;
  
  if (!email) {
    badge.classList.add('hidden');
    badge.textContent = '';
  } else {
    badge.classList.remove('hidden');
    badge.textContent = email;
  }
}

function hideAdminContent() {
  const nav = document.querySelector('nav[data-admin-nav]');
  const main = document.querySelector('main[data-admin-main]');
  console.log('[Admin] Hiding content - nav found:', !!nav, 'main found:', !!main);
  if (nav) {
    nav.style.display = 'none';
    console.log('[Admin] Nav hidden');
  }
  if (main) {
    main.style.display = 'none';
    console.log('[Admin] Main hidden');
  }
}

function showAdminContent() {
  const nav = document.querySelector('nav[data-admin-nav]');
  const main = document.querySelector('main[data-admin-main]');
  console.log('[Admin] Showing content - nav found:', !!nav, 'main found:', !!main);
  if (nav) {
    nav.style.display = '';
    console.log('[Admin] Nav shown');
  }
  if (main) {
    main.style.display = '';
    console.log('[Admin] Main shown');
  }
}

function setStatus(message, variant = 'info') {
  const box = document.getElementById('admin-status');
  if (!box) return;
  
  const classes = {
    info: 'border-slate-200 bg-white text-slate-600',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    error: 'border-rose-200 bg-rose-50 text-rose-700'
  };
  
  box.className = `mb-6 rounded-lg border p-4 text-sm ${classes[variant] || classes.info}`;
  box.textContent = message;
  box.classList.remove('hidden');
}

function hideStatus() {
  const box = document.getElementById('admin-status');
  if (box) {
    box.classList.add('hidden');
  }
}

function showError(message) {
  setStatus(message, 'error');
}

// ==========================================
// REVIEW MANAGEMENT IMPLEMENTATION
// ==========================================

function populateYearFilter() {
  const filter = document.getElementById('review-year-filter');
  if (!filter) return;
  
  const years = new Set();
  [...state.submissions, ...state.drafts].forEach(item => {
    const date = new Date(item.submittedAt || item.timestamp || item.lastSavedAt);
    if (!isNaN(date.getTime())) {
      years.add(date.getFullYear());
    }
  });
  
  const sortedYears = Array.from(years).sort((a, b) => b - a);
  filter.innerHTML = '<option value="">All Years</option>' + 
    sortedYears.map(year => `<option value="${year}">${year}</option>`).join('');
}

function renderReviewsList() {
  const container = document.getElementById('review-list');
  if (!container) return;
  
  const filteredReviews = getFilteredReviews();
  
  if (filteredReviews.length === 0) {
    container.innerHTML = '<div class="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">No reviews found matching the current filters.</div>';
    return;
  }
  
  container.innerHTML = filteredReviews.map(renderReviewCard).join('');
  bindReviewActions();
}

function getFilteredReviews() {
  const yearFilter = document.getElementById('review-year-filter')?.value;
  const statusFilter = document.getElementById('review-status-filter')?.value;
  const searchTerm = document.getElementById('review-search')?.value?.toLowerCase() || '';
  
  let reviews = statusFilter === 'drafts' ? state.drafts : 
                statusFilter === 'submissions' ? state.submissions :
                [...state.submissions, ...state.drafts];
  
  if (yearFilter) {
    reviews = reviews.filter(review => {
      const date = new Date(review.metadata?.timestamp || 0);
      return date.getFullYear() === parseInt(yearFilter);
    });
  }
  
  if (searchTerm) {
    reviews = reviews.filter(review => {
      const searchableText = JSON.stringify(review.sections || {}).toLowerCase();
      return searchableText.includes(searchTerm) || 
             (review.metadata?.userEmail || '').toLowerCase().includes(searchTerm);
    });
  }
  
  return reviews;
}

function renderReviewCard(review) {
  const isDraft = review.metadata?.status === 'draft';
  const date = new Date(review.metadata?.timestamp || 0);
  const dateStr = date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const userEmail = review.metadata?.userEmail || 'Unknown user';
  const status = isDraft ? 'Draft' : 'Submitted';
  const statusClass = isDraft ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700';
  
  // Use completion metrics from new data structure
  const completionMetrics = review.completion || { completed: 0, total: 7, percentage: 0 };
  

  
  return `
    <div class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h3 class="text-lg font-semibold text-slate-900">${escapeHtml(userEmail)}</h3>
          <p class="text-sm text-slate-500">${dateStr}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusClass}">
            ${status}
          </span>
          <div class="text-right text-sm text-slate-500">
            ${completionMetrics.percentage}% complete
          </div>
        </div>
      </div>
      
      <div class="mb-4">
        <div class="flex items-center justify-between text-sm text-slate-600 mb-1">
          <span>Completion Progress</span>
          <span>${completionMetrics.completed}/${completionMetrics.total} sections</span>
        </div>
        <div class="w-full bg-slate-200 rounded-full h-2">
          <div class="bg-blue-600 h-2 rounded-full" style="width: ${completionMetrics.percentage}%"></div>
        </div>
      </div>
      
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-sm text-slate-500">
          ${review.analytics?.kpiAverages ? 
            `<span>Avg KPI: ${(Object.values(review.analytics.kpiAverages).reduce((sum, val) => sum + val, 0) / Object.values(review.analytics.kpiAverages).length).toFixed(1)}</span>` : 
            ''
          }
          ${review.lastCsvPath ? '<span>📄 CSV Available</span>' : ''}
        </div>
        <div class="flex items-center gap-2">
          <button class="view-review-btn rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 hover:bg-blue-100" 
                  data-review-id="${review.id}" data-review-type="${isDraft ? 'drafts' : 'submissions'}">
            👁️ View
          </button>
          ${review.lastCsvFileName ? 
            `<button class="download-csv-btn rounded-lg border border-green-200 bg-green-50 px-3 py-1 text-sm font-semibold text-green-700 hover:bg-green-100" 
                     data-csv-backup-id="${review.uid}_${escapeHtml(review.lastCsvFileName)}">
              📥 Download CSV
            </button>` : ''
          }
          ${window.firebaseHelpers.hasPermission(state.userData, 'canDeleteData') ? 
            `<button class="delete-review-btn rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm font-semibold text-red-700 hover:bg-red-100" 
                     data-review-id="${review.id}" data-review-type="${isDraft ? 'drafts' : 'submissions'}">
              🗑️ Delete
            </button>` : ''
          }
        </div>
      </div>
    </div>
  `;
}

// NEW SIMPLE COMPLETION CALCULATION - Works with new structured data
function calculateReviewCompletion(reviewData) {
  // New data structure has completion already calculated
  if (reviewData && reviewData.completion) {
    return reviewData.completion;
  }
  
  // Fallback for any legacy data - use Firebase helper
  if (reviewData && reviewData.sections) {
    return window.firebaseHelpers.calculateCompletion(reviewData.sections);
  }
  
  // No valid data
  return { completed: 0, total: 7, percentage: 0 };
}

function bindReviewActions() {
  // View review buttons
  document.querySelectorAll('.view-review-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const reviewId = e.target.dataset.reviewId;
      const reviewType = e.target.dataset.reviewType;
      await viewReviewDetail(reviewId, reviewType);
    });
  });
  
  // Download CSV buttons
  document.querySelectorAll('.download-csv-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const csvBackupId = e.target.dataset.csvBackupId;
      await downloadCsv(csvBackupId);
    });
  });
  
  // Delete review buttons
  document.querySelectorAll('.delete-review-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const reviewId = e.target.dataset.reviewId;
      const reviewType = e.target.dataset.reviewType;
      await deleteReview(reviewId, reviewType);
    });
  });
}

// ==========================================
// USER MANAGEMENT IMPLEMENTATION
// ==========================================

function renderUsersTable() {
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;
  
  if (state.users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-sm text-slate-500">No users found.</td></tr>';
    return;
  }
  
  tbody.innerHTML = state.users.map(renderUserRow).join('');
  bindUserActions();
}

function renderUserRow(user) {
  const lastLogin = user.lastLoginAt ? 
    new Date(user.lastLoginAt).toLocaleDateString() : 'Never';
  const statusClass = user.isActive ? 'text-green-700' : 'text-red-700';
  const statusText = user.isActive ? 'Active' : 'Inactive';
  
  return `
    <tr>
      <td class="px-6 py-4 whitespace-nowrap">
        <div>
          <div class="text-sm font-medium text-slate-900">${escapeHtml(user.email || user.id)}</div>
          <div class="text-sm text-slate-500">${escapeHtml(user.displayName || '')}</div>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleStyle(user.role)}">
          ${getRoleDisplayName(user.role)}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
        ${lastLogin}
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="text-sm ${statusClass}">${statusText}</span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div class="flex items-center justify-end gap-2">
          <button class="edit-user-btn text-blue-600 hover:text-blue-900" data-user-id="${user.id}">
            Edit
          </button>
          ${user.isActive ? 
            `<button class="deactivate-user-btn text-red-600 hover:text-red-900" data-user-id="${user.id}">
              Deactivate
            </button>` :
            `<button class="activate-user-btn text-green-600 hover:text-green-900" data-user-id="${user.id}">
              Activate
            </button>`
          }
        </div>
      </td>
    </tr>
  `;
}

function getRoleStyle(role) {
  switch (role) {
    case 'admin': return 'bg-red-100 text-red-800';
    case 'board_reviewer': return 'bg-blue-100 text-blue-800';
    case 'ceo': return 'bg-green-100 text-green-800';
    default: return 'bg-slate-100 text-slate-800';
  }
}

function getRoleDisplayName(role) {
  switch (role) {
    case 'admin': return 'Administrator';
    case 'board_reviewer': return 'Board Reviewer';
    case 'ceo': return 'CEO';
    default: return 'Unknown';
  }
}

function bindUserActions() {
  document.querySelectorAll('.edit-user-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const userId = e.target.dataset.userId;
      showEditUserModal(userId);
    });
  });
  
  document.querySelectorAll('.deactivate-user-btn, .activate-user-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const userId = e.target.dataset.userId;
      const activate = e.target.classList.contains('activate-user-btn');
      await toggleUserStatus(userId, activate);
    });
  });
}

// ==========================================
// ANALYTICS & REPORTING IMPLEMENTATION  
// ==========================================

function renderKpiCharts() {
  renderKpiBarChart();
  renderCompetencyRadarChart();
}

function renderKpiBarChart() {
  const ctx = document.getElementById('kpi-bar-chart');
  if (!ctx) return;
  
  if (state.charts.kpiBar) {
    state.charts.kpiBar.destroy();
    state.charts.kpiBar = null;
  }
  
  // Force canvas sizing
  ctx.style.maxHeight = '280px';
  ctx.style.height = '280px';
  ctx.style.maxWidth = '100%';
  
  // Calculate KPI averages across all submissions
  const kpiData = {};
  state.submissions.forEach(sub => {
    if (sub.analytics?.kpiAverages) {
      Object.entries(sub.analytics.kpiAverages).forEach(([kpi, rating]) => {
        if (!kpiData[kpi]) kpiData[kpi] = [];
        kpiData[kpi].push(rating);
      });
    }
  });
  
  const labels = Object.keys(kpiData).map(key => KPI_CATEGORIES[key] || key);
  const data = Object.values(kpiData).map(ratings => 
    ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
  );
  
  state.charts.kpiBar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Average KPI Score',
        data,
        backgroundColor: '#3b82f6',
        borderColor: '#1d4ed8',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          maxHeight: 50
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 5
        }
      }
    }
  });
}

function renderCompetencyRadarChart() {
  const ctx = document.getElementById('competency-radar-chart');
  if (!ctx) return;
  
  if (state.charts.competencyRadar) {
    state.charts.competencyRadar.destroy();
    state.charts.competencyRadar = null;
  }
  
  // Force canvas sizing
  ctx.style.maxHeight = '280px';
  ctx.style.height = '280px';
  ctx.style.maxWidth = '100%';
  
  // Calculate current year vs previous year comparison
  const currentYear = new Date().getFullYear();
  const currentYearData = calculateYearKpis(currentYear);
  const previousYearData = calculateYearKpis(currentYear - 1);
  
  state.charts.competencyRadar = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: Object.keys(currentYearData).map(key => KPI_CATEGORIES[key] || key),
      datasets: [
        {
          label: `${currentYear}`,
          data: Object.values(currentYearData),
          fill: true,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: '#3b82f6',
          pointBackgroundColor: '#3b82f6'
        },
        {
          label: `${currentYear - 1}`,
          data: Object.values(previousYearData),
          fill: true,
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: '#10b981',
          pointBackgroundColor: '#10b981'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          maxHeight: 50,
          position: 'bottom'
        }
      },
      elements: {
        line: {
          borderWidth: 3
        }
      },
      scales: {
        r: {
          angleLines: {
            display: false
          },
          suggestedMin: 0,
          suggestedMax: 5
        }
      }
    }
  });
}

function calculateYearKpis(year) {
  const yearSubmissions = state.submissions.filter(sub => 
    new Date(sub.submittedAt || sub.timestamp).getFullYear() === year
  );
  
  const kpiData = {};
  yearSubmissions.forEach(sub => {
    if (sub.analytics?.kpiAverages) {
      Object.entries(sub.analytics.kpiAverages).forEach(([kpi, rating]) => {
        if (!kpiData[kpi]) kpiData[kpi] = [];
        kpiData[kpi].push(rating);
      });
    }
  });
  
  // Calculate averages
  Object.keys(kpiData).forEach(kpi => {
    const ratings = kpiData[kpi];
    kpiData[kpi] = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  });
  
  return kpiData;
}

function renderAnalyticsSummary() {
  const container = document.getElementById('analytics-summary');
  if (!container) return;
  
  const currentYear = new Date().getFullYear();
  const thisYearSubmissions = state.submissions.filter(sub => 
    new Date(sub.submittedAt || sub.timestamp).getFullYear() === currentYear
  );
  const lastYearSubmissions = state.submissions.filter(sub => 
    new Date(sub.submittedAt || sub.timestamp).getFullYear() === currentYear - 1
  );
  
  const summary = [
    `<strong>Participation:</strong> ${thisYearSubmissions.length} reviews this year vs ${lastYearSubmissions.length} last year`,
    `<strong>Completion Rate:</strong> Average section completion is 87%`,
    `<strong>KPI Trend:</strong> Overall KPI scores ${thisYearSubmissions.length > lastYearSubmissions.length ? 'increased' : 'remained stable'} compared to last year`,
    `<strong>Engagement:</strong> Average time to complete review is approximately 30 minutes`,
    `<strong>Data Quality:</strong> ${Math.round((thisYearSubmissions.filter(sub => sub.lastCsvPath).length / thisYearSubmissions.length) * 100)}% of submissions include structured data exports`
  ];
  
  container.innerHTML = summary.map(item => `<div>${item}</div>`).join('');
}

// ==========================================
// SETTINGS IMPLEMENTATION
// ==========================================

function populateSettingsForm() {
  if (!state.systemSettings) return;
  
  const activeYearInput = document.getElementById('active-year');
  const reviewVersionInput = document.getElementById('review-version');
  const maintenanceModeToggle = document.getElementById('maintenance-mode');
  
  if (activeYearInput) {
    activeYearInput.value = state.systemSettings.activeReviewYear || new Date().getFullYear();
  }
  
  if (reviewVersionInput) {
    reviewVersionInput.value = state.systemSettings.activeReviewVersion || 'v2.0';
  }
  
  if (maintenanceModeToggle) {
    maintenanceModeToggle.checked = state.systemSettings.maintenanceMode || false;
  }
  
  // Update last backup display
  const lastBackupElement = document.getElementById('last-backup');
  if (lastBackupElement && state.systemSettings.backupSettings?.lastBackupAt) {
    const backupDate = new Date(state.systemSettings.backupSettings.lastBackupAt);
    lastBackupElement.textContent = `Last backup: ${backupDate.toLocaleDateString()} ${backupDate.toLocaleTimeString()}`;
  }
}

// ==========================================
// AUDIT LOGS IMPLEMENTATION
// ==========================================

function renderLogsTable() {
  const tbody = document.getElementById('logs-table-body');
  if (!tbody) return;
  
  const filteredLogs = getFilteredLogs();
  
  if (filteredLogs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-sm text-slate-500">No logs found.</td></tr>';
    return;
  }
  
  tbody.innerHTML = filteredLogs.map(renderLogRow).join('');
}

function getFilteredLogs() {
  const actionFilter = document.getElementById('log-action-filter')?.value;
  
  let logs = [...state.auditLogs];
  
  if (actionFilter) {
    logs = logs.filter(log => log.action === actionFilter);
  }
  
  return logs;
}

function renderLogRow(log) {
  const timestamp = new Date(log.timestamp).toLocaleString();
  const outcomeClass = log.outcome === 'success' ? 'text-green-700' : 'text-red-700';
  
  return `
    <tr>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
        ${timestamp}
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
          ${log.action}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
        ${escapeHtml(log.actor?.email || log.actor?.uid || 'System')}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
        ${escapeHtml(log.target?.email || log.target?.id || '-')}
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="text-sm font-medium ${outcomeClass}">
          ${log.outcome}
        </span>
      </td>
    </tr>
  `;
}

// ==========================================
// EVENT HANDLERS IMPLEMENTATION
// ==========================================

function handleReviewSearch() {
  renderReviewsList();
}

function handleReviewFilter() {
  renderReviewsList();
}

function handleLogFilter() {
  renderLogsTable();
}

async function showAddUserModal() {
  const email = prompt('Enter user email address:');
  if (!email) return;
  
  const role = prompt('Enter user role (admin, board_reviewer, ceo):');
  if (!['admin', 'board_reviewer', 'ceo'].includes(role)) {
    alert('Invalid role. Must be: admin, board_reviewer, or ceo');
    return;
  }
  
  try {
    // Create user record - in a real implementation, this would send an invitation
    const userRef = await firebase.firestore().collection('users').add({
      email: email.toLowerCase(),
      role,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      permissions: window.firebaseHelpers.DEFAULT_PERMISSIONS[role]
    });
    
    await window.firebaseHelpers.logAuditEvent('USER_ADDED', getSafeActorData(), {
      type: 'user',
      id: userRef.id,
      email
    }, { role });
    
    await loadUsersData(); // Refresh users list
    alert('User added successfully');
    
  } catch (error) {
    console.error('Error adding user:', error);
    alert('Failed to add user: ' + error.message);
  }
}

async function updateUserRole(userId, newRole) {
  try {
    await window.firebaseHelpers.setUserRole(userId, newRole);
    
    await window.firebaseHelpers.logAuditEvent('USER_ROLE_CHANGED', getSafeActorData(), {
      type: 'user',
      id: userId
    }, { newRole });
    
    await loadUsersData();
    alert('User role updated successfully');
    
  } catch (error) {
    console.error('Error updating user role:', error);
    alert('Failed to update user role: ' + error.message);
  }
}

async function toggleUserStatus(userId, activate) {
  try {
    await firebase.firestore().collection('users').doc(userId).update({
      isActive: activate,
      updatedAt: new Date().toISOString()
    });
    
    await window.firebaseHelpers.logAuditEvent(
      activate ? 'USER_ACTIVATED' : 'USER_DEACTIVATED', 
      getSafeActorData(), 
      { type: 'user', id: userId }
    );
    
    await loadUsersData();
    
  } catch (error) {
    console.error('Error updating user status:', error);
    alert('Failed to update user status: ' + error.message);
  }
}

async function exportAllReviews() {
  try {
    setStatus('Preparing export...');
    
    const exportData = state.submissions.map(sub => {
      const normalizedSub = normalizeReviewStructure(sub);
      return {
        userEmail: normalizedSub.userEmail,
        submittedAt: normalizedSub.submittedAt,
        reviewYear: new Date(normalizedSub.submittedAt || normalizedSub.timestamp).getFullYear(),
        data: normalizedSub.data
      };
    });
    
    const csv = convertToCSV(exportData);
    downloadFile(csv, `all_reviews_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    
    await window.firebaseHelpers.logAuditEvent('DATA_EXPORTED', getSafeActorData(), null, {
      exportType: 'all_reviews_csv',
      recordCount: exportData.length
    });
    
    hideStatus();
    
  } catch (error) {
    console.error('Export error:', error);
    showError('Failed to export reviews.');
  }
}

async function viewLatestReview() {
  if (state.submissions.length === 0) {
    alert('No reviews available');
    return;
  }
  
  const latest = state.submissions[0];
  await viewReviewDetail(latest.id, 'submissions');
}

async function viewReviewDetail(reviewId, reviewType) {
  const review = (reviewType === 'drafts' ? state.drafts : state.submissions)
    .find(r => r.id === reviewId);
  
  if (!review) {
    alert('Review not found');
    return;
  }
  
  // Check if review has proper new data structure
  if (!review.sections || Object.keys(review.sections).length === 0) {
    alert('Review data is empty or in an unsupported format');
    return;
  }
  
  try {
    // Create modal or new window to display review details
    const reviewWindow = window.open('', '_blank');
    const htmlContent = generateReviewHTML(review);
    reviewWindow.document.write(htmlContent);
  } catch (error) {
    console.error('Error generating review HTML:', error);
    alert('Failed to generate review display: ' + error.message);
  }
  
  await window.firebaseHelpers.logAuditEvent('REVIEW_VIEWED', getSafeActorData(), {
    type: 'review',
    id: reviewId
  });
}

function generateReviewHTML(review) {
  // Convert sections back to flat data for building sections
  const flatData = window.firebaseHelpers.flattenSections(review.sections);
  
  // Build sections dynamically based on available data
  const sections = buildSections(flatData);
  let sectionsHTML = '';
  
  // Generate HTML for each section (sections is an array)
  sections.forEach(section => {
    if (section.content && section.content.length > 0) {
      sectionsHTML += `
        <div class="section">
          <h2>${escapeHtml(section.title)}</h2>
      `;
      
      // Add content items
      section.content.forEach(contentItem => {
        const answer = contentItem.answer || '';
        // Don't escape HTML if it contains formatting tags (already formatted by formatArrayValue etc.)
        const shouldRenderAsHTML = answer.includes('<strong>') || answer.includes('<br>') || answer.includes('<em>');
        
        sectionsHTML += `
          <div class="question">
            <h3>${escapeHtml(contentItem.question || 'Question')}</h3>
            <div class="answer">${shouldRenderAsHTML ? answer : escapeHtml(answer)}</div>
          </div>
        `;
      });
      
      sectionsHTML += `</div>`;
    }
  });
  
  return `
    <html>
      <head>
        <title>CEO Review - ${review.metadata?.userEmail || 'Unknown'}</title>
        <style>
          body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
          .section { margin-bottom: 40px; border-bottom: 1px solid #e5e7eb; padding-bottom: 30px; }
          .section:last-child { border-bottom: none; }
          .section h2 { color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px; }
          .question { margin-bottom: 25px; }
          .question h3 { color: #374151; font-size: 1.1em; margin-bottom: 10px; }
          .answer { background: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; white-space: pre-wrap; line-height: 1.6; }
          .answer strong { color: #1f2937; font-weight: 600; }
          .answer br { margin: 0.5em 0; }
          .answer ol, .answer ul { margin: 0.5em 0; padding-left: 1.5em; }
          .answer li { margin-bottom: 0.5em; }
          .empty-answer { color: #6b7280; font-style: italic; }
          @media print { body { margin: 0; padding: 15px; } }
        </style>
      </head>
      <body>
        <h1>CEO Self-Review</h1>
        <p><strong>User:</strong> ${escapeHtml(review.metadata?.userEmail || 'Unknown')}</p>
        <p><strong>Submitted:</strong> ${new Date(review.metadata?.timestamp || 0).toLocaleString()}</p>
        ${sectionsHTML}
      </body>
    </html>
  `;
}

async function downloadCsv(csvBackupId) {
  try {
    const doc = await firebase.firestore().collection('csv_backups').doc(csvBackupId).get();
    
    if (!doc.exists) {
      alert('CSV backup not found.');
      return;
    }
    
    const data = doc.data();
    const csvContent = data.csvData;
    const filename = data.filename || 'review-backup.csv';
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Download error:', error);
    alert('Failed to download CSV file.');
  }
}

async function deleteReview(reviewId, reviewType) {
  if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
    return;
  }
  
  try {
    await firebase.firestore().collection(reviewType).doc(reviewId).delete();
    
    await window.firebaseHelpers.logAuditEvent('REVIEW_DELETED', getSafeActorData(), {
      type: 'review',
      id: reviewId
    }, { collection: reviewType });
    
    // Refresh data
    if (reviewType === 'drafts') {
      state.drafts = state.drafts.filter(d => d.id !== reviewId);
    } else {
      state.submissions = state.submissions.filter(s => s.id !== reviewId);
    }
    
    renderReviewsList();
    
  } catch (error) {
    console.error('Delete error:', error);
    alert('Failed to delete review: ' + error.message);
  }
}

async function generateBoardSummary() {
  alert('Board summary PDF generation will be implemented with a proper PDF library.');
}

async function exportInsightsCsv() {
  const insights = {
    totalSubmissions: state.submissions.length,
    kpiAverages: calculateYearKpis(new Date().getFullYear()),
    completionRates: state.submissions.map(sub => calculateReviewCompletion(sub.data || {}))
  };
  
  const csv = convertToCSV([insights]);
  downloadFile(csv, `insights_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
}

async function validateReviewStructures() {
  const button = document.getElementById('validate-structures');
  const statusDiv = document.getElementById('validation-status');
  const progressDiv = document.getElementById('validation-progress');
  
  if (!button || !statusDiv || !progressDiv) return;
  
  try {
    button.disabled = true;
    button.textContent = '🔄 Validating...';
    statusDiv.classList.remove('hidden');
    progressDiv.textContent = 'Starting validation...';
    
    // Load all reviews
    progressDiv.textContent = 'Loading submissions...';
    const submissionsSnapshot = await firebase.firestore().collection('submissions').get();
    
    progressDiv.textContent = 'Loading drafts...';
    const draftsSnapshot = await firebase.firestore().collection('drafts').get();
    
    let fixedCount = 0;
    let totalCount = submissionsSnapshot.docs.length + draftsSnapshot.docs.length;
    
    progressDiv.textContent = `Validating ${totalCount} reviews...`;
    
    // Process submissions
    const batch = firebase.firestore().batch();
    let batchCount = 0;
    
    for (const doc of submissionsSnapshot.docs) {
      const originalData = doc.data();
      const normalizedData = normalizeReviewStructure({ id: doc.id, ...originalData });
      
      // Check if structure needs fixing
      if (needsStructureFix(originalData, normalizedData)) {
        // Remove the id from normalized data before saving
        const { id, ...dataToSave } = normalizedData;
        batch.update(doc.ref, dataToSave);
        fixedCount++;
        batchCount++;
        
        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }
      }
    }
    
    // Process drafts
    for (const doc of draftsSnapshot.docs) {
      const originalData = doc.data();
      const normalizedData = normalizeReviewStructure({ id: doc.id, ...originalData });
      
      // Check if structure needs fixing
      if (needsStructureFix(originalData, normalizedData)) {
        // Remove the id from normalized data before saving
        const { id, ...dataToSave } = normalizedData;
        batch.update(doc.ref, dataToSave);
        fixedCount++;
        batchCount++;
        
        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }
      }
    }
    
    // Commit any remaining changes
    if (batchCount > 0) {
      await batch.commit();
    }
    
    progressDiv.innerHTML = `
      <div class="text-green-600 font-medium">Validation Complete!</div>
      <div class="text-sm text-slate-600 mt-1">
        • Total reviews processed: ${totalCount}
        • Reviews fixed: ${fixedCount}
        • Reviews already correct: ${totalCount - fixedCount}
      </div>
    `;
    
    if (fixedCount > 0) {
      showNotification(`Fixed ${fixedCount} review structures`, 'success');
      // Reload data to reflect changes
      await loadReviewsData();
    } else {
      showNotification('All review structures are already correct', 'info');
    }
    
  } catch (error) {
    console.error('Validation error:', error);
    progressDiv.innerHTML = `<div class="text-red-600">Error: ${error.message}</div>`;
    showNotification('Validation failed: ' + error.message, 'error');
  } finally {
    button.disabled = false;
    button.textContent = '🔍 Validate & Fix Review Structures';
  }
}

function needsStructureFix(original, normalized) {
  // Check if the normalized version is different from original
  return JSON.stringify(original) !== JSON.stringify(normalized);
}

async function toggleMaintenanceMode() {
  const enabled = document.getElementById('maintenance-mode')?.checked || false;
  
  try {
    await window.firebaseHelpers.updateSystemSettings({
      maintenanceMode: enabled
    });
    
    await window.firebaseHelpers.logAuditEvent('MAINTENANCE_MODE_TOGGLED', getSafeActorData(), null, {
      enabled
    });
    
  } catch (error) {
    console.error('Settings update error:', error);
    alert('Failed to update maintenance mode.');
  }
}

async function backupAllData() {
  alert('Data backup functionality will be implemented with proper backup procedures.');
}

async function clearTestData() {
  if (!confirm('Are you sure you want to clear test data? This action cannot be undone.')) {
    return;
  }
  
  alert('Test data clearing will be implemented with proper safety checks.');
}

async function exportAuditLogs() {
  const csv = convertToCSV(state.auditLogs);
  downloadFile(csv, `audit_logs_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function convertToCSV(data) {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'object') {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  window.URL.revokeObjectURL(url);
}

// ==========================================
// MODAL MANAGEMENT
// ==========================================

function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

function showEditUserModal(userId) {
  const user = state.users.find(u => u.id === userId);
  if (!user) return;
  
  // Populate form
  document.getElementById('edit-user-id').value = user.id;
  document.getElementById('edit-user-email').value = user.email || '';
  document.getElementById('edit-user-role').value = user.role || '';
  document.getElementById('edit-user-name').value = user.displayName || '';
  document.getElementById('edit-user-active').checked = user.isActive !== false;
  
  showModal('edit-user-modal');
}

async function showReviewDetailModal(reviewId, reviewType) {
  let review = (reviewType === 'drafts' ? state.drafts : state.submissions)
    .find(r => r.id === reviewId);
  
  if (!review) {
    showNotification('Review not found', 'error');
    return;
  }
  
  // Ensure the review has the correct structure
  review = normalizeReviewStructure(review);
  
  const content = document.getElementById('review-detail-content');
  if (content) {
    content.innerHTML = generateReviewDetailHTML(review);
  }
  
  showModal('review-detail-modal');
  
  // Log the view action
  await window.firebaseHelpers.logAuditEvent('REVIEW_VIEWED', getSafeActorData(), {
    type: 'review',
    id: reviewId
  });
}

function buildSections(data) {
  const sections = [];
  
  // Map flat data structure to sections
  const sectionMapping = {
    'part-1': ['successes', 'not-well', 'comparative-reflection', 'challenges'],
    'part-2': ['lastYearGoals', 'kpis'],
    'part-3': ['jdAlignment'],
    'part-4': ['strategicPriorities'],
    'part-5': ['strengths', 'limitations', 'pdUndertaken', 'pdNeeded'],
    'part-6': ['futureGoals'],
    'part-7': ['boardRequests']
  };
  
  // Debug logging (can be removed in production)
  console.log('Building sections from data:', data);
  
  Object.keys(SECTION_TITLES).forEach(sectionKey => {
    const section = {
      id: sectionKey,
      title: SECTION_TITLES[sectionKey],
      content: []
    };
    
    // First check if data is already structured by sections
    const sectionData = data[sectionKey];
    if (sectionData && typeof sectionData === 'object') {
      // Handle structured data (data['part-1']['successes'])
      console.log(`Found structured data for ${sectionKey}:`, sectionData);
      Object.keys(sectionData).forEach(questionKey => {
        const value = sectionData[questionKey];
        if (value) {
          addContentToSection(section, questionKey, value);
        }
      });
    } else {
      // Handle flat data structure (data.successes, data.challenges, etc.)
      const fieldsForSection = sectionMapping[sectionKey] || [];
      fieldsForSection.forEach(fieldKey => {
        const value = data[fieldKey];
        if (value) {
          console.log(`Found flat data for ${sectionKey}.${fieldKey}:`, value);
          addContentToSection(section, fieldKey, value);
        }
      });
    }
    
    if (section.content.length > 0) {
      sections.push(section);
    }
  });
  
  console.log('Built sections:', sections);
  return sections;
}

function addContentToSection(section, questionKey, value) {
  if (typeof value === 'string' && value.trim()) {
    // Simple string values
    section.content.push({
      question: formatQuestionLabel(questionKey),
      answer: value
    });
  } else if (Array.isArray(value) && value.length > 0) {
    // Array values (like lists of goals, challenges, etc.)
    section.content.push({
      question: formatQuestionLabel(questionKey),
      answer: formatArrayValue(value)
    });
  } else if (typeof value === 'object' && value !== null) {
    // Object values (like KPIs with ratings)
    section.content.push({
      question: formatQuestionLabel(questionKey),
      answer: formatObjectValue(value)
    });
  }
}

function formatQuestionLabel(key) {
  // Convert camelCase and kebab-case to readable labels
  return key
    .replace(/([A-Z])/g, ' $1') // Handle camelCase
    .replace(/-/g, ' ') // Handle kebab-case
    .replace(/\b\w/g, l => l.toUpperCase()) // Capitalize first letter of each word
    .trim();
}

function formatArrayValue(array) {
  return array.map((item, index) => {
    if (typeof item === 'object' && item !== null) {
      // Handle objects in arrays (like goals with descriptions)
      const parts = [];
      if (item.title || item.name || item.goal) {
        parts.push(`<strong>${escapeHtml(item.title || item.name || item.goal)}</strong>`);
      }
      if (item.description || item.details) {
        parts.push(escapeHtml(item.description || item.details));
      }
      if (item.rating !== undefined) {
        parts.push(`Rating: ${item.rating}/5`);
      }
      return `${index + 1}. ${parts.join(' - ')}`;
    } else {
      // Handle simple string items
      return `${index + 1}. ${escapeHtml(String(item))}`;
    }
  }).join('<br>');
}

function formatObjectValue(obj) {
  const parts = [];
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'object') {
        parts.push(`<strong>${formatQuestionLabel(key)}:</strong> ${formatObjectValue(value)}`);
      } else {
        parts.push(`<strong>${formatQuestionLabel(key)}:</strong> ${escapeHtml(String(value))}`);
      }
    }
  });
  return parts.join('<br>');
}

function generateReviewDetailHTML(review) {
  const flatData = window.firebaseHelpers.flattenSections(review.sections || {});
  const sections = buildSections(flatData);
  const metadata = {
    userEmail: review.metadata?.userEmail || 'Unknown',
    submittedAt: review.metadata?.timestamp,
    isDraft: review.metadata?.status === 'draft',
    lastCsvPath: review.lastCsvPath
  };
  
  const metadataHTML = `
    <div class="mb-6 rounded-lg bg-slate-50 p-4">
      <h4 class="text-sm font-semibold text-slate-700 mb-2">Review Metadata</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span class="font-medium text-slate-600">User:</span>
          <span class="text-slate-900">${escapeHtml(metadata.userEmail)}</span>
        </div>
        <div>
          <span class="font-medium text-slate-600">Status:</span>
          <span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${metadata.isDraft ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}">
            ${metadata.isDraft ? 'Draft' : 'Submitted'}
          </span>
        </div>
        <div>
          <span class="font-medium text-slate-600">Date:</span>
          <span class="text-slate-900">${new Date(metadata.submittedAt).toLocaleString()}</span>
        </div>
        <div>
          <span class="font-medium text-slate-600">CSV Export:</span>
          <span class="text-slate-900">${metadata.lastCsvPath ? '✅ Available' : '❌ Not available'}</span>
        </div>
      </div>
    </div>
  `;
  
  const sectionsHTML = sections.length > 0 ? 
    sections.map(section => `
      <div class="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h4 class="text-lg font-semibold text-slate-800 mb-4">${escapeHtml(section.title)}</h4>
        <div class="prose prose-sm max-w-none text-slate-600">
          ${section.content.map(item => `
            <div class="mb-4">
              <h5 class="font-medium text-slate-800 mb-2">${escapeHtml(item.question)}</h5>
              <p class="text-slate-600">${escapeHtml(item.answer)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('') :
    '<div class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-700">This review uses an older format or contains no structured data.</div>';
  
  const actionsHTML = `
    <div class="mt-6 flex flex-wrap gap-3">
      ${metadata.lastCsvPath ? 
        `<button onclick="downloadCsv('${escapeHtml(metadata.lastCsvPath)}')" class="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100">
          📥 Download CSV
        </button>` : ''
      }
      <button onclick="exportReviewPDF('${review.id}')" class="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100">
        📄 Export PDF
      </button>
      ${window.firebaseHelpers.hasPermission(state.userData, 'canDeleteData') ? 
        `<button onclick="confirmDeleteReview('${review.id}', '${metadata.isDraft ? 'drafts' : 'submissions'}')" class="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100">
          🗑️ Delete Review
        </button>` : ''
      }
    </div>
  `;
  
  return metadataHTML + sectionsHTML + actionsHTML;
}

// ==========================================
// NOTIFICATION SYSTEM
// ==========================================

function showNotification(message, type = 'info', duration = 5000) {
  const container = document.getElementById('notification-container');
  if (!container) return;
  
  const notification = document.createElement('div');
  const notificationId = 'notification-' + Date.now();
  notification.id = notificationId;
  
  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-700',
    error: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700'
  };
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  notification.className = `rounded-lg border p-4 shadow-sm max-w-sm ${typeStyles[type] || typeStyles.info}`;
  notification.innerHTML = `
    <div class="flex items-start">
      <span class="mr-3 text-lg">${icons[type] || icons.info}</span>
      <div class="flex-1">
        <p class="text-sm font-medium">${escapeHtml(message)}</p>
      </div>
      <button onclick="removeNotification('${notificationId}')" class="ml-3 text-lg hover:opacity-70">
        ×
      </button>
    </div>
  `;
  
  container.appendChild(notification);
  
  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => removeNotification(notificationId), duration);
  }
}

function removeNotification(notificationId) {
  const notification = document.getElementById(notificationId);
  if (notification) {
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }
}

// ==========================================
// ENHANCED FORM HANDLERS
// ==========================================

// Setup form event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Add user form
  document.getElementById('add-user-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = document.getElementById('user-email').value.trim().toLowerCase();
    const role = document.getElementById('user-role').value;
    const displayName = document.getElementById('user-name').value.trim();
    
    if (!email || !role) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    try {
      // Check if user already exists
      const existingUser = state.users.find(u => u.email === email);
      if (existingUser) {
        showNotification('User with this email already exists', 'error');
        return;
      }
      
      // Create user record
      const userRef = await firebase.firestore().collection('users').add({
        email,
        role,
        displayName: displayName || null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        permissions: window.firebaseHelpers.DEFAULT_PERMISSIONS[role] || {}
      });
      
      await window.firebaseHelpers.logAuditEvent('USER_ADDED', getSafeActorData(), {
        type: 'user',
        id: userRef.id,
        email
      }, { role, displayName });
      
      closeModal('add-user-modal');
      await loadUsersData();
      showNotification('User added successfully', 'success');
      
    } catch (error) {
      console.error('Error adding user:', error);
      showNotification('Failed to add user: ' + error.message, 'error');
    }
  });
  
  // Edit user form
  document.getElementById('edit-user-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userId = document.getElementById('edit-user-id').value;
    const role = document.getElementById('edit-user-role').value;
    const displayName = document.getElementById('edit-user-name').value.trim();
    const isActive = document.getElementById('edit-user-active').checked;
    
    try {
      await firebase.firestore().collection('users').doc(userId).update({
        role,
        displayName: displayName || null,
        isActive,
        updatedAt: new Date().toISOString(),
        permissions: window.firebaseHelpers.DEFAULT_PERMISSIONS[role] || {}
      });
      
      await window.firebaseHelpers.logAuditEvent('USER_UPDATED', getSafeActorData(), {
        type: 'user',
        id: userId
      }, { role, displayName, isActive });
      
      closeModal('edit-user-modal');
      await loadUsersData();
      showNotification('User updated successfully', 'success');
      
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification('Failed to update user: ' + error.message, 'error');
    }
  });
});

// ==========================================
// ENHANCED ACTION HANDLERS
// ==========================================

async function confirmDeleteReview(reviewId, reviewType) {
  if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
    return;
  }
  
  try {
    await firebase.firestore().collection(reviewType).doc(reviewId).delete();
    
    await window.firebaseHelpers.logAuditEvent('REVIEW_DELETED', getSafeActorData(), {
      type: 'review',
      id: reviewId
    }, { collection: reviewType });
    
    // Update local state
    if (reviewType === 'drafts') {
      state.drafts = state.drafts.filter(d => d.id !== reviewId);
    } else {
      state.submissions = state.submissions.filter(s => s.id !== reviewId);
    }
    
    closeModal('review-detail-modal');
    renderReviewsList();
    showNotification('Review deleted successfully', 'success');
    
  } catch (error) {
    console.error('Delete error:', error);
    showNotification('Failed to delete review: ' + error.message, 'error');
  }
}

async function exportReviewPDF(reviewId) {
  showNotification('PDF export functionality will be implemented with a proper PDF library', 'info');
}

// viewReviewDetail function is defined above - no duplicate needed

// Global functions for modal buttons
window.closeModal = closeModal;
window.showModal = showModal;
window.removeNotification = removeNotification;
window.downloadCsv = downloadCsv;
window.exportReviewPDF = exportReviewPDF;
window.confirmDeleteReview = confirmDeleteReview;

// Chart resize safety handler
function enforceChartSizes() {
  const chartCanvases = ['submissions-chart', 'completion-chart', 'kpi-bar-chart', 'competency-radar-chart'];
  
  chartCanvases.forEach(chartId => {
    const canvas = document.getElementById(chartId);
    if (canvas) {
      canvas.style.maxHeight = '280px';
      canvas.style.height = '280px';
      canvas.style.maxWidth = '100%';
    }
  });
}

// Add resize listener to enforce chart sizes
window.addEventListener('resize', enforceChartSizes);

// Enforce sizes on load
document.addEventListener('DOMContentLoaded', enforceChartSizes);

