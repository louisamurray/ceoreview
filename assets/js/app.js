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

// --- Debug Log ---
function debugLog(msg) {
  let dbg = document.getElementById('debug-log');
  if (!dbg) {
    dbg = document.createElement('div');
    dbg.id = 'debug-log';
    dbg.style.background = '#eef';
    dbg.style.color = '#333';
    dbg.style.fontSize = '12px';
    dbg.style.padding = '0.5em';
    dbg.style.margin = '0.5em 0';
    dbg.style.border = '1px solid #99f';
    dbg.style.fontFamily = 'monospace';
    dbg.style.maxHeight = '120px';
    dbg.style.overflowY = 'auto';
    document.body.prepend(dbg);
  }
  dbg.textContent += '\n' + new Date().toLocaleTimeString() + ': ' + msg;
}

// --- Login Modal Display ---
function showLoginModal(show) {
  const loginModal = document.getElementById('login-modal');
  const appContainer = document.getElementById('app-container');
  if (loginModal) loginModal.classList.toggle('hidden', !show);
  if (appContainer) appContainer.style.display = show ? 'none' : '';
  debugLog('showLoginModal(' + show + ') called.');
}

// --- Logout Handler ---
function attachLogoutHandler() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn && window.firebaseHelpers?.logout) {
    logoutBtn.onclick = () => window.firebaseHelpers.logout();
  }
}

// --- Clear Form Stub ---
function clearForm() {
  const form = document.getElementById('reviewForm');
  if (form) form.reset();
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
    debugLog('CRITICAL ERROR: ' + msg);
  };

  debugLog('onFirebaseAuthStateChanged: user=' + (user ? user.uid : 'null'));

  if (user) {
    localStorage.removeItem(STORAGE_KEY);
    if (loginModal) loginModal.classList.add('hidden');
    if (appContainer) appContainer.style.display = '';
    window.firebaseHelpers.loadReviewData(user.uid, 'drafts')
      .then(doc => {
        debugLog('Firestore draft loaded: ' + (doc ? 'yes' : 'no'));
        const localDraft = localStorage.getItem(STORAGE_KEY);
        if (!doc && localDraft) {
          if (confirm('A local draft was found. Would you like to import it to your cloud account?')) {
            try {
              const parsed = JSON.parse(localDraft);
              return window.firebaseHelpers.saveReviewData(user.uid, parsed.data, 'drafts')
                .then(() => {
                  alert('Draft imported to your cloud account.');
                  loadProgress();
                  debugLog('Draft imported to cloud and hydrated.');
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
            debugLog('Hydrated from Firestore draft.');
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
    clearForm();
    debugLog('Logged out, cleared localStorage and showed login modal.');
  }
};

// --- Initialise Form App ---
document.addEventListener('DOMContentLoaded', () => {
  attachLogoutHandler();
  debugLog('Main DOMContentLoaded initialisation fired.');
});

// --- Dynamic Field Functions ---
function createItem(html) {
  const div = document.createElement('div');
  div.className = "p-4 border border-slate-200 rounded-md bg-slate-50 space-y-2";
  div.innerHTML = html;
  return div;
}

function addChallenge() {
  const container = document.getElementById("challenges-container");
  if (!container) return;
  container.appendChild(createItem(`
    <label>Challenge</label><textarea class="textarea"></textarea>
    <label>Action Taken</label><textarea class="textarea"></textarea>
    <label>Result</label><textarea class="textarea"></textarea>
  `));
}

function addLastYearGoal() {
  const container = document.getElementById("last-year-goals-container");
  if (!container) return;
  container.appendChild(createItem(`
    <label>Goal</label><input type="text" class="input">
    <label>Status</label><select class="input">
      <option>Achieved</option><option>Partially Achieved</option><option>Not Achieved</option></select>
    <label>Evidence</label><textarea class="textarea"></textarea>
  `));
}

function addPDUndertaken() {
  const container = document.getElementById("pd-undertaken-container");
  if (!container) return;
  container.appendChild(createItem(`<label>Professional Development</label><input type="text" class="input">`));
}

function addPDNeeded() {
  const container = document.getElementById("pd-needed-container");
  if (!container) return;
  container.appendChild(createItem(`<label>Professional Development Needed</label><input type="text" class="input">`));
}

function addFutureGoal() {
  const container = document.getElementById("future-goals-container");
  if (!container) return;
  container.appendChild(createItem(`<label>Future Goal</label><input type="text" class="input">`));
}

function removeFutureGoal() {
  const container = document.getElementById("future-goals-container");
  if (container && container.lastElementChild) container.removeChild(container.lastElementChild);
}

function addBoardRequest() {
  const container = document.getElementById("board-requests-container");
  if (!container) return;
  container.appendChild(createItem(`<label>Request</label><textarea class="textarea"></textarea>`));
}

// --- Global Exports ---
window.loadProgress = typeof loadProgress === 'function' ? loadProgress : () => {};
window.saveProgress = typeof saveProgress === 'function' ? saveProgress : () => {};
window.clearForm = clearForm;

window.addChallenge = addChallenge;
window.addLastYearGoal = addLastYearGoal;
window.addPDUndertaken = addPDUndertaken;
window.addPDNeeded = addPDNeeded;
window.addFutureGoal = addFutureGoal;
window.removeFutureGoal = removeFutureGoal;
window.addBoardRequest = addBoardRequest;
