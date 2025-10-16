/**
 * Modal Management & Focus Trap Helpers
 * Handles modal operations and keyboard navigation
 * Exported as window.ModalManager namespace
 */

const modalFocusTraps = new WeakMap();

function getFocusableElements(modal) {
  return Array.from(
    modal.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');
}

function activateFocusTrap(modal, onClose) {
  if (!modal) return;
  releaseFocusTrap(modal);
  const focusable = getFocusableElements(modal);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const handler = (event) => {
    if (event.key === 'Tab') {
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    if (event.key === 'Escape' && typeof onClose === 'function') {
      event.preventDefault();
      onClose();
    }
  };
  modal.addEventListener('keydown', handler);
  modalFocusTraps.set(modal, { handler });
  const autoFocusTarget = modal.querySelector('[data-auto-focus]') || first;
  window.requestAnimationFrame(() => autoFocusTarget.focus());
}

function releaseFocusTrap(modal) {
  const trap = modalFocusTraps.get(modal);
  if (!trap) return;
  modal.removeEventListener('keydown', trap.handler);
  modalFocusTraps.delete(modal);
}

function openModal(modal, onClose) {
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  activateFocusTrap(modal, onClose);
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  releaseFocusTrap(modal);
}

function showLoginModal(show) {
  const loginModal = document.getElementById('login-modal');
  const appContainer = document.getElementById('app-container');
  if (!loginModal) return;
  if (show) {
    showSignupModal(false);
    showResetModal(false, false);
    openModal(loginModal, () => showLoginModal(false));
    if (appContainer) {
      appContainer.style.display = 'none';
      appContainer.setAttribute('aria-hidden', 'true');
    }
  } else {
    closeModal(loginModal);
    if (appContainer) {
      appContainer.style.display = '';
      appContainer.setAttribute('aria-hidden', 'false');
    }
  }
}

function showSignupModal(show) {
  const signupModal = document.getElementById('signup-modal');
  const appContainer = document.getElementById('app-container');
  if (!signupModal) return;
  if (show) {
    showLoginModal(false);
    showResetModal(false, false);
    openModal(signupModal, () => showSignupModal(false));
    if (appContainer) {
      appContainer.style.display = 'none';
      appContainer.setAttribute('aria-hidden', 'true');
    }
  } else {
    closeModal(signupModal);
    if (appContainer) {
      appContainer.style.display = '';
      appContainer.setAttribute('aria-hidden', 'false');
    }
  }
}

function showResetModal(show, focusLoginAfterClose = true) {
  const resetModal = document.getElementById('reset-modal');
  const appContainer = document.getElementById('app-container');
  if (!resetModal) return;
  if (show) {
    showLoginModal(false);
    showSignupModal(false);
    openModal(resetModal, () => {
      showResetModal(false);
      if (focusLoginAfterClose) showLoginModal(true);
    });
    if (appContainer) {
      appContainer.style.display = 'none';
      appContainer.setAttribute('aria-hidden', 'true');
    }
  } else {
    closeModal(resetModal);
    if (appContainer) {
      appContainer.style.display = '';
      appContainer.setAttribute('aria-hidden', 'false');
    }
  }
}

// Export as window.ModalManager namespace
window.ModalManager = {
  getFocusableElements,
  activateFocusTrap,
  releaseFocusTrap,
  openModal,
  closeModal,
  showLoginModal,
  showSignupModal,
  showResetModal
};

// Legacy global exports for backwards compatibility
Object.assign(window, {
  getFocusableElements,
  activateFocusTrap,
  releaseFocusTrap,
  openModal,
  closeModal,
  showLoginModal,
  showSignupModal,
  showResetModal
});
