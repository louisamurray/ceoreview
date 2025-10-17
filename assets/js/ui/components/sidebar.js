/**
 * Sidebar Navigation Component
 * Displays user menu with links to My Reviews and Admin Dashboard
 * Exported as window.SidebarNav namespace
 */


let sidebarInitialized = false;
const sidebarState = {
  isOpen: false,
  isAdmin: false,
  currentUser: null
};

function initializeSidebar() {
  if (sidebarInitialized) return;
  sidebarInitialized = true;
  // Create sidebar HTML
  createSidebarHTML();
  // Setup event listeners
  setupSidebarListeners();
  // Check if user is admin
  checkAdminStatus();
}

function createSidebarHTML() {
  // DEBUG: Add a large overlay to test if sidebar is being covered
  const debugOverlay = '<div id="sidebar-debug-overlay" style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(255,0,0,0.2);z-index:1000000;pointer-events:none;font-size:2rem;text-align:center;line-height:200px;">DEBUG OVERLAY</div>';
  const sidebarHTML = `
    ${debugOverlay}
    <!-- Sidebar Overlay (mobile) -->
    <div id="sidebar-overlay" class="fixed inset-0 z-30 hidden bg-black/50 transition-opacity lg:hidden"></div>
    
    <!-- Sidebar -->
    <aside
      id="sidebar"
      class="fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full transform bg-slate-900 shadow-lg transition-transform duration-300 lg:sticky lg:top-0 lg:z-0 lg:h-screen lg:w-64 lg:translate-x-0 lg:transform-none lg:shadow-none"
    >
      <!-- Header -->
      <div class="border-b border-slate-800 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-white">Menu</h2>
            <p class="text-xs text-slate-400">REAP Marlborough</p>
          </div>
          <button
            id="sidebar-close-btn"
            class="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="space-y-2 overflow-y-auto p-6" style="max-height: calc(100vh - 300px);">
        <!-- Dynamic Navigation Links -->
        <div id="sidebar-nav-links">
          <!-- Links will be inserted here based on current page -->
        </div>
      </nav>

      <!-- Footer with User Info -->
      <div class="absolute bottom-0 left-0 right-0 border-t border-slate-800 p-6">
        <div class="mb-4 rounded-lg bg-slate-800 p-3">
          <p class="text-xs text-slate-400">Logged in as</p>
          <p id="sidebar-user-email" class="truncate text-sm font-semibold text-white"></p>
        </div>
        <button
          id="sidebar-logout-btn"
          class="w-full rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-600"
        >
          Sign Out
        </button>
      </div>
    </aside>

    <!-- Sidebar Toggle Button (for mobile) -->
    <button
      id="sidebar-toggle-btn"
      class="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg transition hover:bg-blue-700 lg:hidden"
      title="Toggle menu"
    >
      <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  `;

  // Insert sidebar at the beginning of body
  const body = document.body;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = sidebarHTML;
  body.insertBefore(tempDiv.querySelector('#sidebar-overlay'), body.firstChild);
  body.insertBefore(tempDiv.querySelector('#sidebar'), body.firstChild);
  body.appendChild(tempDiv.querySelector('#sidebar-toggle-btn'));
  
  // Populate navigation links based on current page
  populateNavigationLinks();
}

