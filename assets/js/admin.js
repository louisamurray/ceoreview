const ADMIN_EMAILS = (window.ADMIN_EMAIL_WHITELIST || [
  'admin@example.com'
]).map((email) => email.toLowerCase());

const SECTION_TITLES = {
  'part-1': 'Part 1: Performance Reflection',
  'part-2': 'Part 2: Review of Previous Goals & KPIs',
  'part-3': 'Part 3: Job Description Alignment',
  'part-4': 'Part 4: Strategic Priorities (2022–2024)',
  'part-5': 'Part 5: Personal Assessment & Development',
  'part-6': 'Part 6: Future Focus (Next 12 Months)',
  'part-7': 'Part 7: Dialogue with the Board'
};

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

const state = {
  currentUser: null,
  collection: 'submissions',
  submissions: []
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

document.addEventListener('DOMContentLoaded', () => {
  initAdminDashboard();
});

function initAdminDashboard() {
  const selector = document.getElementById('collection-selector');
  const refreshBtn = document.getElementById('refresh-btn');
  const logoutBtn = document.getElementById('admin-logout');

  if (selector) {
    selector.addEventListener('change', (event) => {
      state.collection = event.target.value || 'submissions';
      loadSubmissions();
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => loadSubmissions());
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.firebaseHelpers?.logout?.();
    });
  }

  firebase.auth().onAuthStateChanged((user) => {
    state.currentUser = user;
    if (!user) {
      setStatus('Please sign in via the main application to access the dashboard.', 'warning');
      showUserBadge(null);
      clearSubmissions();
      return;
    }
    if (!isAdmin(user)) {
      setStatus('You do not have permission to access the admin dashboard.', 'error');
      showUserBadge(null);
      clearSubmissions();
      return;
    }
    showUserBadge(user.email || user.uid);
    setStatus('Loading submissions…');
    loadSubmissions();
  });
}

function isAdmin(user) {
  if (!user?.email) return false;
  const allowlist = ADMIN_EMAILS.length ? ADMIN_EMAILS : [];
  return allowlist.includes(user.email.toLowerCase());
}

function showUserBadge(email) {
  const badge = document.getElementById('admin-user');
  if (!badge) return;
  if (!email) {
    badge.classList.add('hidden');
    badge.textContent = '';
  } else {
    badge.classList.remove('hidden');
    badge.textContent = email;
  }
}

function setStatus(message, variant = 'info') {
  const box = document.getElementById('admin-status');
  if (!box) return;
  const classes = {
    info: 'border-slate-200 bg-white text-slate-600',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    error: 'border-rose-200 bg-rose-50 text-rose-700'
  };
  box.className = `mb-6 rounded-lg border p-4 text-sm ${classes[variant] || classes.info}`;
  box.textContent = message;
  box.classList.remove('hidden');
}

function hideStatus() {
  const box = document.getElementById('admin-status');
  if (box) {
    box.classList.add('hidden');
  }
}

async function loadSubmissions() {
  const list = document.getElementById('submission-list');
  if (list) list.innerHTML = '';
  const user = state.currentUser;
  if (!user || !isAdmin(user)) return;
  setStatus('Loading submissions…');
  try {
    const snapshot = await firebase.firestore().collection(state.collection).get();
    const submissions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    submissions.sort((a, b) => {
      const aDate = new Date(a.submittedAt || a.timestamp || 0).getTime();
      const bDate = new Date(b.submittedAt || b.timestamp || 0).getTime();
      return bDate - aDate;
    });
    state.submissions = submissions;
    renderSubmissions();
    hideStatus();
  } catch (err) {
    console.error('Failed to load submissions', err);
    setStatus('Unable to load submissions. Please try again.', 'error');
  }
}

function clearSubmissions() {
  const list = document.getElementById('submission-list');
  if (list) list.innerHTML = '';
}

function renderSubmissions() {
  const list = document.getElementById('submission-list');
  if (!list) return;
  if (!state.submissions.length) {
    list.innerHTML = '<div class="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">No submissions found in this collection.</div>';
    return;
  }
  const cards = state.submissions.map((submission) => buildSubmissionCard(submission)).join('');
  list.innerHTML = cards;
  bindDownloadButtons();
}

