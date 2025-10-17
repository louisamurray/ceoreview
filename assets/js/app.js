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

const STATUS_CLASSES = {
  error: 'text-sm min-h-[1.5em] text-red-600',
  info: 'text-sm min-h-[1.5em] text-slate-600',
  success: 'text-sm min-h-[1.5em] text-green-600'
};

function getFieldValue(id, { trim = true } = {}) {
  const input = document.getElementById(id);
  if (!input) return '';
  const value = input.value ?? '';
  return trim ? value.trim() : value;
}

function getFirebaseHelpers() {
  const helpers = window.firebaseHelpers;
  if (!helpers) {
    throw new Error('Firebase not initialized. Please reload the page.');
  }
  return helpers;
}

function createStatusManager(element, defaultClass) {
  if (!element) {
    return {
      clear() {},
      error() {},
      success() {},
      info() {},
      set() {}
    };
  }

  const baseClass = defaultClass || element.className || STATUS_CLASSES.info;

  const apply = (text, className = baseClass) => {
    element.textContent = text;
    element.className = className;
  };

  return {
    clear() {
      apply('', baseClass);
    },
    error(text) {
      apply(text, STATUS_CLASSES.error);
    },
    success(text) {
      apply(text, STATUS_CLASSES.success);
    },
    info(text) {
      apply(text, STATUS_CLASSES.info);
    },
    set(text, className) {
      apply(text, className || baseClass);
    }
  };
}

function bindAuthForm({ formId, statusId, defaultStatusClass, onSubmit }) {
  const form = document.getElementById(formId);
  if (!form) {
    console.warn(`Auth form not found: ${formId}`);
    return;
  }

  const statusElement = statusId ? document.getElementById(statusId) : null;
  const status = createStatusManager(statusElement, defaultStatusClass);
  const submitButton = form.querySelector('[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute('aria-busy', 'true');
    }

    try {
      await onSubmit({ status, form });
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute('aria-busy');
      }
    }
  });
}

function setupAuthFormHandlers() {
  bindAuthForm({
    formId: 'login-form',
    statusId: 'login-error',
    defaultStatusClass: STATUS_CLASSES.error,
    onSubmit: async ({ status }) => {
      status.clear();

      const email = getFieldValue('login-email');
      const password = getFieldValue('login-password', { trim: false });

      if (!email || !password) {
        status.error('Please enter both email and password.');
        return;
      }

      try {
        const helpers = getFirebaseHelpers();
        await helpers.loginWithEmail(email, password);
      } catch (error) {
        console.error('Login error:', error);
        status.error(error.message || 'Login failed. Please try again.');
      }
    }
  });

  bindAuthForm({
    formId: 'signup-form',
    statusId: 'signup-error',
    defaultStatusClass: STATUS_CLASSES.error,
    onSubmit: async ({ status }) => {
      status.clear();

      const email = getFieldValue('signup-email');
      const password = getFieldValue('signup-password', { trim: false });
      const confirm = getFieldValue('signup-confirm', { trim: false });

      if (!email || !password || !confirm) {
        status.error('Please fill in all fields.');
        return;
      }

      if (password !== confirm) {
        status.error('Passwords do not match.');
        return;
      }

      if (password.length < 6) {
        status.error('Password must be at least 6 characters.');
        return;
      }

      try {
        const helpers = getFirebaseHelpers();
        await helpers.signUpWithEmail(email, password);
      } catch (error) {
        console.error('Signup error:', error);
        status.error(error.message || 'Sign up failed. Please try again.');
      }
    }
  });

  bindAuthForm({
    formId: 'reset-form',
    statusId: 'reset-status',
    defaultStatusClass: STATUS_CLASSES.info,
    onSubmit: async ({ status, form }) => {
      status.clear();
      const email = getFieldValue('reset-email');

      if (!email) {
        status.error('Please enter your email address.');
        return;
      }

      status.info('Sending reset email…');

      try {
        const helpers = getFirebaseHelpers();
        await helpers.sendPasswordReset(email);
        status.success('Email sent! Check your inbox for further instructions.');
        form.reset();
        setTimeout(() => {
          if (typeof window.showResetModal === 'function') {
            window.showResetModal(false);
          }
        }, 2000);
      } catch (error) {
        console.error('Reset error:', error);
        status.error(error.message || 'Unable to send reset email. Please try again.');
      }
    }
  });
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
      if (typeof window.showResetModal === 'function') {
        window.showResetModal(false);
      }
      updateLogoutButtonVisibility(true);
      checkAdminStatusAndUpdateUI(user);
    } else {
      // User is logged out - ONLY show login modal, hide everything else
      updateLogoutButtonVisibility(false);
      checkAdminStatusAndUpdateUI(null);
      if (typeof window.showLoginModal === 'function') {
        window.showLoginModal(true);
      }
    }
  };

  // Setup all button handlers from ButtonHandlers module
  if (typeof window.ButtonHandlers !== 'undefined') {
    window.ButtonHandlers.setupAll();
  } else {
    console.warn('ButtonHandlers module not loaded');
  }

  setupAuthFormHandlers();
  
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
  
  // --- Resume review from sessionStorage if present ---
  const resumeReviewData = sessionStorage.getItem('resumeReviewData');
  if (resumeReviewData && typeof window.populateFormFromData === 'function') {
    try {
      const draft = JSON.parse(resumeReviewData);
      if (draft && draft.sections) {
        window.populateFormFromData(draft.sections);
        sessionStorage.removeItem('resumeReviewData');
        sessionStorage.removeItem('resumeReviewId');
        alert('Draft loaded from My Reviews!');
      }
    } catch (e) {
      console.error('Failed to load review from sessionStorage:', e);
    }
  }
});
