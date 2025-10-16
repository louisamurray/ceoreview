/**
 * Autosave & Textarea Enhancement Helpers
 * Manages form autosave and textarea UI enhancements
 * Exported as window.AutosaveManager namespace
 */

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

function setupAutosave(form) {
  if (!form) return;
  const indicator = document.getElementById('autosave-indicator');
  if (!indicator) return;
  autosaveIndicatorEl = indicator;
  renderAutosaveIndicator();

  const debounceFunc = window.debounce || ((fn, wait = 300) => {
    let timeout;
    return function debounced(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), wait);
    };
  });

  const runAutosave = debounceFunc(async () => {
    try {
      const user = window.firebaseHelpers?.auth?.currentUser;
      if (!user) {
        renderAutosaveIndicator('Not logged in');
        return;
      }
      
      const payload = window.collectFormData?.();
      if (!payload) return;
      
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
    window.changeCheckTimeout = setTimeout(() => {
      if (typeof window.checkForUnsavedChanges === 'function') {
        window.checkForUnsavedChanges();
      }
    }, 500);
  });
  form.addEventListener('change', () => {
    renderAutosaveIndicator('Autosaving…');
    runAutosave();
    // Debounce change checking to avoid excessive calls
    clearTimeout(window.changeCheckTimeout);
    window.changeCheckTimeout = setTimeout(() => {
      if (typeof window.checkForUnsavedChanges === 'function') {
        window.checkForUnsavedChanges();
      }
    }, 500);
  });
}

// Export as window.AutosaveManager namespace
window.AutosaveManager = {
  formatShortTime,
  renderAutosaveIndicator,
  enhanceTextarea,
  enhanceAllTextareas,
  setupAutosave
};

// Legacy global exports for backwards compatibility
Object.assign(window, {
  formatShortTime,
  renderAutosaveIndicator,
  enhanceTextarea,
  enhanceAllTextareas,
  setupAutosave
});
