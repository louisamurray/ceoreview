# CEO Review Application - Architecture Guide

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Module Organization](#module-organization)
4. [Data Flow](#data-flow)
5. [Dependency Graph](#dependency-graph)
6. [Setup Instructions](#setup-instructions)
7. [Development Workflow](#development-workflow)
8. [Deployment Guide](#deployment-guide)
9. [Troubleshooting](#troubleshooting)
10. [Performance Considerations](#performance-considerations)

---

## Overview

The CEO Review Application is a modular, client-side web application built with vanilla JavaScript, Tailwind CSS, and Firebase. It allows CEOs to conduct annual self-reviews with multiple sections, data persistence, PDF export, and previous review context.

### Key Characteristics

- **Modular Architecture**: 13+ focused modules with clear responsibilities
- **No Build Step**: Direct script loading with defer attributes
- **Namespace Pattern**: All modules export to `window.ModuleName` for backwards compatibility
- **Progressive Enhancement**: Works with or without each module
- **Firebase Integration**: Real-time data sync, authentication, and hosting

### Refactoring Milestones

| Phase | Scope | Result |
|-------|-------|--------|
| **Phase 1** | Extract constants & forms | 2,639 → 2,210 lines (-16%) |
| **Phase 2** | Extract UI & services | 2,210 → 1,560 lines (-29%) |
| **Phase 3** | Extract helpers & utilities | 1,560 → 260 lines (-83%) |
| **Phase 4** | Documentation & cleanup | ← Current |

---

## Project Structure

```
ceoreview/
├── assets/
│   ├── css/
│   │   ├── print.css           # Print stylesheet
│   │   └── styles.css          # Main stylesheet
│   └── js/
│       ├── core/
│       │   ├── constants.js     # Config, schemas, messages (147L)
│       │   ├── formatters.js    # Data formatting (172L)
│       │   └── forms.js         # Form operations (446L)
│       ├── ui/
│       │   ├── components/
│       │   │   ├── buttons.js   # Button handlers (376L)
│       │   │   └── form-inputs.js  # Dynamic forms (215L)
│       │   └── helpers/
│       │       ├── navigation.js   # Section nav (190L)
│       │       ├── modals.js       # Modal management (135L)
│       │       ├── autosave.js     # Autosave & textarea (165L)
│       │       └── auth-ui.js      # Auth handlers (50L)
│       ├── services/
│       │   ├── firebase.js       # Firebase helpers
│       │   ├── pdf-generator.js  # PDF export (182L)
│       │   ├── previous-review.js # Review context (160L)
│       │   └── export-csv.js     # CSV export (120L)
│       └── app.js               # Main orchestrator (260L)
├── docs/
│   ├── ARCHITECTURE.md          # This file
│   ├── DEVELOPMENT.md           # Dev guide
│   ├── modules/                 # Module documentation
│   │   ├── constants.md
│   │   ├── formatters.md
│   │   ├── navigation.md
│   │   └── ...
│   └── API.md                   # Public API reference
├── tests/
│   ├── e2e/
│   │   └── sample.e2e.spec.js
│   ├── unit/
│   │   └── sample.test.js
│   └── sample.lint.test.js
├── index.html                   # Main application
├── admin.html                   # Admin dashboard
├── firebase.json                # Firebase config
├── package.json                 # Dependencies
├── jest.config.js               # Test config
├── playwright.config.js         # E2E test config
├── eslint.config.mjs            # Linter config
└── README.md                    # Project README
```

---

## Module Organization

### Core Modules (2 files, 593 lines)

**`core/constants.js`** (147L)
- Configuration and enums
- Field schemas
- Messages and labels
- Empty state text
- No dependencies

**`core/formatters.js`** (172L)
- Data formatting functions
- HTML escaping and text processing
- List rendering for previous reviews
- No external dependencies

**`core/forms.js`** (446L)
- Form data collection and population
- Dynamic item handling
- Data transformation
- Depends on: constants

### UI Components (2 files, 591 lines)

**`ui/components/buttons.js`** (376L)
- Click handlers for all action buttons
- Form submission workflows
- Data validation before submit
- Depends on: forms, constants, services

**`ui/components/form-inputs.js`** (215L)
- Add/remove dynamic form elements
- Challenge, goal, PD entry management
- HTML generation for new items
- Depends on: constants

### UI Helpers (4 files, 540 lines)

**`ui/helpers/navigation.js`** (190L)
- Section navigation and collapsibles
- Progress tracking and indicators
- Smooth scrolling
- Debounce utility
- No dependencies

**`ui/helpers/modals.js`** (135L)
- Modal open/close logic
- Keyboard focus trapping
- Login, signup, reset modals
- Depends on: None

**`ui/helpers/autosave.js`** (165L)
- Automatic form saving
- Autosave indicator UI
- Textarea enhancement (word count, toolbar)
- Depends on: forms, navigation (debounce)

**`ui/helpers/auth-ui.js`** (50L)
- Login/logout button handlers
- Admin UI visibility control
- Auth state display
- Depends on: modals, auth

### Services (3 files, 462 lines)

**`services/pdf-generator.js`** (182L)
- PDF document generation
- Multi-page formatting
- Download triggering
- Depends on: jsPDF library

**`services/previous-review.js`** (160L)
- Load previous year's review
- Render in-context for reference
- Field comparison and highlights
- Depends on: formatters, constants, forms

**`services/export-csv.js`** (120L)
- CSV data formatting
- CSV string generation
- Download triggering
- Depends on: constants

### Application Orchestrator (1 file, 260 lines)

**`app.js`** (260L)
- Main event listeners
- Component initialization
- Form rendering (KPI, JD, Strategic cards)
- DOMContentLoaded coordination
- Depends on: Most other modules

---

## Data Flow

### User Journey: Complete a Review

```
1. Page Load
   ├─ HTML renders
   ├─ Scripts load (defer)
   └─ DOMContentLoaded fires
   
2. Initialization (app.js)
   ├─ setupCollapsibles() → navigation.js
   ├─ setupSectionNav() → navigation.js
   ├─ setupInfoDots() → navigation.js
   ├─ ButtonHandlers.setupAll() → buttons.js
   ├─ attachLoginLogoutHandlers() → auth-ui.js
   ├─ Render KPI/JD/Strategic cards
   └─ enhanceAllTextareas() → autosave.js

3. User Fills Form
   ├─ Input events trigger
   ├─ Autosave debounced (1200ms) → autosave.js
   ├─ Progress updates → navigation.js
   └─ Data saved to Firestore (async)

4. User Clicks "Save Draft"
   ├─ collectFormData() → forms.js
   ├─ saveDraft() → firebase.js
   ├─ Success message shown
   └─ Autosave timestamp updated

5. User Clicks "Submit"
   ├─ Validation check → constants.js
   ├─ collectFormData() → forms.js
   ├─ flattenData() → forms.js
   ├─ Submit to Firestore → firebase.js
   ├─ Success notification
   └─ Redirect to thank you page

6. User Generates PDF
   ├─ collectFormData() → forms.js
   ├─ formatData() → formatters.js
   ├─ generatePDF() → pdf-generator.js
   └─ Download triggered
```

### Data Transformation Flow

```
HTML Form
    ↓
collectFormData()  [forms.js]
    ↓ (structured format)
{ 'part-1': {...}, 'part-2': {...}, ... }
    ↓
flattenData()  [forms.js]
    ↓ (flat format for storage)
{ field1: value1, field2: value2, ... }
    ↓
Firestore
    ↓ (on load)
Structured format reconstructed [forms.js]
    ↓
populateForm()  [forms.js]
    ↓
HTML Form rendered with data
```

---

## Dependency Graph

### Minimal Dependency Version (Load Order)

```
1. firebase.js                    (Auth, Firestore provider)
2. core/constants.js              (Config data)
3. core/formatters.js             (Data formatting)
4. core/forms.js                  (Form operations)
5. ui/components/buttons.js       (Button handlers)
6. ui/components/form-inputs.js   (Dynamic form items)
7. ui/helpers/navigation.js       (Navigation helpers)
8. ui/helpers/modals.js           (Modal management)
9. ui/helpers/autosave.js         (Autosave)
10. ui/helpers/auth-ui.js         (Auth UI)
11. services/pdf-generator.js     (PDF export)
12. services/previous-review.js   (Previous context)
13. services/export-csv.js        (CSV export)
14. app.js                        (Orchestrator - depends on all)
```

### Critical Dependencies

```
app.js
├─ forms.js
│  └─ constants.js
├─ navigation.js (no deps)
├─ buttons.js
│  ├─ forms.js
│  └─ constants.js
├─ modals.js (no deps)
├─ autosave.js
│  ├─ forms.js
│  └─ navigation.js (debounce)
├─ pdf-generator.js
│  └─ forms.js
├─ previous-review.js
│  ├─ formatters.js
│  ├─ forms.js
│  └─ constants.js
└─ export-csv.js (no deps)

Legend:
─ → direct dependency
└─ → optional/conditional
```

---

## Setup Instructions

### Local Development

#### Prerequisites
- Node.js v14+ (for Firebase CLI and testing)
- Firebase account with project created
- Web browser with DevTools

#### Installation

```bash
# Clone repository
git clone <repo-url>
cd ceoreview

# Install dependencies
npm install

# Install Firebase CLI globally
npm install -g firebase-tools
```

#### Configuration

```bash
# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Select: Hosting, Firestore, Auth
# Use existing project: studio-8276146072-e2bec
# Set public directory: . (current)
```

#### Running Locally

```bash
# Option 1: Simple HTTP server (no Firebase emulation)
python3 -m http.server 8000
# Visit: http://localhost:8000

# Option 2: Firebase emulator suite (full local dev)
firebase emulators:start
# Visit: http://localhost:5000

# Option 3: VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

#### Testing Locally

```bash
# Run unit tests
npm test

# Run E2E tests with Playwright
npx playwright test

# Run ESLint
npx eslint assets/js/**/*.js

# Check all tests
npm run test:all
```

---

## Development Workflow

### Adding a New Feature

1. **Create feature branch**
   ```bash
   git checkout -b feature/new-feature-name
   ```

2. **Implement changes**
   - Add to appropriate module
   - Follow existing namespace pattern
   - Add backwards-compatible exports

3. **Write tests**
   - Unit tests in `tests/unit/`
   - E2E tests in `tests/e2e/`
   - Target > 80% coverage

4. **Document changes**
   - Update module JSDoc
   - Update `docs/modules/` if needed
   - Update README if public API changes

5. **Test thoroughly**
   ```bash
   npm test
   npx eslint assets/js/
   # Manual browser testing
   ```

6. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: Description of feature"
   git push origin feature/new-feature-name
   ```

7. **Deploy**
   ```bash
   npm run deploy
   ```

### Modifying Existing Modules

1. **Understand current behavior**
   - Read module documentation in `docs/modules/`
   - Check all modules depending on it
   - Review existing tests

2. **Make changes carefully**
   - Maintain backwards compatibility
   - Keep namespace pattern
   - Update JSDoc comments

3. **Update tests and docs**
   - Modify tests to match new behavior
   - Update module documentation
   - Add migration guide if breaking

4. **Test all dependents**
   - Run `npm test`
   - Manual browser test of affected features

### Adding a New Module

1. **Create file in appropriate directory**
   ```bash
   # For a new helper:
   touch assets/js/ui/helpers/my-helper.js
   ```

2. **Use namespace pattern**
   ```javascript
   window.MyHelper = {
     // Public API
     publicFunction: () => { ... },
     
     // Private helpers prefixed with _
     _privateHelper: () => { ... }
   };
   
   // Export legacy globals for HTML onclick if needed
   window.publicFunction = window.MyHelper.publicFunction;
   ```

3. **Add to load order in index.html**
   - Place before any modules that depend on it
   - Use `defer` attribute
   - Add comment explaining purpose

4. **Document in docs/modules/**
   ```bash
   touch docs/modules/my-helper.md
   # Follow format in existing module docs
   ```

5. **Update ARCHITECTURE.md**
   - Add to structure diagram
   - Update dependency graph
   - Update load order

---

## Deployment Guide

### Pre-Deployment Checklist

```bash
# Run all tests
npm run test:all

# Run linter
npx eslint assets/js/**/*.js

# Manual browser testing
# - Test all main workflows
# - Check console for errors
# - Test on mobile/tablet

# Check git status
git status
# Should be clean

# Review changes
git log --oneline -5
```

### Deployment Process

#### To Firebase Hosting

```bash
# Build (no build step needed - static files)
# Already done by git

# Deploy
firebase deploy --only hosting

# Verify
# Visit: https://studio-8276146072-e2bec.web.app
# Test all features
```

#### Production Verification

```bash
# Check deployment status
firebase hosting:channel:list

# View logs
firebase hosting:channel:logs main

# Rollback if needed
firebase hosting:release:list
firebase hosting:rollback [version-id]
```

### Monitoring

```bash
# View Firebase Analytics
firebase analytics:get

# Check Firestore quota usage
firebase firestore:get-stats

# Monitor real-time database (if used)
firebase functions:log
```

---

## Troubleshooting

### Common Issues

#### "Module not defined" console error

**Cause:** Script load order issue - module loaded after dependent module

**Solution:**
```javascript
// In index.html, check order. Example:
<script src="assets/js/core/constants.js" defer></script>
<script src="assets/js/core/forms.js" defer></script>  <!-- depends on constants -->
<script src="assets/js/app.js" defer></script>        <!-- depends on both -->
```

#### Form data not persisting

**Cause:** 
- Autosave disabled or not initialized
- Firebase rules blocking writes
- Network connectivity issue

**Debug:**
```javascript
// In console
window.lastCloudSaveTime        // Should show recent timestamp
window.firebaseHelpers.user     // Should show logged-in user
// Check Network tab in DevTools
```

#### PDF generation fails

**Cause:**
- jsPDF library not loaded
- Invalid form data
- Large document exceeds limits

**Solution:**
```html
<!-- Ensure jsPDF is loaded before pdf-generator.js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="assets/js/services/pdf-generator.js" defer></script>
```

#### Modal won't close

**Cause:**
- Focus trap not released
- Event listener not attached
- Modal ID mismatch

**Debug:**
```javascript
// In console
window.ModalManager.closeModal(document.getElementById('login-modal'))
// Or check event listeners
getEventListeners(document.getElementById('close-btn'))
```

#### Autosave not working

**Cause:**
- Firestore write permissions
- Form element not found
- Autosave module not initialized

**Debug:**
```javascript
// Check if setup was called
window.AutosaveManager._active  // Should be true

// Manual save attempt
window.firebaseHelpers.saveDraft(
  window.firebaseHelpers.user.uid,
  { test: true }
).catch(console.error)
```

### Performance Issues

#### Page loads slowly

**Check:**
```javascript
// In console, check script load timing
performance.measure('navigation')
performance.measure('resource-loading')

// Look for slow modules
performance.getEntriesByType('navigation')
performance.getEntriesByType('resource')
```

**Solutions:**
- Reduce form size
- Implement lazy loading
- Minimize autosave frequency
- Optimize PDF generation

#### High memory usage

**Debug:**
```javascript
// Check for memory leaks
performance.memory

// Look for un-released event listeners
getEventListeners(document)

// Check for circular references
// Look for modules creating new instances repeatedly
```

---

## Performance Considerations

### Optimization Strategies

#### 1. Script Loading

- ✅ **defer attribute**: All scripts use `defer` for non-blocking load
- ✅ **Load order**: Dependencies loaded before dependents
- ✅ **No bundling**: Single HTTP request per file acceptable at this scale

#### 2. Form Operations

- ✅ **Debouncing**: Autosave debounced 1200ms
- ✅ **Lazy rendering**: Dynamic items only rendered when needed
- ✅ **Event delegation**: Avoids attaching listeners to many elements

#### 3. Progress Tracking

- ⚠️ **Current**: Recalculates all sections on each change
- 🚀 **Improvement**: Could cache progress and only update changed section

#### 4. Data Persistence

- ✅ **Batched saves**: Autosave batches multiple changes
- ✅ **Async operations**: Firebase operations don't block UI
- ⚠️ **Current**: Saves entire form on each autosave
- 🚀 **Improvement**: Could implement delta/partial saves

### Benchmarks (Target)

| Metric | Target | Current |
|--------|--------|---------|
| Page load | < 3s | ~2.5s |
| Form interaction | < 100ms | ~50ms |
| Autosave | < 500ms | ~300ms |
| PDF generation | < 5s | ~3s |
| Memory (idle) | < 50MB | ~35MB |

### Future Optimization Ideas

1. **Lazy-load modules** - Only load admin features when needed
2. **Service Worker** - Offline support and caching
3. **Web Workers** - Move PDF generation off main thread
4. **Compression** - Gzip scripts for smaller downloads
5. **Code splitting** - Separate admin features into different bundle

---

## See Also

- [Development Guide](./DEVELOPMENT.md)
- [Module Documentation](./modules/)
- [API Reference](./API.md)
- [Firebase Setup](https://firebase.google.com/docs/web/setup)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-17 | Initial architecture documentation - Phase 4 |

