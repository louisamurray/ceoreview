/**
 * My Reviews Dashboard
 * Displays user's submitted and draft reviews
 * Features: view, delete, resume editing, search, filter
 */

const state = {
  currentUser: null,
  submissions: [],
  drafts: [],
  filteredReviews: [],
  allReviews: [],
  searchTerm: '',
  statusFilter: '',
  currentPage: 1,
  reviewsPerPage: 6,
  isLoading: true
};

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  initializeAuth();
});

function setupEventListeners() {
  document.getElementById('refresh-btn').addEventListener('click', loadUserReviews);
  document.getElementById('search-input').addEventListener('input', handleSearch);
  document.getElementById('status-filter').addEventListener('change', handleStatusFilter);
  document.getElementById('logout-btn').addEventListener('click', logout);
  document.getElementById('prev-page').addEventListener('click', previousPage);
  document.getElementById('next-page').addEventListener('click', nextPage);
}

function initializeAuth() {
  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      // Not logged in - redirect to main site
      showStatus('Please sign in to view your reviews.', 'error');
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 1500);
      return;
    }

    state.currentUser = user;
    document.getElementById('user-email').textContent = user.email || user.uid;

    try {
      await loadUserReviews();
      showAuthContent();
    } catch (error) {
      console.error('Error loading reviews:', error);
      showStatus('Failed to load reviews. Please try again.', 'error');
    }
  });
}

// ==========================================
// AUTH & UI STATE
// ==========================================

function showAuthContent() {
  document.getElementById('auth-loading').style.display = 'none';
  document.getElementById('reviews-content').style.display = 'block';
}

function showStatus(message, type = 'info') {
  const statusDiv = document.getElementById('status-message');
  const typeClasses = {
    info: 'border-blue-200 bg-blue-50 text-blue-800',
    success: 'border-green-200 bg-green-50 text-green-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-700'
  };

  statusDiv.className = `mx-auto mt-6 rounded-lg border px-4 py-4 sm:px-6 lg:px-8 max-w-6xl ${typeClasses[type] || typeClasses.info}`;
  statusDiv.textContent = message;
  statusDiv.classList.remove('hidden');

  // Auto-hide success and info messages after 3 seconds
  if (type === 'success' || type === 'info') {
    setTimeout(() => {
      statusDiv.classList.add('hidden');
    }, 3000);
  }
}

async function logout() {
  try {
    await window.firebaseHelpers.logout();
    window.location.href = '/index.html';
  } catch (error) {
    console.error('Logout error:', error);
    showStatus('Failed to sign out. Please try again.', 'error');
  }
}

// ==========================================
// DATA LOADING
// ==========================================

async function loadUserReviews() {
  if (!state.currentUser) return;

  try {
    state.isLoading = true;
    showStatus('Loading your reviews...', 'info');

    // Load submissions
    const submissionsSnapshot = await firebase
      .firestore()
      .collection('submissions')
      .where('uid', '==', state.currentUser.uid)
      .orderBy('metadata.timestamp', 'desc')
      .get();

    state.submissions = submissionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      type: 'submitted'
    }));

    // Load drafts
    const draftsSnapshot = await firebase
      .firestore()
      .collection('drafts')
      .where('uid', '==', state.currentUser.uid)
      .orderBy('metadata.timestamp', 'desc')
      .get();

    state.drafts = draftsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      type: 'draft'
    }));

    // Combine and sort all reviews
    state.allReviews = [...state.submissions, ...state.drafts].sort((a, b) => {
      const timeA = new Date(a.metadata?.timestamp || 0).getTime();
      const timeB = new Date(b.metadata?.timestamp || 0).getTime();
      return timeB - timeA;
    });

    // Apply filters
    applyFilters();

    // Show content and update UI
    state.isLoading = false;
    renderReviews();
    showStatus(`Found ${state.allReviews.length} review(s)`, 'success');

  } catch (error) {
    console.error('Error loading reviews:', error);
    state.isLoading = false;
    showStatus('Failed to load reviews. Please try again.', 'error');
  }
}

// ==========================================
// FILTERING & SEARCH
// ==========================================

function handleSearch(e) {
  state.searchTerm = e.target.value.toLowerCase();
  state.currentPage = 1;
  applyFilters();
  renderReviews();
}

function handleStatusFilter(e) {
  state.statusFilter = e.target.value;
  state.currentPage = 1;
  applyFilters();
  renderReviews();
}

function applyFilters() {
  let filtered = [...state.allReviews];

  // Apply status filter
  if (state.statusFilter) {
    filtered = filtered.filter(review => review.type === state.statusFilter);
  }

  // Apply search filter
  if (state.searchTerm) {
    filtered = filtered.filter(review => {
      const searchableText = JSON.stringify(review.sections || {}).toLowerCase();
      const timestamp = new Date(review.metadata?.timestamp || 0).toLocaleDateString();
      return searchableText.includes(state.searchTerm) || timestamp.includes(state.searchTerm);
    });
  }

  state.filteredReviews = filtered;
}

// ==========================================
// RENDERING
// ==========================================

