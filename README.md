# REAP Marlborough – CEO Self-Review

A comprehensive, cloud-enabled self-review application for the REAP Marlborough CEO. Features structured 7-part assessment with Firebase authentication, data persistence, professional PDF generation, and **comprehensive administrative oversight system**.

## 🚀 NEW: Advanced Admin System

The application now includes a **full governance oversight platform** with:
- **Dashboard Analytics** - Real-time metrics, charts, and KPI tracking
- **Review Management** - View, filter, search, and export all reviews
- **User & Access Control** - Role-based permissions and user management
- **Reports & Insights** - Board-ready analytics and year-over-year comparisons
- **System Configuration** - Settings, maintenance mode, and data backup
- **Comprehensive Audit Trail** - Full logging of all admin actions

### 🎯 Quick Setup for Admin System

**First-time setup requires database seeding:**

1. **Start the server:** `npm run serve`
2. **Seed the database:** Visit http://localhost:8080/seed.html
3. **Access admin panel:** Visit http://localhost:8080/admin.html

The admin system provides complete governance oversight with enterprise-grade security and comprehensive audit capabilities.

## Features
- **Structured 7‑part self‑review form** (Performance Reflection → Dialogue with Board)
- **Firebase Authentication** with secure user login/signup and password reset
- **Dual Data Persistence**: Cloud storage (Firebase Firestore) + local backup (localStorage)
- **Professional PDF Generation** using jsPDF with A4 formatting and clean styling
- **Test Data Population** for development and demonstration purposes
- **Admin Dashboard** for reviewing submitted assessments with CSV export
- **Dynamic Sections**: Repeatable challenges, goals, professional development, and board requests
- **KPI & Competency Ratings** with 5-point scale and descriptive tooltips
- **Strategic Priorities & Job Description Alignment** assessments
- **Responsive Design** using Tailwind CSS with accessible, professional UI
- **Previous Review Context** loading for year-over-year comparisons

## Tech Stack
- **Frontend**: HTML5 + Vanilla JavaScript (ES6+)
- **Styling**: Tailwind CSS via CDN + custom CSS
- **Authentication**: Firebase Auth (email/password)
- **Database**: Firebase Firestore (cloud) + localStorage (local backup)
- **File Storage**: Firebase Storage for CSV exports
- **PDF Generation**: jsPDF v2.5.1 + html2canvas v1.4.1
- **Testing**: Jest, Playwright E2E, ESLint
- **Development**: http-server for local hosting

## Quick Start

