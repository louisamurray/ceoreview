/**
 * DynamicFormItems - Manages repeating form elements
 * Provides functions for adding/removing dynamic form items like challenges, goals, etc.
 * @namespace DynamicFormItems
 */

/**
 * Add a challenge item to the challenges container
 * @function addChallenge
 * @returns {void}
 */
function addChallenge() {
  const container = document.getElementById('challenges-container');
  if (!container) return;
  
  removeEmptyState(container);
  
  const div = document.createElement('div');
  div.className = 'challenge-group p-4 bg-slate-50 border border-slate-200 rounded-lg';
  div.innerHTML = `
    <div class="flex justify-between items-center mb-2">
      <h4 class="font-medium text-slate-700">Challenge ${container.children.length + 1}</h4>
      <button type="button" onclick="this.closest('.challenge-group').remove(); ensureEmptyState('challenges-container'); updateAllSectionSummaries();" 
              class="text-red-600 hover:text-red-800 text-sm">Remove</button>
    </div>
    <div class="space-y-2">
      <textarea class="w-full p-2 border border-slate-300 rounded-md" placeholder="Challenge description..." rows="2"></textarea>
      <textarea class="w-full p-2 border border-slate-300 rounded-md" placeholder="Action taken..." rows="2"></textarea>
      <textarea class="w-full p-2 border border-slate-300 rounded-md" placeholder="Result / outcome..." rows="2"></textarea>
    </div>
  `;
  container.appendChild(div);
  if (typeof updateAllSectionSummaries === 'function') {
    updateAllSectionSummaries();
  }
}

/**
 * Add a goal item to the last year goals container
 * @function addLastYearGoal
 * @returns {void}
 */
function addLastYearGoal() {
  const container = document.getElementById('last-year-goals-container');
  if (!container) return;
  
  removeEmptyState(container);
  
  const div = document.createElement('div');
  div.className = 'goal-group p-4 bg-slate-50 border border-slate-200 rounded-lg';
  div.innerHTML = `
    <div class="flex justify-between items-center mb-2">
      <h4 class="font-medium text-slate-700">Last Year Goal ${container.children.length + 1}</h4>
      <button type="button" onclick="this.closest('.goal-group').remove(); ensureEmptyState('last-year-goals-container'); updateAllSectionSummaries();" 
              class="text-red-600 hover:text-red-800 text-sm">Remove</button>
    </div>
    <div class="space-y-2">
      <input type="text" class="w-full p-2 border border-slate-300 rounded-md" placeholder="Goal description...">
      <textarea class="w-full p-2 border border-slate-300 rounded-md" placeholder="Progress made..." rows="2"></textarea>
      <select class="w-full p-2 border border-slate-300 rounded-md">
        <option value="">Select status...</option>
        <option value="Achieved">Achieved</option>
        <option value="Exceeded">Exceeded</option>
        <option value="In Progress">In Progress</option>
        <option value="Revised">Revised</option>
        <option value="Not Achieved">Not Achieved</option>
      </select>
    </div>
  `;
  container.appendChild(div);
  if (typeof updateAllSectionSummaries === 'function') {
    updateAllSectionSummaries();
  }
}

/**
 * Add a professional development item (undertaken)
 * @function addPDUndertaken
 * @returns {void}
 */
function addPDUndertaken() {
  const container = document.getElementById('pd-undertaken-container');
  if (!container) return;
  
  removeEmptyState(container);
  
  const div = document.createElement('div');
  div.className = 'pd-group p-4 bg-slate-50 border border-slate-200 rounded-lg';
  div.innerHTML = `
    <div class="flex justify-between items-center mb-2">
      <h4 class="font-medium text-slate-700">Professional Development ${container.children.length + 1}</h4>
      <button type="button" onclick="this.closest('.pd-group').remove(); ensureEmptyState('pd-undertaken-container'); updateAllSectionSummaries();" 
              class="text-red-600 hover:text-red-800 text-sm">Remove</button>
    </div>
    <div class="space-y-2">
      <input type="text" class="w-full p-2 border border-slate-300 rounded-md" placeholder="Course/program name...">
      <textarea class="w-full p-2 border border-slate-300 rounded-md" placeholder="What you learned / outcomes..." rows="2"></textarea>
    </div>
  `;
  container.appendChild(div);
  if (typeof updateAllSectionSummaries === 'function') {
    updateAllSectionSummaries();
  }
}