function renderReviews() {
  const listContainer = document.getElementById('reviews-list');
  const emptyState = document.getElementById('empty-state');

  if (state.filteredReviews.length === 0) {
    listContainer.innerHTML = '';
    emptyState.classList.remove('hidden');
    updatePagination();
    return;
  }

  emptyState.classList.add('hidden');

  // Calculate pagination
  const totalPages = Math.ceil(state.filteredReviews.length / state.reviewsPerPage);
  const startIndex = (state.currentPage - 1) * state.reviewsPerPage;
  const endIndex = startIndex + state.reviewsPerPage;
  const pageReviews = state.filteredReviews.slice(startIndex, endIndex);

  // Render reviews for current page
  listContainer.innerHTML = pageReviews.map(renderReviewCard).join('');

  // Bind event listeners to action buttons
  bindReviewActions();

  // Update pagination
  updatePagination(totalPages);
}

function renderReviewCard(review) {
  const timestamp = new Date(review.metadata?.timestamp || 0);
  const dateStr = timestamp.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  const timeStr = timestamp.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const isSubmitted = review.type === 'submitted';
  const status = isSubmitted ? 'Submitted' : 'Draft';
  const statusClass = isSubmitted ? 'status-submitted' : 'status-draft';

  // Calculate completion
  const completion = review.completion || { completed: 0, total: 7, percentage: 0 };
  const completionPercent = completion.percentage || 0;

  // Get completion color
  const completionColor = 
    completionPercent === 100 ? 'bg-green-500' :
    completionPercent >= 75 ? 'bg-blue-500' :
    completionPercent >= 50 ? 'bg-amber-500' :
    'bg-slate-400';

  return `
    <div class="review-card rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <!-- Header -->
      <div class="mb-4 flex items-start justify-between gap-3">
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <h3 class="text-lg font-semibold text-slate-900">
              ${isSubmitted ? '✓' : '📝'} Review
            </h3>
            <span class="status-badge ${statusClass}">
              ${status}
            </span>
          </div>
          <p class="mt-1 text-sm text-slate-500">${dateStr} at ${timeStr}</p>
        </div>
      </div>

      <!-- Completion Progress -->
      <div class="mb-4">
        <div class="mb-2 flex items-center justify-between text-sm">
          <span class="font-medium text-slate-700">Progress</span>
          <span class="text-slate-600">${completion.completed}/${completion.total} sections</span>
        </div>
        <div class="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div class="h-full transition-all duration-300 ${completionColor}" style="width: ${completionPercent}%"></div>
        </div>
        <p class="mt-1 text-xs text-slate-500">${completionPercent}% complete</p>
      </div>

      <!-- Actions -->
      <div class="flex gap-2">
        <button
          class="view-review-btn flex-1 rounded-lg border border-blue-200 bg-blue-50 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          data-review-id="${review.id}"
          data-review-type="${review.type}"
        >
          👁️ View
        </button>
        ${!isSubmitted ? `
          <button
            class="resume-review-btn flex-1 rounded-lg border border-green-200 bg-green-50 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100"
            data-review-id="${review.id}"
          >
            ✏️ Resume
          </button>
        ` : ''}
        <button
          class="delete-review-btn flex-1 rounded-lg border border-red-200 bg-red-50 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          data-review-id="${review.id}"
          data-review-type="${review.type}"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  `;
}

function bindReviewActions() {
  // View buttons
  document.querySelectorAll('.view-review-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const reviewId = e.target.dataset.reviewId;
      const reviewType = e.target.dataset.reviewType;
      await viewReview(reviewId, reviewType);
    });
  });

  // Resume editing buttons
  document.querySelectorAll('.resume-review-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const reviewId = e.target.dataset.reviewId;
      await resumeReview(reviewId);
    });
  });

  // Delete buttons
  document.querySelectorAll('.delete-review-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const reviewId = e.target.dataset.reviewId;
      const reviewType = e.target.dataset.reviewType;
      await deleteReview(reviewId, reviewType);
    });
  });
}

// ==========================================
// REVIEW ACTIONS
// ==========================================

async function viewReview(reviewId, reviewType) {
  try {
    const review = [...state.submissions, ...state.drafts].find(r => r.id === reviewId);
    if (!review) {
      showStatus('Review not found.', 'error');
      return;
    }

    // Open review in a new window or modal
    const reviewWindow = window.open('', '_blank');
    const htmlContent = generateReviewViewHTML(review);
    reviewWindow.document.write(htmlContent);
    reviewWindow.document.close();

  } catch (error) {
    console.error('Error viewing review:', error);
    showStatus('Failed to view review.', 'error');
  }
}

