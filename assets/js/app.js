// --- Constants imported from core/constants.js ---
// window.ReviewConstants now contains: kpis, strategicPriorities, jdAreas, 
// ratingDescriptions, emptyStateMessages, previousContextSchema, employeeReviewSchema, defaultSections
// Legacy exports also maintained: window.ceoReviewConfig, window.employeeReviewSchema, window.defaultSections

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

// previousContextSchema imported from core/constants.js

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatMultiline(text) {
  return escapeHtml(text).replace(/\n/g, '<br>');
}

function formatChallengeList(list) {
  if (!Array.isArray(list) || !list.length) return '';
  return `<ul class="previous-list">${list
    .map((item) => {
      if (!item || typeof item !== 'object') return `<li>${escapeHtml(String(item))}</li>`;
      const parts = [];
      if (item.challenge) parts.push(`<strong>Challenge:</strong> ${formatMultiline(item.challenge)}`);
      if (item.action) parts.push(`<strong>Action:</strong> ${formatMultiline(item.action)}`);
      if (item.result) parts.push(`<strong>Outcome:</strong> ${formatMultiline(item.result)}`);
      if (!parts.length) return '';
      return `<li>${parts.join('<br>')}</li>`;
    })
    .filter(Boolean)
    .join('')}</ul>`;
}

function formatGoalList(list) {
  if (!Array.isArray(list) || !list.length) return '';
  return `<ul class="previous-list">${list
    .map((item) => {
      if (!item || typeof item !== 'object') return `<li>${escapeHtml(String(item))}</li>`;
      const parts = [];
      if (item.goal) parts.push(`<strong>Goal:</strong> ${formatMultiline(item.goal)}`);
      if (item.status) parts.push(`<strong>Status:</strong> ${escapeHtml(item.status)}`);
      if (item.evidence) parts.push(`<strong>Evidence:</strong> ${formatMultiline(item.evidence)}`);
      if (!parts.length) return '';
      return `<li>${parts.join('<br>')}</li>`;
    })
    .filter(Boolean)
    .join('')}</ul>`;
}

function formatKpiList(list) {
  if (!Array.isArray(list) || !list.length) return '';
  return `<ul class="previous-list">${list
    .map((item) => {
      if (!item || typeof item !== 'object') return `<li>${escapeHtml(String(item))}</li>`;
      const parts = [];
      const name = item.name ? `<strong>${escapeHtml(item.name)}:</strong>` : '<strong>KPI:</strong>';
      const rating = item.rating ? ` Rating ${escapeHtml(item.rating)}` : '';
      const compared = item.compared ? ` (${escapeHtml(item.compared)})` : '';
      const header = `${name}${rating}${compared}`.trim();
      parts.push(header);
      if (item.why) parts.push(`<strong>Reason:</strong> ${formatMultiline(item.why)}`);
      if (item.evidence) parts.push(`<strong>Evidence:</strong> ${formatMultiline(item.evidence)}`);
      return `<li>${parts.join('<br>')}</li>`;
    })
    .join('')}</ul>`;
}

function formatJobAlignmentList(list) {
  if (!Array.isArray(list) || !list.length) return '';
  return `<ul class="previous-list">${list
    .map((item) => {
      if (!item || typeof item !== 'object') return `<li>${escapeHtml(String(item))}</li>`;
      const parts = [];
      if (item.area) parts.push(`<strong>${escapeHtml(item.area)}:</strong>`);
      if (item.wentWell) parts.push(`<em>Went well:</em> ${formatMultiline(item.wentWell)}`);
      if (item.notWell) parts.push(`<em>Needs work:</em> ${formatMultiline(item.notWell)}`);
      return `<li>${parts.join('<br>')}</li>`;
    })
    .join('')}</ul>`;
}

function formatStrategicPriorityList(list) {
  if (!Array.isArray(list) || !list.length) return '';
  return `<ul class="previous-list">${list
    .map((item) => {
      if (!item || typeof item !== 'object') return `<li>${escapeHtml(String(item))}</li>`;
      const parts = [];
      if (item.name) parts.push(`<strong>${escapeHtml(item.name)}:</strong>`);
      if (item.progress) parts.push(`<em>Progress:</em> ${formatMultiline(item.progress)}`);
      if (item.challenges) parts.push(`<em>Challenges:</em> ${formatMultiline(item.challenges)}`);
      if (item.trend) parts.push(`<em>Trend vs last year:</em> ${escapeHtml(item.trend)}`);
      return `<li>${parts.join('<br>')}</li>`;
    })
    .join('')}</ul>`;
}

