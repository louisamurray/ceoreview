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

const emptyStateMessages = {
  'challenges-container': 'No challenges added yet.',
  'last-year-goals-container': 'No goals from last year added yet.',
  'pd-undertaken-container': 'No professional development recorded yet.',
  'pd-needed-container': 'No future professional development needs added.',
  'future-goals-container': 'No future goals added yet.',
  'board-requests-container': 'No requests for the board added yet.'
};

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

// --- UI Helpers ---
function debounce(fn, wait = 300) {
  let timeout;
  return function debounced(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
}

function smoothScrollTo(target) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  const offset = 80;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

function setSectionCollapsed(section, collapsed) {
  if (!section) return;
  const toggle = section.querySelector('.section-toggle');
  if (!toggle) return;
  const targetSelector = toggle.dataset.target;
  const body = targetSelector ? document.querySelector(targetSelector) : null;
  const isCollapsed = Boolean(collapsed);
  if (isCollapsed) {
    section.dataset.collapsed = 'true';
  } else {
    delete section.dataset.collapsed;
  }
  toggle.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
  if (body) body.hidden = isCollapsed;
}

function updateSectionSummary(section) {
  const summaryEl = section.querySelector('[data-section-summary]');
  if (!summaryEl) return;
  const fields = Array.from(section.querySelectorAll(
    '.section-body textarea, .section-body select, .section-body input[type="text"], .section-body input[type="email"], .section-body input[type="number"]'
  ));
  const filledFields = fields.filter((el) => {
    if (el.tagName === 'SELECT') return el.value && el.value.trim() !== '';
    return el.value && el.value.trim() !== '';
  }).length;
  const radioGroups = new Set();
  const radioValues = new Set();
  section.querySelectorAll('.section-body input[type="radio"]').forEach((el) => {
    radioGroups.add(el.name);
    if (el.checked) radioValues.add(el.name);
  });
  const total = fields.length + radioGroups.size;
  const filled = filledFields + radioValues.size;
  if (!total) {
    summaryEl.textContent = 'Ready';
    section.dataset.progressState = 'ready';
    return;
  }
  if (filled === 0) {
    summaryEl.textContent = 'Not started';
    section.dataset.progressState = 'not-started';
  } else if (filled >= total) {
    summaryEl.textContent = 'Complete';
    section.dataset.progressState = 'complete';
  } else {
    summaryEl.textContent = `In progress · ${filled}/${total}`;
    section.dataset.progressState = 'in-progress';
  }
}

function updateAllSectionSummaries() {
  document.querySelectorAll('.collapsible-section').forEach(updateSectionSummary);
  updateOverallProgress();
}

function updateOverallProgress() {
  const sections = Array.from(document.querySelectorAll('.collapsible-section'));
  if (!sections.length) return;
  const complete = sections.filter((section) => section.dataset.progressState === 'complete').length;
  const inProgress = sections.filter((section) => section.dataset.progressState === 'in-progress').length;
  const numerator = complete + inProgress * 0.5;
  const percent = Math.round((numerator / sections.length) * 100);
  const label = document.getElementById('overall-progress-label');
  const bar = document.getElementById('overall-progress-bar');
  if (label) {
    label.textContent = `${percent}% complete`;
  }
  if (bar) {
    bar.style.width = `${percent}%`;
  }
}

function navigateToSection(id, updateUrl = true) {
  if (!id) return;
  const section = document.querySelector(id);
  if (!section) return;
  setSectionCollapsed(section, false);
  smoothScrollTo(section);
  if (updateUrl) {
    const url = new URL(window.location);
    url.searchParams.set('section', id.replace('#', ''));
    history.replaceState({}, '', `${url.pathname}${url.search}#${id.replace('#', '')}`);
  }
}

function setupCollapsibles() {
  const sections = Array.from(document.querySelectorAll('.collapsible-section'));
  const collapseAllBtn = document.getElementById('collapse-all-btn');
  const syncCollapseLabel = () => {
    if (!collapseAllBtn) return;
    const anyOpen = sections.some((section) => section.dataset.collapsed !== 'true');
    collapseAllBtn.textContent = anyOpen ? 'Collapse all' : 'Expand all';
  };
  sections.forEach((section) => {
    const toggle = section.querySelector('.section-toggle');
    if (!toggle) return;
    const targetSelector = toggle.dataset.target;
    const body = targetSelector ? document.querySelector(targetSelector) : null;
    if (body && body.hasAttribute('hidden')) {
      section.dataset.collapsed = 'true';
      toggle.setAttribute('aria-expanded', 'false');
    } else if (body) {
      body.hidden = false;
    }
    toggle.addEventListener('click', () => {
      const wasCollapsed = section.dataset.collapsed === 'true';
      setSectionCollapsed(section, !wasCollapsed);
      syncCollapseLabel();
    });
  });
  if (collapseAllBtn) {
    collapseAllBtn.addEventListener('click', () => {
      const anyOpen = sections.some((section) => section.dataset.collapsed !== 'true');
      sections.forEach((section) => setSectionCollapsed(section, anyOpen));
      syncCollapseLabel();
    });
    syncCollapseLabel();
  }
}

function setupSectionNav() {
  const pills = Array.from(document.querySelectorAll('.section-nav-pill'));
  const select = document.getElementById('section-nav-select');
  const sections = Array.from(document.querySelectorAll('.collapsible-section'));

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const target = pill.dataset.target;
      if (target) navigateToSection(target);
    });
  });

  if (select) {
    select.addEventListener('change', (e) => {
      if (e.target.value) navigateToSection(e.target.value);
    });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = `#${entry.target.id}`;
          pills.forEach((pill) => {
            pill.classList.toggle('is-active', pill.dataset.target === id);
          });
          if (select && select.value !== id) {
            select.value = id;
          }
          const url = new URL(window.location);
          url.searchParams.set('section', entry.target.id);
          history.replaceState({}, '', `${url.pathname}${url.search}#${entry.target.id}`);
        });
      },
      { threshold: 0.4 }
    );
    sections.forEach((section) => {
      if (section.id) observer.observe(section);
    });
  }
}