function generateReviewViewHTML(review) {
  const sections = review.sections || {};
  const metadata = review.metadata || {};

  const sectionsHTML = Object.entries(sections)
    .filter(([_, content]) => content && Object.keys(content).length > 0)
    .map(([sectionKey, content]) => {
      const sectionTitle = {
        'part-1': 'Performance Reflection',
        'part-2': 'Review of Previous Goals & KPIs',
        'part-3': 'Job Description Alignment',
        'part-4': 'Strategic Priorities',
        'part-5': 'Personal Assessment & Development',
        'part-6': 'Future Focus',
        'part-7': 'Dialogue with the Board'
      }[sectionKey] || sectionKey;

      const contentHTML = Object.entries(content)
        .filter(([_, value]) => value && (typeof value === 'string' || Array.isArray(value) || typeof value === 'object'))
        .map(([key, value]) => {
          let displayValue = '';
          if (typeof value === 'string') {
            displayValue = value;
          } else if (Array.isArray(value)) {
            displayValue = value.map((v, i) => {
              if (typeof v === 'object') {
                return `${i + 1}. ${Object.values(v).join(', ')}`;
              }
              return `${i + 1}. ${v}`;
            }).join('<br>');
          } else if (typeof value === 'object') {
            displayValue = Object.entries(value)
              .map(([k, v]) => `<strong>${k}:</strong> ${v}`)
              .join('<br>');
          }
          return `
            <div style="margin-bottom: 15px;">
              <h4 style="font-weight: 600; color: #1f2937; margin-bottom: 5px;">${escapeHtml(key)}</h4>
              <div style="color: #4b5563; white-space: pre-wrap;">${displayValue}</div>
            </div>
          `;
        })
        .join('');

      return `
        <div style="page-break-inside: avoid; margin-bottom: 30px;">
          <h2 style="font-size: 1.25em; font-weight: 600; color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 15px;">${escapeHtml(sectionTitle)}</h2>
          ${contentHTML}
        </div>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Review - ${escapeHtml(metadata.userEmail || 'Unknown')}</title>
      <style>
        body {
          font-family: system-ui, sans-serif;
          max-width: 900px;
          margin: 0 auto;
          padding: 30px;
          line-height: 1.6;
          color: #374151;
        }
        .header {
          margin-bottom: 30px;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 20px;
        }
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 2em;
          color: #1f2937;
        }
        .metadata {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          background: #f9fafb;
          padding: 15px;
          border-radius: 8px;
          font-size: 0.9em;
        }
        .metadata div {
          display: flex;
          flex-direction: column;
        }
        .metadata strong {
          color: #6b7280;
          font-size: 0.85em;
          margin-bottom: 3px;
        }
        @media print {
          body { margin: 0; padding: 15px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>CEO Self-Review</h1>
        <div class="metadata">
          <div>
            <strong>Submitted by:</strong>
            ${escapeHtml(metadata.userEmail || 'Unknown')}
          </div>
          <div>
            <strong>Date:</strong>
            ${new Date(metadata.timestamp || 0).toLocaleString()}
          </div>
          <div>
            <strong>Status:</strong>
            ${metadata.status === 'submitted' ? 'Submitted' : 'Draft'}
          </div>
        </div>
      </div>
      ${sectionsHTML}
    </body>
    </html>
  `;
}

async function resumeReview(reviewId) {
  try {
    // Get the draft and load it into the main review form
    const draft = state.drafts.find(d => d.id === reviewId);
    if (!draft) {
      showStatus('Draft not found.', 'error');
      return;
    }

    // Store the draft ID in sessionStorage to load it in index.html
    sessionStorage.setItem('resumeReviewId', reviewId);
    sessionStorage.setItem('resumeReviewData', JSON.stringify(draft));

    // Redirect to main review page
    window.location.href = '/index.html';

  } catch (error) {
    console.error('Error resuming review:', error);
    showStatus('Failed to resume review.', 'error');
  }
}

async function deleteReview(reviewId, reviewType) {
  if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
    return;
  }

  try {
    showStatus('Deleting review...', 'info');

    // Delete from Firestore
    await firebase
      .firestore()
      .collection(reviewType === 'submitted' ? 'submissions' : 'drafts')
      .doc(reviewId)
      .delete();

    // Update local state
    state.allReviews = state.allReviews.filter(r => r.id !== reviewId);
    if (reviewType === 'submitted') {
      state.submissions = state.submissions.filter(r => r.id !== reviewId);
    } else {
      state.drafts = state.drafts.filter(r => r.id !== reviewId);
    }

    // Re-render
    applyFilters();
    renderReviews();

    showStatus('Review deleted successfully.', 'success');

  } catch (error) {
    console.error('Error deleting review:', error);
    showStatus('Failed to delete review. Please try again.', 'error');
  }
}

// ==========================================
// PAGINATION
// ==========================================

function updatePagination(totalPages = 1) {
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  const pageInfo = document.getElementById('page-info');

  if (totalPages <= 1) {
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    pageInfo.textContent = '';
    return;
  }

  prevBtn.disabled = state.currentPage === 1;
  nextBtn.disabled = state.currentPage === totalPages;
  pageInfo.textContent = `Page ${state.currentPage} of ${totalPages}`;
}

function previousPage() {
  if (state.currentPage > 1) {
    state.currentPage--;
    renderReviews();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function nextPage() {
  const totalPages = Math.ceil(state.filteredReviews.length / state.reviewsPerPage);
  if (state.currentPage < totalPages) {
    state.currentPage++;
    renderReviews();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
