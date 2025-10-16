/**
 * UI Navigation & Collapsible Helpers
 * Manages section navigation, collapsible panels, and progress tracking
 * Exported as window.UINavigation namespace
 */

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

// Export as window.UINavigation namespace
window.UINavigation = {
  debounce,
  smoothScrollTo,
  setSectionCollapsed,
  updateSectionSummary,
  updateAllSectionSummaries,
  updateOverallProgress,
  navigateToSection,
  setupCollapsibles,
  setupSectionNav,
  setupInfoDots
};

// Legacy global exports for backwards compatibility
Object.assign(window, {
  debounce,
  smoothScrollTo,
  setSectionCollapsed,
  updateSectionSummary,
  updateAllSectionSummaries,
  updateOverallProgress,
  navigateToSection,
  setupCollapsibles,
  setupSectionNav,
  setupInfoDots
});