function setupInfoDots() {
  const closeAll = () => {
    document.querySelectorAll('.info-dot.is-open').forEach((btn) => {
      btn.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    });
  };

  document.addEventListener('click', (event) => {
    const button = event.target.closest('.info-dot');
    if (!button) {
      closeAll();
      return;
    }
    event.preventDefault();
    const isOpen = button.classList.contains('is-open');
    closeAll();
    if (!isOpen) {
      button.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
    }
  }, { passive: false });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAll();
    }
  });

  document.querySelectorAll('.info-dot').forEach((btn) => {
    btn.setAttribute('aria-expanded', 'false');
  });
}

function enhanceTextarea(textarea) {
  if (!textarea || textarea.dataset.enhanced === 'true') return;
  textarea.dataset.enhanced = 'true';
  const wrapper = document.createElement('div');
  wrapper.className = 'rich-text';
  const toolbar = document.createElement('div');
  toolbar.className = 'rich-text-toolbar';

  const bulletBtn = document.createElement('button');
  bulletBtn.type = 'button';
  bulletBtn.textContent = '• Bullet';

  const exampleBtn = document.createElement('button');
  exampleBtn.type = 'button';
  exampleBtn.textContent = 'Insert example';

  const counter = document.createElement('span');
  counter.className = 'rich-text-count';
  counter.textContent = '0 words';

  toolbar.appendChild(bulletBtn);
  toolbar.appendChild(exampleBtn);
  toolbar.appendChild(counter);

  const originalParent = textarea.parentElement;
  const placeholderClasses = ['border', 'border-slate-300', 'rounded-md'];
  placeholderClasses.forEach((cls) => textarea.classList.remove(cls));
  textarea.classList.add('w-full', 'p-3');

  wrapper.appendChild(toolbar);
  wrapper.appendChild(textarea.cloneNode(false));

  const clonedTextarea = wrapper.querySelector('textarea');
  clonedTextarea.dataset.enhanced = 'true';
  clonedTextarea.value = textarea.value;
  Array.from(textarea.attributes).forEach((attr) => {
    if (attr.name === 'class') {
      clonedTextarea.className = textarea.className;
    } else {
      clonedTextarea.setAttribute(attr.name, attr.value);
    }
  });

  originalParent.replaceChild(wrapper, textarea);

  const updateCounter = () => {
    const words = clonedTextarea.value.trim();
    const count = words ? words.split(/\s+/).length : 0;
    counter.textContent = `${count} ${count === 1 ? 'word' : 'words'}`;
  };

  clonedTextarea.addEventListener('input', updateCounter);
  updateCounter();

  bulletBtn.addEventListener('click', () => {
    const currentValue = clonedTextarea.value;
    const { selectionStart } = clonedTextarea;
    const lineStart = currentValue.lastIndexOf('\n', selectionStart - 1) + 1;
    if (currentValue.slice(lineStart, lineStart + 2) === '• ') {
      clonedTextarea.focus();
      return;
    }
    const newValue =
      currentValue.slice(0, lineStart) + '• ' + currentValue.slice(lineStart);
    const caret = selectionStart + 2;
    clonedTextarea.value = newValue;
    clonedTextarea.focus();
    clonedTextarea.setSelectionRange(caret, caret);
    clonedTextarea.dispatchEvent(new Event('input', { bubbles: true }));
  });

  exampleBtn.addEventListener('click', () => {
    const template = '• Context: \n• Action: \n• Impact: ';
    clonedTextarea.value = clonedTextarea.value
      ? `${clonedTextarea.value.trim()}\n${template}`
      : template;
    clonedTextarea.focus();
    clonedTextarea.setSelectionRange(clonedTextarea.value.length, clonedTextarea.value.length);
    clonedTextarea.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function enhanceAllTextareas(root = document) {
  root.querySelectorAll('textarea').forEach((textarea) => {
    if (textarea.dataset.noEnhance === 'true') return;
    enhanceTextarea(textarea);
  });
}

let autosaveIndicatorEl = null;
let lastLocalAutosaveISO = null;
window.lastCloudSaveTime = window.lastCloudSaveTime || null;

function formatShortTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function renderAutosaveIndicator(prefix) {
  if (!autosaveIndicatorEl) return;
  const parts = [];
  if (prefix) {
    parts.push(prefix);
  } else if (lastLocalAutosaveISO) {
    parts.push(`Local autosave: ${formatShortTime(lastLocalAutosaveISO)}`);
  } else {
    parts.push('Local autosave: pending');
  }
  if (window.lastCloudSaveTime) {
    parts.push(`Cloud: ${formatShortTime(window.lastCloudSaveTime)}`);
  } else {
    parts.push('Cloud: pending');
  }
  autosaveIndicatorEl.textContent = parts.join(' · ');
}

function setupAutosave(form) {
  if (!form) return;
  const indicator = document.getElementById('autosave-indicator');
  if (!indicator) return;
  autosaveIndicatorEl = indicator;
  renderAutosaveIndicator();

  const runAutosave = debounce(() => {
    try {
      const payload = collectFormData();
      const timestamp = new Date().toISOString();
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ savedAt: timestamp, data: payload })
      );
      lastLocalAutosaveISO = timestamp;
      renderAutosaveIndicator();
    } catch (err) {
      renderAutosaveIndicator('Autosave failed');
      console.error(err);
    }
  }, 1200);

  form.addEventListener('input', () => {
    renderAutosaveIndicator('Autosaving…');
    runAutosave();
  });
  form.addEventListener('change', () => {
    renderAutosaveIndicator('Autosaving…');
    runAutosave();
  });

  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    try {
      const data = JSON.parse(existing);
      if (data?.savedAt) {
        lastLocalAutosaveISO = data.savedAt;
        renderAutosaveIndicator();
      }
    } catch (err) {
      console.warn('Failed to parse saved draft timestamp', err);
    }
  }
}

