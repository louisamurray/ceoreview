# Implementation Checklist

## Phase 1: Foundation (Week 1) - ~3.5 hours

### Step 1: Extract Constants (30 minutes)
- [ ] Create `assets/js/core/constants.js`
- [ ] Copy all constant definitions from `app.js`
- [ ] Create `window.ReviewConstants` namespace
- [ ] Update `app.js` to import from constants
- [ ] Test: Reload app, verify UI still works
- [ ] Commit: "refactor: Extract constants to dedicated module"

**Files affected:**
```
+ assets/js/core/constants.js
~ assets/js/app.js (remove constants, add import)
```

**Verification:**
```javascript
// In browser console:
console.log(window.ReviewConstants.KPI_CATEGORIES);
// Should show KPI object
```

---

### Step 2: Extract Form Utilities (2 hours)
- [ ] Create `assets/js/core/forms.js`
- [ ] Move functions: `collectFormData()`, `collectDynamicItems()`, `collectKPIs()`, `collectJobAlignment()`, `collectStrategicPriorities()`, `populateFormFromData()`, `flattenSectionsToFlat()`, `clearForm()`
- [ ] Create public API object: `window.FormUtils`
- [ ] Update all references in `app.js`
- [ ] Test: Each form operation individually
- [ ] Commit: "refactor: Extract form utilities to dedicated module"

**Files affected:**
```
+ assets/js/core/forms.js
~ assets/js/app.js (remove functions, add import)
```

**Verification:**
```javascript
// Test collect
const data = FormUtils.collect(document.getElementById('reviewForm'));
console.log(Object.keys(data)); // ['part-1', 'part-2', ...]

// Test flatten
const flat = FormUtils.flatten(data);
console.log(Object.keys(flat)); // [field1, field2, ...]

// Test populate
FormUtils.populate(document.getElementById('reviewForm'), data);
```

---

### Step 3: Update Imports & Test (1 hour)
- [ ] Update script includes in `index.html`
- [ ] Add: `<script src="assets/js/core/constants.js" defer></script>`
- [ ] Add: `<script src="assets/js/core/forms.js" defer></script>`
- [ ] Test full app workflow:
  - [ ] Load test data
  - [ ] Fill form manually
  - [ ] Save draft
  - [ ] Load draft
  - [ ] Submit review
  - [ ] Download PDF
- [ ] Commit: "chore: Update script imports for refactored modules"

**Verification:**
```bash
# All buttons should work
# Console should be clean (no errors)
# No new warnings
```

---

## Phase 2: UI Components (Week 2) - ~4 hours

### Step 4: Extract Button Handlers (1.5 hours)
- [ ] Create `assets/js/ui/components/buttons.js`
- [ ] Move button handler setup code (lines 2100-2250 from app.js)
- [ ] Create `window.ButtonHandlers` namespace
- [ ] Methods:
  - [ ] `setupLoadSaved()`
  - [ ] `setupSaveDraft()`
  - [ ] `setupDownloadPDF()`
  - [ ] `setupSubmitReview()`
  - [ ] `setupClearForm()`
  - [ ] `setupLogout()`
- [ ] Update `app.js` to call handlers
- [ ] Test: All buttons work
- [ ] Commit: "refactor: Extract button handlers to component module"

**Files affected:**
```
+ assets/js/ui/components/buttons.js
~ assets/js/app.js (move handlers, add calls)
```

**Sample Code:**
```javascript
// assets/js/ui/components/buttons.js
window.ButtonHandlers = {
  setupLoadSaved: () => {
    const btn = document.getElementById('load-last-saved-btn');
    if (btn) {
      btn.onclick = async () => {
        // existing code here
      };
    }
  },
  // ... other handlers
};

// In app.js DOMContentLoaded:
ButtonHandlers.setupLoadSaved();
ButtonHandlers.setupSaveDraft();
// etc.
```

---

