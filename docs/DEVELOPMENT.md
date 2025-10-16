# Development Guide

## Quick Start

### 1. Local Setup (5 minutes)

```bash
# Clone repository
git clone <repo-url>
cd ceoreview

# Install dependencies
npm install

# Start local server
python3 -m http.server 8000

# Open browser
open http://localhost:8000
```

### 2. Firebase Setup (Optional, for real data)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init

# Start emulator
firebase emulators:start
```

### 3. Run Tests

```bash
# Unit tests
npm test

# E2E tests
npx playwright test

# Linting
npx eslint assets/js/**/*.js
```

---

## Project Structure

```
ceoreview/
├── assets/js/               # JavaScript modules
│   ├── core/               # Core functionality
│   ├── ui/                 # UI components & helpers
│   ├── services/           # Firebase & services
│   └── app.js              # Main orchestrator
├── docs/                   # Documentation
├── tests/                  # Test files
├── index.html              # Main application
├── admin.html              # Admin dashboard
└── package.json            # Dependencies
```

---

## Adding New Features

### Step 1: Identify Where to Put Code

```
Q: Is it a utility function?
└─> Add to existing module (e.g., formatters.js)

Q: Is it a user interaction?
└─> Add to ui/components/buttons.js or ui/helpers/

Q: Is it external data operation?
└─> Add to services/

Q: Is it configuration/constant?
└─> Add to core/constants.js

Q: Multiple responsibilities?
└─> Create a new module
```

### Step 2: Create New Module (if needed)

```bash
# Create file in appropriate directory
mkdir -p assets/js/ui/helpers/
touch assets/js/ui/helpers/my-feature.js
```

### Step 3: Write Module

```javascript
// assets/js/ui/helpers/my-feature.js

/**
 * My Feature - Brief description
 * @namespace MyFeature
 */
window.MyFeature = {
  /**
   * Public function with documentation
   * @param {string} param1 - Description
   * @returns {boolean} What it returns
   * @example
   * const result = window.MyFeature.publicFunc('value');
   */
  publicFunc: (param1) => {
    return true;
  },
  
  // Private helper (prefix with _)
  _privateHelper: () => {
    return null;
  }
};

// Export legacy globals if needed for HTML onclick
window.publicFunc = window.MyFeature.publicFunc;
```

### Step 4: Add to HTML

```html
<!-- In index.html, add before app.js -->
<script src="assets/js/ui/helpers/my-feature.js" defer></script>
```

### Step 5: Use in app.js

```javascript
// In app.js DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // Call setup functions
  window.MyFeature.setup();
  
  // Or use directly
  document.getElementById('button').onclick = () => {
    window.MyFeature.publicFunc('value');
  };
});
```

### Step 6: Test

```bash
# 1. Run linter
npx eslint assets/js/ui/helpers/my-feature.js

# 2. Browser console test
window.MyFeature.publicFunc('test')

# 3. Add unit tests
# Create tests/unit/my-feature.test.js

# 4. Run all tests
npm test
```

### Step 7: Document

```bash
# Create module documentation
touch docs/modules/my-feature.md

# Follow template from other modules
```

### Step 8: Commit

```bash
git add .
git commit -m "feat: Add my feature

- Brief description
- What changed
- Why it was needed"

git push origin feature/my-feature
```

---

## Common Tasks

### Add a New Form Field

1. **Update constants.js**
   ```javascript
   // Add to FIELD_SCHEMAS
   'part-1': {
     myNewField: {
       type: 'textarea',
       label: 'My New Field',
       maxLength: 1000
     }
   }
   ```

2. **Add HTML in index.html**
   ```html
   <textarea id="myNewField" placeholder="..."></textarea>
   ```

3. **Test**
   ```javascript
   // In console
   const data = window.FormUtils.collect(document.getElementById('reviewForm'));
   console.log(data['part-1'].myNewField);
   ```

### Add a New Button Action

1. **Create handler in buttons.js**
   ```javascript
   // In window.ButtonHandlers
   setupMyNewButton: () => {
     const btn = document.getElementById('my-new-btn');
     if (btn) {
       btn.onclick = async () => {
         const data = window.FormUtils.collect(form);
         // Do something with data
       };
     }
   }
   ```

2. **Call setup in app.js**
   ```javascript
   window.ButtonHandlers.setupMyNewButton();
   ```

3. **Add button to HTML**
   ```html
   <button id="my-new-btn">My New Action</button>
   ```

### Modify Form Data Processing

1. **Find relevant function**
   - Collection: `forms.js` → `collectFormData()`
   - Population: `forms.js` → `populateFormFromData()`
   - Flattening: `forms.js` → `flattenSectionsToFlat()`

2. **Update function**
   - Add validation if needed
   - Update data transformation
   - Test with console

3. **Check all tests pass**
   ```bash
   npm test
   ```

---

## Testing

### Manual Testing Checklist

Before committing, test:

- [ ] Page loads without console errors
- [ ] All buttons clickable
- [ ] Form fields update
- [ ] Autosave works (check timestamp)
- [ ] Navigation between sections works
- [ ] Modals open/close
- [ ] PDF generates
- [ ] Data saves to Firestore

### Unit Tests

```javascript
// tests/unit/my-feature.test.js

