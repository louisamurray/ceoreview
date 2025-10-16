/**
 * Authentication UI Helpers
 * Manages login/logout handlers and admin-only UI logic
 * Exported as window.AuthUI namespace
 */

function attachLoginLogoutHandlers() {
  const logoutBtn = document.getElementById('logout-btn');
  const loginBtn = document.getElementById('login-btn');
  
  if (logoutBtn && window.firebaseHelpers?.logout) {
    logoutBtn.onclick = () => window.firebaseHelpers.logout();
  }
  
  if (loginBtn) {
    loginBtn.onclick = () => {
      // Show the login modal
      if (typeof window.showLoginModal === 'function') {
        window.showLoginModal(true);
      }
    };
  }
}

function checkAdminStatusAndUpdateUI(user) {
  // Elements that should only be visible to admins
  const adminElements = document.querySelectorAll('.admin-only, #populate-test-data-btn');
  if (!user) {
    adminElements.forEach(el => { el.style.display = 'none'; });
    return;
  }
  // Fetch user data first, then check if admin
  if (window.firebaseHelpers && typeof window.firebaseHelpers.getUserData === 'function') {
    window.firebaseHelpers.getUserData(user.uid).then(userData => {
      const isAdmin = window.firebaseHelpers.isAdmin(userData);
      adminElements.forEach(el => {
        el.style.display = isAdmin ? '' : 'none';
      });
    }).catch((err) => {
      // On error, hide admin-only elements
      console.warn('Failed to check admin status:', err);
      adminElements.forEach(el => { el.style.display = 'none'; });
    });
  } else {
    // Fallback: hide admin-only elements
    adminElements.forEach(el => { el.style.display = 'none'; });
  }
}

function updateLogoutButtonVisibility(isLoggedIn) {
  const logoutBtn = document.getElementById('logout-btn');
  const loginBtn = document.getElementById('login-btn');
  if (logoutBtn) logoutBtn.style.display = isLoggedIn ? '' : 'none';
  if (loginBtn) loginBtn.style.display = isLoggedIn ? 'none' : '';
}

// Export as window.AuthUI namespace
window.AuthUI = {
  attachLoginLogoutHandlers,
  checkAdminStatusAndUpdateUI,
  updateLogoutButtonVisibility
};

// Legacy global exports for backwards compatibility
Object.assign(window, {
  attachLoginLogoutHandlers,
  checkAdminStatusAndUpdateUI,
  updateLogoutButtonVisibility
});
