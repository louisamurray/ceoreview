# Architecture Overview

## Current Architecture (Monolithic)

```
┌─────────────────────────────────────────┐
│         User Interface                  │
│  (HTML: index.html, admin.html)        │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
   ┌───▼────┐      ┌───▼────┐
   │ app.js │      │admin.js │
   │ 2,638L │      │ 2,257L  │
   └────┬───┘      └────┬────┘
        │               │
        └───────┬───────┘
                │
        ┌───────▼────────┐
        │  firebase.js   │
        │    598L        │
        └────────────────┘
                │
        ┌───────▼────────┐
        │   Firebase     │
        │   Firestore    │
        └────────────────┘

❌ Problems:
- Tightly coupled concerns
- Difficult to test
- Hard to maintain
- Code duplication
- Large monolithic files
```

## Proposed Architecture (Modular)

```
┌─────────────────────────────────────────────────┐
│              UI Layer                           │
│  ┌──────────────────────────────────────────┐  │
│  │  HTML Templates                          │  │
│  │  (index.html, admin.html, modals.html)   │  │
│  └──────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────┘
                     │
      ┌──────────────┼──────────────┐
      │              │              │
   ┌──▼────┐    ┌───▼────┐    ┌──▼─────┐
   │ Main  │    │ Admin  │    │ Shared │
   │ App   │    │ Page   │    │ Utils  │
   │ 800L  │    │ 1,200L │    │ 300L   │
   └──┬────┘    └───┬────┘    └──┬─────┘
      │             │            │
      └─────────────┼────────────┘
                    │
        ┌───────────▼──────────────┐
        │    Component Layer       │
        │  ┌────────────────────┐  │
        │  │ • Form Inputs      │  │
        │  │ • Buttons          │  │
        │  │ • Modals           │  │
        │  │ • Sections         │  │
        │  └────────────────────┘  │
        └───────────┬──────────────┘
                    │
        ┌───────────▼──────────────┐
        │    State Management      │
        │  ┌────────────────────┐  │
        │  │ • Form State       │  │
        │  │ • User State       │  │
        │  │ • UI State         │  │
        │  └────────────────────┘  │
        └───────────┬──────────────┘
                    │
        ┌───────────▼──────────────────┐
        │    Business Logic            │
        │  ┌──────────────────────┐    │
        │  │ • Form Utils         │    │
        │  │ • Data Validation    │    │
        │  │ • Serialization      │    │
        │  │ • Review Engine      │    │
        │  │ • Constants          │    │
        │  └──────────────────────┘    │
        └───────────┬──────────────────┘
                    │
        ┌───────────▼─────────────────┐
        │    Service Layer            │
        │  ┌────────────────────────┐ │
        │  │ • Firebase Service     │ │
        │  │ • Analytics Service    │ │
        │  │ • PDF Generator        │ │
        │  │ • Email Notifications  │ │
        │  └────────────────────────┘ │
        └───────────┬─────────────────┘
                    │
        ┌───────────▼────────────┐
        │  External APIs         │
        │  ┌────────────────┐    │
        │  │ • Firebase     │    │
        │  │ • Firestore    │    │
        │  │ • jsPDF        │    │
        │  │ • Chart.js     │    │
        │  └────────────────┘    │
        └────────────────────────┘

✅ Benefits:
- Clear separation of concerns
- Easy to test each layer
- Reusable components
- Simple to maintain
- Good for scaling
```

## Module Dependencies