function escapeCsvValue(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function buildReviewRows(data) {
  const rows = [];
  const pushRow = (section, item, prompt, response) => {
    const value = response ?? '';
    if (Array.isArray(value)) {
      value.forEach((entry, idx) => pushRow(section, `${item} (${idx + 1})`, prompt, entry));
      return;
    }
    rows.push([section, item, prompt, value]);
  };

  pushRow('Part 1', '', 'Key Successes & What Went Well', data.successes);
  pushRow('Part 1', '', 'What Did Not Go Well', data['not-well']);
  pushRow('Part 1', '', 'Comparative Reflection', data['comparative-reflection']);
  (data.challenges || []).forEach((item, idx) => {
    const label = `Challenge ${idx + 1}`;
    pushRow('Part 1', label, 'Challenge', item.challenge);
    pushRow('Part 1', label, 'Action Taken', item.action);
    pushRow('Part 1', label, 'Result', item.result);
  });

  (data.lastYearGoals || []).forEach((item, idx) => {
    const label = `Goal ${idx + 1}`;
    pushRow('Part 2', label, 'Goal Statement', item.goal);
    pushRow('Part 2', label, 'Status', item.status);
    pushRow('Part 2', label, 'Evidence / Examples', item.evidence);
  });

  (data.kpis || []).forEach((item, idx) => {
    const label = item.name ? item.name.trim() : `KPI ${idx + 1}`;
    pushRow('Part 2', label, 'Rating', item.rating);
    pushRow('Part 2', label, 'Evidence / Examples', item.evidence);
    pushRow('Part 2', label, 'Compared to Last Year', item.compared);
    pushRow('Part 2', label, 'Reason', item.why);
  });

  (data.jdAlignment || []).forEach((item, idx) => {
    const label = item.area ? item.area.trim() : `JD Area ${idx + 1}`;
    pushRow('Part 3', label, 'What Went Well', item.wentWell);
    pushRow('Part 3', label, 'What Did Not Go Well', item.notWell);
  });

  (data.strategicPriorities || []).forEach((item, idx) => {
    const label = item.name ? item.name.trim() : `Priority ${idx + 1}`;
    pushRow('Part 4', label, 'Progress & Achievements', item.progress);
    pushRow('Part 4', label, 'Challenges', item.challenges);
    pushRow('Part 4', label, 'Trend vs Last Year', item.trend);
  });

  pushRow('Part 5', '', 'Key Strengths', data.strengths);
  pushRow('Part 5', '', 'Limitations / Restrictions', data.limitations);

  (data.pdUndertaken || []).forEach((item, idx) => {
    const label = `PD Undertaken ${idx + 1}`;
    pushRow('Part 5', label, 'Programme/Course Title', item.title);
    pushRow('Part 5', label, 'Key Learnings', item.learnings);
    pushRow('Part 5', label, 'How Learnings Were Applied', item.applied);
    pushRow('Part 5', label, 'Requested Previously', item.requested);
    pushRow('Part 5', label, 'Usefulness vs Last Year', item.usefulness);
  });

  (data.pdNeeded || []).forEach((item, idx) => {
    const label = `PD Need ${idx + 1}`;
    pushRow('Part 5', label, 'Area of Need', item.area);
    pushRow('Part 5', label, 'Expected Impact', item.impact);
  });

  (data.futureGoals || []).forEach((item, idx) => {
    const label = `Future Goal ${idx + 1}`;
    pushRow('Part 6', label, 'Goal Statement', item.statement);
    pushRow('Part 6', label, 'Desired Outcome', item.outcome);
    pushRow('Part 6', label, 'Why It Matters', item.why);
  });

  (data.boardRequests || []).forEach((item, idx) => {
    const label = `Board Request ${idx + 1}`;
    pushRow('Part 7', label, 'Request', item.request);
    pushRow('Part 7', label, 'Why is this needed?', item.why);
    pushRow('Part 7', label, 'Requested Previously', item.requested);
    pushRow('Part 7', label, 'What has changed?', item.changed);
  });

  return rows;
}

function buildCsvString(data) {
  const header = ['Section', 'Item', 'Prompt', 'Response'];
  const rows = [header, ...buildReviewRows(data)];
  return rows
    .map((row) => row.map((cell) => escapeCsvValue(cell ?? '')).join(','))
    .join('\r\n');
}

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

// --- Debug Log ---

// --- Login Modal Display ---
function showLoginModal(show) {
  const loginModal = document.getElementById('login-modal');
  const appContainer = document.getElementById('app-container');
  if (!loginModal) return;
  if (show) {
    showSignupModal(false);
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
    openModal(signupModal, () => showSignupModal(false));
    if (appContainer) {
      appContainer.style.display = 'none';
      appContainer.setAttribute('aria-hidden', 'true');
    }
  } else {
    closeModal(signupModal);
    const loginModal = document.getElementById('login-modal');
    if (
      appContainer &&
      loginModal &&
      loginModal.classList.contains('hidden')
    ) {
      appContainer.style.display = '';
      appContainer.setAttribute('aria-hidden', 'false');
    }
  }
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
  updateAllSectionSummaries();
}

// --- Auth Change Listener ---
window.onFirebaseAuthStateChanged = function(user) {
  const appContainer = document.getElementById('app-container');
  const loginModal = document.getElementById('login-modal');
  const signupModal = document.getElementById('signup-modal');

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
    showLoginModal(false);
    showSignupModal(false);
    if (appContainer) {
      appContainer.style.display = '';
      appContainer.setAttribute('aria-hidden', 'false');
    }
    // Do not auto-load last saved draft. Only load on button click.
  } else {
    showSignupModal(false);
    showLoginModal(true);
    localStorage.removeItem(STORAGE_KEY);
    clearForm();
  }
};

