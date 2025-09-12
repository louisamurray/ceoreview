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
  // Render KPI cards
  const kpiContainer = document.getElementById('kpi-container');
  if (kpiContainer && Array.isArray(window.ceoReviewConfig?.kpis)) {
    window.ceoReviewConfig.kpis.forEach((kpi, i) => {
      const div = document.createElement('div');
      div.className = "p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm mb-4";
      div.innerHTML = `
        <div class="mb-2 font-semibold text-slate-800">${kpi}</div>
        <div class="flex items-center gap-2 mb-2">
          <span class="text-sm text-slate-700">Rating:</span>
          <div class="flex gap-2">
            <label><input type="radio" name="kpi-${i}" value="1" class="accent-blue-600"> 1</label>
            <label><input type="radio" name="kpi-${i}" value="2" class="accent-blue-600"> 2</label>
            <label><input type="radio" name="kpi-${i}" value="3" class="accent-blue-600"> 3</label>
            <label><input type="radio" name="kpi-${i}" value="4" class="accent-blue-600"> 4</label>
            <label><input type="radio" name="kpi-${i}" value="5" class="accent-blue-600"> 5</label>
          </div>
        </div>
        <div class="mb-2">
          <textarea class="w-full p-2 border border-slate-300 rounded-md bg-white" placeholder="Evidence / Examples for ${kpi}..."></textarea>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1">
            <label class="block text-sm font-medium text-slate-700 mb-1">Compared to Last Year</label>
            <select class="w-full p-2 border border-slate-300 rounded-md bg-white">
              <option>Better</option>
              <option>About the Same</option>
              <option>Worse</option>
            </select>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-slate-700 mb-1">Why? (briefly)</label>
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
        <div class="mb-2 font-semibold text-slate-800">${area}</div>
        <div class="mb-3">
          <textarea class="w-full p-2 border border-slate-300 rounded-md bg-white mb-2" placeholder="What Went Well..."></textarea>
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
        <div class="mb-2 font-semibold text-slate-800">${priority}</div>
        <div class="mb-3">
          <textarea class="w-full p-2 border border-slate-300 rounded-md bg-white mb-2" placeholder="Progress & Achievements..."></textarea>
          <textarea class="w-full p-2 border border-slate-300 rounded-md bg-white mb-2" placeholder="Challenges..."></textarea>
          <label class="block text-sm font-medium text-slate-700 mb-1">Trend vs Last Year</label>
          <select class="w-full p-2 border border-slate-300 rounded-md bg-white">
            <option>Improving</option>
            <option>About the Same</option>
            <option>Declining</option>
          </select>
        </div>
      `;
      spContainer.appendChild(div);
    });
  }
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
  const idx = container.children.length + 1;
  const div = document.createElement('div');
  div.className = "p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm mb-4 relative";
  div.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <h4 class="text-lg font-semibold text-slate-900">Challenge #${idx}</h4>
      <button type="button" class="remove-challenge-btn px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium" style="margin-left:auto;">&times; Remove</button>
    </div>
    <div class="mb-3">
      <label class="block text-sm font-medium text-slate-700 mb-1">Challenge</label>
      <textarea class="w-full p-2 border border-slate-300 rounded-md bg-white" placeholder="Describe the challenge..."></textarea>
    </div>
    <div class="mb-3">
      <label class="block text-sm font-medium text-slate-700 mb-1">Action Taken</label>
      <textarea class="w-full p-2 border border-slate-300 rounded-md bg-white" placeholder="What action was taken?"></textarea>
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1">Result</label>
      <textarea class="w-full p-2 border border-slate-300 rounded-md bg-white" placeholder="What was the outcome?"></textarea>
    </div>
  `;
  // Remove button handler
  div.querySelector('.remove-challenge-btn').onclick = function() {
    div.remove();
    // Re-number remaining cards
    Array.from(container.children).forEach((el, i) => {
      const h = el.querySelector('h4');
      if (h) h.textContent = `Challenge #${i+1}`;
    });
  };
  container.appendChild(div);
}

