# REAP Marlborough CEO Review - Admin System Documentation

## Overview

The upgraded admin system provides comprehensive governance oversight, data integrity, and efficient performance review management for the REAP Marlborough CEO Self-Review App. This system gives board members and authorized administrators full visibility of reviews while maintaining security and preventing accidental edits or data breaches.

## Access & Authentication

### User Roles

1. **Administrator (`admin`)**
   - Full system access
   - Can manage users and roles
   - Can edit system settings
   - Can delete data
   - Can view audit logs

2. **Board Reviewer (`board_reviewer`)**
   - Read-only access to all reviews
   - Can export data for reporting
   - Cannot manage users or edit settings
   - Cannot delete data

3. **CEO (`ceo`)**
   - Can only access their own reviews
   - Cannot view other users' data
   - Cannot access admin functions

### Initial Setup

1. **Legacy Admin Access**: Users listed in `window.ADMIN_EMAIL_WHITELIST` automatically get admin privileges
2. **Role-Based Access**: New users must be assigned roles through the admin interface
3. **Authentication**: Uses Firebase Authentication - users must sign in through the main application first

## Core Features

### 1. Dashboard Overview

**Location**: First tab when accessing admin area

**Key Metrics Displayed**:
- Total submissions (current year)
- Drafts in progress
- Average KPI scores
- Completion rates
- Year-over-year trends

**Visual Analytics**:
- Submissions over time (line chart)
- Section completion rates (doughnut chart)

**Quick Actions**:
- Export all reviews as CSV
- View latest review
- Jump to user management

### 2. Review Management

**Location**: "Reviews" tab

**Features**:
- **Filtering**: By year, status (submitted/draft), user
- **Search**: Full-text search across review content and metadata
- **Bulk Operations**: Export multiple reviews
- **Individual Actions**: View details, download CSV, delete (admin only)

**Review Cards Display**:
- User email and submission date
- Completion progress indicator
- Status badges (Draft/Submitted)
- Average KPI scores (when available)
- Quick action buttons

**Review Detail Modal**:
- Full review content organized by sections
- Metadata (submission date, CSV availability, etc.)
- Export options (CSV, PDF)
- Delete option (for admins)

### 3. User & Access Control

**Location**: "Users & Access" tab

**User Management Table**:
- User email and display name
- Current role with color coding
- Last login date
- Account status (Active/Inactive)
- Action buttons (Edit, Activate/Deactivate)

**Add New User**:
- Email address (required)
- Role assignment (Admin/Board Reviewer/CEO)
- Optional display name
- Automatic permission assignment

**Edit User**:
- Change role and permissions
- Update display name
- Toggle active status
- Cannot change email (readonly)

### 4. Reports & Insights

**Location**: "Reports & Insights" tab

**Analytics Dashboard**:
- KPI Performance by Category (bar chart)
- Competency Radar (current vs previous year)
- Year-over-year comparison metrics

**Board Reporting Tools**:
- Generate Board Summary PDF (planned feature)
- Export insights as CSV
- Automated analytics summary with trends

**Key Insights Provided**:
- Participation rates year-over-year
- Average completion times
- KPI trend analysis
- Data quality metrics

### 5. System Configuration

**Location**: "Settings" tab

**Review Configuration**:
- Active review year setting
- Review version/template control

**System Maintenance**:
- Maintenance mode toggle (disables review system)
- System status monitoring

**Data Management**:
- Manual data backup trigger
- Test data cleanup utilities
- Last backup timestamp display

### 6. System Logs & Audit Trail

**Location**: "System Logs" tab

**Comprehensive Logging**:
- User login/logout events
- Review access and modifications
- User role changes
- Data exports and downloads
- System setting changes
- Failed login attempts

**Log Filtering**:
- Filter by action type
- Date range selection
- User-specific logs
- Export full audit trail

**Log Information**:
- Timestamp with precise timing
- Action type with clear categorization
- User who performed the action
- Target of the action (user, review, system)
- Outcome (success/failure)
- Additional context data

## Technical Implementation

### Database Schema

**Enhanced Firestore Collections**:

