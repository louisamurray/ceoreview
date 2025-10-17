/**
 * Sidebar Navigation Component
 * Displays user menu with links to My Reviews and Admin Dashboard
 * Exported as window.SidebarNav namespace
 */

// Sidebar state object
const sidebarState = window.sidebarState || { isAdmin: false, isOpen: false, currentUser: null };


function initializeSidebar() {
  const currentPage = window.location.pathname;
  const navContainer = document.getElementById('sidebar-nav-links');
  if (!navContainer) return;
  // Populate navigation links based on current page
  let navLinksHTML = '';
  // Always show My Reviews (unless already on that page)
  if (!currentPage.includes('/my-reviews.html')) {
    navLinksHTML += '<a href="/my-reviews.html" class="sidebar-nav-link flex items-center gap-3 rounded-lg px-4 py-3 bg-slate-800 text-white shadow-md hover:bg-blue-600 transition">'
      + '<svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">'
      + '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />'
      + '</svg>'
      + '<span class="font-semibold text-lg">My Reviews</span>'
      + '</a>';
  }
  // On admin page - always show New Review
  if (currentPage.includes('/admin.html')) {
    navLinksHTML += '<a href="/index.html" class="sidebar-nav-link flex items-center gap-3 rounded-lg px-4 py-3 bg-slate-800 text-white shadow-md hover:bg-blue-600 transition">'
      + '<svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">'
      + '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />'
      + '</svg>'
      + '<span class="font-semibold text-lg">New Review</span>'
      + '</a>';
  } else {
    // On index.html or my-reviews.html - show Back to Review link
    navLinksHTML += '<a href="/index.html" class="sidebar-nav-link flex items-center gap-3 rounded-lg px-4 py-3 bg-slate-800 text-white shadow-md hover:bg-blue-600 transition">'
      + '<svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">'
      + '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />'
      + '</svg>'
      + '<span class="font-semibold text-lg">Back to Review</span>'
      + '</a>';
  }
  // Show Admin Dashboard link if admin (conditional)
  if (sidebarState.isAdmin) {
    navLinksHTML += '<a id="admin-dashboard-link" href="/admin.html" class="sidebar-nav-link flex items-center gap-3 rounded-lg px-4 py-3 bg-slate-800 text-white shadow-md hover:bg-blue-600 transition">'
      + '<svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">'
      + '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />'
      + '</svg>'
      + '<span class="font-semibold text-lg">Admin Dashboard</span>'
      + '<span class="ml-auto rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white">Admin</span>'
      + '</a>';
  }
  navContainer.innerHTML = navLinksHTML;
  console.log('[Sidebar] navLinksHTML:', navLinksHTML);
}

function setupSidebarListeners() {
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
      // Always hide overlay when navigating, regardless of screen size
      const overlay = document.getElementById('sidebar-overlay');
      overlay?.classList.add('hidden');
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
          const adminRole = window.firebaseHelpers.USER_ROLES?.ADMIN;
          const adminEmails = window.ADMIN_EMAILS || [];
          const userEmail = user.email?.toLowerCase();
          const userRole = userData?.role;
          const isAdmin =
            (userRole === 'admin' || userRole === adminRole) ||
            (adminEmails.includes(userEmail));
          console.log('[Sidebar][AdminCheck] user:', user);
          console.log('[Sidebar][AdminCheck] userData:', userData);
          console.log('[Sidebar][AdminCheck] userRole:', userRole, 'adminRole:', adminRole);
          console.log('[Sidebar][AdminCheck] userEmail:', userEmail, 'adminEmails:', adminEmails);
          console.log('[Sidebar][AdminCheck] isAdmin:', isAdmin);
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
