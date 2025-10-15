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

const previousContextSchema = {
  'part-1': [
    { key: 'successes', altKeys: ['successHighlights', 'wins'], label: 'Success highlights' },
    { key: 'not-well', altKeys: ['setbacks', 'improvementsNeeded'], label: 'Areas that did not go well' },
    { key: 'comparative-reflection', altKeys: ['yearComparison'], label: 'Comparative reflection' },
    { key: 'challenges', label: 'Key challenges', formatter: formatChallengeList }
  ],
  'part-2': [
    { key: 'lastYearGoals', altKeys: ['goalsLastYear', 'goals'], label: 'Goals from last year', formatter: formatGoalList },
    { key: 'kpis', altKeys: ['kpiRatings'], label: 'KPI & competency ratings', formatter: formatKpiList }
  ],
  'part-3': [
    { key: 'jdAlignment', altKeys: ['jobAlignment'], label: 'Job description alignment', formatter: formatJobAlignmentList }
  ],
  'part-4': [
    { key: 'strategicPriorities', altKeys: ['priorities'], label: 'Strategic priorities', formatter: formatStrategicPriorityList }
  ],
  'part-5': [
    { key: 'strengths', altKeys: ['keyStrengths'], label: 'Key strengths' },
    { key: 'limitations', altKeys: ['constraints'], label: 'Limitations / restrictions' },
    { key: 'pdUndertaken', altKeys: ['professionalDevelopmentUndertaken'], label: 'Professional development undertaken', formatter: formatPDUndertakenList },
    { key: 'pdNeeded', altKeys: ['professionalDevelopmentNeeded', 'pdNeeds'], label: 'Future professional development needs', formatter: formatPDNeededList }
  ],
  'part-6': [
    { key: 'futureGoals', altKeys: ['nextYearGoals'], label: 'Future goals', formatter: formatFutureGoalList }
  ],
  'part-7': [
    { key: 'boardRequests', altKeys: ['requestsForBoard'], label: 'Requests for the board', formatter: formatBoardRequestList }
  ]
};

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
    const record = await window.firebaseHelpers.loadReviewData(uid, 'submissions');
    if (!record || !record.data) {
      return;
    }
    window.previousReviewData = record.data;
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
    localStorage.removeItem(STORAGE_KEY);
    showLoginModal(false);
    showSignupModal(false);
    showResetModal(false, false);
    if (appContainer) {
      appContainer.style.display = '';
      appContainer.setAttribute('aria-hidden', 'false');
    }
    if (user.uid) renderPreviousReview(user.uid);
    // Do not auto-load last saved draft. Only load on button click.
  } else {
    showSignupModal(false);
    showLoginModal(true);
    showResetModal(false, false);
    localStorage.removeItem(STORAGE_KEY);
    clearForm();
    clearPreviousSummaries();
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

  // Populate test data
  const populateTestDataBtn = document.getElementById('populate-test-data-btn');
  if (populateTestDataBtn) {
    populateTestDataBtn.onclick = function() {
      if (confirm('This will clear the current form and load comprehensive test data. Continue?')) {
        populateTestData();
      }
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

  const showResetBtn = document.getElementById('show-reset-btn');
  if (showResetBtn) {
    showResetBtn.onclick = function() {
      showResetModal(true);
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
      } else if (modal.id === 'reset-modal') {
        showResetModal(false);
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
    await window.firebaseHelpers.saveReviewData(user.uid, data, 'drafts', {
      lastSavedAt: new Date().toISOString()
    });
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
      const submittedAt = new Date().toISOString();
      await window.firebaseHelpers.saveReviewData(user.uid, data, 'submissions', {
        submittedAt,
        lastCsvPath: null,
        lastCsvUploadedAt: null
      });
      window.lastCloudSaveTime = new Date().toISOString();
      renderAutosaveIndicator();
      try {
        const csv = buildCsvString(data);
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `ceo-review-${stamp}.csv`;
        const uploadSnapshot = await window.firebaseHelpers.uploadReviewCsv(user.uid, filename, csv);
        const fullPath = uploadSnapshot?.metadata?.fullPath || null;
        await window.firebaseHelpers.updateReviewMetadata(user.uid, 'submissions', {
          lastCsvPath: fullPath,
          lastCsvUploadedAt: new Date().toISOString(),
          lastCsvFileName: filename
        });
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
      if (user.uid) renderPreviousReview(user.uid);
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

// Print Preview Button
const printPreviewBtn = document.getElementById('print-preview-btn');
if (printPreviewBtn) {
  printPreviewBtn.onclick = function() {
    printPreview();
  };
}

// Save as PDF Button
const savePdfBtn = document.getElementById('save-pdf-btn');
if (savePdfBtn) {
  savePdfBtn.onclick = function() {
    preparePrintLayout();
    
    // Listen for after print to clean up
    const afterPrint = () => {
      cleanupPrintLayout();
      window.removeEventListener('afterprint', afterPrint);
    };
    window.addEventListener('afterprint', afterPrint);
    
    setTimeout(() => {
      window.print();
    }, 200);
  };
}

// Clean up print elements after printing
function cleanupPrintLayout() {
  const printElements = document.querySelectorAll('.print-content');
  printElements.forEach(el => el.remove());
  
  const formElements = document.querySelectorAll('[data-print-converted]');
  formElements.forEach(el => delete el.dataset.printConverted);
}

// Prepare layout for printing
function preparePrintLayout() {
  // Convert all form elements to static content for reliable PDF generation
  convertFormElementsToStaticContent();
  
  // Ensure all collapsible sections are expanded
  const collapsibleSections = document.querySelectorAll('.collapsible-section[data-collapsed="true"]');
  collapsibleSections.forEach(section => {
    const body = section.querySelector('.section-body');
    if (body) {
      body.style.display = 'block';
      body.style.height = 'auto';
      body.style.visibility = 'visible';
    }
  });
  
  // Add page break hints for better pagination
  const sections = document.querySelectorAll('section[id*="part-"]');
  sections.forEach((section, index) => {
    // Add page breaks before major sections (parts 3, 5, 7)
    if (section.id === 'part-3' || section.id === 'part-5' || section.id === 'part-7') {
      section.style.pageBreakBefore = 'always';
    }
    
    // Ensure sections don't break awkwardly - but allow for large sections
    if (section.id === 'part-1' || section.id === 'part-2' || section.id === 'part-6') {
      section.style.pageBreakInside = 'avoid';
    } else {
      section.style.pageBreakInside = 'auto';
    }
  });
  
  // Handle repeater items to avoid awkward breaks
  const repeaterItems = document.querySelectorAll('.repeater-item');
  repeaterItems.forEach(item => {
    // Calculate content size to determine if item can fit on one page
    const textContent = item.textContent.trim();
    const estimatedHeight = textContent.length * 0.15; // Rough estimate in pts
    const hasLongContent = textContent.length > 800 || estimatedHeight > 200;
    
    if (hasLongContent) {
      // Allow breaking for very large items
      item.classList.add('large-content');
      item.style.pageBreakInside = 'auto';
      item.style.breakInside = 'auto';
    } else {
      // Keep smaller items together
      item.style.pageBreakInside = 'avoid';
      item.style.breakInside = 'avoid';
    }
    
    item.style.marginBottom = '20pt';
    item.style.orphans = '5';
    item.style.widows = '5';
  });
}

// Convert form elements to static content for reliable printing
function convertFormElementsToStaticContent() {
  // Handle textareas - auto-expand to show full content
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    if (!textarea.dataset.printConverted) {
      const content = textarea.value.trim() || '—';
      const printDiv = document.createElement('div');
      printDiv.className = 'print-content';
      printDiv.textContent = content;
      
      // Calculate if this is long content that might need to break
      const isLongContent = content.length > 500 || content.split('\n').length > 8;
      
      printDiv.style.cssText = `
        display: none;
        font-family: 'Times New Roman', serif;
        font-size: 11pt;
        line-height: 1.5;
        color: #222;
        white-space: pre-wrap;
        word-wrap: break-word;
        padding: 6pt 0;
        margin-bottom: 10pt;
        border-bottom: 1px solid #ccc;
        height: auto;
        min-height: auto;
        ${isLongContent ? 'page-break-inside: auto;' : 'page-break-inside: avoid;'}
        orphans: 3;
        widows: 3;
      `;
      
      // Insert after the textarea
      textarea.parentNode.insertBefore(printDiv, textarea.nextSibling);
      textarea.dataset.printConverted = 'true';
    }
  });
  
  // Handle text inputs
  const textInputs = document.querySelectorAll('input[type="text"], input[type="email"]');
  textInputs.forEach(input => {
    if (!input.dataset.printConverted) {
      const content = input.value.trim() || '—';
      const printSpan = document.createElement('span');
      printSpan.className = 'print-content print-content-inline';
      printSpan.textContent = content;
      printSpan.style.cssText = `
        display: none;
        font-family: 'Times New Roman', serif;
        font-size: 11pt;
        color: #222;
        border-bottom: 1px solid #ccc;
        padding: 2pt 0;
        margin-right: 8pt;
      `;
      
      // Insert after the input
      input.parentNode.insertBefore(printSpan, input.nextSibling);
      input.dataset.printConverted = 'true';
    }
  });
  
  // Handle select elements
  const selects = document.querySelectorAll('select');
  selects.forEach(select => {
    if (!select.dataset.printConverted) {
      const selectedOption = select.options[select.selectedIndex];
      const content = selectedOption ? selectedOption.text : '—';
      const printSpan = document.createElement('span');
      printSpan.className = 'print-content print-content-inline';
      printSpan.textContent = content;
      printSpan.style.cssText = `
        display: none;
        font-family: 'Times New Roman', serif;
        font-size: 11pt;
        color: #222;
        border-bottom: 1px solid #ccc;
        padding: 2pt 0;
        margin-right: 8pt;
        font-weight: 500;
      `;
      
      // Insert after the select
      select.parentNode.insertBefore(printSpan, select.nextSibling);
      select.dataset.printConverted = 'true';
    }
  });
  
  // Handle radio buttons
  const radioGroups = {};
  const radios = document.querySelectorAll('input[type="radio"]');
  radios.forEach(radio => {
    const name = radio.name;
    if (!radioGroups[name]) radioGroups[name] = [];
    radioGroups[name].push(radio);
  });
  
  Object.keys(radioGroups).forEach(groupName => {
    const group = radioGroups[groupName];
    const checkedRadio = group.find(r => r.checked);
    
    if (checkedRadio && !checkedRadio.dataset.printConverted) {
      const label = document.querySelector(`label[for="${checkedRadio.id}"]`);
      const content = label ? label.textContent.trim() : checkedRadio.value;
      
      const printSpan = document.createElement('span');
      printSpan.className = 'print-content print-content-inline';
      printSpan.innerHTML = `<strong>Selected:</strong> ${content}`;
      printSpan.style.cssText = `
        display: none;
        font-family: 'Times New Roman', serif;
        font-size: 11pt;
        color: #222;
        margin-right: 12pt;
        font-weight: normal;
      `;
      
      // Insert after the radio group container
      const container = checkedRadio.closest('.grid') || checkedRadio.closest('div');
      if (container) {
        container.appendChild(printSpan);
      }
      
      // Mark all radios in group as converted
      group.forEach(r => r.dataset.printConverted = 'true');
    }
  });
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

// --- Test Data Population Function ---
function populateTestData() {
  const testData = {
    // Part 1: Performance Reflection
    successes: `• Successfully launched the Community Hub initiative, serving 150+ whānau in its first 6 months
• Secured $250,000 in additional funding through strategic partnership with local iwi
• Implemented new conflict resolution framework resulting in 40% faster case resolution
• Led organizational restructure that improved staff satisfaction scores from 72% to 89%
• Established mentoring programme connecting 25 rangatahi with community leaders`,

    'not-well': `• Recruitment timeline for Senior Social Worker position extended by 3 months due to limited candidate pool
• Initial community consultation for new facility location faced unexpected resistance requiring redesign
• IT system upgrade caused temporary service disruptions affecting client scheduling
• Staff development budget overspent by 15% due to increased demand for specialized training`,

    'comparative-reflection': `This year showed marked improvement in stakeholder relationships compared to 2023. The establishment of regular hui with iwi partners created trust that was previously lacking. Financial management became more robust with the implementation of quarterly forecasting, contrasting sharply with the reactive approach of previous years. However, staff retention challenges persist, though at lower levels than the 25% turnover experienced in 2023. The organization's community profile has strengthened significantly through increased media presence and successful events.`,

    // Challenges
    challenges: [
      {
        challenge: "Securing sustainable funding for core programmes beyond government contracts",
        action: "Developed diversified funding strategy including corporate partnerships, community fundraising, and fee-for-service offerings. Engaged professional grant writer and established donor stewardship programme.",
        result: "Secured $180,000 in non-government funding and established ongoing revenue stream generating $15,000 monthly. Reduced dependency on government funding from 90% to 72%."
      },
      {
        challenge: "Managing increased demand for services with limited staffing capacity",
        action: "Implemented waitlist management system, expanded volunteer programme, and negotiated flexible working arrangements. Prioritized service delivery through triage assessment process.",
        result: "Reduced average wait times from 6 weeks to 3 weeks while maintaining service quality. Volunteer hours increased by 200% contributing equivalent of 1.5 FTE positions."
      },
      {
        challenge: "Navigating complex regulatory changes affecting service delivery standards",
        action: "Established compliance working group with legal consultation, provided staff training on new requirements, and updated all policies and procedures. Created monitoring dashboard for compliance tracking.",
        result: "Achieved 100% compliance with new regulations ahead of deadline. Avoided potential $50,000 penalty and maintained all funding contracts. Process improvements identified efficiency gains."
      }
    ],

    // Goals from Last Year
    lastYearGoals: [
      {
        goal: "Establish Community Hub facility serving North Marlborough region",
        status: "Fully Achieved",
        evidence: "Hub opened March 2024, serving 150+ clients monthly. User satisfaction survey shows 94% approval rating. Partnership agreements signed with 8 local organizations for co-location."
      },
      {
        goal: "Achieve financial sustainability with 30% non-government revenue",
        status: "Partially Achieved",
        evidence: "Reached 28% non-government revenue by year-end. Established corporate partnerships worth $85,000 annually and fee-for-service programmes generating $180,000. Target missed by 2% due to delayed grant outcome."
      },
      {
        goal: "Implement comprehensive staff development programme",
        status: "Fully Achieved",
        evidence: "100% of staff completed core competency training. Leadership development programme launched with 6 participants. Staff satisfaction improved from 72% to 89%. Professional development budget fully utilized."
      },
      {
        goal: "Expand iwi partnership framework to include all local iwi",
        status: "Partially Achieved",
        evidence: "Formal partnerships established with 3 of 5 local iwi through signed MOUs. Regular hui schedule implemented. Cultural competency training completed by all staff. Remaining 2 iwi partnerships in development."
      }
    ],

    // KPIs (will be populated separately as they have specific structure)
    kpis: [
      {
        name: "Conflict Resolution",
        rating: "4",
        evidence: "Implemented new restorative justice approach reducing average case duration from 8 to 5 weeks. Client satisfaction with resolution process increased to 87%. Successfully mediated 42 complex family disputes with 95% resolution rate.",
        compared: "Better",
        why: "New framework and staff training provided tools for more effective intervention strategies"
      },
      {
        name: "Financial Resilience", 
        rating: "3",
        evidence: "Maintained 3-month operating reserves throughout the year. Diversified revenue streams reduced government dependency to 72%. All audit recommendations implemented with clean audit report received.",
        compared: "Similar",
        why: "Solid financial management maintained despite challenging funding environment"
      },
      {
        name: "Board–CEO Communication",
        rating: "4", 
        evidence: "Introduced monthly CEO reports with KPI dashboard. Board meeting attendance averaged 92%. All board requests addressed within agreed timeframes. Regular 1:1 meetings with Chair established.",
        compared: "Better",
        why: "Structured communication protocols improved transparency and board engagement"
      },
      {
        name: "Values Alignment",
        rating: "5",
        evidence: "Staff survey shows 94% feel organizational values are lived daily. Community feedback consistently highlights cultural responsiveness. Values-based decision making framework implemented for all major decisions.",
        compared: "Much Better", 
        why: "Dedicated focus on embedding values into operational practice and decision-making processes"
      }
    ],

    // Job Description Alignment (will be populated separately)
    jdAlignment: [
      {
        area: "Strategic Leadership",
        wentWell: "Successfully developed and communicated 3-year strategic plan with board and staff input. Led organizational change management for new service delivery model. Established strong external relationships with key stakeholders including local government and iwi partners.",
        notWell: "Strategic planning timeline extended due to extensive consultation requirements. Some strategic initiatives delayed by 3-6 months due to competing priorities. Need to improve strategic communication to wider community."
      },
      {
        area: "People & Resources", 
        wentWell: "Improved staff retention rates and satisfaction scores. Successfully recruited for key positions including Senior Social Worker and Community Liaison roles. Implemented performance management system with regular feedback loops.",
        notWell: "Recruitment processes took longer than anticipated for specialized roles. Professional development budget management could be improved. Need better succession planning for key positions."
      },
      {
        area: "Partnerships",
        wentWell: "Established formal partnerships with 3 local iwi and 8 community organizations. Secured new funding partnerships worth $180,000. Developed collaborative service delivery models reducing duplication.",
        notWell: "Partnership development with remaining 2 iwi progressing slower than expected. Some partnership agreements require renegotiation due to changing organizational needs. Communication protocols with partners need strengthening."
      },
      {
        area: "Growth Opportunities",
        wentWell: "Successfully expanded service delivery to North Marlborough region. Identified and pursued new funding opportunities resulting in 28% revenue diversification. Established innovation fund for pilot programmes.",
        notWell: "Some growth initiatives required more resources than initially planned. Market analysis for new services took longer than expected. Need better systems for evaluating growth opportunity ROI."
      },
      {
        area: "Accountability", 
        wentWell: "Implemented comprehensive reporting framework for all stakeholders. All compliance requirements met ahead of deadlines. Board reporting improved with monthly KPI dashboards and quarterly reviews.",
        notWell: "Some reporting systems require integration to reduce duplication. Stakeholder feedback mechanisms could be more systematic. Need to improve transparency in decision-making processes."
      },
      {
        area: "Team & Culture",
        wentWell: "Staff satisfaction increased significantly from 72% to 89%. Successful cultural competency training programme implemented. Team building initiatives improved collaboration across departments.",
        notWell: "Still experiencing challenges with work-life balance in high-demand periods. Communication between departments needs improvement. Need to address workload distribution more equitably."
      }
    ],

    // Strategic Priorities (will be populated separately) 
    strategicPriorities: [
      {
        name: "Strengthen Iwi relationships",
        progress: "Significant progress made with formal MOUs signed with 3 of 5 local iwi. Regular hui established monthly with attendance averaging 85%. Cultural competency training completed by 100% of staff. Joint initiatives launched including rangatahi mentoring programme.",
        challenges: "Remaining 2 iwi partnerships progressing slowly due to internal iwi governance processes. Balancing different iwi perspectives and protocols requires careful navigation. Resource allocation for cultural activities needs increase.",
        trend: "Improving"
      },
      {
        name: "Increase trusted relationships & social cohesion", 
        progress: "Community Hub establishment has created central meeting place fostering natural connections. Conflict resolution programme showing 95% success rate. Community events attendance increased by 150% year-on-year. Social media engagement up 300%.",
        challenges: "Reaching isolated community members remains difficult. Some community tensions persist around resource allocation. Measuring social cohesion improvements requires better metrics development.",
        trend: "Improving"
      },
      {
        name: "Contribute to intergenerational wellbeing",
        progress: "Rangatahi mentoring programme connecting 25 young people with community elders. Family support services expanded to include parenting programmes. Educational support provided to 40+ students. Housing advocacy secured stable accommodation for 15 families.",
        challenges: "Long-term impact measurement systems need development. Intergenerational programmes require sustained funding beyond current grants. Balancing immediate needs with long-term wellbeing goals challenging.",
        trend: "Steady"
      },
      {
        name: "Operate a positive & professional organisation",
        progress: "Staff satisfaction increased to 89% with improved professional development opportunities. All compliance requirements exceeded. Financial management systems strengthened with clean audit results. Workplace culture assessment shows significant improvement.",
        challenges: "Workload management during peak periods affects staff wellbeing. Professional development budget constraints limit opportunities. Office space limitations impact productivity and staff satisfaction.",
        trend: "Improving"
      }
    ],

    // Part 5: Personal Assessment
    strengths: `• Strategic thinking and planning - able to see big picture while managing operational details
• Relationship building and stakeholder engagement - strong connections across diverse community groups
• Crisis management and decision-making under pressure - calm leadership during challenging situations  
• Cultural competency and responsiveness - deep understanding of Te Ao Māori principles and practices
• Financial stewardship and resource management - proven track record of prudent financial oversight
• Change management and organizational development - successful leadership through significant transitions`,

    limitations: `• Technology systems knowledge - require support for complex IT implementations and digital transformation initiatives
• Limited bandwidth for concurrent major projects - need to improve delegation and prioritization during high-demand periods
• Grant writing expertise - while strategic, could benefit from technical writing skills development for complex funding applications
• Regional networking beyond Marlborough - opportunities to expand connections with national sector leaders and organizations`,

    // Professional Development Undertaken
    pdUndertaken: [
      {
        title: "Advanced Conflict Resolution & Mediation Certificate",
        learnings: "Gained expertise in restorative justice approaches, de-escalation techniques, and cultural mediation practices. Learned structured frameworks for complex multi-party disputes and trauma-informed conflict resolution.",
        applied: "Implemented new mediation protocols reducing case resolution time by 37%. Training used in 42 family disputes with 95% success rate. Developed staff training programme based on learnings benefiting entire team.",
        requested: "Board Requested",
        usefulness: "Extremely Useful"
      },
      {
        title: "Nonprofit Financial Management Intensive",
        learnings: "Advanced understanding of nonprofit accounting standards, grant compliance requirements, and diversified revenue strategies. Learned forecasting models and risk management approaches specific to community sector.",
        applied: "Implemented quarterly financial forecasting improving budget accuracy by 25%. Developed diversified funding strategy achieving 28% non-government revenue. Enhanced board financial reporting with KPI dashboards.",
        requested: "Self-Initiated", 
        usefulness: "Very Useful"
      },
      {
        title: "Te Reo Māori Level 2 Certification",
        learnings: "Improved conversational Te Reo capability and deeper understanding of tikanga Māori. Enhanced cultural competency for engaging with iwi partners and Māori whānau in appropriate cultural context.",
        applied: "Used Te Reo in all hui and formal iwi engagements. Improved cultural responsiveness in service delivery. Led organizational karakia and supported staff cultural development. Enhanced community trust and relationships.",
        requested: "Self-Initiated",
        usefulness: "Extremely Useful"
      }
    ],

    // Professional Development Needed
    pdNeeded: [
      {
        area: "Digital Leadership & Technology Strategy",
        impact: "Essential for leading organizational digital transformation. Will enable better service delivery through technology platforms, improve efficiency through automation, and enhance community engagement through digital channels. Critical for remaining competitive and meeting evolving client expectations."
      },
      {
        area: "Advanced Grant Writing & Funding Strategy", 
        impact: "Will significantly increase funding success rates and enable pursuit of larger collaborative grants. Essential for achieving financial sustainability goals and reducing government funding dependency. Will build organizational capacity for long-term resource security."
      },
      {
        area: "National Sector Leadership Programme",
        impact: "Will enhance national profile and sector influence, creating opportunities for policy input and collaborative initiatives. Essential for staying current with sector trends and building networks that benefit local community. Will position organization as regional leader."
      }
    ],

    // Part 6: Future Goals
    futureGoals: [
      {
        statement: "Establish Marlborough as regional hub for restorative justice practice",
        outcome: "Recognition as leading practice region with 50% of family disputes using restorative approaches. Training centre established providing professional development regionally. Partnership agreements with justice sector agencies for referral pathways.",
        why: "Aligns directly with strengthening iwi relationships and increasing social cohesion. Builds on successful conflict resolution improvements and community trust. Positions organization as innovative sector leader while meeting community needs."
      },
      {
        statement: "Achieve 35% non-government revenue diversification",
        outcome: "Sustainable funding mix reducing government dependency risk. Established social enterprise generating $200,000+ annually. Corporate partnership programme worth $150,000 per year. Community fundraising capability producing $100,000 annually.",
        why: "Critical for operating positive professional organization with financial resilience. Enables pursuit of innovative programmes aligned with community priorities. Provides flexibility to respond quickly to emerging needs without funding constraints."
      },
      {
        statement: "Launch intergenerational housing development project",
        outcome: "20-unit housing complex designed with cultural principles enabling whānau of different generations to live interdependently. Project fully funded through partnership model. Waitlist of eligible whānau established with support wraparound services designed.",
        why: "Directly contributes to intergenerational wellbeing strategic priority. Addresses critical housing shortage while maintaining cultural connections. Creates tangible legacy project demonstrating organizational capability and community commitment."
      }
    ],

    // Part 7: Board Requests  
    boardRequests: [
      {
        request: "Support for attending National Nonprofit Leadership Summit in Wellington (3 days)",
        why: "Critical for staying current with sector developments and policy changes affecting community organizations. Opportunity to represent Marlborough region perspectives and build national networks. Learning will directly benefit strategic planning and organizational development.",
        requested: "Professional Development",
        changed: "Increased national focus and policy advocacy workload requiring dedicated time allocation"
      },
      {
        request: "Approval for strategic partnership development with South Island community organizations", 
        why: "Opportunity to leverage resources and expertise through collaborative service delivery models. Will strengthen funding applications and enable shared professional development. Critical for achieving growth and sustainability goals.",
        requested: "Strategic Direction",
        changed: "Expanded regional focus requiring travel and relationship management beyond current scope"
      },
      {
        request: "Board champion for digital transformation project leadership and community engagement",
        why: "Major organizational change requiring board-level advocacy and community leadership. Technology transformation affects all aspects of service delivery and requires strong governance oversight. Board member expertise in digital strategy would accelerate implementation.",
        requested: "Governance Support", 
        changed: "Complex change management requiring additional board meeting time and decision-making support"
      }
    ]
  };

  // Clear existing form
  clearForm();
  
  // Wait a moment for form to clear
  setTimeout(() => {
    // Populate static fields
    document.getElementById('successes').value = testData.successes;
    document.getElementById('not-well').value = testData['not-well']; 
    document.getElementById('comparative-reflection').value = testData['comparative-reflection'];
    document.getElementById('strengths').value = testData.strengths;
    document.getElementById('limitations').value = testData.limitations;

    // Populate challenges
    testData.challenges.forEach(() => addChallenge());
    const challengeCards = document.getElementById('challenges-container').children;
    testData.challenges.forEach((item, i) => {
      if (challengeCards[i]) {
        challengeCards[i].querySelector('textarea[placeholder="Describe the challenge..."]').value = item.challenge;
        challengeCards[i].querySelector('textarea[placeholder="What action was taken?"]').value = item.action;
        challengeCards[i].querySelector('textarea[placeholder="What was the outcome?"]').value = item.result;
      }
    });

    // Populate last year goals
    testData.lastYearGoals.forEach(() => addLastYearGoal());
    const goalCards = document.getElementById('last-year-goals-container').children;
    testData.lastYearGoals.forEach((item, i) => {
      if (goalCards[i]) {
        goalCards[i].querySelector('input[placeholder="Enter the goal statement..."]').value = item.goal;
        goalCards[i].querySelector('select').value = item.status;
        goalCards[i].querySelector('textarea[placeholder="Provide supporting evidence..."]').value = item.evidence;
      }
    });

    // Populate KPIs
    const kpiCards = document.getElementById('kpi-container').children;
    testData.kpis.forEach((item, i) => {
      if (kpiCards[i]) {
        const ratingInput = kpiCards[i].querySelector(`input[type="radio"][value="${item.rating}"]`);
        if (ratingInput) ratingInput.checked = true;
        kpiCards[i].querySelector('textarea').value = item.evidence;
        kpiCards[i].querySelector('select').value = item.compared;
        kpiCards[i].querySelector('input[type="text"]').value = item.why;
      }
    });

    // Populate JD alignment
    const jdCards = document.getElementById('jd-alignment-container').children;
    testData.jdAlignment.forEach((item, i) => {
      if (jdCards[i]) {
        const textareas = jdCards[i].querySelectorAll('textarea');
        if (textareas[0]) textareas[0].value = item.wentWell;
        if (textareas[1]) textareas[1].value = item.notWell;
      }
    });

    // Populate strategic priorities  
    const priorityCards = document.getElementById('strategic-priorities-container').children;
    testData.strategicPriorities.forEach((item, i) => {
      if (priorityCards[i]) {
        const textareas = priorityCards[i].querySelectorAll('textarea');
        if (textareas[0]) textareas[0].value = item.progress;
        if (textareas[1]) textareas[1].value = item.challenges;
        const select = priorityCards[i].querySelector('select');
        if (select) select.value = item.trend;
      }
    });

    // Populate PD undertaken
    testData.pdUndertaken.forEach(() => addPDUndertaken());
    const pdUndertakenCards = document.getElementById('pd-undertaken-container').children;
    testData.pdUndertaken.forEach((item, i) => {
      if (pdUndertakenCards[i]) {
        pdUndertakenCards[i].querySelector('input[placeholder="Programme/Course Title"]').value = item.title;
        pdUndertakenCards[i].querySelector('textarea[placeholder="Key Learnings"]').value = item.learnings;
        pdUndertakenCards[i].querySelector('textarea[placeholder="How Learnings Were Applied"]').value = item.applied;
        const selects = pdUndertakenCards[i].querySelectorAll('select');
        if (selects[0]) selects[0].value = item.requested;
        if (selects[1]) selects[1].value = item.usefulness;
      }
    });

    // Populate PD needed
    testData.pdNeeded.forEach(() => addPDNeeded());
    const pdNeededCards = document.getElementById('pd-needed-container').children;
    testData.pdNeeded.forEach((item, i) => {
      if (pdNeededCards[i]) {
        pdNeededCards[i].querySelector('input[placeholder="Area of Need"]').value = item.area;
        pdNeededCards[i].querySelector('textarea[placeholder*="expected impact"]').value = item.impact;
      }
    });

    // Populate future goals
    testData.futureGoals.forEach(() => addFutureGoal());
    const futureGoalCards = document.getElementById('future-goals-container').children;
    testData.futureGoals.forEach((item, i) => {
      if (futureGoalCards[i]) {
        futureGoalCards[i].querySelector('input[placeholder="Enter the goal statement..."]').value = item.statement;
        futureGoalCards[i].querySelector('textarea[placeholder="What will success look like?"]').value = item.outcome;
        futureGoalCards[i].querySelector('textarea[placeholder*="align with strategic priorities"]').value = item.why;
      }
    });

    // Populate board requests
    testData.boardRequests.forEach(() => addBoardRequest());
    const boardRequestCards = document.getElementById('board-requests-container').children;
    testData.boardRequests.forEach((item, i) => {
      if (boardRequestCards[i]) {
        boardRequestCards[i].querySelector('textarea[placeholder="Request"]').value = item.request;
        boardRequestCards[i].querySelector('textarea[placeholder="Why is this needed?"]').value = item.why;
        boardRequestCards[i].querySelector('select').value = item.requested;
        boardRequestCards[i].querySelector('input[placeholder*="workload pressure"]').value = item.changed;
      }
    });

    // Update all section summaries and progress
    updateAllSectionSummaries();
    
    // Save the test data to local storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      timestamp: new Date().toISOString(),
      data: testData
    }));

    // Show success message
    const status = document.getElementById('save-status');
    if (status) {
      status.textContent = '✅ Test data loaded successfully!';
      status.style.color = '#059669';
      setTimeout(() => {
        status.textContent = '';
        status.style.color = '';
      }, 3000);
    }

  }, 100);
}

// Print preview function for debugging
function printPreview() {
  const originalTitle = document.title;
  document.title = 'CEO Review - Print Preview';
  
  // Add print preview class to body
  document.body.classList.add('print-preview');
  
  // Prepare layout
  preparePrintLayout();
  
  // Add some visual indicators for page breaks
  const pageBreakElements = document.querySelectorAll('[style*="page-break-before: always"]');
  pageBreakElements.forEach(el => {
    el.style.borderTop = '2px dashed #e11d48';
    el.style.marginTop = '20px';
    el.style.paddingTop = '20px';
  });
  
  alert('Print preview mode activated. Check the layout and use browser print to generate PDF. Refresh page to exit preview mode.');
  
  // Restore title
  document.title = originalTitle;
}

// Add print debug styles
function addPrintDebugStyles() {
  if (document.getElementById('print-debug-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'print-debug-styles';
  style.textContent = `
    body.print-preview {
      background: #f3f4f6 !important;
      padding: 20px;
    }
    
    body.print-preview .container {
      background: white !important;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
      max-width: 8.5in !important;
      margin: 0 auto !important;
      padding: 1in 0.75in !important;
    }
    
    body.print-preview [style*="page-break-before: always"] {
      position: relative;
    }
    
    body.print-preview [style*="page-break-before: always"]::before {
      content: "📄 New Page";
      position: absolute;
      top: -15px;
      left: 0;
      background: #dc2626;
      color: white;
      padding: 2px 8px;
      font-size: 12px;
      border-radius: 4px;
    }
  `;
  
  document.head.appendChild(style);
}

// Initialize debug styles
addPrintDebugStyles();

// Expose test function globally
window.populateTestData = populateTestData;
window.printPreview = printPreview;

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
