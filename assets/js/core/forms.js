/**
 * FormUtils - Handles all form data operations for CEO review
 * Provides utilities for collecting, populating, and transforming form data
 * @namespace FormUtils
 */

// --- Collect Form Data ---

/**
 * Collect all form data into structured format
 * @function collect
 * @returns {Object} Structured data { 'part-1': {...}, 'part-2': {...}, ... }
 * @example
 * const data = FormUtils.collect();
 * console.log(data['part-1'].successes);
 */
function collectFormData() {
  const sections = {};
  
  // Part 1: Performance Reflection
  sections['part-1'] = {
    successes: document.getElementById('successes')?.value || '',
    'not-well': document.getElementById('not-well')?.value || '',
    'comparative-reflection': document.getElementById('comparative-reflection')?.value || '',
    challenges: collectDynamicItems('#challenges-container .challenge-group', ['textarea', 'textarea', 'textarea'], ['challenge', 'action', 'result'])
  };
  
  // Part 2: Goals & KPIs
  sections['part-2'] = {
    lastYearGoals: collectDynamicItems('#last-year-goals-container .goal-group', ['input', 'textarea', 'select'], ['goal', 'progress', 'status']),
    kpis: collectKPIs()
  };
  
  // Part 3: Job Description Alignment
  sections['part-3'] = {
    jdAlignment: collectJobAlignment()
  };
  
  // Part 4: Strategic Priorities
  sections['part-4'] = {
    strategicPriorities: collectStrategicPriorities()
  };
  
  // Part 5: Personal Assessment
  sections['part-5'] = {
    strengths: document.getElementById('strengths')?.value || '',
    limitations: document.getElementById('limitations')?.value || '',
    pdUndertaken: collectDynamicItems('#pd-undertaken-container .pd-group', ['input', 'textarea'], ['name', 'outcome']),
    pdNeeded: collectDynamicItems('#pd-needed-container .pd-group', ['input', 'textarea'], ['type', 'rationale'])
  };
  
  // Part 6: Future Goals
  sections['part-6'] = {
    futureGoals: collectDynamicItems('#future-goals-container .goal-group', ['input', 'textarea', 'textarea'], ['goal', 'outcomes', 'timeline'])
  };
  
  // Part 7: Board Requests
  sections['part-7'] = {
    boardRequests: collectDynamicItems('#board-requests-container .request-group', ['input', 'textarea'], ['request', 'rationale'])
  };
  
  return sections;
}

/**
 * Collect dynamic items (repeating form elements) from a container
 * @function collectDynamicItems
 * @param {string} containerSelector - CSS selector for container
 * @param {Array<string>} fieldSelectors - CSS selectors for input types
 * @param {Array<string>} fieldNames - Names of fields in output object
 * @returns {Array<Object>} Array of collected items
 */
function collectDynamicItems(containerSelector, fieldSelectors, fieldNames) {
  const items = [];
  const groups = document.querySelectorAll(containerSelector);
  
  groups.forEach(group => {
    const item = {};
    fieldSelectors.forEach((selector, index) => {
      const element = group.querySelector(selector);
      if (element) {
        item[fieldNames[index]] = element.value || '';
      }
    });
    
    // Only add if at least one field has content
    if (Object.values(item).some(val => val.trim() !== '')) {
      items.push(item);
    }
  });
  
  return items;
}

/**
 * Collect KPI ratings from form
 * @function collectKPIs
 * @returns {Array<Object>} Array of KPI entries with name, rating, and reason
 */
function collectKPIs() {
  const kpis = [];
  const kpiCards = document.querySelectorAll('#kpi-container .p-6');
  
  kpiCards.forEach((card, index) => {
    const title = card.querySelector('.font-semibold')?.textContent?.trim() || `KPI ${index + 1}`;
    const select = card.querySelector('select');
    const input = card.querySelector('input[type="text"]');
    
    kpis.push({
      name: title,
      rating: select?.value || '',
      why: input?.value || ''
    });
  });
  
  return kpis;
}

/**
 * Collect job description alignment data
 * @function collectJobAlignment
 * @returns {Array<Object>} Array of JD alignment entries
 */
function collectJobAlignment() {
  const alignments = [];
  const jdCards = document.querySelectorAll('#jd-alignment-container .p-6');
  
  jdCards.forEach((card, index) => {
    const title = card.querySelector('.font-semibold')?.textContent?.trim() || `Area ${index + 1}`;
    const textareas = card.querySelectorAll('textarea');
    
    alignments.push({
      area: title,
      wentWell: textareas[0]?.value || '',
      notWell: textareas[1]?.value || ''
    });
  });
  
  return alignments;
}

/**
 * Collect strategic priorities data
 * @function collectStrategicPriorities
 * @returns {Array<Object>} Array of priority entries
 */
