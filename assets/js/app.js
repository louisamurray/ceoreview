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
  // Login form handler
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.onsubmit = async function(e) {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const errorDiv = document.getElementById('login-error');
      errorDiv.textContent = '';
      try {
        await window.firebaseHelpers.loginWithEmail(email, password);
        // Success: modal will close via auth state listener
      } catch (err) {
        errorDiv.textContent = err.message || 'Login failed. Please try again.';
      }
    };
  }
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

// --- Form Data Collection ---
function collectFormData() {
  const data = {};
  // Part 1
  data.successes = document.getElementById('successes')?.value || '';
  data['not-well'] = document.getElementById('not-well')?.value || '';
  data['comparative-reflection'] = document.getElementById('comparative-reflection')?.value || '';
  // Challenges
  data.challenges = Array.from(document.getElementById('challenges-container')?.children || []).map(card => ({
    challenge: card.querySelector('textarea[placeholder="Describe the challenge..."]')?.value || '',
    action: card.querySelector('textarea[placeholder="What action was taken?"]')?.value || '',
    result: card.querySelector('textarea[placeholder="What was the outcome?"]')?.value || ''
  }));
  // Goals from Last Year
  data.lastYearGoals = Array.from(document.getElementById('last-year-goals-container')?.children || []).map(card => ({
    goal: card.querySelector('input[placeholder="Enter the goal statement..."]')?.value || '',
    status: card.querySelector('select')?.value || '',
    evidence: card.querySelector('textarea[placeholder="Provide supporting evidence..."]')?.value || ''
  }));
  // KPIs
  data.kpis = Array.from(document.getElementById('kpi-container')?.children || []).map(card => ({
    name: card.querySelector('.font-semibold')?.textContent || '',
    rating: card.querySelector('input[type="radio"]:checked')?.value || '',
    evidence: card.querySelector('textarea')?.value || '',
    compared: card.querySelector('select')?.value || '',
    why: card.querySelector('input[type="text"]')?.value || ''
  }));
  // JD Alignment
  data.jdAlignment = Array.from(document.getElementById('jd-alignment-container')?.children || []).map(card => ({
    area: card.querySelector('.font-semibold')?.textContent || '',
    wentWell: card.querySelectorAll('textarea')[0]?.value || '',
    notWell: card.querySelectorAll('textarea')[1]?.value || ''
  }));
  // Strategic Priorities
  data.strategicPriorities = Array.from(document.getElementById('strategic-priorities-container')?.children || []).map(card => ({
    name: card.querySelector('.font-semibold')?.textContent || '',
    progress: card.querySelectorAll('textarea')[0]?.value || '',
    challenges: card.querySelectorAll('textarea')[1]?.value || '',
    trend: card.querySelector('select')?.value || ''
  }));
  // Part 5
  data.strengths = document.getElementById('strengths')?.value || '';
  data.limitations = document.getElementById('limitations')?.value || '';
  // PD Undertaken
  data.pdUndertaken = Array.from(document.getElementById('pd-undertaken-container')?.children || []).map(card => ({
    title: card.querySelector('input[placeholder="Programme/Course Title"]')?.value || '',
    learnings: card.querySelector('textarea[placeholder="Key Learnings"]')?.value || '',
    applied: card.querySelector('textarea[placeholder="How Learnings Were Applied"]')?.value || '',
    requested: card.querySelectorAll('select')[0]?.value || '',
    usefulness: card.querySelectorAll('select')[1]?.value || ''
  }));
  // PD Needed
  data.pdNeeded = Array.from(document.getElementById('pd-needed-container')?.children || []).map(card => ({
    area: card.querySelector('input[placeholder="Area of Need"]')?.value || '',
    impact: card.querySelector('textarea[placeholder*="expected impact"]')?.value || ''
  }));
  // Future Goals
  data.futureGoals = Array.from(document.getElementById('future-goals-container')?.children || []).map(card => ({
    statement: card.querySelector('input[placeholder="Enter the goal statement..."]')?.value || '',
    outcome: card.querySelector('textarea[placeholder="What will success look like?"]')?.value || '',
    why: card.querySelector('textarea[placeholder*="align with strategic priorities"]')?.value || ''
  }));
  // Board Requests
  data.boardRequests = Array.from(document.getElementById('board-requests-container')?.children || []).map(card => ({
    request: card.querySelector('textarea[placeholder="Request"]')?.value || '',
    why: card.querySelector('textarea[placeholder="Why is this needed?"]')?.value || '',
    requested: card.querySelector('select')?.value || '',
    changed: card.querySelector('input[placeholder*="workload pressure"]')?.value || ''
  }));
  return data;
}

// --- Save Progress Handler ---
async function saveProgress() {
  const status = document.getElementById('save-status');
  status.textContent = 'Saving...';
  try {
    const user = window.firebaseHelpers.auth.currentUser;
    if (!user) throw new Error('Not logged in');
    const data = collectFormData();
    await window.firebaseHelpers.saveReviewData(user.uid, data, 'drafts');
    status.textContent = 'Draft saved!';
    setTimeout(() => { status.textContent = ''; }, 2000);
  } catch (err) {
    status.textContent = 'Save failed: ' + (err.message || err);
  }
}

// --- Submit Handler ---
document.getElementById('reviewForm').onsubmit = async function(e) {
  e.preventDefault();
  const status = document.getElementById('save-status');
  status.textContent = 'Submitting...';
  try {
    const user = window.firebaseHelpers.auth.currentUser;
    if (!user) throw new Error('Not logged in');
    const data = collectFormData();
    await window.firebaseHelpers.saveReviewData(user.uid, data, 'submissions');
    status.textContent = 'Review submitted!';
    setTimeout(() => { status.textContent = ''; }, 2000);
  } catch (err) {
    status.textContent = 'Submit failed: ' + (err.message || err);
  }
};

// --- Save Progress Button ---
document.getElementById('save-progress-btn').onclick = saveProgress;

window.loadProgress = typeof loadProgress === 'function' ? loadProgress : () => {};
window.saveProgress = saveProgress;
window.clearForm = clearForm;

window.addChallenge = addChallenge;
window.addLastYearGoal = addLastYearGoal;
window.addPDUndertaken = addPDUndertaken;
window.addPDNeeded = addPDNeeded;
window.addFutureGoal = addFutureGoal;
window.removeFutureGoal = removeFutureGoal;
window.addBoardRequest = addBoardRequest;