// --- Initialise Form App ---
document.addEventListener('DOMContentLoaded', () => {
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

  // Clear entire form
  const clearFormBtn = document.getElementById('clear-form-btn');
  if (clearFormBtn) {
    clearFormBtn.onclick = function() {
      clearForm();
    };
  }

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
  // Load Last Saved Button
  const loadBtn = document.getElementById('load-last-saved-btn');
  if (loadBtn && typeof window.loadProgress === 'function') {
    loadBtn.onclick = function() {
      window.loadProgress();
    };
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
      try {
        await window.firebaseHelpers.loginWithEmail(email, password);
        // Success: modal will close via auth state listener
      } catch (err) {
        errorDiv.textContent = err.message || 'Login failed. Please try again.';
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

  document.querySelectorAll('[data-modal-close]').forEach((button) => {
    button.addEventListener('click', () => {
      const modal = button.closest('[data-modal]');
      if (!modal) return;
      if (modal.id === 'login-modal') {
        showLoginModal(false);
      } else if (modal.id === 'signup-modal') {
        showSignupModal(false);
      } else {
        closeModal(modal);
      }
    });
  });

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
      if (password !== confirm) {
        errorDiv.textContent = 'Passwords do not match.';
        return;
      }
      if (password.length < 6) {
        errorDiv.textContent = 'Password must be at least 6 characters.';
        return;
      }
      try {
        await window.firebaseHelpers.signUpWithEmail(email, password);
        // Success: modal will close via auth state listener
      } catch (err) {
        errorDiv.textContent = err.message || 'Sign up failed. Please try again.';
      }
    };
  }
  attachLogoutHandler();
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
    function tooltipHtml(text) {
      const safeText = String(text).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      return `<button type="button" class="info-dot ml-1 shrink-0" data-info="${safeText}" aria-label="${safeText}" aria-expanded="false">i</button>`;
    }
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
  removeEmptyState(container);
  const idx = container.children.length + 1;
  const div = document.createElement('div');
  div.className = "p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm mb-4 relative";
  div.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <h4 class="text-lg font-semibold text-slate-900">Challenge #${idx}</h4>
      <div class="flex gap-2">
        <button type="button" class="clear-challenge-btn px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm font-medium">Clear</button>
        <button type="button" class="remove-challenge-btn px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium">&times; Remove</button>
      </div>
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
  // Clear button handler
  div.querySelector('.clear-challenge-btn').onclick = function() {
    Array.from(div.querySelectorAll('textarea')).forEach(t => t.value = '');
    updateAllSectionSummaries();
  };
  // Remove button handler
  div.querySelector('.remove-challenge-btn').onclick = function() {
    div.remove();
    // Re-number remaining cards
    Array.from(container.children).forEach((el, i) => {
      const h = el.querySelector('h4');
      if (h) h.textContent = `Challenge #${i+1}`;
    });
    updateAllSectionSummaries();
    ensureEmptyState(container);
  };
  container.appendChild(div);
  enhanceAllTextareas(div);
  updateAllSectionSummaries();
  ensureEmptyState(container);
}

function addLastYearGoal() {
  const container = document.getElementById("last-year-goals-container");
  if (!container) return;
  removeEmptyState(container);
  const idx = container.children.length + 1;
  const div = document.createElement('div');
  div.className = "p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm mb-4 relative";
  div.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <h4 class="text-lg font-semibold text-slate-900">Goal from Last Year #${idx}</h4>
      <div class="flex gap-2">
        <button type="button" class="clear-goal-btn px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm font-medium">Clear</button>
        <button type="button" class="remove-goal-btn px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium">&times; Remove</button>
      </div>
    </div>
    <div class="mb-3">
      <label class="block text-sm font-medium text-slate-700 mb-1">Goal</label>
      <input type="text" class="w-full p-2 border border-slate-300 rounded-md bg-white" placeholder="Enter the goal statement...">
    </div>
    <div class="mb-3">
      <label class="block text-sm font-medium text-slate-700 mb-1">Status</label>
      <select class="w-full p-2 border border-slate-300 rounded-md bg-white">
        <option value="">Select status…</option>
        <option value="Achieved">Achieved</option>
        <option value="Partially Achieved">Partially Achieved</option>
        <option value="Not Achieved">Not Achieved</option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1">Evidence / Examples</label>
      <textarea class="w-full p-2 border border-slate-300 rounded-md bg-white" placeholder="Provide supporting evidence..."></textarea>
    </div>
  `;
  // Clear button handler
  div.querySelector('.clear-goal-btn').onclick = function() {
    div.querySelector('input[type="text"]').value = '';
    div.querySelector('select').selectedIndex = 0;
    div.querySelector('textarea').value = '';
    updateAllSectionSummaries();
  };
  div.querySelector('.remove-goal-btn').onclick = function() {
    div.remove();
    Array.from(container.children).forEach((el, i) => {
      const h = el.querySelector('h4');
      if (h) h.textContent = `Goal from Last Year #${i+1}`;
    });
    updateAllSectionSummaries();
    ensureEmptyState(container);
  };
  container.appendChild(div);
  enhanceAllTextareas(div);
  updateAllSectionSummaries();
  ensureEmptyState(container);
}