### Step 5: Extract Dynamic Form Elements (1.5 hours)
- [ ] Create `assets/js/ui/components/form-inputs.js`
- [ ] Move all `window.add*` functions
- [ ] Consolidate into `window.DynamicFormItems`
- [ ] Methods:
  - [ ] `addChallenge()`
  - [ ] `addLastYearGoal()`
  - [ ] `addPDUndertaken()`
  - [ ] `addPDNeeded()`
  - [ ] `addFutureGoal()`
  - [ ] `addBoardRequest()`
  - [ ] `removeItem(element)`
- [ ] Update HTML onclick handlers to reference new functions
- [ ] Test: All add/remove buttons work
- [ ] Commit: "refactor: Extract dynamic form components"

**Files affected:**
```
+ assets/js/ui/components/form-inputs.js
~ assets/js/app.js (remove functions)
~ index.html (update onclick attributes)
```

**Sample Update in HTML:**
```html
<!-- BEFORE -->
<button onclick="addChallenge()">+ Add Challenge</button>

<!-- AFTER -->
<button onclick="DynamicFormItems.addChallenge()">+ Add Challenge</button>
```

---

### Step 6: Extract PDF Generator (1 hour)
- [ ] Create `assets/js/services/pdf-generator.js`
- [ ] Move `generatePDF()` function
- [ ] Create `window.PDFGenerator` with:
  - [ ] `generate(formData)` - returns PDF object
  - [ ] `download(pdf, filename)` - triggers download
  - [ ] `email(pdf, recipientEmail)` - for future use
- [ ] Update button handler to use new service
- [ ] Test: PDF download works with all parts
- [ ] Commit: "refactor: Extract PDF generation to service module"

**Files affected:**
```
+ assets/js/services/pdf-generator.js
~ assets/js/app.js (update button handler)
```

**Sample Code:**
```javascript
// assets/js/services/pdf-generator.js
window.PDFGenerator = {
  generate: async (formData) => {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) throw new Error('PDF library not loaded');
    
    const doc = new jsPDF();
    // ... PDF generation logic
    return doc;
  },
  
  download: (doc, filename) => {
    doc.save(filename);
  }
};

// In button handler:
const doc = await PDFGenerator.generate(collectFormData());
PDFGenerator.download(doc, 'review.pdf');
```

---

### Step 7: Create Firebase Service Wrapper (1 hour)
- [ ] Create `assets/js/services/firebase-wrapper.js`
- [ ] Create `window.ReviewService` with:
  - [ ] `submit(uid, formData)`
  - [ ] `saveDraft(uid, formData)`
  - [ ] `loadDraft(uid)`
  - [ ] `getSubmissions()` - for admin dashboard
- [ ] Handle data transformation (structured ↔ flat)
- [ ] Update button handlers to use new service
- [ ] Update admin.js if needed
- [ ] Test: All submission flows work
- [ ] Commit: "refactor: Extract Firebase operations to service layer"

**Files affected:**
```
+ assets/js/services/firebase-wrapper.js
~ assets/js/app.js (update handlers)
~ assets/js/admin.js (update calls)
```

**Sample Code:**
```javascript
// assets/js/services/firebase-wrapper.js
window.ReviewService = {
  submit: async (uid, formData) => {
    const flatData = FormUtils.flatten(formData);
    try {
      const result = await window.firebaseHelpers.saveReview(
        uid, 
        flatData, 
        'submitted'
      );
      console.log('Review submitted:', result);
      return result;
    } catch (error) {
      console.error('Submission failed:', error);
      throw new Error(`Failed to submit: ${error.message}`);
    }
  },
  // ... other methods
};

// In button handler:
await ReviewService.submit(user.uid, collectFormData());
```

---

## Phase 3: Testing (Week 3) - ~5 hours

### Step 8: Write Unit Tests (3 hours)

#### Test file: `tests/unit/forms.test.js`
- [ ] Setup test framework (Jest or Vitest)
- [ ] Test `FormUtils.collect()`
  - [ ] Returns correct structure
  - [ ] Handles empty fields
  - [ ] Collects all form sections
- [ ] Test `FormUtils.flatten()`
  - [ ] Converts structured to flat
  - [ ] Preserves all data