function formatPDUndertakenList(list) {
  if (!Array.isArray(list) || !list.length) return '';
  return `<ul class="previous-list">${list
    .map((item) => {
      if (!item || typeof item !== 'object') return `<li>${escapeHtml(String(item))}</li>`;
      const parts = [];
      if (item.title) parts.push(`<strong>${escapeHtml(item.title)}</strong>`);
      if (item.learnings) parts.push(`<em>Key learnings:</em> ${formatMultiline(item.learnings)}`);
      if (item.applied) parts.push(`<em>Applied:</em> ${formatMultiline(item.applied)}`);
      if (item.requested) parts.push(`<em>Requested previously:</em> ${escapeHtml(item.requested)}`);
      if (item.usefulness) parts.push(`<em>Usefulness vs last year:</em> ${escapeHtml(item.usefulness)}`);
      return `<li>${parts.join('<br>')}</li>`;
    })
    .join('')}</ul>`;
}

function formatPDNeededList(list) {
  if (!Array.isArray(list) || !list.length) return '';
  return `<ul class="previous-list">${list
    .map((item) => {
      if (!item || typeof item !== 'object') return `<li>${escapeHtml(String(item))}</li>`;
      const parts = [];
      if (item.area) parts.push(`<strong>${escapeHtml(item.area)}</strong>`);
      if (item.impact) parts.push(`<em>Expected impact:</em> ${formatMultiline(item.impact)}`);
      return `<li>${parts.join('<br>')}</li>`;
    })
    .join('')}</ul>`;
}

function formatFutureGoalList(list) {
  if (!Array.isArray(list) || !list.length) return '';
  return `<ul class="previous-list">${list
    .map((item) => {
      if (!item || typeof item !== 'object') return `<li>${escapeHtml(String(item))}</li>`;
      const parts = [];
      if (item.statement) parts.push(`<strong>${escapeHtml(item.statement)}</strong>`);
      if (item.outcome) parts.push(`<em>Desired outcome:</em> ${formatMultiline(item.outcome)}`);
      if (item.why) parts.push(`<em>Why it matters:</em> ${formatMultiline(item.why)}`);
      return `<li>${parts.join('<br>')}</li>`;
    })
    .join('')}</ul>`;
}

function formatBoardRequestList(list) {
  if (!Array.isArray(list) || !list.length) return '';
  return `<ul class="previous-list">${list
    .map((item) => {
      if (!item || typeof item !== 'object') return `<li>${escapeHtml(String(item))}</li>`;
      const parts = [];
      if (item.request) parts.push(`<strong>Request:</strong> ${formatMultiline(item.request)}`);
      if (item.why) parts.push(`<strong>Why needed:</strong> ${formatMultiline(item.why)}`);
      if (item.requested) parts.push(`<em>Requested previously:</em> ${escapeHtml(item.requested)}`);
      if (item.changed) parts.push(`<em>What has changed:</em> ${formatMultiline(item.changed)}`);
      return `<li>${parts.join('<br>')}</li>`;
    })
    .join('')}</ul>`;
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

function getOrCreatePreviousSummary(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return null;
  const body = section.querySelector('.section-body');
  if (!body) return null;
  let details = body.querySelector('.previous-summary');
  if (!details) {
    details = document.createElement('details');
    details.className = 'previous-summary hidden';
    details.innerHTML = '<summary class="previous-summary-title">Last review snapshot</summary><div class="previous-summary-content"></div>';
    body.prepend(details);
  }
  return details;
}

function renderFieldValue(value, config = {}) {
  if (config.formatter) {
    const formatted = config.formatter(value);
    if (formatted) return formatted;
  }
  if (typeof value === 'string') {
    const content = formatMultiline(value);
    return `<p>${content}</p>`;
  }
  if (Array.isArray(value)) {
    if (!value.length) return '';
    if (value.every((item) => typeof item === 'string')) {
      return `<ul class="previous-list">${value.map((item) => `<li>${formatMultiline(item)}</li>`).join('')}</ul>`;
    }
    return `<pre class="previous-pre">${escapeHtml(JSON.stringify(value, null, 2))}</pre>`;
  }
  if (value && typeof value === 'object') {
    return `<pre class="previous-pre">${escapeHtml(JSON.stringify(value, null, 2))}</pre>`;
  }
  if (value === undefined || value === null) return '';
  return `<p>${escapeHtml(String(value))}</p>`;
}

function setPreviousSummary(sectionId, entries, timestamp) {
  const summary = getOrCreatePreviousSummary(sectionId);
  if (!summary) return;
  const content = summary.querySelector('.previous-summary-content');
  if (!content) return;
  if (!entries || !entries.length) {
    summary.classList.add('hidden');
    summary.open = false;
    content.innerHTML = '';
    return;
  }
  const dateLine = timestamp
    ? `<p class="previous-summary-meta">Submitted ${new Date(timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>`
    : '';
  const html = entries
    .map((entry) => `<dt>${escapeHtml(entry.label)}</dt><dd>${entry.html}</dd>`)
    .join('');
  content.innerHTML = `${dateLine}<dl>${html}</dl>`;
  summary.classList.remove('hidden');
}

function pickFieldValue(data, config) {
  if (!data) return { value: undefined, keyUsed: null };
  const keys = [config.key].concat(config.altKeys || []);
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      return { value: data[key], keyUsed: key };
    }
  }
  return { value: undefined, keyUsed: null };
}

