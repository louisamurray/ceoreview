/**
 * Previous Review Context Service
 * Handles loading and rendering previous review data
 * Exported as window.PreviousReview namespace
 */

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
    const content = window.Formatters?.formatMultiline?.(value) || value;
    return `<p>${content}</p>`;
  }
  if (Array.isArray(value)) {
    if (!value.length) return '';
    if (value.every((item) => typeof item === 'string')) {
      const escape = window.Formatters?.escapeHtml || (v => v);
      const format = window.Formatters?.formatMultiline || (v => v);
      return `<ul class="previous-list">${value.map((item) => `<li>${format(item)}</li>`).join('')}</ul>`;
    }
    const escape = window.Formatters?.escapeHtml || (v => v);
    return `<pre class="previous-pre">${escape(JSON.stringify(value, null, 2))}</pre>`;
  }
  if (value && typeof value === 'object') {
    const escape = window.Formatters?.escapeHtml || (v => v);
    return `<pre class="previous-pre">${escape(JSON.stringify(value, null, 2))}</pre>`;
  }
  if (value === undefined || value === null) return '';
  const escape = window.Formatters?.escapeHtml || (v => v);
  return `<p>${escape(String(value))}</p>`;
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
  const escape = window.Formatters?.escapeHtml || (v => v);
  const dateLine = timestamp
    ? `<p class="previous-summary-meta">Submitted ${new Date(timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>`
    : '';
  const html = entries
    .map((entry) => `<dt>${escape(entry.label)}</dt><dd>${entry.html}</dd>`)
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
  const escape = window.Formatters?.escapeHtml || (v => v);
  const items = keys
    .map((key) => {
      const value = data[key];
      if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) return null;
      const rendered = renderFieldValue(value);
      if (!rendered) return null;
      return `<li><strong>${escape(key)}:</strong> ${rendered}</li>`;
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
  const previousContextSchema = window.ReviewConstants?.previousContextSchema || {};
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

// Export as window.PreviousReview namespace
window.PreviousReview = {
  getOrCreatePreviousSummary,
  renderFieldValue,
  setPreviousSummary,
  pickFieldValue,
  renderAdditionalData,
  updatePreviousReviewBanner,
  applyPreviousReviewContext,
  clearPreviousSummaries,
  renderPreviousReview
};

// Legacy global exports for backwards compatibility
Object.assign(window, {
  getOrCreatePreviousSummary,
  renderFieldValue,
  setPreviousSummary,
  pickFieldValue,
  renderAdditionalData,
  updatePreviousReviewBanner,
  applyPreviousReviewContext,
  clearPreviousSummaries,
  renderPreviousReview
});