function addPDUndertaken() {
  const container = document.getElementById("pd-undertaken-container");
  if (!container) return;
  removeEmptyState(container);
  const idx = container.children.length + 1;
  const div = document.createElement('div');
  div.className = "p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm mb-4 relative";
  div.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <h4 class="text-lg font-semibold text-slate-900">Programme/Course #${idx}</h4>
      <div class="flex gap-2">
        <button type="button" class="clear-pd-btn px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm font-medium">Clear</button>
        <button type="button" class="remove-pd-btn px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium">&times; Remove</button>
      </div>
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
          <option value="">Select an option…</option>
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
      </div>
      <div class="flex-1">
        <label class="block text-sm font-medium text-slate-700 mb-1">Usefulness vs Last Year</label>
        <select class="w-full p-2 border border-slate-300 rounded-md bg-white">
          <option value="">Select usefulness…</option>
          <option value="More Useful">More Useful</option>
          <option value="About the Same">About the Same</option>
          <option value="Less Useful">Less Useful</option>
        </select>
      </div>
    </div>
  `;
  // Clear button handler
  div.querySelector('.clear-pd-btn').onclick = function() {
    div.querySelector('input[type="text"]').value = '';
    Array.from(div.querySelectorAll('textarea')).forEach(t => t.value = '');
    Array.from(div.querySelectorAll('select')).forEach(s => s.selectedIndex = 0);
    updateAllSectionSummaries();
  };
  div.querySelector('.remove-pd-btn').onclick = function() {
    div.remove();
    Array.from(container.children).forEach((el, i) => {
      const h = el.querySelector('h4');
      if (h) h.textContent = `Programme/Course #${i+1}`;
    });
    updateAllSectionSummaries();
    ensureEmptyState(container);
  };
  container.appendChild(div);
  enhanceAllTextareas(div);
  updateAllSectionSummaries();
  ensureEmptyState(container);
}