describe('MyFeature', () => {
  test('should do something', () => {
    const result = window.MyFeature.publicFunc('input');
    expect(result).toBe(true);
  });
  
  test('should handle errors', () => {
    expect(() => {
      window.MyFeature.publicFunc(null);
    }).toThrow();
  });
});
```

### E2E Tests

```javascript
// tests/e2e/my-feature.spec.js

import { test, expect } from '@playwright/test';

test('User can use my feature', async ({ page }) => {
  await page.goto('http://localhost:8000');
  
  // Setup
  await page.fill('#myField', 'test value');
  
  // Action
  await page.click('#myNewBtn');
  
  // Verify
  const result = await page.locator('#result').textContent();
  expect(result).toContain('success');
});
```

### Running Tests

```bash
# All tests
npm test

# Specific file
npm test my-feature.test.js

# With coverage
npm test -- --coverage

# E2E tests
npx playwright test

# Linting
npx eslint assets/js/**/*.js
```

---

## Debugging

### Browser Console

```javascript
// Check if module loaded
window.MyFeature
// Should show { publicFunc: (...), _privateHelper: (...) }

// Test module function
window.MyFeature.publicFunc('test')

// Check form data
window.FormUtils.collect(document.getElementById('reviewForm'))

// Check Firebase connection
window.firebaseHelpers.user
```

### DevTools

1. **Elements tab**
   - Inspect form structure
   - Check CSS classes
   - Verify IDs match

2. **Console tab**
   - Watch for errors
   - Test functions directly
   - Check variable values

3. **Network tab**
   - Monitor Firebase requests
   - Check file sizes
   - Look for failed requests

4. **Performance tab**
   - Check load time
   - Identify bottlenecks
   - Measure specific operations

### Debugging Tips

```javascript
// Add debug logging
console.log('DEBUG:', variableName);

// Check function called
console.time('operation');
window.MyFeature.publicFunc();
console.timeEnd('operation');

// Monitor events
document.addEventListener('myEvent', () => {
  console.log('Event fired!');
});

// Check Firestore saves
window.firebaseHelpers.saveReview(uid, data)
  .then(() => console.log('Saved!'))
  .catch(err => console.error('Error:', err));
```

---

## Code Style

### Naming Conventions

```javascript
// Variables: camelCase
const myVariable = 'value';

// Functions: camelCase
function myFunction() { }

// Classes/Namespaces: PascalCase (rarely used)
window.MyNamespace = { };

// Constants: UPPER_SNAKE_CASE
const MAX_LENGTH = 1000;

// Private functions: _camelCase
window.MyModule._privateHelper = () => { };

// HTML IDs: kebab-case
<div id="my-element"></div>

// CSS Classes: kebab-case
<div class="my-class"></div>
```

### Formatting

```javascript
// Use 2 spaces for indentation
if (true) {
  console.log('Indented');
}

// Keep lines < 100 characters
const veryLongVariableName = 
  'Split across lines if needed';

// Use arrow functions in modern code
const handler = (event) => { };

// Use const by default, let if needed
const x = 10;  // ✅ Default
let y = 0;     // Use only if reassigned

// Semicolons optional but recommended
window.MyFunc = () => { };  // ✅
```

### Comments

```javascript
// Use // for single-line comments
const x = 5; // Explain why if not obvious

/**
 * Use JSDoc for public functions
 * @param {string} name - Description
 * @returns {boolean} What it returns
 */
function publicFunction(name) { }

// TODO: Use for future improvements
// FIXME: Use for known issues
// NOTE: Use for important information
```

---

## Git Workflow

### Branch Naming

```
feature/description      # New feature
fix/description         # Bug fix
docs/description        # Documentation
refactor/description    # Code refactoring
perf/description        # Performance improvement
```

### Commit Messages

```
feat: Add new feature description

Longer description explaining:
- What changed
- Why it changed
- Any side effects

Fixes #123
```

### Common Commands

```bash
# Create and switch to new branch
git checkout -b feature/my-feature

# Stage changes
git add .

# Commit
git commit -m "feat: Description"

# Push to remote
git push origin feature/my-feature

# Create pull request (via GitHub web)

# After PR review, merge locally
git checkout main
git pull origin main
git merge feature/my-feature

# Delete feature branch
git branch -d feature/my-feature
git push origin --delete feature/my-feature
```

---

## Deployment

### Pre-Deployment Checklist

```bash
# 1. Run all tests
npm test
npm run test:e2e
npx eslint assets/js/**/*.js

# 2. Check for console errors
# Load in browser, open DevTools

# 3. Manual testing
# Go through key workflows

# 4. Check git status
git status  # Should be clean

