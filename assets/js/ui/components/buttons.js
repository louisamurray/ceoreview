/**
 * ButtonHandlers - Centralized button event handler setup
 * Manages all interactive buttons in the CEO review form
 * @namespace ButtonHandlers
 */

/**
 * Setup "Load Last Saved" button handler
 * @function setupLoadSaved
 * @returns {void}
 */
function setupLoadSaved() {
  const loadSavedBtn = document.getElementById('load-last-saved-btn');
  if (loadSavedBtn) {
    loadSavedBtn.onclick = async function() {
      try {
        const user = firebase.auth().currentUser;
        if (!user) {
          alert('Please log in to load saved drafts.');
          return;
        }
        
        loadSavedBtn.disabled = true;
        loadSavedBtn.textContent = 'Loading...';
        
        const draft = await window.firebaseHelpers.loadReview(user.uid, 'draft');
        if (draft && draft.sections) {
          populateFormFromData(draft.sections);
          alert('Draft loaded successfully!');
        } else {
          alert('No saved draft found.');
        }
      } catch (error) {
        console.error('Error loading draft:', error);
        alert('Failed to load draft: ' + error.message);
      } finally {
        loadSavedBtn.disabled = false;
        loadSavedBtn.textContent = 'Load Saved';
      }
    };
  }
}

/**
 * Setup "Save Draft" button handler
 * @function setupSaveDraft
 * @returns {void}
 */
function setupSaveDraft() {
  const saveProgressBtn = document.getElementById('save-progress-btn');
  if (saveProgressBtn) {
    saveProgressBtn.onclick = async function() {
      try {
        const user = firebase.auth().currentUser;
        if (!user) {
          alert('Please log in to save your progress.');
          return;
        }
        
        saveProgressBtn.disabled = true;
        saveProgressBtn.textContent = 'Saving...';
        
        const formData = collectFormData();
        const flatData = flattenSectionsToFlat(formData);
        await window.firebaseHelpers.saveReview(user.uid, flatData, 'draft');
        markFormAsSaved();
        alert('Draft saved successfully!');
      } catch (error) {
        console.error('Error saving draft:', error);
        alert('Failed to save draft: ' + error.message);
      } finally {
        saveProgressBtn.disabled = false;
        saveProgressBtn.textContent = 'Save Draft';
      }
    };
  }
}

/**
 * Setup "Download PDF" button handler
 * @function setupDownloadPDF
 * @returns {void}
 */
function setupDownloadPDF() {
  const savePdfBtn = document.getElementById('save-pdf-btn');
  if (savePdfBtn) {
    savePdfBtn.onclick = async function() {
      try {
        savePdfBtn.disabled = true;
        savePdfBtn.textContent = 'Generating...';
        
        await generatePDF();
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF: ' + error.message);
      } finally {
        savePdfBtn.disabled = false;
        savePdfBtn.textContent = 'Download PDF';
      }
    };
  }
}

/**
 * Setup form submission handler (Submit Review)
 * @function setupSubmitReview
 * @returns {void}
 */
function setupSubmitReview() {
  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      try {
        const user = firebase.auth().currentUser;
        if (!user) {
          alert('Please log in to submit your review.');
          return;
        }
        
        if (!confirm('Are you sure you want to submit this review? Once submitted, it cannot be edited.')) {
          return;
        }
        
        const submitBtn = reviewForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Submitting...';
        }
        
        const formData = collectFormData();
        const flatData = flattenSectionsToFlat(formData);
        console.log('Submitting review for user:', user.uid);
        console.log('Flat data:', flatData);
        await window.firebaseHelpers.saveReview(user.uid, flatData, 'submitted');
        console.log('Review submitted successfully to Firestore');
        
        alert('Review submitted successfully!');
        clearForm();
        markFormAsSaved();
        
        if (submitBtn) {
          submitBtn.textContent = 'Submit Review';
        }
      } catch (error) {
        console.error('Error submitting review:', error);
        alert('Failed to submit review: ' + error.message);
        
        const submitBtn = reviewForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Review';
        }
      }
    });
  }
}

/**
 * Setup "Clear Form" button handler
 * @function setupClearForm
 * @returns {void}
 */
function setupClearForm() {
  const clearFormBtn = document.getElementById('clear-form-btn');
  if (clearFormBtn) {
    clearFormBtn.onclick = async function() {
      await clearForm();
    };
  }
}

/**
 * Setup section-specific "Clear" buttons
 * These buttons clear individual form sections
 * @function setupSectionClearButtons
 * @returns {void}
 */