function addPDNeeded() {
  const container = document.getElementById("pd-needed-container");
  if (!container) return;
  removeEmptyState(container);
  const idx = container.children.length + 1;
  const div = document.createElement('div');
  div.className = "p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm mb-4 relative";
  div.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <h4 class="text-lg font-semibold text-slate-900">Development Need #${idx}</h4>
      <div class="flex gap-2">
        <button type="button" class="clear-pdneed-btn px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm font-medium">Clear</button>
        <button type="button" class="remove-pdneed-btn px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium">&times; Remove</button>
      </div>
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
  // Clear button handler
  div.querySelector('.clear-pdneed-btn').onclick = function() {
    div.querySelector('input[type="text"]').value = '';
    div.querySelector('textarea').value = '';
    updateAllSectionSummaries();
  };
  div.querySelector('.remove-pdneed-btn').onclick = function() {
    div.remove();
    Array.from(container.children).forEach((el, i) => {
      const h = el.querySelector('h4');
      if (h) h.textContent = `Development Need #${i+1}`;
    });
    updateAllSectionSummaries();
    ensureEmptyState(container);
  };
  container.appendChild(div);
  enhanceAllTextareas(div);
  updateAllSectionSummaries();
  ensureEmptyState(container);
}

function addFutureGoal() {
  const container = document.getElementById("future-goals-container");
  if (!container) return;
  removeEmptyState(container);
  const idx = container.children.length + 1;
  const div = document.createElement('div');
  div.className = "p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm mb-4 relative";
  div.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <h4 class="text-lg font-semibold text-slate-900">Future Goal #${idx}</h4>
      <div class="flex gap-2">
        <button type="button" class="clear-futuregoal-btn px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm font-medium">Clear</button>
        <button type="button" class="remove-futuregoal-btn px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium">&times; Remove</button>
      </div>
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
  // Clear button handler
  div.querySelector('.clear-futuregoal-btn').onclick = function() {
    div.querySelector('input[type="text"]').value = '';
    Array.from(div.querySelectorAll('textarea')).forEach(t => t.value = '');
    updateAllSectionSummaries();
  };
  div.querySelector('.remove-futuregoal-btn').onclick = function() {
    div.remove();
    Array.from(container.children).forEach((el, i) => {
      const h = el.querySelector('h4');
      if (h) h.textContent = `Future Goal #${i+1}`;
    });
    updateAllSectionSummaries();
    ensureEmptyState(container);
  };
  container.appendChild(div);
  enhanceAllTextareas(div);
  updateAllSectionSummaries();
  ensureEmptyState(container);
}

function removeFutureGoal() {
  const container = document.getElementById("future-goals-container");
  if (container && container.lastElementChild) container.removeChild(container.lastElementChild);
}