function addLastYearGoal() {
  const container = document.getElementById("last-year-goals-container");
  if (!container) return;
  const idx = container.children.length + 1;
  const div = document.createElement('div');
  div.className = "p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm mb-4 relative";
  div.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <h4 class="text-lg font-semibold text-slate-900">Goal from Last Year #${idx}</h4>
      <button type="button" class="remove-goal-btn px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium">&times; Remove</button>
    </div>
    <div class="mb-3">
      <label class="block text-sm font-medium text-slate-700 mb-1">Goal</label>
      <input type="text" class="w-full p-2 border border-slate-300 rounded-md bg-white" placeholder="Enter the goal statement...">
    </div>
    <div class="mb-3">
      <label class="block text-sm font-medium text-slate-700 mb-1">Status</label>
      <select class="w-full p-2 border border-slate-300 rounded-md bg-white">
        <option>Achieved</option>
        <option>Partially Achieved</option>
        <option>Not Achieved</option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1">Evidence / Examples</label>
      <textarea class="w-full p-2 border border-slate-300 rounded-md bg-white" placeholder="Provide supporting evidence..."></textarea>
    </div>
  `;
  div.querySelector('.remove-goal-btn').onclick = function() {
    div.remove();
    Array.from(container.children).forEach((el, i) => {
      const h = el.querySelector('h4');
      if (h) h.textContent = `Goal from Last Year #${i+1}`;
    });
  };
  container.appendChild(div);
}

function addPDUndertaken() {
  const container = document.getElementById("pd-undertaken-container");
  if (!container) return;
  const idx = container.children.length + 1;
  const div = document.createElement('div');
  div.className = "p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm mb-4 relative";
  div.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <h4 class="text-lg font-semibold text-slate-900">Programme/Course #${idx}</h4>
      <button type="button" class="remove-pd-btn px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium">&times; Remove</button>
    </div>
    <div class="mb-3">
      <label class="block text-sm font-medium text-slate-700 mb-1">Programme/Course Title</label>
      <input type="text" class="w-full p-2 border border-slate-300 rounded-md bg-white" placeholder="Programme/Course Title">
    </div>
    <div class="mb-3">
      <label class="block text-sm font-medium text-slate-700 mb-1">Key Learnings</label>
      <textarea class="w-full p-2 border border-slate-300 rounded-md bg-white" placeholder="Key Learnings"></textarea>
    </div>
    <div class="mb-3">
      <label class="block text-sm font-medium text-slate-700 mb-1">How Learnings Were Applied</label>
      <textarea class="w-full p-2 border border-slate-300 rounded-md bg-white" placeholder="How Learnings Were Applied"></textarea>
    </div>
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="flex-1">
        <label class="block text-sm font-medium text-slate-700 mb-1">Was This Requested Previously?</label>
        <select class="w-full p-2 border border-slate-300 rounded-md bg-white">
          <option>No</option>
          <option>Yes</option>
        </select>
      </div>
      <div class="flex-1">
        <label class="block text-sm font-medium text-slate-700 mb-1">Usefulness vs Last Year</label>
        <select class="w-full p-2 border border-slate-300 rounded-md bg-white">
          <option>More Useful</option>
          <option>About the Same</option>
          <option>Less Useful</option>
        </select>
      </div>
    </div>
  `;
  div.querySelector('.remove-pd-btn').onclick = function() {
    div.remove();
    Array.from(container.children).forEach((el, i) => {
      const h = el.querySelector('h4');
      if (h) h.textContent = `Programme/Course #${i+1}`;
    });
  };
  container.appendChild(div);
}