```
┌──────────────────────────────────────────────────────────────────────┐
│                    UI Components                                      │
│  ┌─────────────────┬──────────────┬─────────────┐                   │
│  │ Form Inputs    │ Buttons      │ Modals      │                   │
│  │ • add*         │ • onClick    │ • show/hide │                   │
│  │ • remove       │ • handlers   │ • submit    │                   │
│  └────────┬────────┴──────┬───────┴──────┬──────┘                   │
└───────────┼────────────────┼──────────────┼──────────────────────────┘
            │                │              │
            ▼                ▼              ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     State Management                                 │
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────────────┐ │
│  │ Form State     │  │ User State     │  │ UI State              │ │
│  │ • data         │  │ • currentUser  │  │ • isCollapsed         │ │
│  │ • dirty        │  │ • role         │  │ • activeTab           │ │
│  │ • errors       │  │ • permissions  │  │ • selectedSection     │ │
│  └────────────────┘  └────────────────┘  └───────────────────────┘ │
└──────────────┬─────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────────┐
│               Core Business Logic                                    │
│                                                                      │
│  ┌────────────────┐  ┌──────────────────┐  ┌──────────────────────┐ │
│  │ Forms Utils    │  │ Review Engine    │  │ Constants            │ │
│  │ • collect      │  │ • calculateKPIs  │  │ • KPI_CATEGORIES     │ │
│  │ • populate     │  │ • validateRoles  │  │ • SECTION_TITLES     │ │
│  │ • serialize    │  │ • computeScore   │  │ • USER_ROLES         │ │
│  │ • validate     │  │                  │  │                      │ │
│  └────────────────┘  └──────────────────┘  └──────────────────────┘ │
└──────────────┬─────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                 Service Layer                                        │
│                                                                      │
│  ┌──────────────────┐  ┌─────────────────┐  ┌──────────────────────┐│
│  │ Firebase Service │  │ PDF Generator   │  │ Analytics Service   ││
│  │ • submitReview   │  │ • generate      │  │ • track             ││
│  │ • loadDraft      │  │ • download      │  │ • report            ││
│  │ • saveDraft      │  │ • email         │  │                     ││
│  │ • deleteReview   │  │                 │  │                     ││
│  └──────────────────┘  └─────────────────┘  └──────────────────────┘│
└──────────────┬─────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────────┐
│            External APIs / Libraries                                 │
│                                                                      │
│  Firebase (Auth, Firestore, Storage) | jsPDF | Chart.js | ...      │
└──────────────────────────────────────────────────────────────────────┘

Legend:
─────────  Imports / Dependencies
```

## Data Flow Diagram

### Submission Flow

```
User fills form
       │
       ▼
  ┌─────────────────────────────┐
  │ Click "Submit Review"       │
  │ (Button Handler)            │
  └────────────┬────────────────┘
               │
               ▼
  ┌────────────────────────────────────┐
  │ FormUtils.collect()                │
  │ (Extract all form data)            │
  │ Returns: { part-1: {...}, ... }    │
  └────────────┬──────────────────────┘
               │
               ▼
  ┌────────────────────────────────────┐
  │ FormUtils.flatten()                │
  │ (Convert structured → flat)        │
  │ Returns: { field1: value1, ... }   │
  └────────────┬──────────────────────┘
               │
               ▼
  ┌────────────────────────────────────┐
  │ ReviewService.submit()             │
  │ (Business logic wrapper)           │
  └────────────┬──────────────────────┘
               │
               ▼
  ┌────────────────────────────────────┐
  │ FirebaseService.saveReview()       │
  │ (Low-level Firebase call)          │
  │ saveReview(uid, data, 'submitted') │
  └────────────┬──────────────────────┘
               │
               ▼
  ┌────────────────────────────────────┐
  │ Firestore Collection               │
  │ /submissions/{userId}              │
  │ { metadata, sections, completion } │
  └────────────┬──────────────────────┘
               │
               ▼
        ✅ Success
        alert('Submitted!')
```

### Load Draft Flow