function renderAdditionalData(keys, data) {
  const items = keys
    .map((key) => {
      const value = data[key];
      if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) return null;
      const rendered = renderFieldValue(value);
      if (!rendered) return null;
      return `<li><strong>${escapeHtml(key)}:</strong> ${rendered}</li>`;
    })
    .filter(Boolean);
  if (!items.length) return '';
  return `<ul class="previous-list">${items.join('')}</ul>`;
}

function updatePreviousReviewBanner(timestamp) {
  const banner = document.getElementById('previous-review-banner');
  const title = document.getElementById('previous-review-title');
  const description = document.getElementById('previous-review-description');
  if (!banner || !title || !description) return;
  if (!timestamp) {
    banner.classList.add('hidden');
    title.textContent = '';
    description.textContent = '';
    return;
  }
  const date = new Date(timestamp);
  const formatted = Number.isNaN(date.getTime())
    ? 'previously'
    : date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  title.textContent = `Last review submitted ${formatted}`;
  description.textContent = 'Previous responses are shown in each section for easy comparison.';
  banner.classList.remove('hidden');
}

function applyPreviousReviewContext(record) {
  if (!record) {
    clearPreviousSummaries();
    return;
  }
  const payload = record.data || record;
  const timestamp = record.timestamp || record.lastSubmittedAt || null;
  if (!payload || typeof payload !== 'object') {
    clearPreviousSummaries();
    return;
  }
  const usedKeys = new Set();
  const sectionEntries = {};
  let hasEntries = false;
  Object.entries(previousContextSchema).forEach(([sectionId, fields]) => {
    fields.forEach((field) => {
      const { value, keyUsed } = pickFieldValue(payload, field);
      if (keyUsed) usedKeys.add(keyUsed);
      if (value === undefined || value === null) return;
      if (typeof value === 'string' && !value.trim()) return;
      if (Array.isArray(value) && !value.length) return;
      const rendered = renderFieldValue(value, field);
      if (!rendered) return;
      (sectionEntries[sectionId] = sectionEntries[sectionId] || []).push({ label: field.label, html: rendered });
      hasEntries = true;
    });
  });
  const ignoredKeys = new Set(['uid', 'timestamp']);
  const additionalKeys = Object.keys(payload).filter((key) => !usedKeys.has(key) && !ignoredKeys.has(key));
  if (additionalKeys.length) {
    const additionalHtml = renderAdditionalData(additionalKeys, payload);
    if (additionalHtml) {
      (sectionEntries['part-1'] = sectionEntries['part-1'] || []).push({
        label: 'Additional data from previous review',
        html: additionalHtml
      });
      hasEntries = true;
    }
  }
  updatePreviousReviewBanner(timestamp);
  if (!hasEntries) {
    const description = document.getElementById('previous-review-description');
    if (description) {
      description.textContent = 'Previous review stored in a different format. Inline comparisons are not available.';
    }
    return;
  }
  Object.keys(sectionEntries).forEach((sectionId) => {
    setPreviousSummary(sectionId, sectionEntries[sectionId], timestamp);
  });
}