- [ ] Test `FormUtils.populate()`
  - [ ] Fills form correctly
  - [ ] Handles missing fields gracefully
- [ ] Test `FormUtils.serialize()` / `deserialize()`

**Sample Test:**
```javascript
describe('FormUtils.collect', () => {
  let form;
  
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="reviewForm">
        <textarea id="successes">Test success</textarea>
        <textarea id="not-well">Test challenge</textarea>
      </form>
    `;
    form = document.getElementById('reviewForm');
  });
  
  test('collects successes field', () => {
    const data = FormUtils.collect(form);
    expect(data['part-1'].successes).toBe('Test success');
  });
  
  test('collects not-well field', () => {
    const data = FormUtils.collect(form);
    expect(data['part-1']['not-well']).toBe('Test challenge');
  });
});
```

---

#### Test file: `tests/unit/constants.test.js`
- [ ] All constants are defined
- [ ] Constants are not empty
- [ ] Constant values are valid

**Sample Test:**
```javascript
describe('ReviewConstants', () => {
  test('KPI_CATEGORIES is defined', () => {
    expect(window.ReviewConstants.KPI_CATEGORIES).toBeDefined();
  });
  
  test('KPI_CATEGORIES has all required keys', () => {
    const required = ['communication', 'leadership', 'financial', ...];
    required.forEach(key => {
      expect(window.ReviewConstants.KPI_CATEGORIES[key]).toBeDefined();
    });
  });
});
```

---

### Step 9: Write Integration Tests (2 hours)

#### Test file: `tests/integration/submission-flow.test.js`
- [ ] Test complete save → load → submit cycle
- [ ] Mock Firebase calls
- [ ] Verify data integrity through transformations

**Sample Test:**
```javascript
describe('Submission Flow', () => {
  test('can save and load draft', async () => {
    // Setup
    const form = setupMockForm();
    const originalData = FormUtils.collect(form);
    
    // Save
    const flatData = FormUtils.flatten(originalData);
    mockDatabase.save(flatData);
    
    // Load
    const loadedFlat = mockDatabase.load();
    FormUtils.populate(form, loadedFlat);
    
    // Verify
    const reloadedData = FormUtils.collect(form);
    expect(reloadedData).toEqual(originalData);
  });
});
```

---

### Step 10: E2E Tests with Playwright (3 hours, optional)

#### Test file: `tests/e2e/user-review.spec.js`
- [ ] User can load test data
- [ ] User can fill form
- [ ] User can save draft
- [ ] User can submit review
- [ ] Submission appears in Firestore

**Sample Test:**
```javascript
import { test, expect } from '@playwright/test';

test('User can submit CEO review', async ({ page }) => {
  // Navigate & login
  await page.goto('/');
  await page.fill('#login-email', 'test@example.com');
  await page.fill('#login-password', 'password');
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
  
  // Load test data
  await page.click('#populate-test-data-btn');
  await page.click('button:has-text("Continue")'); // confirm dialog
  
  // Submit
  await page.click('button[type="submit"]:has-text("Submit")');
  
  // Verify success message
  const message = await page.locator('.success-message').textContent();
  expect(message).toContain('submitted successfully');
});
```

---

## Phase 4: Documentation & Cleanup (Week 4) - ~4 hours

### Step 11: Add JSDoc Comments (2 hours)
- [ ] Add JSDoc to all public functions
- [ ] Example for `forms.js`:

```javascript
/**
 * FormUtils - Handles all form data operations
 * @namespace FormUtils
 */
window.FormUtils = {
  /**
   * Collect all form data into structured format
   * @param {HTMLFormElement} formElement - The form to collect from
   * @returns {Object} Structured data { 'part-1': {...}, 'part-2': {...}, ... }
   * @example
   * const data = FormUtils.collect(document.getElementById('reviewForm'));
   */
  collect: (formElement) => { /* ... */ },
  
  /**
   * Populate form from previously saved data
   * @param {HTMLFormElement} formElement - The form to populate
   * @param {Object} sections - Data in structured format
   * @returns {void}
   * @throws {Error} If form element not found
   */
  populate: (formElement, sections) => { /* ... */ },
  // ... more functions
};
```

---

### Step 12: Create Module Documentation (1.5 hours)

#### Create: `docs/modules/forms.md`
```markdown
# FormUtils Module

