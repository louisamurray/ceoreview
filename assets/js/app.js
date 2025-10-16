/**
 * CEO Review Application - Main Orchestrator
 * 
 * This file coordinates the modular components:
 * - Core modules: constants, formatters, forms
 * - UI components: buttons, form-inputs
 * - UI helpers: navigation, modals, autosave, auth-ui
 * - Services: pdf-generator, previous-review, export-csv
 * 
 * All extracted modules maintain backwards compatibility via global exports.
 * See PHASE3_COMPLETE.md for detailed refactoring documentation.
 */

// ===== Local Helper Functions (not extracted to modules) =====

function ensureEmptyState(containerOrId) {
  const container = typeof containerOrId === 'string' ? document.getElementById(containerOrId) : containerOrId;
  if (!container) return;
  const message = emptyStateMessages[container.id];
  if (!message) return;
  const hasContent = Array.from(container.children).some((child) => !child.classList.contains('empty-placeholder'));
  let placeholder = container.querySelector('.empty-placeholder');
  if (!hasContent) {
    if (!placeholder) {
      placeholder = document.createElement('div');
      placeholder.className = 'empty-placeholder';
      placeholder.appendChild(document.createTextNode(message));
      container.appendChild(placeholder);
    }
    placeholder.textContent = message;
  } else if (placeholder) {
    placeholder.remove();
  }
}

function removeEmptyState(container) {
  if (!container) return;
  const placeholder = container.querySelector('.empty-placeholder');
  if (placeholder) placeholder.remove();
}

function tooltipHtml(text) {
  const safeText = String(text).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  return `<button type="button" class="info-dot ml-1 shrink-0" data-info="${safeText}" aria-label="${safeText}" aria-expanded="false">i</button>`;
}

function markFormAsSaved() {
  // Mark form as saved - can be used for tracking unsaved changes
  window.formHasUnsavedChanges = false;
}

// ===== Main Application Initialization =====