function clearPreviousSummaries() {
  document.querySelectorAll('.previous-summary').forEach((panel) => panel.remove());
  updatePreviousReviewBanner(null);
  window.previousReviewData = null;
}

async function renderPreviousReview(uid) {
  clearPreviousSummaries();
  try {
    const record = await window.firebaseHelpers.loadReview(uid, 'submitted');
    if (!record || !record.sections) {
      return;
    }
    window.previousReviewData = window.firebaseHelpers.flattenSections(record.sections);
    applyPreviousReviewContext(record);
  } catch (err) {
    console.error('Failed to load previous review', err);
  }
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
window.lastCloudSaveTime = window.lastCloudSaveTime || null;

function formatShortTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function renderAutosaveIndicator(prefix) {
  if (!autosaveIndicatorEl) return;
  const parts = [];
  if (prefix) {
    parts.push(prefix);
  } else if (window.lastCloudSaveTime) {
    parts.push(`Autosaved: ${formatShortTime(window.lastCloudSaveTime)}`);
  } else {
    parts.push('Autosave: pending');
  }
  autosaveIndicatorEl.textContent = parts.join(' · ');
}

function setupAutosave(form) {
  if (!form) return;
  const indicator = document.getElementById('autosave-indicator');
  if (!indicator) return;
  autosaveIndicatorEl = indicator;
  renderAutosaveIndicator();

  const runAutosave = debounce(async () => {
    try {
      const user = window.firebaseHelpers.auth.currentUser;
      if (!user) {
        renderAutosaveIndicator('Not logged in');
        return;
      }
      
      const payload = collectFormData();
      const timestamp = new Date().toISOString();
      
      // Save to Firestore using new system
      await window.firebaseHelpers.saveReview(user.uid, payload, 'draft');
      
      window.lastCloudSaveTime = timestamp;
      renderAutosaveIndicator();
    } catch (err) {
      renderAutosaveIndicator('Autosave failed');
      console.error('Autosave error:', err);
    }
  }, 1200);

  form.addEventListener('input', () => {
    renderAutosaveIndicator('Autosaving…');
    runAutosave();
    // Debounce change checking to avoid excessive calls
    clearTimeout(window.changeCheckTimeout);
    window.changeCheckTimeout = setTimeout(checkForUnsavedChanges, 500);
  });
  form.addEventListener('change', () => {
    renderAutosaveIndicator('Autosaving…');
    runAutosave();
    // Debounce change checking to avoid excessive calls
    clearTimeout(window.changeCheckTimeout);
    window.changeCheckTimeout = setTimeout(checkForUnsavedChanges, 500);
  });

  // Load initial save time from Firestore if available
  const user = window.firebaseHelpers.auth.currentUser;
  if (user) {
    window.firebaseHelpers.loadReview(user.uid, 'draft')
      .then(data => {
        if (data?.metadata?.timestamp) {
          window.lastCloudSaveTime = data.metadata.timestamp;
          renderAutosaveIndicator();
        }
      })
      .catch(err => {
        console.warn('Failed to load draft timestamp', err);
      });
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
    showResetModal(false, false);
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

function showResetModal(show, focusLoginAfterClose = true) {
  const resetModal = document.getElementById('reset-modal');
  const appContainer = document.getElementById('app-container');
  if (!resetModal) return;
  if (show) {
    showSignupModal(false);
    closeModal(document.getElementById('login-modal'));
    openModal(resetModal, () => showResetModal(false, focusLoginAfterClose));
    if (appContainer) {
      appContainer.style.display = 'none';
      appContainer.setAttribute('aria-hidden', 'true');
    }
    const status = document.getElementById('reset-status');
    if (status) {
      status.textContent = '';
      status.className = 'text-sm min-h-[1.5em] text-slate-600';
    }
  } else {
    closeModal(resetModal);
    if (focusLoginAfterClose) {
      showLoginModal(true);
    } else if (appContainer) {
      appContainer.style.display = '';
      appContainer.setAttribute('aria-hidden', 'false');
    }
  }
}

// --- Login/Logout Handlers ---
function attachLoginLogoutHandlers() {
  const logoutBtn = document.getElementById('logout-btn');
  const loginBtn = document.getElementById('login-btn');
  
  if (logoutBtn && window.firebaseHelpers?.logout) {
    logoutBtn.onclick = () => window.firebaseHelpers.logout();
  }
  
  if (loginBtn) {
    loginBtn.onclick = () => {
      // Show the login modal
      showLoginModal(true);
    };
  }
}

// --- Clear Form Stub ---
async function clearForm() {
  const form = document.getElementById('reviewForm');
  if (form) form.reset();
  
  // Clear the Firestore saved data
  try {
    const user = window.firebaseAuth?.currentUser;
    if (user && window.firebaseHelpers?.clearReviewData) {
      await window.firebaseHelpers.clearReviewData(user.uid);
      console.log('Form data cleared from Firestore');
    }
  } catch (error) {
    console.error('Error clearing Firestore data:', error);
  }
  
  updateAllSectionSummaries();
}

// --- Admin-only UI Logic ---
function checkAdminStatusAndUpdateUI(user) {
  // Elements that should only be visible to admins
  const adminElements = document.querySelectorAll('.admin-only, #populate-test-data-btn');
  if (!user) {
    adminElements.forEach(el => { el.style.display = 'none'; });
    return;
  }
  // Fetch user data first, then check if admin
  if (window.firebaseHelpers && typeof window.firebaseHelpers.getUserData === 'function') {
    window.firebaseHelpers.getUserData(user.uid).then(userData => {
      const isAdmin = window.firebaseHelpers.isAdmin(userData);
      adminElements.forEach(el => {
        el.style.display = isAdmin ? '' : 'none';
      });
    }).catch((err) => {
      // On error, hide admin-only elements
      console.warn('Failed to check admin status:', err);
      adminElements.forEach(el => { el.style.display = 'none'; });
    });
  } else {
    // Fallback: hide admin-only elements
    adminElements.forEach(el => { el.style.display = 'none'; });
  }
}

// --- Logout Button Visibility ---
function updateLogoutButtonVisibility(isLoggedIn) {
  const logoutBtn = document.getElementById('logout-btn');
  const loginBtn = document.getElementById('login-btn');
  if (logoutBtn) logoutBtn.style.display = isLoggedIn ? '' : 'none';
  if (loginBtn) loginBtn.style.display = isLoggedIn ? 'none' : '';
}

// --- Form State Tracking ---
function markFormAsSaved() {
  // Mark form as saved - can be used for tracking unsaved changes
  window.formHasUnsavedChanges = false;
}

// --- Clear Form ---
function clearForm() {
  // Clear all text inputs and textareas
  document.querySelectorAll('input[type="text"], input[type="email"], textarea').forEach(el => {
    el.value = '';
  });
  
  // Reset all selects
  document.querySelectorAll('select').forEach(el => {
    el.selectedIndex = 0;
  });
  
  // Clear dynamic containers
  ['challenges-container', 'last-year-goals-container', 'pd-undertaken-container', 
   'pd-needed-container', 'future-goals-container', 'board-requests-container'].forEach(containerId => {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
      ensureEmptyState(container);
    }
  });
  
  // Update section summaries
  if (typeof updateAllSectionSummaries === 'function') {
    updateAllSectionSummaries();
  }
}

// --- Dynamic Form Element Functions ---
// All window.add* functions extracted to ui/components/form-inputs.js
// window.DynamicFormItems.addChallenge(), addLastYearGoal(), addPDUndertaken(), addPDNeeded(), addFutureGoal(), addBoardRequest()
// Backwards compatible exports available at window.addChallenge, window.addLastYearGoal, etc.

// --- Populate Test Data ---
async function populateTestData() {
  // Clear form first
  clearForm();
  
  // Part 1: Performance Reflection
  document.getElementById('successes').value = `This year has been marked by significant achievements:
  
• Successfully launched the new community engagement program, reaching over 500 families
• Secured $2.3M in additional funding from diverse sources including central government grants
• Led the strategic planning process that resulted in unanimous board approval of our 2025-2027 plan
• Improved staff retention rate from 65% to 82% through enhanced workplace culture initiatives
• Established three new strategic partnerships with iwi organizations, strengthening our community connections`;

  document.getElementById('not-well').value = `Several areas require improvement and reflection:
  
• Digital transformation project experienced significant delays (6 months behind schedule)
• Communication with some board members could have been more frequent and transparent
• Budget variance in Q2 exceeded acceptable limits due to unforeseen infrastructure costs
• Staff survey revealed concerns about workload distribution that need addressing
• Some key stakeholder relationships require rebuilding after challenging policy discussions`;

  document.getElementById('comparative-reflection').value = `Compared to last year, this has been a year of consolidation and growth. While we faced more complex challenges, our responses were more strategic and measured. The organization's financial position is significantly stronger (reserve fund increased by 40%), and stakeholder satisfaction scores improved by 15 percentage points. However, internal systems and processes haven't kept pace with our growth, creating bottlenecks that weren't present last year. Overall, I'd rate this year as more successful, but with clearer areas for improvement identified.`;

  // Add sample challenges (if addChallenge function exists)
  if (typeof window.addChallenge === 'function') {
    window.addChallenge();
    setTimeout(() => {
      const challengeInputs = document.querySelectorAll('#challenges-container .challenge-group');
      if (challengeInputs.length > 0) {
        const lastChallenge = challengeInputs[challengeInputs.length - 1];
        const textareas = lastChallenge.querySelectorAll('textarea');
        if (textareas[0]) textareas[0].value = 'Staff recruitment and retention in specialized roles';
        if (textareas[1]) textareas[1].value = 'Implemented competitive salary review, flexible working arrangements, and professional development pathways';
        if (textareas[2]) textareas[2].value = 'Successfully filled 4 critical positions, improved staff satisfaction scores by 20%';
      }
    }, 100);
  }

  // Part 2: Goals & KPIs (populate KPI ratings if visible)
  const kpiCards = document.querySelectorAll('#kpi-container .p-6');
  if (kpiCards.length > 0) {
    const ratings = [4, 5, 3, 4]; // Sample ratings for each KPI
    kpiCards.forEach((card, index) => {
      const select = card.querySelector('select');
      const input = card.querySelector('input[type="text"]');
      if (select && ratings[index]) {
        select.value = ratings[index];
      }
      if (input) {
        const reasons = [
          'Improved conflict resolution processes led to faster resolution times',
          'Exceeded budget targets and built strong reserves',
          'Regular reporting and open dialogue enhanced trust and transparency',
          'Organizational values consistently reflected in decision-making and culture'
        ];
        input.value = reasons[index] || 'Consistent performance throughout the year';
      }
    });
  }

  // Add last year goals (if function exists)
  if (typeof window.addLastYearGoal === 'function') {
    window.addLastYearGoal();
    setTimeout(() => {
      const goalInputs = document.querySelectorAll('#last-year-goals-container .goal-group');
      if (goalInputs.length > 0) {
        const lastGoal = goalInputs[goalInputs.length - 1];
        const inputs = lastGoal.querySelectorAll('input, textarea, select');
        if (inputs[0]) inputs[0].value = 'Increase community engagement by 25%';
        if (inputs[1]) inputs[1].value = 'Exceeded target - achieved 32% increase through new programs and partnerships';
        if (inputs[2] && inputs[2].tagName === 'SELECT') inputs[2].value = 'Exceeded';
      }
    }, 100);
  }

  // Part 3: Job Description Alignment
  const jdCards = document.querySelectorAll('#jd-alignment-container .p-6');
  if (jdCards.length > 0) {
    const wellExamples = [
      'Developed and implemented 3-year strategic plan with clear KPIs and milestones. Board approval achieved with strong support.',
      'Built high-performing team through targeted recruitment and professional development. Staff engagement scores increased significantly.',
      'Strengthened relationships with key partners including iwi, government agencies, and community organizations.',
      'Identified and secured new funding streams totaling $800K. Explored innovative program delivery models.',
      'Implemented robust reporting systems and maintained regulatory compliance across all areas.',
      'Fostered positive workplace culture with emphasis on collaboration, respect, and continuous improvement.'
    ];
    const notWellExamples = [
      'Digital systems and infrastructure improvements delayed. Need better project management.',
      'Workload distribution concerns raised in staff survey. Need to review resource allocation.',
      'Some partnership communications could be more frequent and proactive.',
      'Risk assessment processes need strengthening to better identify emerging opportunities.',
      'Board reporting format could be more concise while maintaining necessary detail.',
      'Change management processes need refining to better support team through transitions.'
    ];
    jdCards.forEach((card, index) => {
      const textareas = card.querySelectorAll('textarea');
      if (textareas[0]) textareas[0].value = wellExamples[index] || 'Met expectations in this area';
      if (textareas[1]) textareas[1].value = notWellExamples[index] || 'Areas for continuous improvement identified';
    });
  }

  // Part 4: Strategic Priorities
  const spCards = document.querySelectorAll('#strategic-priorities-container .p-6');
  if (spCards.length > 0) {
    const progressExamples = [
      'Established formal protocols with three iwi partners. Participated in 12 hui and collaborative projects. Co-designed new program with iwi input.',
      'Launched community connection initiatives reaching 200+ new participants. Increased inter-generational program participation by 45%.',
      'Implemented youth mentoring programs supporting 80 rangatahi. Developed sustainability framework for long-term impact.',
      'Achieved 95% staff satisfaction score. Maintained positive workplace culture. Enhanced professional development opportunities.'
    ];
    const challengeExamples = [
      'Building trust takes time. Need to ensure consistency and follow-through on commitments.',
      'Resource constraints limit program expansion. Competing priorities in community require careful navigation.',
      'Measuring long-term wellbeing outcomes remains challenging. Need better evaluation frameworks.',
      'Balancing growth with organizational capacity. Ensuring sustainability of positive culture during change.'
    ];
    spCards.forEach((card, index) => {
      const textareas = card.querySelectorAll('textarea');
      const select = card.querySelector('select');
      if (textareas[0]) textareas[0].value = progressExamples[index] || 'Good progress made';
      if (textareas[1]) textareas[1].value = challengeExamples[index] || 'Some challenges encountered';
      if (select) select.value = ['Improving', 'Improving', 'About the Same', 'Improving'][index] || 'About the Same';
    });
  }

  // Part 5: Personal Assessment
  document.getElementById('strengths').value = `• Strategic thinking and long-term planning
• Building and maintaining stakeholder relationships
• Financial management and resource allocation
• Creating and sustaining positive organizational culture
• Change leadership and adaptive management
• Clear communication across diverse audiences`;

  document.getElementById('limitations').value = `• Time management when juggling multiple priorities
• Sometimes struggle with delegation, tendency to be too hands-on
• Digital technology implementation and systems thinking
• Balancing operational details with strategic focus
• Need to improve conflict avoidance tendencies`;

  // Part 6: Future Goals (if function exists)
  if (typeof window.addFutureGoal === 'function') {
    window.addFutureGoal();
    setTimeout(() => {
      const goalInputs = document.querySelectorAll('#future-goals-container .goal-group');
      if (goalInputs.length > 0) {
        const lastGoal = goalInputs[goalInputs.length - 1];
        const inputs = lastGoal.querySelectorAll('input, textarea');
        if (inputs[0]) inputs[0].value = 'Complete digital transformation project and enhance operational systems';
        if (inputs[1]) inputs[1].value = 'Improved efficiency, better data for decision-making, enhanced stakeholder experience';
        if (inputs[2]) inputs[2].value = 'Project completion by Q3, staff training by Q4, full implementation by year-end';
      }
    }, 100);
  }

  // Part 7: Board Requests (if function exists)
  if (typeof window.addBoardRequest === 'function') {
    window.addBoardRequest();
    setTimeout(() => {
      const requestInputs = document.querySelectorAll('#board-requests-container .request-group');
      if (requestInputs.length > 0) {
        const lastRequest = requestInputs[requestInputs.length - 1];
        const inputs = lastRequest.querySelectorAll('input, textarea');
        if (inputs[0]) inputs[0].value = 'Increased budget allocation for digital infrastructure ($250K)';
        if (inputs[1]) inputs[1].value = 'Current systems are constraining growth and efficiency. Investment will enable scalability and better service delivery.';
      }
    }, 100);
  }

  // Add PD Undertaken (if function exists)
  if (typeof window.addPDUndertaken === 'function') {
    window.addPDUndertaken();
    setTimeout(() => {
      const pdInputs = document.querySelectorAll('#pd-undertaken-container .pd-group');
      if (pdInputs.length > 0) {
        const lastPD = pdInputs[pdInputs.length - 1];
        const inputs = lastPD.querySelectorAll('input, textarea');
        if (inputs[0]) inputs[0].value = 'Executive Leadership Program, Massey University';
        if (inputs[1]) inputs[1].value = 'Enhanced strategic leadership capabilities, improved change management skills, valuable peer network';
      }
    }, 100);
  }

  // Add PD Needed (if function exists)
  if (typeof window.addPDNeeded === 'function') {
    window.addPDNeeded();
    setTimeout(() => {
      const pdInputs = document.querySelectorAll('#pd-needed-container .pd-group');
      if (pdInputs.length > 0) {
        const lastPD = pdInputs[pdInputs.length - 1];
        const inputs = lastPD.querySelectorAll('input, textarea');
        if (inputs[0]) inputs[0].value = 'Digital transformation leadership course';
        if (inputs[1]) inputs[1].value = 'Need stronger technical understanding to lead digital initiatives effectively';
      }
    }, 100);
  }

  // Update all section summaries after populating
  setTimeout(() => {
    if (typeof updateAllSectionSummaries === 'function') {
      updateAllSectionSummaries();
    }
    ensureAllEmptyStates();
  }, 500);
  
  console.log('Test data populated successfully');
  alert('Test data has been loaded into the form. You can now review, edit, or submit.');
}

// --- Auth Change Listener ---
window.onFirebaseAuthStateChanged = function(user) {
  const appContainer = document.getElementById('app-container');
  const loginModal = document.getElementById('login-modal');
  const signupModal = document.getElementById('signup-modal');
  const resetModal = document.getElementById('reset-modal');

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
    showLoginModal(false);
    showSignupModal(false);
    showResetModal(false, false);
    if (appContainer) {
      appContainer.style.display = '';
      appContainer.setAttribute('aria-hidden', 'false');
    }
    if (user.uid) renderPreviousReview(user.uid);
    
    // Check admin status and show/hide test data button
    checkAdminStatusAndUpdateUI(user);
    
    // Show logout button when user is logged in
    updateLogoutButtonVisibility(true);
    
    // Initialize form state tracking
    markFormAsSaved();
    
    // Do not auto-load last saved draft. Only load on button click.
  } else {
    showSignupModal(false);
    showLoginModal(true);
    showResetModal(false, false);
    clearForm();
    clearPreviousSummaries();
    
    // Hide logout button when user is not logged in
    updateLogoutButtonVisibility(false);
    
    // Hide admin-only elements when not logged in
    checkAdminStatusAndUpdateUI(null);
  }
};

// --- Form Data Collection ---
// --- Form data collection functions imported from core/forms.js ---
// FormUtils provides: collect(), collectDynamicItems(), collectKPIs(), collectJobAlignment(), collectStrategicPriorities()
// Legacy functions remain available: collectFormData(), collectDynamicItems(), collectKPIs(), collectJobAlignment(), collectStrategicPriorities()

// --- Populate Form from Data ---
// populateFormFromData() imported from core/forms.js

// --- Convert Structured Sections Back to Flat ---
// flattenSectionsToFlat() imported from core/forms.js

// --- PDF Generation ---
// generatePDF() imported from services/pdf-generator.js
// Call window.PDFGenerator.generate() or generatePDF() to generate PDF

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

  // Initially hide logout button until user is authenticated
  updateLogoutButtonVisibility(false);

  // Setup all button handlers from ButtonHandlers module
  if (typeof window.ButtonHandlers !== 'undefined') {
    window.ButtonHandlers.setupAll();
  } else {
    console.warn('ButtonHandlers module not loaded');
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

  const resetForm = document.getElementById('reset-form');
  if (resetForm) {
    resetForm.onsubmit = async function(e) {
      e.preventDefault();
      const email = document.getElementById('reset-email').value.trim();
      const status = document.getElementById('reset-status');
      if (status) {
        status.textContent = 'Sending reset email…';
        status.className = 'text-sm min-h-[1.5em] text-slate-600';
      }
      try {
        await window.firebaseHelpers.sendPasswordReset(email);
        if (status) {
          status.textContent = 'Email sent! Check your inbox for further instructions.';
          status.className = 'text-sm min-h-[1.5em] text-emerald-600';
        }
        setTimeout(() => {
          showResetModal(false);
        }, 2000);
      } catch (err) {
        if (status) {
          status.textContent = err.message || 'Unable to send reset email. Please try again.';
          status.className = 'text-sm min-h-[1.5em] text-red-600';
        }
      }
    };
  }
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

// --- Employee Review Schema (Flexible) ---
// --- Schemas imported from core/constants.js ---
// employeeReviewSchema and defaultSections now in window.ReviewConstants