function buildSubmissionCard(record) {
  const submittedAt = record.submittedAt || record.timestamp || null;
  const savedAtStr = submittedAt
    ? new Date(submittedAt).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Unknown';
  const userEmail = record.userEmail || 'Unknown user';
  const csvPath = record.lastCsvPath || null;
  const sections = buildSections(record.data || {});
  const hasSections = sections.length > 0;
  const legacyNote = !hasSections
    ? '<p class="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">This submission uses an older format. Review the raw JSON to inspect its contents.</p>'
    : '';
  const sectionHtml = hasSections
    ? sections
        .map(
          (section) => `
            <article class="rounded-lg border border-slate-200 bg-white p-4">
              <h3 class="text-sm font-semibold text-slate-700">${escapeHtml(section.title)}</h3>
              <div class="mt-3 text-sm text-slate-600">${section.html}</div>
            </article>
          `
        )
        .join('')
    : '';
  const rawJson = escapeHtml(JSON.stringify(record.data || {}, null, 2));
  const downloadBtn = csvPath
    ? `<button type="button" data-csv-path="${escapeHtml(csvPath)}" class="download-csv rounded-full border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:text-blue-800">Download CSV</button>`
    : '<span class="text-xs font-medium text-slate-400">No CSV available</span>';
  const additionalMeta = buildMetadataList(record);

  return `
    <details class="rounded-lg border border-slate-200 bg-white shadow-sm">
      <summary class="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <span class="text-sm font-semibold text-slate-800">${escapeHtml(userEmail)}</span>
        <span class="text-xs uppercase tracking-wide text-slate-500">${escapeHtml(state.collection)} · ${escapeHtml(savedAtStr)}</span>
      </summary>
      <div class="space-y-4 border-t border-slate-200 px-4 py-4">
        <div class="flex flex-wrap items-center gap-3">
          ${downloadBtn}
          ${additionalMeta}
        </div>
        ${legacyNote}
        ${sectionHtml}
        <details class="rounded-lg border border-slate-200 bg-slate-50">
          <summary class="px-4 py-3 text-sm font-semibold text-slate-700">Raw JSON payload</summary>
          <pre class="overflow-x-auto px-4 py-3 text-xs text-slate-600">${rawJson}</pre>
        </details>
      </div>
    </details>
  `;
}

function buildMetadataList(record) {
  const items = [];
  if (record.lastCsvUploadedAt) {
    items.push(`<span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">CSV updated ${escapeHtml(new Date(record.lastCsvUploadedAt).toLocaleString())}</span>`);
  }
  if (record.lastSavedAt && state.collection === 'drafts') {
    items.push(`<span class="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">Last saved ${escapeHtml(new Date(record.lastSavedAt).toLocaleString())}</span>`);
  }
  return items.join('');
}

function bindDownloadButtons() {
  document.querySelectorAll('.download-csv').forEach((button) => {
    button.addEventListener('click', async (event) => {
      const path = event.currentTarget.getAttribute('data-csv-path');
      if (!path) return;
      button.disabled = true;
      button.classList.add('opacity-60');
      try {
        const url = await firebase.storage().ref(path).getDownloadURL();
        window.open(url, '_blank', 'noopener');
      } catch (err) {
        console.error('Failed to fetch CSV', err);
        alert('Unable to fetch CSV download URL. Please try again later.');
      } finally {
        button.disabled = false;
        button.classList.remove('opacity-60');
      }
    });
  });
}

function buildSections(payload) {
  if (!payload || typeof payload !== 'object') return [];
  const usedKeys = new Set();
  const sections = [];
  Object.entries(previousContextSchema).forEach(([sectionId, fields]) => {
    const entries = [];
    fields.forEach((field) => {
      const { value, keyUsed } = pickFieldValue(payload, field);
      if (keyUsed) usedKeys.add(keyUsed);
      if (value === undefined || value === null) return;
      if (typeof value === 'string' && !value.trim()) return;
      if (Array.isArray(value) && !value.length) return;
      const rendered = renderFieldValue(value, field);
      if (!rendered) return;
      entries.push({ label: field.label, html: rendered });
    });
    if (entries.length) {
      sections.push({
        id: sectionId,
        title: SECTION_TITLES[sectionId] || sectionId,
        html: entries.map((entry) => `<dt class="font-semibold text-slate-700">${escapeHtml(entry.label)}</dt><dd class="mt-1 mb-3 text-slate-600">${entry.html}</dd>`).join('')
      });
    }
  });
  const ignoredKeys = new Set(['uid', 'timestamp', 'submittedAt', 'lastSavedAt', 'lastCsvPath', 'lastCsvUploadedAt', 'lastCsvFileName', 'userEmail', 'userDisplayName']);
  const additionalKeys = Object.keys(payload).filter((key) => !usedKeys.has(key) && !ignoredKeys.has(key));
  if (additionalKeys.length) {
    const additionalHtml = renderAdditionalData(additionalKeys, payload);
    if (additionalHtml) {
      sections.push({
        id: 'additional',
        title: 'Additional data',
        html: additionalHtml
      });
    }
  }
  return sections;
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
      if (!parts.length) return '';
      return `<li>${parts.join('<br>')}</li>`;
    })
    .filter(Boolean)
    .join('')}</ul>`;
}