function collectStrategicPriorities() {
  const priorities = [];
  const spCards = document.querySelectorAll('#strategic-priorities-container .p-6');
  
  spCards.forEach((card, index) => {
    const title = card.querySelector('.font-semibold')?.textContent?.trim() || `Priority ${index + 1}`;
    const textareas = card.querySelectorAll('textarea');
    const select = card.querySelector('select');
    
    priorities.push({
      priority: title,
      progress: textareas[0]?.value || '',
      challenges: textareas[1]?.value || '',
      trend: select?.value || ''
    });
  });
  
  return priorities;
}

// --- Populate Form from Data ---

/**
 * Populate form from previously saved data
 * @function populate
 * @param {Object} sections - Data in structured format from collectFormData()
 * @returns {void}
 */
function populateFormFromData(sections) {
  if (!sections) return;
  
  // Part 1
  if (sections['part-1']) {
    const part1 = sections['part-1'];
    if (part1.successes) document.getElementById('successes').value = part1.successes;
    if (part1['not-well']) document.getElementById('not-well').value = part1['not-well'];
    if (part1['comparative-reflection']) document.getElementById('comparative-reflection').value = part1['comparative-reflection'];
    
    // Populate challenges
    if (part1.challenges && Array.isArray(part1.challenges)) {
      part1.challenges.forEach(challenge => {
        window.addChallenge();
        setTimeout(() => {
          const groups = document.querySelectorAll('#challenges-container .challenge-group');
          const lastGroup = groups[groups.length - 1];
          if (lastGroup) {
            const textareas = lastGroup.querySelectorAll('textarea');
            if (textareas[0]) textareas[0].value = challenge.challenge || '';
            if (textareas[1]) textareas[1].value = challenge.action || '';
            if (textareas[2]) textareas[2].value = challenge.result || '';
          }
        }, 50);
      });
    }
  }
  
  // Part 2
  if (sections['part-2']) {
    const part2 = sections['part-2'];
    
    // Populate last year goals
    if (part2.lastYearGoals && Array.isArray(part2.lastYearGoals)) {
      part2.lastYearGoals.forEach(goal => {
        window.addLastYearGoal();
        setTimeout(() => {
          const groups = document.querySelectorAll('#last-year-goals-container .goal-group');
          const lastGroup = groups[groups.length - 1];
          if (lastGroup) {
            const input = lastGroup.querySelector('input');
            const textarea = lastGroup.querySelector('textarea');
            const select = lastGroup.querySelector('select');
            if (input) input.value = goal.goal || '';
            if (textarea) textarea.value = goal.progress || '';
            if (select) select.value = goal.status || '';
          }
        }, 50);
      });
    }
    
    // Populate KPIs
    if (part2.kpis && Array.isArray(part2.kpis)) {
      setTimeout(() => {
        const kpiCards = document.querySelectorAll('#kpi-container .p-6');
        part2.kpis.forEach((kpi, index) => {
          if (kpiCards[index]) {
            const select = kpiCards[index].querySelector('select');
            const input = kpiCards[index].querySelector('input[type="text"]');
            if (select) select.value = kpi.rating || '';
            if (input) input.value = kpi.why || '';
          }
        });
      }, 100);
    }
  }
  
  // Part 3
  if (sections['part-3'] && sections['part-3'].jdAlignment) {
    setTimeout(() => {
      const jdCards = document.querySelectorAll('#jd-alignment-container .p-6');
      sections['part-3'].jdAlignment.forEach((alignment, index) => {
        if (jdCards[index]) {
          const textareas = jdCards[index].querySelectorAll('textarea');
          if (textareas[0]) textareas[0].value = alignment.wentWell || '';
          if (textareas[1]) textareas[1].value = alignment.notWell || '';
        }
      });
    }, 100);
  }
  
  // Part 4
  if (sections['part-4'] && sections['part-4'].strategicPriorities) {
    setTimeout(() => {
      const spCards = document.querySelectorAll('#strategic-priorities-container .p-6');
      sections['part-4'].strategicPriorities.forEach((priority, index) => {
        if (spCards[index]) {
          const textareas = spCards[index].querySelectorAll('textarea');
          const select = spCards[index].querySelector('select');
          if (textareas[0]) textareas[0].value = priority.progress || '';
          if (textareas[1]) textareas[1].value = priority.challenges || '';
          if (select) select.value = priority.trend || '';
        }
      });
    }, 100);
  }
  
  // Part 5
  if (sections['part-5']) {
    const part5 = sections['part-5'];
    if (part5.strengths) document.getElementById('strengths').value = part5.strengths;
    if (part5.limitations) document.getElementById('limitations').value = part5.limitations;
    
    // Populate PD undertaken
    if (part5.pdUndertaken && Array.isArray(part5.pdUndertaken)) {
      part5.pdUndertaken.forEach(pd => {
        window.addPDUndertaken();
        setTimeout(() => {
          const groups = document.querySelectorAll('#pd-undertaken-container .pd-group');
          const lastGroup = groups[groups.length - 1];
          if (lastGroup) {
            const input = lastGroup.querySelector('input');
            const textarea = lastGroup.querySelector('textarea');
            if (input) input.value = pd.name || '';
            if (textarea) textarea.value = pd.outcome || '';
          }
        }, 50);
      });
    }
    
    // Populate PD needed
    if (part5.pdNeeded && Array.isArray(part5.pdNeeded)) {
      part5.pdNeeded.forEach(pd => {
        window.addPDNeeded();
        setTimeout(() => {
          const groups = document.querySelectorAll('#pd-needed-container .pd-group');
          const lastGroup = groups[groups.length - 1];
          if (lastGroup) {
            const input = lastGroup.querySelector('input');
            const textarea = lastGroup.querySelector('textarea');
            if (input) input.value = pd.type || '';
            if (textarea) textarea.value = pd.rationale || '';
          }
        }, 50);
      });
    }
  }
  
  // Part 6
  if (sections['part-6'] && sections['part-6'].futureGoals) {
    sections['part-6'].futureGoals.forEach(goal => {
      window.addFutureGoal();
      setTimeout(() => {
        const groups = document.querySelectorAll('#future-goals-container .goal-group');
        const lastGroup = groups[groups.length - 1];
        if (lastGroup) {
          const inputs = lastGroup.querySelectorAll('input, textarea');
          if (inputs[0]) inputs[0].value = goal.goal || '';
          if (inputs[1]) inputs[1].value = goal.outcomes || '';
          if (inputs[2]) inputs[2].value = goal.timeline || '';
        }
      }, 50);
    });
  }
  
  // Part 7
  if (sections['part-7'] && sections['part-7'].boardRequests) {
    sections['part-7'].boardRequests.forEach(request => {
      window.addBoardRequest();
      setTimeout(() => {
        const groups = document.querySelectorAll('#board-requests-container .request-group');
        const lastGroup = groups[groups.length - 1];
        if (lastGroup) {
          const inputs = lastGroup.querySelectorAll('input, textarea');
          if (inputs[0]) inputs[0].value = request.request || '';
          if (inputs[1]) inputs[1].value = request.rationale || '';
        }
      }, 50);
    });
  }
  
  // Update summaries after all data is loaded
  setTimeout(() => {
    if (typeof updateAllSectionSummaries === 'function') {
      updateAllSectionSummaries();
    }
    if (typeof ensureAllEmptyStates === 'function') {
      ensureAllEmptyStates();
    }
  }, 500);
}