function addPDNeeded() {
  const container = document.getElementById("pd-needed-container");
  if (!container) return;
  const idx = container.children.length + 1;
  const div = document.createElement('div');
  div.className = "p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm mb-4 relative";
  div.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <h4 class="text-lg font-semibold text-slate-900">Development Need #${idx}</h4>
      <button type="button" class="remove-pdneed-btn px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium">&times; Remove</button>
    </div>
    <div class="mb-3">
      <label class="block text-sm font-medium text-slate-700 mb-1">Area of Need</label>
      <input type="text" class="w-full p-2 border border-slate-300 rounded-md bg-white" placeholder="Area of Need">
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1">Expected Impact</label>
      <textarea class="w-full p-2 border border-slate-300 rounded-md bg-white" placeholder="Describe the expected impact of this PD..."></textarea>
    </div>
  `;
  div.querySelector('.remove-pdneed-btn').onclick = function() {
    div.remove();
    Array.from(container.children).forEach((el, i) => {
      const h = el.querySelector('h4');
      if (h) h.textContent = `Development Need #${i+1}`;
    });
  };
  container.appendChild(div);
}

function addFutureGoal() {
  const container = document.getElementById("future-goals-container");
  if (!container) return;
  const idx = container.children.length + 1;
  const div = document.createElement('div');
  div.className = "p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm mb-4 relative";
  div.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <h4 class="text-lg font-semibold text-slate-900">Future Goal #${idx}</h4>
      <button type="button" class="remove-futuregoal-btn px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium">&times; Remove</button>
    </div>
    <div class="mb-3">
      <label class="block text-sm font-medium text-slate-700 mb-1">Goal Statement</label>
      <input type="text" class="w-full p-2 border border-slate-300 rounded-md bg-white" placeholder="Enter the goal statement...">
    </div>
    <div class="mb-3">
      <label class="block text-sm font-medium text-slate-700 mb-1">Desired Outcome</label>
      <textarea class="w-full p-2 border border-slate-300 rounded-md bg-white" placeholder="What will success look like?"></textarea>
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1">Why It Matters (Alignment to strategic priorities)</label>
      <textarea class="w-full p-2 border border-slate-300 rounded-md bg-white" placeholder="How does this align with strategic priorities?"></textarea>
    </div>
  `;
  div.querySelector('.remove-futuregoal-btn').onclick = function() {
    div.remove();
    Array.from(container.children).forEach((el, i) => {
      const h = el.querySelector('h4');
      if (h) h.textContent = `Future Goal #${i+1}`;
    });
  };
  container.appendChild(div);
}

function removeFutureGoal() {
  const container = document.getElementById("future-goals-container");
  if (container && container.lastElementChild) container.removeChild(container.lastElementChild);
}

function addBoardRequest() {
  const container = document.getElementById("board-requests-container");
  if (!container) return;
  const idx = container.children.length + 1;
  const div = document.createElement('div');
  div.className = "p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm mb-4 relative";
  div.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <h4 class="text-lg font-semibold text-slate-900">Board Request #${idx}</h4>
      <button type="button" class="remove-boardrequest-btn px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium">&times; Remove</button>
    </div>
    <div class="mb-3">
      <label class="block text-sm font-medium text-slate-700 mb-1">Request</label>
      <textarea class="w-full p-2 border border-slate-300 rounded-md bg-white" placeholder="Request"></textarea>
    </div>
    <div class="mb-3">
      <label class="block text-sm font-medium text-slate-700 mb-1">Why is this needed?</label>
      <textarea class="w-full p-2 border border-slate-300 rounded-md bg-white" placeholder="Why is this needed?"></textarea>
    </div>
    <div class="mb-3">
      <label class="block text-sm font-medium text-slate-700 mb-1">Was this requested previously?</label>
      <select class="w-full p-2 border border-slate-300 rounded-md bg-white">
        <option>No</option>
        <option>Yes</option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1">If Yes, what has changed since last year?</label>
      <input type="text" class="w-full p-2 border border-slate-300 rounded-md bg-white" placeholder="e.g., Still not in place, workload pressure continues...">
    </div>
  `;
  div.querySelector('.remove-boardrequest-btn').onclick = function() {
    div.remove();
    Array.from(container.children).forEach((el, i) => {
      const h = el.querySelector('h4');
      if (h) h.textContent = `Board Request #${i+1}`;
    });
  };
  container.appendChild(div);
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