function addBoardRequest() {
  const container = document.getElementById("board-requests-container");
  if (!container) return;
  removeEmptyState(container);
  const idx = container.children.length + 1;
  const div = document.createElement('div');
  div.className = "p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm mb-4 relative";
  div.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <h4 class="text-lg font-semibold text-slate-900">Board Request #${idx}</h4>
      <div class="flex gap-2">
        <button type="button" class="clear-boardrequest-btn px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm font-medium">Clear</button>
        <button type="button" class="remove-boardrequest-btn px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium">&times; Remove</button>
      </div>
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
        <option value="">Select an option…</option>
        <option value="No">No</option>
        <option value="Yes">Yes</option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1">If Yes, what has changed since last year?</label>
      <input type="text" class="w-full p-2 border border-slate-300 rounded-md bg-white" placeholder="e.g., Still not in place, workload pressure continues...">
    </div>
  `;
  // Clear button handler
  div.querySelector('.clear-boardrequest-btn').onclick = function() {
    Array.from(div.querySelectorAll('textarea')).forEach(t => t.value = '');
    div.querySelector('select').selectedIndex = 0;
    div.querySelector('input[type="text"]').value = '';
    updateAllSectionSummaries();
  };
  div.querySelector('.remove-boardrequest-btn').onclick = function() {
    div.remove();
    Array.from(container.children).forEach((el, i) => {
      const h = el.querySelector('h4');
      if (h) h.textContent = `Board Request #${i+1}`;
    });
    updateAllSectionSummaries();
    ensureEmptyState(container);
  };
  container.appendChild(div);
  enhanceAllTextareas(div);
  updateAllSectionSummaries();
  ensureEmptyState(container);
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
  if (status) status.textContent = 'Saving...';
  try {
    const user = window.firebaseHelpers.auth.currentUser;
    if (!user) throw new Error('Not logged in');
    const data = collectFormData();
    await window.firebaseHelpers.saveReviewData(user.uid, data, 'drafts');
    window.lastCloudSaveTime = new Date().toISOString();
    renderAutosaveIndicator();
    if (status) {
      status.textContent = 'Draft saved!';
      setTimeout(() => { if (status) status.textContent = ''; }, 2000);
    }
  } catch (err) {
    if (status) status.textContent = 'Save failed: ' + (err.message || err);
    if (status) {
      status.textContent += ' Local draft still saved in this browser.';
    }
  }
}

// --- Submit Handler ---
const reviewFormEl = document.getElementById('reviewForm');
if (reviewFormEl) {
  reviewFormEl.onsubmit = async function(e) {
    e.preventDefault();
    const status = document.getElementById('save-status');
    if (status) status.textContent = 'Submitting...';
    try {
      const user = window.firebaseHelpers.auth.currentUser;
      if (!user) throw new Error('Not logged in');
      const data = collectFormData();
      await window.firebaseHelpers.saveReviewData(user.uid, data, 'submissions');
      window.lastCloudSaveTime = new Date().toISOString();
      renderAutosaveIndicator();
      try {
        const csv = buildCsvString(data);
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `ceo-review-${stamp}.csv`;
        await window.firebaseHelpers.uploadReviewCsv(user.uid, filename, csv);
      } catch (uploadErr) {
        console.error('CSV upload failed', uploadErr);
        if (status) {
          status.textContent = 'Review submitted, but CSV upload failed. Use “Save Draft” to retry when your connection is stable.';
          setTimeout(() => { if (status) status.textContent = ''; }, 6000);
        }
        return;
      }
      if (status) {
        status.textContent = 'Review submitted!';
        setTimeout(() => { if (status) status.textContent = ''; }, 2000);
      }
    } catch (err) {
      if (status) status.textContent = 'Submit failed: ' + (err.message || err) + ' Your responses remain locally saved.';
    }
  };
}

// --- Save Progress Button ---

// Save Progress Button
const saveProgressBtn = document.getElementById('save-progress-btn');
if (saveProgressBtn) {
  saveProgressBtn.onclick = saveProgress;
}

// Save as PDF Button
const savePdfBtn = document.getElementById('save-pdf-btn');
if (savePdfBtn) {
  savePdfBtn.onclick = function() {
    window.print();
  };
}