function setupSectionClearButtons() {
  // Clear Performance Reflection section
  const clearPerformanceBtn = document.getElementById('clear-performance-btn');
  if (clearPerformanceBtn) {
    clearPerformanceBtn.onclick = function() {
      document.getElementById('successes').value = '';
      document.getElementById('not-well').value = '';
      document.getElementById('comparative-reflection').value = '';
      const challenges = document.getElementById('challenges-container');
      if (challenges) {
        Array.from(challenges.querySelectorAll('textarea')).forEach(t => t.value = '');
      }
      updateAllSectionSummaries();
    };
  }

  // Clear Goals & KPIs section
  const clearGoalsBtn = document.getElementById('clear-goals-btn');
  if (clearGoalsBtn) {
    clearGoalsBtn.onclick = function() {
      const lastYearGoals = document.getElementById('last-year-goals-container');
      if (lastYearGoals) {
        Array.from(lastYearGoals.querySelectorAll('input, textarea, select')).forEach(el => {
          if (el.type === 'checkbox' || el.type === 'radio') el.checked = false;
          else el.value = '';
        });
      }
      const kpiContainer = document.getElementById('kpi-container');
      if (kpiContainer) {
        Array.from(kpiContainer.querySelectorAll('input[type="radio"]')).forEach(el => el.checked = false);
        Array.from(kpiContainer.querySelectorAll('textarea')).forEach(el => el.value = '');
        Array.from(kpiContainer.querySelectorAll('select')).forEach(el => el.selectedIndex = 0);
        Array.from(kpiContainer.querySelectorAll('input[type="text"]')).forEach(el => el.value = '');
      }
      updateAllSectionSummaries();
    };
  }

  // Clear JD Alignment section
  const clearJdBtn = document.getElementById('clear-jd-btn');
  if (clearJdBtn) {
    clearJdBtn.onclick = function() {
      const jdContainer = document.getElementById('jd-alignment-container');
      if (jdContainer) {
        Array.from(jdContainer.querySelectorAll('textarea')).forEach(el => el.value = '');
      }
      updateAllSectionSummaries();
    };
  }

  // Clear Strategic Priorities section
  const clearStrategicBtn = document.getElementById('clear-strategic-btn');
  if (clearStrategicBtn) {
    clearStrategicBtn.onclick = function() {
      const spContainer = document.getElementById('strategic-priorities-container');
      if (spContainer) {
        Array.from(spContainer.querySelectorAll('textarea')).forEach(el => el.value = '');
        Array.from(spContainer.querySelectorAll('select')).forEach(el => el.selectedIndex = 0);
      }
      updateAllSectionSummaries();
    };
  }

  // Clear Personal Assessment section
  const clearPersonalBtn = document.getElementById('clear-personal-btn');
  if (clearPersonalBtn) {
    clearPersonalBtn.onclick = function() {
      document.getElementById('strengths').value = '';
      document.getElementById('limitations').value = '';
      const pdUndertaken = document.getElementById('pd-undertaken-container');
      if (pdUndertaken) {
        Array.from(pdUndertaken.querySelectorAll('input, textarea, select')).forEach(el => {
          if (el.type === 'checkbox' || el.type === 'radio') el.checked = false;
          else el.value = '';
        });
      }
      const pdNeeded = document.getElementById('pd-needed-container');
      if (pdNeeded) {
        Array.from(pdNeeded.querySelectorAll('input, textarea')).forEach(el => el.value = '');
      }
      updateAllSectionSummaries();
    };
  }

  // Clear Future Focus section
  const clearFutureBtn = document.getElementById('clear-future-btn');
  if (clearFutureBtn) {
    clearFutureBtn.onclick = function() {
      const futureGoals = document.getElementById('future-goals-container');
      if (futureGoals) {
        Array.from(futureGoals.querySelectorAll('input, textarea')).forEach(el => el.value = '');
      }
      updateAllSectionSummaries();
    };
  }

  // Clear Board Dialogue section
  const clearBoardBtn = document.getElementById('clear-board-btn');
  if (clearBoardBtn) {
    clearBoardBtn.onclick = function() {
      const boardRequests = document.getElementById('board-requests-container');
      if (boardRequests) {
        Array.from(boardRequests.querySelectorAll('input, textarea, select')).forEach(el => {
          if (el.type === 'checkbox' || el.type === 'radio') el.checked = false;
          else el.value = '';
        });
      }
      updateAllSectionSummaries();
    };
  }
}

/**
 * Setup test data and auth modal buttons
 * @function setupUtilityButtons
 * @returns {void}
 */
function setupUtilityButtons() {
  // Populate test data - Admin only
  const populateTestDataBtn = document.getElementById('populate-test-data-btn');
  if (populateTestDataBtn) {
    // Initially hide the button until we check admin status
    populateTestDataBtn.style.display = 'none';
    
    populateTestDataBtn.onclick = async function() {
      if (populateTestDataBtn.style.display === 'none') return; // Prevent action if hidden
      
      if (confirm('This will clear the current form and load comprehensive test data. Continue?')) {
        await populateTestData();
        markFormAsSaved(); // Mark as saved after loading test data
      }
    };
  }

  // Show sign-up modal from login
  const showSignupBtn = document.getElementById('show-signup-btn');
  if (showSignupBtn) {
    showSignupBtn.onclick = function() {
      showLoginModal(false);
      showSignupModal(true);
    };
  }

  // Show login modal from sign-up
  const showLoginBtn = document.getElementById('show-login-btn');
  if (showLoginBtn) {
    showLoginBtn.onclick = function() {
      showSignupModal(false);
      showLoginModal(true);
    };
  }

  // Show password reset modal
  const showResetBtn = document.getElementById('show-reset-btn');
  if (showResetBtn) {
    showResetBtn.onclick = function() {
      showResetModal(true);
    };
  }

  // Modal close buttons
  document.querySelectorAll('[data-modal-close]').forEach((button) => {
    button.addEventListener('click', () => {
      const modal = button.closest('[data-modal]');
      if (!modal) return;
      if (modal.id === 'login-modal') {
        showLoginModal(false);
      } else if (modal.id === 'signup-modal') {
        showSignupModal(false);
      } else if (modal.id === 'reset-modal') {
        showResetModal(false);
      } else {
        closeModal(modal);
      }
    });
  });
}

// --- Export to global namespace ---
window.ButtonHandlers = {
  setupLoadSaved,
  setupSaveDraft,
  setupDownloadPDF,
  setupSubmitReview,
  setupClearForm,
  setupSectionClearButtons,
  setupUtilityButtons,
  setupAll: function() {
    this.setupLoadSaved();
    this.setupSaveDraft();
    this.setupDownloadPDF();
    this.setupSubmitReview();
    this.setupClearForm();
    this.setupSectionClearButtons();
    this.setupUtilityButtons();
  }
};