function populateNavigationLinks() {
  // DEBUG: Add a test element to check visibility
  setTimeout(() => {
    const navContainer = document.getElementById('sidebar-nav-links');
    if (navContainer && !document.getElementById('sidebar-test-element')) {
      const testDiv = document.createElement('div');
      testDiv.id = 'sidebar-test-element';
      testDiv.textContent = 'TEST ELEMENT';
      testDiv.style.cssText = 'color: red !important; background: yellow !important; font-size: 2rem !important; padding: 1rem !important;';
      navContainer.appendChild(testDiv);
    }
  }, 100);
  console.log('[Sidebar] Populating navigation links. isAdmin:', sidebarState.isAdmin, 'pathname:', window.location.pathname);
  const currentPage = window.location.pathname;
  const navContainer = document.getElementById('sidebar-nav-links');
  
  if (!navContainer) return;
  
  let navLinksHTML = '';
  
  // Always show My Reviews (unless already on that page)
  if (!currentPage.includes('/my-reviews.html')) {
    navLinksHTML += `
      <a
        href="/my-reviews.html"
        class="sidebar-nav-link flex items-center gap-3 rounded-lg px-4 py-3 text-white transition hover:bg-slate-800 hover:text-yellow-300"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>My Reviews</span>
      </a>
    `;
  }

  // On admin page - always show New Review
  if (currentPage.includes('/admin.html')) {
    navLinksHTML += `
      <a
        href="/index.html"
        class="sidebar-nav-link flex items-center gap-3 rounded-lg px-4 py-3 text-white transition hover:bg-slate-800 hover:text-yellow-300"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>New Review</span>
      </a>
    `;
  } else {
    // On index.html or my-reviews.html - show Back to Review link
    navLinksHTML += `
      <a
        href="/index.html"
        class="sidebar-nav-link flex items-center gap-3 rounded-lg px-4 py-3 text-white transition hover:bg-slate-800 hover:text-yellow-300"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
        <span>Back to Review</span>
      </a>
    `;
  }

  // Show Admin Dashboard link if admin (conditional)
  if (sidebarState.isAdmin) {
    navLinksHTML += `
      <a
        id="admin-dashboard-link"
        href="/admin.html"
        class="sidebar-nav-link flex items-center gap-3 rounded-lg px-4 py-3 text-white transition hover:bg-slate-800 hover:text-yellow-300"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <span>Admin Dashboard</span>
        <span class="ml-auto rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white">Admin</span>
      </a>
    `;
  }

  navContainer.innerHTML = navLinksHTML;
  console.log('[Sidebar] navLinksHTML:', navLinksHTML);
}function setupSidebarListeners() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const closeBtn = document.getElementById('sidebar-close-btn');
  const logoutBtn = document.getElementById('sidebar-logout-btn');

  // Toggle sidebar
  toggleBtn?.addEventListener('click', () => {
    sidebarState.isOpen = !sidebarState.isOpen;
    updateSidebarVisibility();
  });

  // Close sidebar
  const closeSidebar = () => {
    sidebarState.isOpen = false;
    updateSidebarVisibility();
  };

  closeBtn?.addEventListener('click', closeSidebar);
  overlay?.addEventListener('click', closeSidebar);

  // Close sidebar when clicking any nav link (mobile only) - use event delegation
  const navLinksContainer = document.getElementById('sidebar-nav-links');
  navLinksContainer?.addEventListener('click', (e) => {
    if (e.target.closest('.sidebar-nav-link')) {
      if (window.innerWidth < 1024) {
        closeSidebar();
      }
    }
  });

  // Logout handler
  logoutBtn?.addEventListener('click', async () => {
    try {
      if (window.firebaseHelpers?.logout) {
        await window.firebaseHelpers.logout();
      } else {
        console.error('Firebase logout not available');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to sign out. Please try again.');
    }
  });

  // Close sidebar on window resize (when going from mobile to desktop)
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024 && sidebarState.isOpen) {
      sidebarState.isOpen = false;
      updateSidebarVisibility();
    }
  });
}

function updateSidebarVisibility() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (sidebarState.isOpen) {
    sidebar?.classList.remove('-translate-x-full');
    overlay?.classList.remove('hidden');
  } else {
    sidebar?.classList.add('-translate-x-full');
    overlay?.classList.add('hidden');
  }
}

function checkAdminStatus() {
  // Listen to auth state and check admin status
  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      sidebarState.currentUser = user;
      // Update user email in sidebar
      const userEmailEl = document.getElementById('sidebar-user-email');
      if (userEmailEl) {
        userEmailEl.textContent = user.email || user.uid;
      }
      // Check if admin
      try {
        if (window.firebaseHelpers?.getUserData) {
          const userData = await window.firebaseHelpers.getUserData(user.uid);
          const isAdmin =
            (userData?.role === 'admin' || userData?.role === window.firebaseHelpers.USER_ROLES?.ADMIN) ||
            (window.ADMIN_EMAILS && window.ADMIN_EMAILS.includes(user.email?.toLowerCase()));
          sidebarState.isAdmin = isAdmin;
        }
      } catch (error) {
        console.warn('Error checking admin status:', error);
        sidebarState.isAdmin = false;
      }
    } else {
      sidebarState.currentUser = null;
      sidebarState.isAdmin = false;
    }
  // Always re-populate navigation links after auth/admin check
  setTimeout(populateNavigationLinks, 0);
  });
}

// Initialize sidebar when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSidebar);
} else {
  initializeSidebar();
}

// Export as window.SidebarNav namespace
window.SidebarNav = {
  initialize: initializeSidebar,
  isAdmin: () => sidebarState.isAdmin,
  getCurrentUser: () => sidebarState.currentUser,
  toggle: () => {
    sidebarState.isOpen = !sidebarState.isOpen;
    updateSidebarVisibility();
  }
};

// Legacy global exports for backwards compatibility
Object.assign(window, {
  initializeSidebar,
  SidebarNav: window.SidebarNav
});