## Purpose
Handles all CEO review form data operations: collection, population, validation, and serialization.

## Public API

### `collect(formElement)`
Extracts all form data into structured format.

**Parameters:**
- `formElement` (HTMLFormElement) - The form to collect from

**Returns:**
```javascript
{
  'part-1': { successes: '...', 'not-well': '...', challenges: [...] },
  'part-2': { lastYearGoals: [...], kpis: [...] },
  // ... other parts
}
```

**Example:**
```javascript
const data = FormUtils.collect(document.getElementById('reviewForm'));
console.log(data['part-1'].successes);
```

### `populate(formElement, sections)`
Fills form fields from previously saved data.

## Usage Examples
...

## Tests
See `tests/unit/forms.test.js`

## Dependencies
- FormUtils depends on: (none - pure functions)
- Components depending on FormUtils: ButtonHandlers, ReviewService
```

#### Create similar docs for:
- [ ] `docs/modules/buttons.md`
- [ ] `docs/modules/pdf-generator.md`
- [ ] `docs/modules/firebase-wrapper.md`
- [ ] `docs/modules/constants.md`

---

### Step 13: Create Architecture Guide (1.5 hours)
- [ ] Update `ARCHITECTURE.md` with actual structure
- [ ] Add deployment notes
- [ ] Add troubleshooting guide

---

## Deployment Checklist

After each phase, verify:

### Code Quality
- [ ] No console errors
- [ ] No console warnings
- [ ] ESLint passes (if configured)
- [ ] All functions properly defined

### Functionality
- [ ] All buttons work
- [ ] Form submission works
- [ ] PDF generation works
- [ ] Admin dashboard works
- [ ] Test data loads correctly

### Performance
- [ ] Page loads in < 3 seconds
- [ ] Form interactions responsive
- [ ] No memory leaks

### Testing
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Manual E2E testing completed

---

## Rollback Plan

If anything breaks, revert with:

```bash
# Revert to previous commit
git revert <commit-hash>
firebase deploy --only hosting

# Or check out previous version
git checkout HEAD~1
firebase deploy --only hosting
```

---

## Success Criteria

✅ Completion checklist:

- [ ] All files extracted as planned
- [ ] All tests pass
- [ ] All buttons work
- [ ] All documentation complete
- [ ] Code size reduced by 40%+
- [ ] No new console errors/warnings
- [ ] Deployment successful
- [ ] Admin dashboard still functions
- [ ] Performance maintained or improved

---

## Time Estimate

| Phase | Task | Duration | Total |
|-------|------|----------|-------|
| 1 | Extract Constants | 0.5h | 0.5h |
| 1 | Extract Forms | 2h | 2.5h |
| 1 | Test & Update | 1h | 3.5h |
| 2 | Extract Buttons | 1.5h | 5h |
| 2 | Extract Form Items | 1.5h | 6.5h |
| 2 | Extract PDF | 1h | 7.5h |
| 2 | Extract Firebase | 1h | 8.5h |
| 3 | Unit Tests | 3h | 11.5h |
| 3 | Integration Tests | 2h | 13.5h |
| 3 | E2E Tests | 3h | 16.5h |
| 4 | JSDoc | 2h | 18.5h |
| 4 | Documentation | 1.5h | 20h |
| 4 | Cleanup | 1.5h | 21.5h |

**Total: ~21.5 hours** (or ~5-6 days of focused work)

---

## Quick Wins (Do First)

If you only have time for a few tasks:

1. **Extract Constants** (30 min) - Huge impact, no risk
2. **Extract Forms** (2 hours) - Reusable, testable
3. **Add JSDoc** (2 hours) - Documentation, no code changes

This gives you 40% of the benefits in 30% of the time!