# 5. Review changes
git log --oneline -10
```

### Deployment Steps

```bash
# 1. Make sure on main branch
git checkout main
git pull origin main

# 2. Verify tests pass
npm test

# 3. Deploy to Firebase
firebase deploy --only hosting

# 4. Verify deployment
# Visit: https://studio-8276146072-e2bec.web.app
# Test all features

# 5. Monitor logs
firebase hosting:channel:logs main
```

### Rollback

```bash
# If something breaks
git revert <commit-hash>
firebase deploy --only hosting

# Or go back to previous version
firebase hosting:rollback
```

---

## Performance Tips

### Optimization Strategies

1. **Debounce frequent events**
   ```javascript
   const debouncedSave = window.UINavigation.debounce(() => {
     window.saveToFirebase();
   }, 1000);
   document.addEventListener('input', debouncedSave);
   ```

2. **Lazy load large features**
   ```javascript
   // Only load PDF library if user tries to generate PDF
   if (!window.pdfReady) {
     loadScript('pdf-library.js').then(() => {
       window.pdfReady = true;
     });
   }
   ```

3. **Batch DOM updates**
   ```javascript
   // Create elements in memory first
   const fragment = document.createDocumentFragment();
   items.forEach(item => {
     fragment.appendChild(createItemElement(item));
   });
   container.appendChild(fragment);  // Single DOM update
   ```

4. **Cache frequently accessed elements**
   ```javascript
   const form = document.getElementById('reviewForm');  // Cache this
   form.addEventListener('input', handler);
   ```

### Monitoring Performance

```javascript
// Measure specific operations
performance.mark('operation-start');
window.MyFeature.expensiveOperation();
performance.mark('operation-end');
performance.measure('operation', 'operation-start', 'operation-end');

// Check results
const measure = performance.getEntriesByName('operation')[0];
console.log(`Operation took ${measure.duration}ms`);
```

---

## Common Issues & Solutions

### Issue: "Module is not defined"

**Cause:** Script load order or module not loaded

**Solution:**
```html
<!-- Check order in index.html -->
<script src="core/constants.js" defer></script>
<script src="core/forms.js" defer></script>  <!-- depends on constants -->
```

### Issue: Form data not saving

**Cause:** Autosave disabled, Firebase rules, or network issue

**Solution:**
```javascript
// Check in console
window.lastCloudSaveTime      // Should show recent timestamp
window.firebaseHelpers.user   // Should show logged-in user
// Check Network tab in DevTools
```

### Issue: Modal won't close

**Cause:** Focus trap not released, ID mismatch

**Solution:**
```javascript
// In console
window.ModalManager.closeModal(
  document.getElementById('modal-id')
);
```

### Issue: PDF generation fails

**Cause:** jsPDF not loaded, invalid data

**Solution:**
```html
<!-- Verify jsPDF loads before pdf-generator.js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="services/pdf-generator.js" defer></script>
```

---

## Getting Help

### Documentation

- **Architecture:** See `docs/ARCHITECTURE.md`
- **Modules:** See `docs/modules/`
- **API Reference:** See `docs/API.md`

### Code Examples

- **Add feature:** See this file section "Adding New Features"
- **Module pattern:** See any file in `assets/js/`
- **Test examples:** See files in `tests/`

### External Resources

- [Vanilla JavaScript Guide](https://javascript.info/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [DevTools Guide](https://developer.chrome.com/docs/devtools/)

---

## Quick Reference

### Important Files

| File | Purpose |
|------|---------|
| `index.html` | Main app structure |
| `admin.html` | Admin dashboard |
| `assets/js/app.js` | Main orchestrator |
| `assets/js/core/constants.js` | Configuration |
| `assets/js/core/forms.js` | Form operations |
| `package.json` | Dependencies |
| `jest.config.js` | Test config |
| `eslint.config.mjs` | Linter config |

### Key Commands

```bash
npm install        # Install dependencies
npm test           # Run tests
npm run deploy     # Deploy to Firebase
npx eslint ...     # Run linter
node -c file.js    # Check syntax
```

### Global Functions (Available in Console)

```javascript
// Forms
window.FormUtils.collect(form)
window.FormUtils.populate(form, data)
window.FormUtils.flatten(data)

// UI Navigation
window.UINavigation.navigateToSection('#part-2')
window.UINavigation.debounce(fn, 300)

// Modals
window.ModalManager.openModal(modal)
window.ModalManager.closeModal(modal)

// Services
window.PDFGenerator.generate(data)
window.ExportService.buildCsvString(data)

// Firebase
window.firebaseHelpers.saveReview(uid, data)
window.firebaseHelpers.user
```

---

## Contact

- **Questions?** Check `docs/ARCHITECTURE.md` first
- **Bug report?** Open GitHub issue with:
  - Browser and OS
  - Steps to reproduce
  - Expected vs actual behavior
  - Console errors/warnings

---

**Last Updated:** October 17, 2025  
**Version:** 1.0  
**Status:** Ready for Use

