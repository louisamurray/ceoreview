/**
 * Sidebar Navigation Component
 * Provides responsive navigation for the CEO review experience.
 * Exported as window.SidebarNav for backwards compatibility.
 */

let sidebarInitialized = false;

const sidebarState = {
  isOpen: false,
  isAdmin: false,
  currentUser: null
};

const NAV_ICON_PATHS = {
  document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  plus: 'M12 4v16m8-8H4',
  arrow: 'M11 19l-7-7 7-7m8 14l-7-7 7-7',
  control: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4'
};

const NAV_LINK_BASE_CLASSES = 'sidebar-nav-link text-sm font-semibold text-slate-100 transition-colors';

function initializeSidebar() {
  if (sidebarInitialized) return;
  sidebarInitialized = true;

  createSidebarStructure();
  setupSidebarListeners();
  attachAuthListener();
  populateNavigationLinks();
}

function createSidebarStructure() {
  const markup = `
    <div
      id="sidebar-overlay"
      class="fixed inset-0 z-30 hidden bg-slate-900/60 backdrop-blur-sm transition-opacity lg:hidden"
      aria-hidden="true"
    ></div>
    <aside
      id="sidebar"
      class="fixed left-0 top-0 z-40 flex h-screen w-64 -translate-x-full flex-col bg-slate-900/95 shadow-xl backdrop-blur lg:sticky lg:top-0 lg:z-0 lg:translate-x-0 lg:bg-slate-900"
      aria-label="Secondary navigation"
    >
      <div class="border-b border-slate-800/70 p-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-wide text-slate-400">REAP Marlborough</p>
            <h2 class="mt-1 text-lg font-semibold text-white">CEO Review</h2>
          </div>
          <button
            id="sidebar-close-btn"
            type="button"
            class="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 lg:hidden"
            aria-label="Close menu"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto p-6" aria-label="Sidebar">
        <div id="sidebar-nav-links" class="space-y-1"></div>
      </nav>

      <div class="border-t border-slate-800/70 p-6">
        <div class="mb-4 rounded-xl bg-slate-800/80 p-4">
          <p class="text-xs uppercase tracking-wide text-slate-400">Logged in as</p>
          <p id="sidebar-user-email" class="mt-2 truncate text-sm font-semibold text-white" title=""></p>
        </div>
        <button
          id="sidebar-logout-btn"
          type="button"
          class="w-full rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          Sign out
        </button>
      </div>
    </aside>
    <button
      id="sidebar-toggle-btn"
      type="button"
      class="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 lg:hidden"
      aria-controls="sidebar"
      aria-expanded="false"
      aria-label="Open menu"
    >
      <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  `;

  const template = document.createElement('template');
  template.innerHTML = markup.trim();

  const overlay = template.content.querySelector('#sidebar-overlay');
  const sidebar = template.content.querySelector('#sidebar');
  const toggle = template.content.querySelector('#sidebar-toggle-btn');

  if (!overlay || !sidebar || !toggle) {
    console.warn('[Sidebar] Failed to generate markup');
    return;
  }

  const fragment = document.createDocumentFragment();
  fragment.appendChild(overlay);
  fragment.appendChild(sidebar);

  document.body.insertBefore(fragment, document.body.firstChild);
  document.body.appendChild(toggle);
}

function attachAuthListener() {
  const auth = window.firebase?.auth?.();
  if (!auth) {
    console.warn('[Sidebar] Firebase auth not available; navigation will render without user context.');
    populateNavigationLinks();
    return;
  }

  auth.onAuthStateChanged(async (user) => {
    sidebarState.currentUser = user;

    updateUserEmail(user);

    if (user) {
      sidebarState.isAdmin = await determineAdminStatus(user);
    } else {
      sidebarState.isAdmin = false;
    }

    populateNavigationLinks();
  });
}

async function determineAdminStatus(user) {
  try {
    if (!window.firebaseHelpers) return false;
    const userData = await window.firebaseHelpers.getUserData?.(user.uid);
    const adminRole = window.firebaseHelpers.USER_ROLES?.ADMIN;
    const adminEmails = (window.ADMIN_EMAILS || []).map((email) => email?.toLowerCase()).filter(Boolean);
    const normalizedEmail = user.email?.toLowerCase();
    const declaredRole = userData?.role;

    return (
      declaredRole === 'admin' ||
      declaredRole === adminRole ||
      (normalizedEmail ? adminEmails.includes(normalizedEmail) : false)
    );
  } catch (error) {
    console.warn('[Sidebar] Error determining admin status:', error);
    return false;
  }
}

