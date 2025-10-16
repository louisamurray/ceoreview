/**
 * Data Formatting Utilities
 * Handles rendering of previous review context data
 * Exported as window.Formatters namespace
 */

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

// Export as window.Formatters namespace
window.Formatters = {
  escapeHtml,
  formatMultiline,
  formatChallengeList,
  formatGoalList,
  formatKpiList,
  formatJobAlignmentList,
  formatStrategicPriorityList,
  formatPDUndertakenList,
  formatPDNeededList,
  formatFutureGoalList,
  formatBoardRequestList
};

// Legacy global exports for backwards compatibility
Object.assign(window, {
  escapeHtml,
  formatMultiline,
  formatChallengeList,
  formatGoalList,
  formatKpiList,
  formatJobAlignmentList,
  formatStrategicPriorityList,
  formatPDUndertakenList,
  formatPDNeededList,
  formatFutureGoalList,
  formatBoardRequestList
});
