const {
  setSectionCollapsed,
  updateSectionSummary,
  setupCollapsibles,
  enhanceTextarea,
  buildReviewRows,
  buildCsvString,
} = require('../assets/js/app.js');

describe('UI helper behaviours', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  test('setSectionCollapsed toggles section visibility state', () => {
    document.body.innerHTML = `
      <section id="part-1" class="collapsible-section">
        <button class="section-toggle" data-target="#part-1-body" aria-expanded="true"></button>
        <div id="part-1-body" class="section-body"></div>
      </section>
    `;
    const section = document.querySelector('.collapsible-section');
    const toggle = section.querySelector('.section-toggle');
    const body = document.getElementById('part-1-body');

    expect(body.hidden).toBe(false);

    setSectionCollapsed(section, true);
    expect(section.dataset.collapsed).toBe('true');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(body.hidden).toBe(true);

    setSectionCollapsed(section, false);
    expect(section.dataset.collapsed).toBeUndefined();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(body.hidden).toBe(false);
  });

  test('updateSectionSummary reports progress accurately', () => {
    document.body.innerHTML = `
      <section id="progress" class="collapsible-section">
        <div data-section-summary>Not started</div>
        <div class="section-body">
          <textarea name="successes"></textarea>
          <textarea name="challenges"></textarea>
        </div>
      </section>
    `;
    const section = document.getElementById('progress');
    const summary = section.querySelector('[data-section-summary]');

    updateSectionSummary(section);
    expect(summary.textContent).toBe('Not started');

    section.querySelector('textarea[name="successes"]').value = 'Notable win';
    updateSectionSummary(section);
    expect(summary.textContent).toBe('In progress · 1/2');

    section.querySelector('textarea[name="challenges"]').value = 'Key challenge';
    updateSectionSummary(section);
    expect(summary.textContent).toBe('Complete');
  });

  test('setupCollapsibles wires toggles and collapse-all button', () => {
    document.body.innerHTML = `
      <button id="collapse-all-btn"></button>
      <section id="section-a" class="collapsible-section">
        <button class="section-toggle" data-target="#section-a-body" aria-expanded="true"></button>
        <div id="section-a-body" class="section-body"></div>
      </section>
    `;

    setupCollapsibles();

    const section = document.getElementById('section-a');
    const toggle = section.querySelector('.section-toggle');
    const collapseAll = document.getElementById('collapse-all-btn');

    expect(collapseAll.textContent).toBe('Collapse all');

    toggle.click();
    expect(section.dataset.collapsed).toBe('true');
    expect(collapseAll.textContent).toBe('Expand all');

    collapseAll.click();
    expect(section.dataset.collapsed).toBeUndefined();
    expect(collapseAll.textContent).toBe('Collapse all');
  });

  test('enhanceTextarea adds formatting toolbar and updates word count', () => {
    document.body.innerHTML = `
      <div id="wrapper">
        <textarea id="story" rows="4"></textarea>
      </div>
    `;
    const original = document.getElementById('story');

    enhanceTextarea(original);

    const richWrapper = document.querySelector('.rich-text');
    expect(richWrapper).not.toBeNull();

    const enhancedTextarea = richWrapper.querySelector('textarea');
    const count = richWrapper.querySelector('.rich-text-count');
    const bulletButton = richWrapper.querySelector('button');

    expect(count.textContent).toBe('0 words');

    enhancedTextarea.value = 'Focus areas';
    enhancedTextarea.dispatchEvent(new Event('input', { bubbles: true }));
    expect(count.textContent).toBe('2 words');

    bulletButton.click();
    expect(enhancedTextarea.value.startsWith('• ')).toBe(true);
  });

  test('buildCsvString flattens responses into CSV output', () => {
    const sample = {
      successes: 'Delivered flagship programme',
      'not-well': 'Delayed hiring',
      'comparative-reflection': 'Improved stakeholder trust',
      challenges: [
        { challenge: 'Funding gap', action: 'Applied for grants', result: 'Secured bridge funding' }
      ],
      lastYearGoals: [
        { goal: 'Launch new hub', status: 'Partially Achieved', evidence: 'Hub opened in Q4' }
      ],
      kpis: [
        { name: 'Conflict Resolution', rating: '4', evidence: 'Survey feedback', compared: 'Better', why: 'New process' }
      ],
      jdAlignment: [],
      strategicPriorities: [],
      strengths: 'Calm under pressure',
      limitations: 'Bandwidth for partnerships',
      pdUndertaken: [],
      pdNeeded: [],
      futureGoals: [],
      boardRequests: [],
    };

    const rows = buildReviewRows(sample);
    expect(rows.length).toBeGreaterThan(0);
    const csv = buildCsvString(sample);
    expect(csv).toContain('Part 1');
    expect(csv).toContain('Key Successes & What Went Well');
    expect(csv).toContain('Delivered flagship programme');
  });
});