### For Development
1. **Install dependencies**: `npm install`
2. **Start local server**: `npm run serve` (serves on http://localhost:8080)
3. **Run tests**: `npm test` (Jest) or `npm run test:e2e` (Playwright)
4. **Lint code**: `npm run lint`

### For Users
1. **Sign Up/Login**: Create account or sign in with existing credentials
2. **Complete Review**: Fill out the 7-part structured assessment
3. **Save Progress**: Automatically saves to cloud + local backup on form changes
4. **Load Test Data**: Use 🧪 button to populate sample data for testing
5. **Generate PDF**: Use 📄 button to download professional PDF report
6. **Submit Review**: Final submission with timestamp and CSV export

### 🆕 For Administrators

**Initial Setup (Required Once):**
1. **Seed Database**: Visit `/seed.html` to initialize admin system
2. **Access Admin Panel**: Navigate to `/admin.html` 
3. **User Management**: Add board members and assign roles
4. **System Configuration**: Configure settings and backup procedures

**Admin Features:**
- **Dashboard**: Analytics, trends, and quick actions
- **Review Management**: View all submissions with filtering and search
- **User Control**: Role-based permissions (Admin/Board Reviewer/CEO)
- **Insights & Reports**: KPI analytics and board-ready summaries
- **Audit Logging**: Complete trail of all administrative actions
- **Data Export**: CSV, PDF, and bulk export capabilities

## 🗄️ Database Setup & Seeding

### Initial Database Seeding (Required)

The admin system requires initial database seeding to create essential collections:

**Automatic Seeding (Recommended):**
```bash
npm run serve                    # Start local server
# Visit http://localhost:8080/seed.html
# Click "Seed Database" button
```

**Manual Seeding (Advanced):**
```javascript
// In browser console with Firebase loaded
await checkIfSeeded();    // Check current status
await seedFirestore();    // Initialize database
```

**What Gets Created:**
- `system_settings` - Configuration and KPI categories
- `users` - Admin user (louisa@whiringa.com) with full permissions
- `analytics_cache` - Dashboard metrics storage
- `notifications` - System alerts and messages
- `audit_logs` - Security and compliance tracking

### Database Reset (Development Only)
```javascript
await resetDatabase();    // ⚠️ DESTRUCTIVE - Deletes all admin data
await seedFirestore();    // Recreate default setup
```

## Data Architecture

### Cloud Storage (Primary)
- **Firebase Firestore Collections**:
  - `drafts/{userId}`: Work-in-progress reviews
  - `submissions/{userId}`: Final submitted reviews  
  - `users/{userId}`: User roles, permissions, and authentication metadata
  - `system_settings/general`: Configuration, KPI categories, review templates
  - `analytics_cache/{year}`: Pre-computed dashboard metrics
  - `audit_logs/{logId}`: Comprehensive action logging
  - `notifications/{notifId}`: System alerts and messages
  - `exports/{exportId}`: Data export tracking
- **Firebase Storage**: CSV exports at `reviews/{userId}/{filename}`
- **Authentication**: Firebase Auth with email/password and role-based access

### Local Backup
- **localStorage key**: `ceoReviewFormData`
- **Structure**: 
  ```json
  {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "data": {
      "simple": { "successes": "...", "not-well": "..." },
      "repeaters": { "challenges": [...], "futureGoals": [...] },
      "kpis": [{"name": "...", "rating": 4, "comments": "..."}],
      "priorities": [...],
      "jdAlignment": [...]
    }
  }
  ```
- **Fallback**: Automatically uses local data when offline or cloud unavailable

## Configuration

### Review Content (assets/js/app.js)
```javascript
const kpis = [
  "Conflict Resolution",
  "Financial Resilience", 
  "Board–CEO Communication",
  "Values Alignment"
];

const strategicPriorities = [
  "Strengthen Iwi relationships",
  "Increase trusted relationships & social cohesion",
  "Contribute to intergenerational wellbeing",
  "Operate a positive & professional organisation"
];

const jdAreas = [
  "Strategic Leadership",
  "People & Resources", 
  "Partnerships",
  "Growth Opportunities",
  "Accountability",
  "Team & Culture"
];
```

### Firebase Configuration (assets/js/firebase.js)
- Update `firebaseConfig` object with your Firebase project credentials
- Ensure Firestore security rules allow authenticated read/write
- Configure Firebase Storage for CSV file uploads

### Admin Access (admin.html)
```javascript
window.ADMIN_EMAIL_WHITELIST = ['admin@example.com'];
```

## Key Features Implemented

### PDF Generation
- **Professional Layout**: A4 format with proper margins and typography
- **Clean Export**: Navigation and UI elements excluded from PDF
- **Text Sanitization**: Removes stray characters and formatting artifacts
- **Preview Available**: View PDF content before download

### Authentication & Security
- **Email/Password Auth**: Secure Firebase authentication
- **Role-Based Access**: Admin dashboard with email whitelist
- **Password Reset**: Built-in password recovery system
- **Session Management**: Automatic login state handling

### Development Features
- **Test Data Population**: One-click sample data loading
- **Comprehensive Testing**: Jest unit tests + Playwright E2E
- **Error Handling**: Graceful fallbacks and user feedback
- **Development Server**: Hot reload with http-server

## Project Structure
```
├── index.html              # Main application interface
├── admin.html              # Admin dashboard for reviewing submissions  
├── package.json            # Dependencies and scripts
├── jest.config.js          # Jest testing configuration
├── playwright.config.js    # Playwright E2E test configuration
├── eslint.config.mjs       # ESLint configuration
├── assets/
│   ├── css/
│   │   ├── styles.css      # Custom styling, animations, tooltips
│   │   └── print.css       # Print-specific styles (legacy)
│   └── js/
│       ├── app.js          # Main application logic (2600+ lines)
│       ├── firebase.js     # Firebase configuration and helpers
│       └── admin.js        # Admin dashboard functionality
├── tests/
│   ├── sample.e2e.spec.js  # End-to-end tests
│   ├── sample.lint.test.js # Linting tests
│   └── ui.helpers.test.js  # UI component tests
├── e2e/
│   └── sample.e2e.spec.js  # Playwright E2E tests
└── README.md               # This documentation
```

## Development Workflow

### Local Development
1. **Start development server**: `npm run serve`
2. **Access application**: http://localhost:8080
3. **Access admin dashboard**: http://localhost:8080/admin.html
4. **Live reload**: Server automatically refreshes on file changes

### Code Organization
- **HTML**: Structure in `index.html` and `admin.html`
- **Styling**: Tailwind utilities + custom CSS in `assets/css/`
- **Logic**: Main app logic in `assets/js/app.js` (core functions)
- **Firebase**: Authentication and data in `assets/js/firebase.js`
- **Admin**: Dashboard logic in `assets/js/admin.js`

### Testing
- **Unit Tests**: `npm test` (Jest with jsdom environment)
- **E2E Tests**: `npm run test:e2e` (Playwright with browser automation)
- **Linting**: `npm run lint` (ESLint with modern JS standards)

### Git Workflow
- Use conventional commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`
- Recent example: `🧹 Fix stray characters in PDF sections`

## Troubleshooting

### Common Issues
| Issue | Resolution |
|-------|------------|
| **Authentication Failed** | Check Firebase config in `firebase.js`, ensure network connectivity |
| **PDF Generation Error** | Verify jsPDF and html2canvas libraries loaded, check browser console |
| **Data Not Saving** | Ensure Firebase auth working, check Firestore security rules |
| **Admin Access Denied** | Verify email in `ADMIN_EMAIL_WHITELIST` in `admin.html` |
| **Test Server Won't Start** | Run `npm install` then `npm run serve`, check port 8080 availability |
| **Styles Missing** | Confirm Tailwind CDN loading, check `assets/css/styles.css` path |

### Debug Steps
1. **Check Browser Console**: Look for JavaScript errors or network failures
2. **Verify Firebase**: Ensure authentication working and data saving to Firestore
3. **Test Locally**: Use `npm run serve` instead of opening HTML directly
4. **Clear Cache**: Browser cache or localStorage corruption can cause issues
5. **Check Network**: Firebase requires internet connectivity for auth and data

### Development Debugging
- **Firebase Console**: Monitor auth, database, and storage in Firebase Console
- **Network Tab**: Check API calls and resource loading
- **Application Tab**: Inspect localStorage data structure
- **Console Logging**: Use browser DevTools console for runtime debugging


## Recent Enhancements

### PDF Generation System
- **Complete Overhaul**: Replaced browser print-to-PDF with professional jsPDF implementation
- **A4 Formatting**: Proper margins, typography, and page breaks
- **Text Cleaning**: Resolved stray character issues in section titles
- **Preview Feature**: View generated PDF before download

### Firebase Integration  
- **Authentication**: Email/password signup, login, password reset
- **Cloud Persistence**: Firestore database with real-time sync
- **File Storage**: CSV export uploads with download links
- **Admin Dashboard**: Role-based access for reviewing submissions

### Testing & Development
- **Comprehensive Test Suite**: Jest + Playwright + ESLint
- **Development Server**: Local http-server with live reload
- **Test Data Population**: One-click sample data for development
- **Error Handling**: Graceful fallbacks and user feedback

## Contributing
- **Code Style**: Follow existing patterns, use ESLint for consistency
- **Testing**: Add tests for new features, ensure existing tests pass
- **Documentation**: Update README for significant changes
- **Firebase**: Test authentication and data persistence thoroughly
- **PDF Generation**: Verify output formatting across different content lengths

## License
ISC License (as specified in package.json)

## Repository
- **GitHub**: https://github.com/louisamurray/ceoreview
- **Issues**: https://github.com/louisamurray/ceoreview/issues
- **Current Branch**: main

## Contact
For questions about REAP Marlborough review processes or technical support, coordinate with the development team or REAP governance.