1. **`users`** - User profiles with roles and permissions
2. **`submissions`** - Submitted reviews with analytics
3. **`drafts`** - Work-in-progress reviews
4. **`audit_logs`** - Comprehensive audit trail
5. **`system_settings`** - Configuration and settings
6. **`analytics_cache`** - Pre-computed dashboard metrics
7. **`notifications`** - System notifications
8. **`exports`** - Data export tracking

### Security Features

**Role-Based Permissions**:
```javascript
const permissions = {
  admin: {
    canViewAllReviews: true,
    canEditSettings: true,
    canExportData: true,
    canManageUsers: true,
    canViewAuditLogs: true,
    canDeleteData: true
  },
  board_reviewer: {
    canViewAllReviews: true,
    canExportData: true,
    // Other permissions: false
  }
};
```

**Audit Logging**: Every significant action is logged with:
- Timestamp and user identification
- Action performed and target affected
- IP address and user agent (when available)
- Success/failure status with error details

**Data Protection**:
- Read-only access for board reviewers
- Strict permission checks before sensitive operations
- Secure file downloads through Firebase Storage
- No direct database access - all through controlled APIs

### Performance Optimizations

**Caching Strategy**:
- Dashboard metrics cached in `analytics_cache` collection
- Charts rendered from pre-computed data
- Batch loading for large datasets

**Efficient Queries**:
- Indexed fields for fast filtering
- Pagination for large result sets
- Selective data loading based on user permissions

## Usage Guide

### For Administrators

1. **Initial Setup**:
   - Access admin area via `/admin.html`
   - Verify your email is in the admin whitelist
   - Add other admin and board reviewer accounts

2. **Regular Tasks**:
   - Monitor dashboard for new submissions
   - Review completion rates and trends
   - Export data for board meetings
   - Manage user access as needed

3. **Maintenance**:
   - Regularly backup data
   - Monitor audit logs for security
   - Update system settings as needed
   - Clean up old test data periodically

### For Board Reviewers

1. **Accessing Reviews**:
   - Use Reviews tab to view all submissions
   - Filter by year or search for specific content
   - Export data for offline analysis

2. **Reporting**:
   - Use Reports & Insights for meeting preparation
   - Generate board summary documents
   - Review year-over-year trends

3. **Data Export**:
   - CSV exports for detailed analysis
   - PDF summaries for presentations
   - Individual review downloads

### For System Maintenance

1. **Backup Procedures**:
   - Regular automated backups (if configured)
   - Manual backup before major changes
   - Export audit logs periodically

2. **User Management**:
   - Add users as needed for governance
   - Deactivate departing board members
   - Regular permission audits

3. **Monitoring**:
   - Check audit logs for unusual activity
   - Monitor system performance
   - Review error logs and notifications

## Migration from Legacy System

### Data Compatibility

The new system maintains full backward compatibility with existing submissions:
- Legacy reviews are displayed with appropriate formatting
- Existing CSV exports remain accessible
- User authentication continues to work

### Gradual Rollout

1. **Phase 1**: Deploy new admin interface alongside existing system
2. **Phase 2**: Migrate user roles from whitelist to database
3. **Phase 3**: Enable advanced features (analytics, audit logs)
4. **Phase 4**: Full transition with legacy support

## Troubleshooting

### Common Issues

1. **Access Denied**: Check user role and permissions in Users tab
2. **Charts Not Loading**: Verify analytics data exists and Chart.js is loaded
3. **Export Failures**: Check Firebase Storage permissions and file paths
4. **Missing Data**: Ensure user has proper role-based access

### Support & Maintenance

For technical issues or feature requests, refer to the development team. The system is designed to be self-maintaining with comprehensive logging for troubleshooting.

## Security Considerations

### Data Protection
- All sensitive operations require authentication
- Role-based access controls prevent unauthorized data access
- Comprehensive audit logging for accountability
- Secure file handling through Firebase Storage

### Access Management
- Regular permission audits recommended
- Inactive users should be deactivated
- Strong authentication required for admin access
- Session management handled by Firebase Auth

### Compliance
- Full audit trail for governance requirements
- Data export capabilities for compliance reporting
- User access tracking and management
- Secure data retention and backup procedures

This admin system provides the REAP Marlborough board with powerful tools for CEO review oversight while maintaining the highest standards of data security and governance transparency.