async function loadProgress() {
  const status = document.getElementById('save-status');
  status.textContent = 'Loading...';
  try {
    let data = null;
    const user = window.firebaseHelpers.auth.currentUser;
    if (user) {
      // Try Firestore first
      const doc = await window.firebaseHelpers.loadReviewData(user.uid, 'drafts');
      if (doc && doc.data) {
        data = doc.data;
      }
    }
    // Fallback to localStorage
    if (!data) {
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        try {
          data = JSON.parse(local).data;
        } catch {}
      }
    }
    if (!data) throw new Error('No saved draft found.');
    // Hydrate static fields
    document.getElementById('successes').value = data.successes || '';
    document.getElementById('not-well').value = data['not-well'] || '';
    document.getElementById('comparative-reflection').value = data['comparative-reflection'] || '';
    document.getElementById('strengths').value = data.strengths || '';
    document.getElementById('limitations').value = data.limitations || '';
    // Hydrate dynamic repeaters
    function clearAndAdd(containerId, addFn, items, hydrateFn) {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = '';
      (items || []).forEach((item, i) => {
        addFn();
        hydrateFn(container.children[i], item);
      });
      if (!items || !items.length) {
        ensureEmptyState(container);
      }
    }
    // Challenges
    clearAndAdd('challenges-container', addChallenge, data.challenges, (el, item) => {
      el.querySelector('textarea[placeholder="Describe the challenge..."]').value = item.challenge || '';
      el.querySelector('textarea[placeholder="What action was taken?"]').value = item.action || '';
      el.querySelector('textarea[placeholder="What was the outcome?"]').value = item.result || '';
    });
    // Last Year Goals
    clearAndAdd('last-year-goals-container', addLastYearGoal, data.lastYearGoals, (el, item) => {
      el.querySelector('input[placeholder="Enter the goal statement..."]').value = item.goal || '';
      el.querySelector('select').value = item.status || '';
      el.querySelector('textarea[placeholder="Provide supporting evidence..."]').value = item.evidence || '';
    });
    // KPIs
    (data.kpis || []).forEach((item, i) => {
      const card = document.getElementById('kpi-container').children[i];
      if (!card) return;
      if (item.rating) card.querySelector(`input[type="radio"][value="${item.rating}"]`).checked = true;
      card.querySelector('textarea').value = item.evidence || '';
      card.querySelector('select').value = item.compared || '';
      card.querySelector('input[type="text"]').value = item.why || '';
    });
    // JD Alignment
    (data.jdAlignment || []).forEach((item, i) => {
      const card = document.getElementById('jd-alignment-container').children[i];
      if (!card) return;
      card.querySelectorAll('textarea')[0].value = item.wentWell || '';
      card.querySelectorAll('textarea')[1].value = item.notWell || '';
    });
    // Strategic Priorities
    (data.strategicPriorities || []).forEach((item, i) => {
      const card = document.getElementById('strategic-priorities-container').children[i];
      if (!card) return;
      card.querySelectorAll('textarea')[0].value = item.progress || '';
      card.querySelectorAll('textarea')[1].value = item.challenges || '';
      card.querySelector('select').value = item.trend || '';
    });
    // PD Undertaken
    clearAndAdd('pd-undertaken-container', addPDUndertaken, data.pdUndertaken, (el, item) => {
      el.querySelector('input[placeholder="Programme/Course Title"]').value = item.title || '';
      el.querySelector('textarea[placeholder="Key Learnings"]').value = item.learnings || '';
      el.querySelector('textarea[placeholder="How Learnings Were Applied"]').value = item.applied || '';
      el.querySelectorAll('select')[0].value = item.requested || '';
      el.querySelectorAll('select')[1].value = item.usefulness || '';
    });
    // PD Needed
    clearAndAdd('pd-needed-container', addPDNeeded, data.pdNeeded, (el, item) => {
      el.querySelector('input[placeholder="Area of Need"]').value = item.area || '';
      el.querySelector('textarea[placeholder*="expected impact"]').value = item.impact || '';
    });
    // Future Goals
    clearAndAdd('future-goals-container', addFutureGoal, data.futureGoals, (el, item) => {
      el.querySelector('input[placeholder="Enter the goal statement..."]').value = item.statement || '';
      el.querySelector('textarea[placeholder="What will success look like?"]').value = item.outcome || '';
      el.querySelector('textarea[placeholder*="align with strategic priorities"]').value = item.why || '';
    });
    // Board Requests
    clearAndAdd('board-requests-container', addBoardRequest, data.boardRequests, (el, item) => {
      el.querySelector('textarea[placeholder="Request"]').value = item.request || '';
      el.querySelector('textarea[placeholder="Why is this needed?"]').value = item.why || '';
      el.querySelector('select').value = item.requested || '';
      el.querySelector('input[placeholder*="workload pressure"]').value = item.changed || '';
    });
    updateAllSectionSummaries();
    status.textContent = 'Loaded!';
    setTimeout(() => { status.textContent = ''; }, 2000);
  } catch (err) {
    status.textContent = 'Load failed: ' + (err.message || err);
    setTimeout(() => { status.textContent = ''; }, 4000);
  }
}
window.loadProgress = loadProgress;
window.saveProgress = saveProgress;
window.clearForm = clearForm;

window.addChallenge = addChallenge;
window.addLastYearGoal = addLastYearGoal;
window.addPDUndertaken = addPDUndertaken;
window.addPDNeeded = addPDNeeded;
window.addFutureGoal = addFutureGoal;
window.removeFutureGoal = removeFutureGoal;
window.addBoardRequest = addBoardRequest;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    debounce,
    smoothScrollTo,
    setSectionCollapsed,
    updateSectionSummary,
    updateAllSectionSummaries,
    updateOverallProgress,
    setupCollapsibles,
    setupSectionNav,
    enhanceTextarea,
    enhanceAllTextareas,
    buildCsvString,
    buildReviewRows,
  };
}