```
User clicks "Load Saved"
       │
       ▼
  ┌─────────────────────────────┐
  │ Button Handler              │
  └────────────┬────────────────┘
               │
               ▼
  ┌──────────────────────────────────────────┐
  │ ReviewService.loadDraft(user.uid)        │
  └────────────┬─────────────────────────────┘
               │
               ▼
  ┌──────────────────────────────────────────┐
  │ FirebaseService.loadReview()             │
  │ Get from /drafts/{userId}                │
  │ Returns: { sections: {...}, metadata }   │
  └────────────┬─────────────────────────────┘
               │
               ▼
  ┌──────────────────────────────────────────┐
  │ FormUtils.deserialize()                  │
  │ (Prepare for form population)            │
  └────────────┬─────────────────────────────┘
               │
               ▼
  ┌──────────────────────────────────────────┐
  │ FormUtils.populate(form, data)           │
  │ (Fill all form fields)                   │
  └────────────┬─────────────────────────────┘
               │
               ▼
        ✅ Success
        Form populated with saved data
```

## Testing Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                     Test Pyramid                                   │
└────────────────────────────────────────────────────────────────────┘

                             ▲
                            /  \
                           /    \
                          / E2E  \
                         / Tests  \     (Few, Slow, High Value)
                        /          \
                       /            \
                      /──────────────\
                     /   Integration  \    (Some, Medium Speed)
                    / Tests & Fixtures \
                   /                    \
                  /──────────────────────\
                 / Unit Tests for Core   \  (Many, Fast, Low Cost)
                /                        \
               /──────────────────────────\

Unit Tests (Focus Here First):
├── tests/unit/forms.test.js
│   ├── collect() correctly extracts all fields
│   ├── flatten() transforms structured to flat
│   ├── populate() fills form correctly
│   └── validate() checks required fields
│
├── tests/unit/review-engine.test.js
│   ├── calculateCompletion() 
│   ├── validateFormData()
│   └── calculateKPIAverages()
│
└── tests/unit/constants.test.js
    └── All constants are defined and valid

Integration Tests:
├── tests/integration/firebase.test.js
│   ├── Can connect to Firebase
│   └── Can read/write to Firestore
│
└── tests/integration/review-submission.test.js
    ├── End-to-end save/load cycle
    └── Database state is correct

E2E Tests (Later):
├── tests/e2e/admin-dashboard.spec.js
│   ├── Admin can view all submissions
│   └── Admin can export data
│
└── tests/e2e/user-review-flow.spec.js
    ├── User can submit review
    ├── Submission appears in admin
    └── User can download PDF
```

## Git Commit Strategy

```
commit: Extract constants from app.js
├── files:
│   ├── + assets/js/core/constants.js (new file)
│   └── ~ assets/js/app.js (removed constants)
└── LOC changed: +50, -100 (net -50)

commit: Extract form utilities
├── files:
│   ├── + assets/js/core/forms.js (new file)
│   ├── + tests/unit/forms.test.js (new file)
│   └── ~ assets/js/app.js (removed utilities)
└── LOC changed: +200, -400 (net -200)

commit: Extract button handlers
├── files:
│   ├── + assets/js/ui/components/buttons.js (new file)
│   └── ~ assets/js/app.js (removed handlers)
└── LOC changed: +150, -200 (net -50)

[Continue for each phase...]

Final state:
- 50+ small, focused commits
- Each commit is atomic and testable
- History is clear and maintainable
```

## Performance Optimization Path

```
Phase 1: Modularize (no performance impact)
├── Extract modules (as above)
└── All files still loaded together

Phase 2: Lazy Load Components (10-15% faster)
├── Split UI components into separate files
├── Load on demand (admin dashboard ≠ main app)
└── Use dynamic imports

Phase 3: Bundle & Minify (20-30% faster)
├── Webpack/Vite for bundling
├── Tree-shake unused code
├── Minify & gzip
└── 1 main bundle instead of 4 files

Phase 4: Cache Strategy (50-70% faster on reload)
├── Service Worker for offline support
├── Cache busting with content hashing
├── CDN distribution
└── Lazy load large PDFs/exports

Result: Load time improvements
Before: 2.5s (all files + parsing)
After Phase 1: 2.5s (same, but organized)
After Phase 2: 2.1s (lazy loading)
After Phase 3: 1.8s (bundling)
After Phase 4: 0.4s (from cache)
```