document.addEventListener('DOMContentLoaded', () => {
  // Setup UI components
  setupCollapsibles();
  setupSectionNav();
  setupInfoDots();

  const form = document.getElementById('reviewForm');
  setupAutosave(form);
  if (form) {
    form.addEventListener('input', updateAllSectionSummaries);
    form.addEventListener('change', updateAllSectionSummaries);
  }
  updateAllSectionSummaries();

  const url = new URL(window.location);
  const sectionParam = url.searchParams.get('section');
  const hashSection = window.location.hash ? window.location.hash.substring(1) : null;
  const targetSection = sectionParam || hashSection;
  if (targetSection) {
    window.requestAnimationFrame(() => navigateToSection(`#${targetSection}`, false));
  }

  Object.keys(emptyStateMessages).forEach((id) => ensureEmptyState(id));

  // Initially hide logout button until user is authenticated
  updateLogoutButtonVisibility(false);

  // Handle Firebase auth state changes
  window.onFirebaseAuthStateChanged = function(user) {
    if (user) {
      // User is logged in - close modals and show app
      if (typeof window.showLoginModal === 'function') {
        window.showLoginModal(false);
      }
      if (typeof window.showSignupModal === 'function') {
        window.showSignupModal(false);
      }
      updateLogoutButtonVisibility(true);
      checkAdminStatusAndUpdateUI(user);
    } else {
      // User is logged out - show login modal and hide app
      updateLogoutButtonVisibility(false);
      checkAdminStatusAndUpdateUI(null);
      // Show login modal only if we're not already in a modal context
      const loginModal = document.getElementById('login-modal');
      const appContainer = document.getElementById('app-container');
      if (loginModal && !loginModal.classList.contains('hidden')) {
        // Already showing a modal, don't interfere
      } else if (appContainer && appContainer.style.display !== 'none') {
        // User logged out while using the app, might want to show modal
        // But for now, just keep the app visible
      }
    }
  };

  // Setup all button handlers from ButtonHandlers module
  if (typeof window.ButtonHandlers !== 'undefined') {
    window.ButtonHandlers.setupAll();
  } else {
    console.warn('ButtonHandlers module not loaded');
  }

  // Login form handler
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.onsubmit = async function(e) {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const errorDiv = document.getElementById('login-error');
      errorDiv.textContent = '';
      
      // Validate inputs
      if (!email || !password) {
        errorDiv.textContent = 'Please enter both email and password.';
        return;
      }
      
      try {
        if (!window.firebaseHelpers) {
          throw new Error('Firebase not initialized. Please reload the page.');
        }
        await window.firebaseHelpers.loginWithEmail(email, password);
        // Success: modal will close via auth state listener
      } catch (err) {
        console.error('Login error:', err);
        errorDiv.textContent = err.message || 'Login failed. Please try again.';
      }
    };
  } else {
    console.warn('Login form not found');
  }

  // Sign-up form handler
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.onsubmit = async function(e) {
      e.preventDefault();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      const confirm = document.getElementById('signup-confirm').value;
      const errorDiv = document.getElementById('signup-error');
      errorDiv.textContent = '';
      
      // Validate inputs
      if (!email || !password || !confirm) {
        errorDiv.textContent = 'Please fill in all fields.';
        return;
      }
      
      if (password !== confirm) {
        errorDiv.textContent = 'Passwords do not match.';
        return;
      }
      if (password.length < 6) {
        errorDiv.textContent = 'Password must be at least 6 characters.';
        return;
      }
      try {
        if (!window.firebaseHelpers) {
          throw new Error('Firebase not initialized. Please reload the page.');
        }
        await window.firebaseHelpers.signUpWithEmail(email, password);
        // Success: modal will close via auth state listener
      } catch (err) {
        console.error('Signup error:', err);
        errorDiv.textContent = err.message || 'Sign up failed. Please try again.';
      }
    };
  } else {
    console.warn('Signup form not found');
  }

  const resetForm = document.getElementById('reset-form');
  if (resetForm) {
    resetForm.onsubmit = async function(e) {
      e.preventDefault();
      const email = document.getElementById('reset-email').value.trim();
      const status = document.getElementById('reset-status');
      
      if (!email) {
        if (status) status.textContent = 'Please enter your email address.';
        return;
      }
      
      if (status) {
        status.textContent = 'Sending reset email…';
        status.className = 'text-sm min-h-[1.5em] text-slate-600';
      }
      try {
        if (!window.firebaseHelpers) {
          throw new Error('Firebase not initialized. Please reload the page.');
        }
        await window.firebaseHelpers.sendPasswordReset(email);
        if (status) {
          status.textContent = 'Email sent! Check your inbox for further instructions.';
          status.className = 'text-sm min-h-[1.5em] text-emerald-600';
        }
        setTimeout(() => {
          showResetModal(false);
        }, 2000);
      } catch (err) {
        console.error('Reset error:', err);
        if (status) {
          status.textContent = err.message || 'Unable to send reset email. Please try again.';
          status.className = 'text-sm min-h-[1.5em] text-red-600';
        }
      }
    };
  } else {
    console.warn('Reset form not found');
  }
  
  attachLoginLogoutHandlers();
  
  // Render KPI cards
  const kpiContainer = document.getElementById('kpi-container');
  if (kpiContainer && Array.isArray(window.ceoReviewConfig?.kpis)) {
    const ratingDescriptions = {
      1: "Unacceptable",
      2: "Partially meets expectations",
      3: "Meets expectations",
      4: "Meets and often exceeds expectations",
      5: "Consistently exceeds expectations"
    };
    
    window.ceoReviewConfig.kpis.forEach((kpi, i) => {
      const div = document.createElement('div');
      div.className = "p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm mb-4";
      div.innerHTML = `
        <div class="mb-2 font-semibold text-slate-800">${kpi} ${tooltipHtml("Rate your performance in this area.")}</div>
        <div class="flex items-center gap-2 mb-2">
          <span class="text-sm text-slate-700">Rating:</span>
          <div class="flex gap-2">
            <label class="relative"> <input type="radio" name="kpi-${i}" value="1" class="accent-blue-600"> 1 ${tooltipHtml(ratingDescriptions[1])}</label>
            <label class="relative"> <input type="radio" name="kpi-${i}" value="2" class="accent-blue-600"> 2 ${tooltipHtml(ratingDescriptions[2])}</label>
            <label class="relative"> <input type="radio" name="kpi-${i}" value="3" class="accent-blue-600"> 3 ${tooltipHtml(ratingDescriptions[3])}</label>
            <label class="relative"> <input type="radio" name="kpi-${i}" value="4" class="accent-blue-600"> 4 ${tooltipHtml(ratingDescriptions[4])}</label>
            <label class="relative"> <input type="radio" name="kpi-${i}" value="5" class="accent-blue-600"> 5 ${tooltipHtml(ratingDescriptions[5])}</label>
          </div>
        </div>
        <div class="mb-2">
          <label class="block text-sm font-medium text-slate-700 mb-1">Evidence / Examples ${tooltipHtml("Include specific examples, data, or feedback that justify your rating.")}</label>
          <textarea class="w-full p-2 border border-slate-300 rounded-md bg-white" placeholder="Describe evidence, examples, or feedback for ${kpi}. What supports your rating?"></textarea>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1">
            <label class="block text-sm font-medium text-slate-700 mb-1">Compared to Last Year ${tooltipHtml("How does this area compare to last year?")}</label>
            <select class="w-full p-2 border border-slate-300 rounded-md bg-white">
              <option value="">Select a comparison…</option>
              <option value="Better">Better</option>
              <option value="About the Same">About the Same</option>
              <option value="Worse">Worse</option>
            </select>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-slate-700 mb-1">Why? (briefly) ${tooltipHtml("Explain the reason for your rating and comparison.")}</label>
            <input type="text" class="w-full p-2 border border-slate-300 rounded-md bg-white" placeholder="Why? (briefly)">
          </div>
        </div>
      `;
      kpiContainer.appendChild(div);
    });
  }

  // Render JD Alignment cards
  const jdContainer = document.getElementById('jd-alignment-container');
  if (jdContainer && Array.isArray(window.ceoReviewConfig?.jdAreas)) {
    window.ceoReviewConfig.jdAreas.forEach((area) => {
      const div = document.createElement('div');
      div.className = "p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm mb-4";
      div.innerHTML = `
        <div class="mb-2 font-semibold text-slate-800">${area} ${tooltipHtml("Reflect on this job description area.")}</div>
        <div class="mb-3">
          <label class="block text-sm font-medium text-slate-700 mb-1">What Went Well ${tooltipHtml("Describe successes, strengths, or positive outcomes in this area.")}</label>
          <textarea class="w-full p-2 border border-slate-300 rounded-md bg-white mb-2" placeholder="What Went Well..."></textarea>
          <label class="block text-sm font-medium text-slate-700 mb-1">What Did Not Go Well ${tooltipHtml("Describe challenges, missed targets, or areas for improvement.")}</label>
          <textarea class="w-full p-2 border border-slate-300 rounded-md bg-white" placeholder="What Did Not Go Well..."></textarea>
        </div>
      `;
      jdContainer.appendChild(div);
    });
  }

  // Render Strategic Priorities cards
  const spContainer = document.getElementById('strategic-priorities-container');
  if (spContainer && Array.isArray(window.ceoReviewConfig?.strategicPriorities)) {
    window.ceoReviewConfig.strategicPriorities.forEach((priority) => {
      const div = document.createElement('div');
      div.className = "p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm mb-4";
      div.innerHTML = `
        <div class="mb-2 font-semibold text-slate-800">${priority} ${tooltipHtml("Reflect on this strategic priority.")}</div>
        <div class="mb-3">
          <label class="block text-sm font-medium text-slate-700 mb-1">Progress & Achievements ${tooltipHtml("Describe progress, milestones, or achievements for this priority.")}</label>
          <textarea class="w-full p-2 border border-slate-300 rounded-md bg-white mb-2" placeholder="Progress & Achievements..."></textarea>
          <label class="block text-sm font-medium text-slate-700 mb-1">Challenges ${tooltipHtml("Describe any challenges or obstacles faced in this area.")}</label>
          <textarea class="w-full p-2 border border-slate-300 rounded-md bg-white mb-2" placeholder="Challenges..."></textarea>
          <label class="block text-sm font-medium text-slate-700 mb-1">Trend vs Last Year ${tooltipHtml("Is this area improving, staying the same, or declining compared to last year?")}</label>
          <select class="w-full p-2 border border-slate-300 rounded-md bg-white">
            <option value="">Select a trend…</option>
            <option value="Improving">Improving</option>
            <option value="About the Same">About the Same</option>
            <option value="Declining">Declining</option>
          </select>
        </div>
      `;
      spContainer.appendChild(div);
    });
  }

  enhanceAllTextareas();
  updateAllSectionSummaries();
});
