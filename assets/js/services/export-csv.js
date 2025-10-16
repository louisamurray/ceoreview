/**
 * Export Service - CSV and Data Export Utilities
 * Handles CSV generation and data export functionality
 * Exported as window.ExportService namespace
 */

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
    let value = response ?? '';
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

// Export as window.ExportService namespace
window.ExportService = {
  escapeCsvValue,
  buildReviewRows,
  buildCsvString
};

// Legacy global exports for backwards compatibility
Object.assign(window, {
  escapeCsvValue,
  buildReviewRows,
  buildCsvString
});
