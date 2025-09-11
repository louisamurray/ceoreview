// --- Config ---
const STORAGE_KEY = "ceoReviewFormData";
const kpis = [
  "Conflict Resolution",
  "Financial Resilience",
  "Board–CEO Communication",
  "Values Alignment"
];
const strategicPriorities = [
  "Strengthen Iwi relationships",
  "Increase trusted relationships & social cohesion",
  "Contribute to intergenerational wellbeing",
  "Operate a positive & professional organisation"
];
const jdAreas = [
  "Strategic Leadership",
  "People & Resources",
  "Partnerships",
  "Growth Opportunities",
  "Accountability",
  "Team & Culture"
];
const ratingDescriptions = {
  5: "Consistently exceeds expectations",
  4: "Meets and often exceeds expectations",
  3: "Meets expectations",
  2: "Partially meets expectations",
  1: "Unacceptable"
};
window.ceoReviewConfig = { kpis, strategicPriorities, jdAreas, ratingDescriptions };


// --- Login Modal Display ---
function showLoginModal(show) {
  const loginModal = document.getElementById('login-modal');
  const appContainer = document.getElementById('app-container');
  if (loginModal) loginModal.classList.toggle('hidden', !show);
  if (appContainer) appContainer.style.display = show ? 'none' : '';

}

// --- Logout Handler ---
function attachLogoutHandler() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn && window.firebaseHelpers?.logout) {
    logoutBtn.onclick = () => window.firebaseHelpers.logout();
  }
}

// --- Auth Change Listener ---
window.onFirebaseAuthStateChanged = function(user) {
  const appContainer = document.getElementById('app-container');
  const loginModal = document.getElementById('login-modal');

  const showCriticalError = (msg) => {
    if (appContainer) {
      appContainer.style.display = '';
      let errDiv = document.getElementById('critical-error');
      if (!errDiv) {
        errDiv = document.createElement('div');
        errDiv.id = 'critical-error';
        errDiv.style.background = '#fee';
        errDiv.style.color = '#b00';
        errDiv.style.padding = '1em';
        errDiv.style.margin = '1em 0';
        errDiv.style.border = '1px solid #b00';
        errDiv.style.fontWeight = 'bold';
        appContainer.prepend(errDiv);
      }
      errDiv.textContent = msg;
    }

  };



  if (user) {
    localStorage.removeItem(STORAGE_KEY);
    if (loginModal) loginModal.classList.add('hidden');
    if (appContainer) appContainer.style.display = '';

    window.firebaseHelpers.loadReviewData(user.uid, 'drafts')
      .then(doc => {

        const localDraft = localStorage.getItem(STORAGE_KEY);

        if (!doc && localDraft) {
          if (confirm('A local draft was found. Would you like to import it to your cloud account?')) {
            try {
              const parsed = JSON.parse(localDraft);
              return window.firebaseHelpers.saveReviewData(user.uid, parsed.data, 'drafts')
                .then(() => {
                  alert('Draft imported to your cloud account.');
                  loadProgress();

                });
            } catch (e) {
              showCriticalError('Local draft parse error: ' + e.message);
            }
          }
        }

        if (doc && doc.data) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ timestamp: doc.timestamp, data: doc.data }));
            loadProgress();

          } catch (e) {
            showCriticalError('Error saving Firestore draft to localStorage: ' + e.message);
          }
        }
      })
      .catch(err => {
        showCriticalError('Could not load your cloud draft. You can still use the form, but cloud sync is unavailable. (' + err.message + ')');
      });
  } else {
    if (loginModal) loginModal.classList.remove('hidden');
    if (appContainer) appContainer.style.display = '';
    localStorage.removeItem(STORAGE_KEY);
    if (typeof clearForm === 'function') clearForm();

  }
};

// --- Initialise Form App ---
// --- Hydrate Form from LocalStorage ---
function loadProgress() {
  const savedDataJSON = localStorage.getItem(STORAGE_KEY);
  if (!savedDataJSON) return;
  let savedData;
  try {
    savedData = JSON.parse(savedDataJSON);
  } catch (e) {
    alert('Saved progress could not be loaded due to a data error. The form will start fresh.');
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  const formData = savedData.data;
  for (const id in formData.simple) {
    const el = document.getElementById(id);
    if (el) el.value = formData.simple[id];
  }
  // Add more hydration logic here if you have repeaters, KPIs, etc.
}
document.addEventListener('DOMContentLoaded', () => {
  attachLogoutHandler();

  // --- Login Form Handler ---
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      document.getElementById('login-error').textContent = '';
      if (window.firebaseHelpers && window.firebaseHelpers.loginWithEmail) {
        window.firebaseHelpers.loginWithEmail(email, password)
          .catch(err => {
            document.getElementById('login-error').textContent = err.message;
          });
      }
    });
  }
});