/**
 * Add a professional development need item
 * @function addPDNeeded
 * @returns {void}
 */
function addPDNeeded() {
  const container = document.getElementById('pd-needed-container');
  if (!container) return;
  
  removeEmptyState(container);
  
  const div = document.createElement('div');
  div.className = 'pd-group p-4 bg-slate-50 border border-slate-200 rounded-lg';
  div.innerHTML = `
    <div class="flex justify-between items-center mb-2">
      <h4 class="font-medium text-slate-700">Development Need ${container.children.length + 1}</h4>
      <button type="button" onclick="this.closest('.pd-group').remove(); ensureEmptyState('pd-needed-container'); updateAllSectionSummaries();" 
              class="text-red-600 hover:text-red-800 text-sm">Remove</button>
    </div>
    <div class="space-y-2">
      <input type="text" class="w-full p-2 border border-slate-300 rounded-md" placeholder="Type of development needed...">
      <textarea class="w-full p-2 border border-slate-300 rounded-md" placeholder="Why / rationale..." rows="2"></textarea>
    </div>
  `;
  container.appendChild(div);
  if (typeof updateAllSectionSummaries === 'function') {
    updateAllSectionSummaries();
  }
}

/**
 * Add a future goal item
 * @function addFutureGoal
 * @returns {void}
 */
function addFutureGoal() {
  const container = document.getElementById('future-goals-container');
  if (!container) return;
  
  removeEmptyState(container);
  
  const div = document.createElement('div');
  div.className = 'goal-group p-4 bg-slate-50 border border-slate-200 rounded-lg';
  div.innerHTML = `
    <div class="flex justify-between items-center mb-2">
      <h4 class="font-medium text-slate-700">Future Goal ${container.children.length + 1}</h4>
      <button type="button" onclick="this.closest('.goal-group').remove(); ensureEmptyState('future-goals-container'); updateAllSectionSummaries();" 
              class="text-red-600 hover:text-red-800 text-sm">Remove</button>
    </div>
    <div class="space-y-2">
      <input type="text" class="w-full p-2 border border-slate-300 rounded-md" placeholder="Goal description...">
      <textarea class="w-full p-2 border border-slate-300 rounded-md" placeholder="Expected outcomes..." rows="2"></textarea>
      <textarea class="w-full p-2 border border-slate-300 rounded-md" placeholder="Timeline / milestones..." rows="2"></textarea>
    </div>
  `;
  container.appendChild(div);
  if (typeof updateAllSectionSummaries === 'function') {
    updateAllSectionSummaries();
  }
}

/**
 * Add a board request item
 * @function addBoardRequest
 * @returns {void}
 */
function addBoardRequest() {
  const container = document.getElementById('board-requests-container');
  if (!container) return;
  
  removeEmptyState(container);
  
  const div = document.createElement('div');
  div.className = 'request-group p-4 bg-slate-50 border border-slate-200 rounded-lg';
  div.innerHTML = `
    <div class="flex justify-between items-center mb-2">
      <h4 class="font-medium text-slate-700">Request ${container.children.length + 1}</h4>
      <button type="button" onclick="this.closest('.request-group').remove(); ensureEmptyState('board-requests-container'); updateAllSectionSummaries();" 
              class="text-red-600 hover:text-red-800 text-sm">Remove</button>
    </div>
    <div class="space-y-2">
      <input type="text" class="w-full p-2 border border-slate-300 rounded-md" placeholder="Request summary...">
      <textarea class="w-full p-2 border border-slate-300 rounded-md" placeholder="Rationale / justification..." rows="2"></textarea>
    </div>
  `;
  container.appendChild(div);
  if (typeof updateAllSectionSummaries === 'function') {
    updateAllSectionSummaries();
  }
}

// --- Export to global namespace for backwards compatibility ---
// These maintain the old window.add* API while being available in new DynamicFormItems namespace
window.DynamicFormItems = {
  addChallenge,
  addLastYearGoal,
  addPDUndertaken,
  addPDNeeded,
  addFutureGoal,
  addBoardRequest
};

// Legacy exports - keep old function names available in global scope
// for HTML onclick handlers and existing code
window.addChallenge = addChallenge;
window.addLastYearGoal = addLastYearGoal;
window.addPDUndertaken = addPDUndertaken;
window.addPDNeeded = addPDNeeded;
window.addFutureGoal = addFutureGoal;
window.addBoardRequest = addBoardRequest;