function updateUserEmail(user) {
  const userEmailEl = document.getElementById('sidebar-user-email');
  if (!userEmailEl) return;

  const email = user?.email || user?.uid || '';
  userEmailEl.textContent = email;
  userEmailEl.title = email;
}

function populateNavigationLinks() {
  const navContainer = document.getElementById('sidebar-nav-links');
  if (!navContainer) return;

  const currentPath = window.location.pathname;
  const isIndexPage = currentPath === '/' || currentPath.endsWith('/index.html');
  const isMyReviewsPage = currentPath.endsWith('/my-reviews.html');
  const isAdminPage = currentPath.endsWith('/admin.html') || currentPath.includes('/admin.html');
  const navItems = [];

  if (!isMyReviewsPage) {
    navItems.push(
      createNavLink({
        href: '/my-reviews.html',
        label: 'My Reviews',
        icon: 'document',
        isActive: isMyReviewsPage
      })
    );
  }

  if (isAdminPage) {
    navItems.push(
      createNavLink({
        href: '/index.html',
        label: 'New Review',
        icon: 'plus',
        isActive: isIndexPage
      })
    );
  } else {
    navItems.push(
      createNavLink({
        href: '/index.html',
        label: 'Back to Review',
        icon: 'arrow',
        isActive: isIndexPage
      })
    );
  }

  if (sidebarState.isAdmin) {
    navItems.push(
      createNavLink({
        href: '/admin.html',
        label: 'Admin Dashboard',
        icon: 'control',
        isActive: isAdminPage,
        badge: 'Admin'
      })
    );
  }

  navContainer.innerHTML = navItems.join('');
}

function createNavLink({ href, label, icon, badge, isActive }) {
  const iconPath = NAV_ICON_PATHS[icon];
  const iconMarkup = iconPath
    ? `
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconPath}" />
        </svg>
      `
    : '';

  const badgeMarkup = badge ? `<span class="badge">${badge}</span>` : '';
  const activeClass = isActive ? ' bg-white/10 text-white' : '';
  const ariaCurrent = isActive ? ' aria-current="page"' : '';

  return `
    <a${ariaCurrent} href="${href}" class="${NAV_LINK_BASE_CLASSES}${activeClass}">
      ${iconMarkup}
      <span>${label}</span>
      ${badgeMarkup}
    </a>
  `;
}

function setupSidebarListeners() {
  const overlay = document.getElementById('sidebar-overlay');
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const closeBtn = document.getElementById('sidebar-close-btn');
  const logoutBtn = document.getElementById('sidebar-logout-btn');

  const closeSidebar = () => {
    sidebarState.isOpen = false;
    updateSidebarVisibility();
  };

  toggleBtn?.addEventListener('click', () => {
    sidebarState.isOpen = !sidebarState.isOpen;
    updateSidebarVisibility();
  });

  closeBtn?.addEventListener('click', closeSidebar);
  overlay?.addEventListener('click', closeSidebar);

  const navLinksContainer = document.getElementById('sidebar-nav-links');
  navLinksContainer?.addEventListener('click', (event) => {
    if (event.target.closest('.sidebar-nav-link') && window.innerWidth < 1024) {
      closeSidebar();
    }
  });

  logoutBtn?.addEventListener('click', async () => {
    try {
      if (window.firebaseHelpers?.logout) {
        await window.firebaseHelpers.logout();
      } else {
        console.error('[Sidebar] Firebase logout helper not available');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to sign out. Please try again.');
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024 && sidebarState.isOpen) {
      sidebarState.isOpen = false;
      updateSidebarVisibility();
    }
  });

  updateSidebarVisibility();
}

function updateSidebarVisibility() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const toggleBtn = document.getElementById('sidebar-toggle-btn');

  const isOpen = sidebarState.isOpen;

  sidebar?.classList.toggle('-translate-x-full', !isOpen);
  overlay?.classList.toggle('hidden', !isOpen);
  overlay?.setAttribute('aria-hidden', String(!isOpen));
  toggleBtn?.setAttribute('aria-expanded', String(isOpen));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSidebar);
} else {
  initializeSidebar();
}

window.SidebarNav = {
  initialize: initializeSidebar,
  isAdmin: () => sidebarState.isAdmin,
  getCurrentUser: () => sidebarState.currentUser,
  toggle: () => {
    sidebarState.isOpen = !sidebarState.isOpen;
    updateSidebarVisibility();
  }
};

Object.assign(window, {
  initializeSidebar,
  SidebarNav: window.SidebarNav
});