// --- Transform Data Format ---

/**
 * Convert structured sections back to flat format for Firebase
 * @function flatten
 * @param {Object} sectionsData - Structured data from collectFormData()
 * @returns {Object} Flat data with all fields at top level
 */
function flattenSectionsToFlat(sectionsData) {
  const flatData = {};
  
  for (const [sectionId, sectionContent] of Object.entries(sectionsData)) {
    if (typeof sectionContent === 'object' && sectionContent !== null) {
      for (const [fieldName, value] of Object.entries(sectionContent)) {
        // Convert all values to the format expected by saveReview
        flatData[fieldName] = value;
      }
    }
  }
  
  return flatData;
}

/**
 * Clear all form fields and empty states
 * @function clear
 * @returns {void}
 */
function clearForm() {
  // Get all form elements
  const form = document.getElementById('reviewForm');
  if (!form) return;
  
  // Clear textareas and inputs
  const formElements = form.querySelectorAll('textarea, input[type="text"], input[type="email"], input[type="password"], select');
  formElements.forEach(element => {
    if (element.type === 'checkbox' || element.type === 'radio') {
      element.checked = false;
    } else {
      element.value = '';
    }
  });
  
  // Clear dynamic items containers
  const containers = [
    '#challenges-container',
    '#last-year-goals-container',
    '#pd-undertaken-container',
    '#pd-needed-container',
    '#future-goals-container',
    '#board-requests-container'
  ];
  
  containers.forEach(selector => {
    const container = document.querySelector(selector);
    if (container) {
      const groups = container.querySelectorAll('.challenge-group, .goal-group, .pd-group, .request-group');
      groups.forEach(group => {
        // Keep the first group, remove the rest
        if (group !== container.children[0]) {
          group.remove();
        }
      });
    }
  });
  
  // Ensure empty states are shown
  containers.forEach(selector => {
    const id = selector.replace('#', '');
    if (typeof ensureEmptyState === 'function') {
      ensureEmptyState(id);
    }
  });
}

// --- Export to global namespace ---
window.FormUtils = {
  collect: collectFormData,
  collectDynamicItems,
  collectKPIs,
  collectJobAlignment,
  collectStrategicPriorities,
  populate: populateFormFromData,
  flatten: flattenSectionsToFlat,
  clear: clearForm
};

// --- Legacy function names for backwards compatibility ---
// These are called from HTML event handlers and need to remain in window
// Old code will call collectFormData(), new code can call FormUtils.collect()
