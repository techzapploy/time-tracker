# Clockify Feature Specification

## Table of Contents
1. [Time Tracking](#1-time-tracking)
2. [Project & Client Management](#2-project--client-management)
3. [Reporting & Analytics](#3-reporting--analytics)
4. [Team Management & Roles](#4-team-management--roles)
5. [Financial Features](#5-financial-features)
6. [Approval Workflows](#6-approval-workflows)
7. [Activity Monitoring](#7-activity-monitoring)
8. [Multi-Platform Access](#8-multi-platform-access)
9. [Integrations & API](#9-integrations--api)
10. [Pricing Tiers](#10-pricing-tiers)

---

# 1. Time Tracking

## 1.1 Timer Modes

### 1.1.1 Start/Stop Timer
**Description:** Real-time timer that tracks time as it passes.

#### UI States
- **Timer Idle:** Green "Start" button displayed with project/task selection fields
- **Timer Running:** Timer displays elapsed time (HH:MM:SS format), red "Stop" button visible
- **Timer Paused:** Pause functionality available, yellow indicator shown

#### User Actions
- Click "Start" to begin tracking time
- Select project, task, tags, and add description before or during tracking
- Click "Stop" to end time entry
- Timer continues running across page navigation
- Timer syncs across all connected devices in real-time

#### Feedback Messages
- "Timer started" - confirmation when timer begins
- "Time entry saved" - confirmation when timer stopped
- "Timer already running" - warning if attempting to start multiple timers
- Notification sound/visual indicator when timer starts/stops (configurable)

### 1.1.2 Manual Entry
**Description:** Manually log time entries after work is completed.

#### User Actions
- Enter start time and end time manually
- Or enter total duration (e.g., "2h 30m")
- Select date for the entry
- Fill in project, task, description, tags
- Mark as billable/non-billable
- Save entry

#### UI States
- **Empty Form:** All fields blank with placeholder text
- **Filled Form:** Fields populated, save button enabled
- **Validation Error:** Red borders on invalid fields, error messages below

#### Feedback Messages
- "Time entry created successfully"
- "Invalid time format" - when duration doesn't parse correctly
- "End time must be after start time" - validation error
- "Time entry overlaps with existing entry" - warning for conflicts

### 1.1.3 Calendar View
**Description:** Visual timeline view of tracked time displayed as color-coded blocks.

#### User Actions
- View daily/weekly calendar with time blocks
- Drag time blocks to adjust start time
- Resize blocks to adjust duration
- Click on empty space to create new entry
- Click on existing block to edit details
- Color-coding by project for visual organization

#### UI States
- **Day View:** 24-hour timeline with horizontal blocks
- **Week View:** 7-day grid with color-coded entries
- **Hover State:** Time block shows tooltip with details (project, task, duration)
- **Edit Mode:** Selected block highlighted with resize handles

#### Feedback Messages
- "Time entry updated" - after drag/resize
- "Cannot overlap entries" - if attempting to create conflict
- Tooltip display: "Project Name - Task Name (2h 30m)"

### 1.1.4 Timesheet View
**Description:** Spreadsheet-style interface for viewing and editing time entries.

#### User Actions
- View entries in tabular format by day/week/month
- Edit entries inline (click cell to modify)
- Bulk edit multiple entries
- Copy entries from previous days
- Submit timesheet for approval
- Filter by date range, project, tags

#### UI States
- **Editable Cells:** White background, pencil icon on hover
- **Locked Cells:** Gray background for approved entries
- **Pending Approval:** Yellow highlight on submitted entries
- **Daily/Weekly Totals:** Bold summary rows

#### Feedback Messages
- "Timesheet submitted for approval"
- "Cannot edit approved entries"
- "Timesheet withdrawn - now editable"
- Daily total displayed: "8h 30m tracked today"

### 1.1.5 Pomodoro Timer
**Description:** Built-in Pomodoro technique timer for productivity.

#### User Actions
- Set Pomodoro duration (default 25 minutes)
- Set break duration (short: 5min, long: 15min)
- Start Pomodoro session
- Auto-start next Pomodoro or break (configurable)
- Track work time and break time separately

#### UI States
- **Work Session:** Red timer with "Focus Time" indicator
- **Break Session:** Green timer with "Break Time" indicator
- **Session Complete:** Notification with options to continue or stop
- **Progress Tracker:** Shows completed Pomodoros in session

#### Feedback Messages
- "Pomodoro session started - Focus for 25 minutes"
- "Time for a break!" - notification when work session ends
- "Break is over - Ready to start next Pomodoro?"
- Sound notification (bell/chime) at session end

### 1.1.6 Kiosk Mode
**Description:** Shared device clock-in/clock-out interface with PIN authentication.

#### User Actions
- Launch kiosk mode on tablet/computer
- Select profile from user list
- Enter 4-digit or 6-digit PIN
- Clock in/out with single tap
- Switch between projects while clocked in
- View current clock-in status

#### UI States
- **User Selection:** Grid of user avatars/names
- **PIN Entry:** Numeric keypad interface, masked input
- **Clocked In:** Green status with elapsed time, "Clock Out" button
- **Clocked Out:** Gray status with "Clock In" button
- **Universal PIN Mode:** Single entry point for all users

#### Feedback Messages
- "Clocked in successfully" - confirmation with timestamp
- "Clocked out - Total time: 8h 30m"
- "Invalid PIN - Please try again"
- "Already clocked in - Clock out first"
- Visual confirmation (green checkmark) on successful action

#### Authentication Types
- **Personal PIN:** Unique 4- or 6-digit PIN per user (Basic plan+)
- **QR Code:** Scan personal QR code to clock in (Standard plan+)
- **Universal PIN:** Single PIN that works for all non-admin users

## 1.2 Auto-Tracking

### 1.2.1 App & Website Tracking
**Description:** Automatic monitoring of applications and websites used during work.

#### User Actions
- Enable auto-tracker in desktop app (Windows/Mac)
- Apps and websites tracked automatically when timer running
- Review tracked apps in activity timeline
- Categorize apps/sites as productive, unproductive, or neutral
- Set apps to trigger automatic time entries

#### UI States
- **Tracking Active:** Blue indicator in system tray
- **Activity Timeline:** Bar chart showing app usage over time
- **App List:** Table with app name, duration, percentage of time
- **Categorization:** Color-coded labels (green/yellow/red)

#### Feedback Messages
- "Auto-tracker enabled - Apps monitored when timer is running"
- "10+ seconds in application counted"
- Weekly summary: "Most used app: VS Code (12h 30m)"

### 1.2.2 Offline Tracking with Sync
**Description:** Continue tracking time without internet connection.

#### User Actions
- Track time normally when offline
- Activities stored locally on device
- Automatic sync when connection restored
- Manual sync trigger available
- View sync status and pending entries

#### UI States
- **Offline Mode:** Orange cloud icon with slash, "Working Offline"
- **Syncing:** Spinning icon, progress indicator
- **Synced:** Green checkmark, "All changes saved"
- **Conflict:** Warning icon for entries that need manual resolution

#### Feedback Messages
- "Working offline - Changes will sync when online"
- "Syncing 5 entries..."
- "All entries synced successfully"
- "Sync conflict detected - Please review"

## 1.3 Break Tracking

### 1.3.1 Manual Break Entry
**Description:** Track break time for labor compliance and reporting.

#### User Actions
- Click "Start Break" to begin break period
- Break time tracked separately from work time
- "End Break" to resume work timer
- Breaks marked with special icon in timeline
- Configure paid vs unpaid breaks

#### UI States
- **Break Active:** Orange timer with coffee cup icon
- **Break Entry:** Distinct visual marker (dotted border)
- **Break Summary:** Total break time shown in daily summary

#### Feedback Messages
- "Break started"
- "Break ended - Duration: 15 minutes"
- "Unpaid break time excluded from billable hours"

### 1.3.2 Automatic Break Detection (Pomodoro)
**Description:** Automatic break periods when using Pomodoro timer.

#### User Actions
- Enable Pomodoro timer with auto-breaks
- Break starts automatically after work session
- Option to skip break and continue working
- Long break after 4 Pomodoros (configurable)

#### Feedback Messages
- "Time for a 5-minute break!"
- "Long break earned - Take 15 minutes"
- "Break skipped - Starting next Pomodoro"

## 1.4 Split Time Entries

### 1.4.1 Manual Split
**Description:** Divide a single time entry into multiple segments.

#### User Actions
- Select existing time entry
- Click "Split" option
- Choose split point (time or percentage)
- Assign different projects/tasks to each segment
- Update descriptions for each part

#### UI States
- **Split Interface:** Timeline slider with split marker
- **Preview:** Shows both resulting entries before confirmation
- **Split Complete:** Two separate entries in timeline

#### Feedback Messages
- "Time entry split successfully"
- "Original entry: 4h → Split into: 2h 30m + 1h 30m"

## 1.5 Clock-in Reminders

### 1.5.1 Reminder Configuration
**Description:** Notifications to remind users to track time.

#### User Actions
- Enable reminders in settings
- Set reminder interval (every X minutes)
- Choose notification type (desktop, email, both)
- Configure reminder schedule (work hours only)
- Snooze reminder temporarily

#### UI States
- **Settings Panel:** Toggle switches for reminder options
- **Notification:** Desktop popup with "Track Time" quick action
- **Snoozed:** Gray bell icon, countdown to next reminder

#### Feedback Messages
- "Reminder: Don't forget to track your time"
- "No timer running - Start tracking?"
- "Reminder snoozed for 30 minutes"

### 1.5.2 Smart Reminders
**Description:** Context-aware reminders based on user behavior.

#### User Actions
- System detects untracked time gaps
- Reminder triggered if timer not running during work hours
- Suggestion to fill in missing time
- One-click start timer from reminder

#### Feedback Messages
- "You haven't tracked time today - Start now?"
- "Gap detected: 10:00 AM - 11:30 AM - Log time?"
- "Timer running for 8 hours - Don't forget to stop!"

## 1.6 Idle Time Detection

### 1.6.1 Idle Detection Settings
**Description:** Detect and handle inactive periods during time tracking.

#### User Actions
- Configure idle threshold (e.g., 10 minutes of inactivity)
- Choose default action: discard, keep, or ask
- Review idle time when detected
- Manually adjust time entry to remove idle periods

#### UI States
- **Idle Detected:** Notification popup with three buttons
- **Timer Paused:** Yellow indicator showing idle state
- **Idle Time Highlighted:** Gray section in time entry

#### Feedback Messages
- "No activity detected for 10 minutes - What would you like to do?"
- "Options: Discard idle time | Discard and continue | Keep idle time"
- "Idle time removed - Timer stopped at 2:30 PM"
- "Timer resumed at 2:45 PM"

**Privacy Note:** Idle detection data stays on local device - admins cannot see user idle activity.

---

# 2. Project & Client Management

## 2.1 Project Creation

### 2.1.1 Create New Project
**Description:** Set up projects to organize time tracking and resources.

#### User Actions
- Click "Add Project" button
- Enter project name (required)
- Select client (optional)
- Set project color for visual identification
- Choose billable status (default billable/non-billable)
- Set visibility (public/private)
- Save project

#### UI States
- **Create Form:** Modal or slide-out panel with form fields
- **Color Picker:** Palette of preset colors or custom color selector
- **Empty State:** "No projects yet - Create your first project"
- **Project List:** Grid or list view of all projects

#### Feedback Messages
- "Project created successfully"
- "Project name is required"
- "Project 'Website Redesign' created and ready to use"

### 2.1.2 Project Settings
**Description:** Configure detailed project parameters.

#### User Actions
- Set hourly rate for project
- Configure time estimate
- Set budget (time and/or money)
- Enable/disable budget alerts
- Set project start and end dates
- Add project notes/description
- Configure custom fields for project

#### UI States
- **Settings Panel:** Tabbed interface (General, Budget, Team, Tasks)
- **Budget Warning:** Yellow indicator when approaching limit
- **Budget Exceeded:** Red indicator when over budget

#### Feedback Messages
- "Project settings updated"
- "Budget alert: Project at 80% of time estimate"
- "Project will exceed budget by 15 hours at current rate"

## 2.2 Client Management

### 2.2.1 Create and Manage Clients
**Description:** Organize projects under client entities.

#### User Actions
- Click "Add Client" button
- Enter client name, email, address
- Add client notes
- Assign multiple projects to client
- Set client-level billing rate
- Archive inactive clients

#### UI States
- **Client List:** Table with client name, projects count, total time
- **Client Details:** Expandable panel showing all client projects
- **Active/Archived Toggle:** Filter to show/hide archived clients

#### Feedback Messages
- "Client 'Acme Corp' created"
- "5 projects assigned to this client"
- "Client archived - Projects remain accessible"

### 2.2.2 Client Reporting
**Description:** Generate client-specific reports and summaries.

#### User Actions
- View total time tracked per client
- See billable vs non-billable breakdown
- Generate client invoices
- Export client time reports
- Share reports with client via link

#### Feedback Messages
- "Total time for Acme Corp: 156 hours this month"
- "Report shared - Client can view at [link]"

## 2.3 Task Management

### 2.3.1 Create and Assign Tasks
**Description:** Break down projects into specific tasks.

#### User Actions
- Add task to project
- Enter task name and description
- Set task estimate
- Assign task to team members
- Set task status (to-do, in progress, done)
- Mark task as billable/non-billable

#### UI States
- **Task List:** Nested under project in hierarchy
- **Task Status:** Color-coded badges (gray/blue/green)
- **Task Assignment:** Avatar icons showing assigned members
- **Task Progress:** Progress bar based on tracked vs estimated time

#### Feedback Messages
- "Task 'Homepage Design' added to project"
- "Task assigned to 3 team members"
- "Task estimate exceeded by 2 hours"

### 2.3.2 Task Hierarchies
**Description:** Organize tasks in parent-child relationships.

#### User Actions
- Create subtasks under main tasks
- Indent/outdent tasks to adjust hierarchy
- Collapse/expand task groups
- Track time at subtask level
- View rollup totals at parent level

#### UI States
- **Tree View:** Indented list showing task hierarchy
- **Collapsed Group:** Chevron icon indicating hidden subtasks
- **Expanded Group:** All subtasks visible below parent

#### Feedback Messages
- "Subtask created under 'Website Redesign'"
- "Parent task total: 45 hours (across 8 subtasks)"

## 2.4 Project Templates

### 2.4.1 Create Template
**Description:** Save project configurations as reusable templates.

#### User Actions
- Create project with desired settings
- Click "Save as Template"
- Name the template
- Choose what to include: tasks, rates, estimates, team, custom fields
- Save for future use

#### UI States
- **Template Library:** List of saved templates with preview
- **Template Selection:** Modal showing template details when creating project

#### Feedback Messages
- "Template 'Web Development Project' saved"
- "Template includes: 15 tasks, hourly rates, team assignments"

### 2.4.2 Use Template
**Description:** Create new projects from saved templates.

#### User Actions
- Click "New Project from Template"
- Select template from library
- Customize project name and client
- Modify inherited settings if needed
- Create project

#### Feedback Messages
- "Project created from 'Web Development' template"
- "15 tasks, 5 team members, and rates automatically applied"

**Availability:** Paid feature (Basic plan and higher)

## 2.5 Tags and Custom Fields

### 2.5.1 Tags
**Description:** Custom labels for flexible categorization across projects.

#### User Actions
- Create workspace-level tags
- Apply multiple tags to time entries
- Filter reports by tags
- Common uses: work type, client grouping, project phase
- Set tag colors for visual organization

#### UI States
- **Tag Manager:** List of all workspace tags
- **Tag Pills:** Colored badges on time entries
- **Tag Filter:** Multi-select dropdown in reports

#### Feedback Messages
- "Tag 'Design' created and applied to 12 entries"
- "5 tags applied to this entry"

### 2.5.2 Custom Fields
**Description:** Add custom metadata to time entries for detailed tracking.

#### User Actions
- Create custom fields (text, number, dropdown, link)
- Set field as required or optional
- Apply fields workspace-wide or per project
- Use for expense tracking, mileage, invoice numbers, etc.
- Export custom field data in reports

#### UI States
- **Field Configuration:** Settings panel with field type selector
- **Entry Form:** Custom fields appear below standard fields
- **Field Values:** Displayed in time entry details and reports

#### Feedback Messages
- "Custom field 'Mileage' created"
- "Required field 'Client PO Number' must be filled"

**Availability:** Pro or Enterprise plan required (up to 50 custom fields)

## 2.6 Visibility Controls

### 2.6.1 Project Access Control
**Description:** Control who can see and track time on projects.

#### User Actions
- Set project as Public (all workspace members can see)
- Set project as Private (only assigned members can see)
- Assign specific team members to project
- Remove team members from project
- Configure project manager permissions

#### UI States
- **Public Project:** Globe icon, visible to all
- **Private Project:** Lock icon, restricted access
- **Access Settings:** Team member list with checkboxes

#### Feedback Messages
- "Project is public - All team members can track time"
- "Project is private - Only 5 assigned members can access"
- "You don't have access to this project"

### 2.6.2 Project Management Permissions
**Description:** Define who can manage project settings.

#### User Actions
- Allow users to manage projects they created
- Restrict project creation to admins only
- Enable/disable task creation by regular users
- Control who can edit project rates
- Set who can archive projects

#### Feedback Messages
- "Only admins can create new projects"
- "You can manage projects assigned to you"

## 2.7 Project Favorites

### 2.7.1 Favorite Projects
**Description:** Quick access to frequently used projects.

#### User Actions
- Click star icon to favorite a project
- Favorited projects appear at top of list
- Sort projects by favorites first
- Remove from favorites

#### UI States
- **Favorited:** Gold star icon filled
- **Not Favorited:** Gray star outline
- **Favorites Section:** Separated group at top of project list

#### Feedback Messages
- "Project added to favorites"
- "3 favorite projects for quick access"

## 2.8 Project Status & Archiving

### 2.8.1 Archive Projects
**Description:** Hide completed projects from active views.

#### User Actions
- Archive completed project
- Archived projects hidden from time tracker
- Archived projects remain in reports
- Unarchive to make active again
- View all archived projects in settings

#### UI States
- **Active Projects:** Default view in time tracker
- **Archived Badge:** Gray "Archived" label on project
- **Archive Filter:** Toggle to show/hide archived projects

#### Feedback Messages
- "Project archived - Hidden from time tracker but kept in reports"
- "12 projects archived in your workspace"

---

# 3. Reporting & Analytics

## 3.1 Dashboard

### 3.1.1 Personal Dashboard
**Description:** At-a-glance view of individual time tracking metrics.

#### User Actions
- View dashboard on login
- See current week's tracked time
- View breakdown by project
- See billable vs non-billable time split
- Check earnings from billable time
- Refresh to update real-time data

#### UI States
- **Dashboard Widgets:** Cards showing key metrics
- **Time Summary:** Large display of total hours this week
- **Project Breakdown:** Donut chart with color-coded segments
- **Billability Chart:** Bar graph comparing billable/non-billable

#### Metrics Displayed
- Total hours tracked (today/week/month)
- Billable hours and earnings
- Most tracked project
- Activity timeline
- Current week progress

#### Feedback Messages
- "You've tracked 32 hours this week"
- "75% billable time this month"
- "Most time on: Website Redesign (18h)"

### 3.1.2 Team Dashboard
**Description:** Aggregated view of all workspace activity.

#### User Actions
- View team-wide time summary
- See who's tracking time right now
- View project progress across team
- Filter by team member, project, or date range
- Compare team productivity
- Identify team availability

#### UI States
- **Active Timers:** List of team members with running timers
- **Team Activity:** Timeline showing when members tracked time
- **Project Overview:** Grid showing all projects with time totals
- **Member Cards:** Individual summaries for each team member

#### Metrics Displayed
- Total workspace hours
- Active team members now
- Team billability rate
- Project completion status
- Budget utilization across projects

#### Feedback Messages
- "Team tracked 240 hours this week"
- "5 team members tracking time now"
- "Project 'Website Redesign' at 80% budget"

### 3.1.3 Dashboard Customization
**Description:** Configure widgets and metrics displayed.

#### User Actions
- Add/remove dashboard widgets
- Rearrange widget layout
- Set default time period (week/month)
- Choose chart types
- Save custom dashboard layouts

#### Available Widgets
- Time by project
- Time by client
- Billability breakdown
- Earnings summary
- Activity timeline
- Team overview
- Budget tracking
- Top tasks

#### Feedback Messages
- "Dashboard layout saved"
- "Widget added: Budget Tracking"

## 3.2 Report Types

### 3.2.1 Summary Report
**Description:** Aggregated view of tracked time with totals.

#### User Actions
- Generate summary report
- Group by: project, client, user, tag, task
- Filter by date range
- See total hours per category
- View percentage breakdown
- Export summary data

#### UI States
- **Summary Table:** Rows with category name and total hours
- **Percentage Bars:** Visual representation of time distribution
- **Expandable Rows:** Click to see sub-categories

#### Displayed Data
- Category name
- Total duration
- Percentage of total time
- Billable amount (if rates configured)
- Number of time entries

#### Feedback Messages
- "Summary generated: 25 projects, 156 total hours"
- "Top project: Website Redesign (45 hours)"

### 3.2.2 Detailed Report
**Description:** Line-by-line listing of all time entries.

#### User Actions
- View all individual time entries
- Filter by multiple criteria simultaneously
- Sort by date, project, duration
- See full descriptions and notes
- Identify specific entries to edit
- Export detailed data

#### UI States
- **Table View:** One row per time entry
- **Column Headers:** Sortable by clicking
- **Filter Panel:** Sidebar with multiple filter options

#### Columns Displayed
- Date and time
- User name
- Project and task
- Description
- Tags
- Duration
- Billable amount
- Custom fields

#### Feedback Messages
- "Showing 243 time entries"
- "Filtered by: Project = 'Website', User = 'John Doe'"

### 3.2.3 Weekly Report
**Description:** Week-by-week breakdown of time tracking.

#### User Actions
- View time organized by calendar weeks
- See daily totals within each week
- Compare weeks over time
- Track weekly billability trends
- Identify gaps in time tracking

#### UI States
- **Weekly Grid:** Rows for each week, columns for metrics
- **Daily Breakdown:** Expandable section showing each day
- **Trend Line:** Graph showing weekly hours over time

#### Feedback Messages
- "Week of Jan 15-21: 42 hours tracked"
- "3 hours more than previous week"

### 3.2.4 Assignments Report
**Description:** View scheduled/planned work vs actual tracked time.

#### User Actions
- See assigned tasks per team member
- Compare scheduled hours to tracked hours
- Identify overallocation or underutilization
- View upcoming assignments
- Adjust schedules based on actuals

#### UI States
- **Assignment Grid:** Timeline view with scheduled blocks
- **Actual vs Planned:** Side-by-side comparison
- **Variance Indicator:** Red/green showing over/under tracking

#### Feedback Messages
- "John scheduled 40h, tracked 35h (variance: -5h)"
- "Team overallocated by 15 hours this week"

### 3.2.5 Attendance Report
**Description:** Clock-in/clock-out records for compliance tracking.

#### User Actions
- View clock-in and clock-out times
- See total work hours per day
- Track late arrivals and early departures
- Monitor break times
- Generate attendance summary for payroll

#### UI States
- **Attendance Table:** Daily rows with in/out times
- **Status Indicators:** On-time (green), late (yellow), absent (red)
- **Break Summary:** Separate column for break duration

#### Feedback Messages
- "John Doe: Clocked in at 8:45 AM (15 min late)"
- "Average work time this week: 8h 15m"

### 3.2.6 Expense Report
**Description:** Track and report project expenses.

#### User Actions
- View all logged expenses
- Filter by project, date, expense type
- See billable vs non-billable expenses
- Attach receipts to expenses
- Include expenses in client invoices

#### UI States
- **Expense Table:** Amount, category, project, receipt status
- **Receipt Attached:** Paperclip icon, click to view
- **Billable Badge:** Green indicator for billable expenses

#### Feedback Messages
- "Total expenses: $1,245.50 (18 items)"
- "8 billable expenses ready for invoicing"

**Availability:** Pro or Enterprise plan required

## 3.3 Report Filters and Breakdowns

### 3.3.1 Filter Options
**Description:** Narrow down report data by multiple criteria.

#### Available Filters
- Date range (custom, preset periods)
- Users (individual or groups)
- Projects (multiple selection)
- Clients
- Tasks
- Tags (multiple selection)
- Billable status
- Approval status
- Custom fields

#### User Actions
- Click "Filters" to open filter panel
- Select multiple filter criteria
- Save filter combinations as presets
- Clear all filters
- Share filtered report via link

#### UI States
- **Filter Panel:** Collapsible sidebar with filter controls
- **Active Filters:** Pills showing current filters, X to remove
- **Filter Presets:** Dropdown of saved filter combinations

#### Feedback Messages
- "5 filters applied (257 entries match)"
- "Filter saved as 'Client Reports - Q1'"

### 3.3.2 Group By / Breakdown
**Description:** Organize report data by different dimensions.

#### Grouping Options
- Project
- Client
- User
- Team/Group
- Task
- Tag
- Date (day/week/month/year)
- Custom fields

#### User Actions
- Select grouping dimension from dropdown
- Sub-group by secondary dimension
- Collapse/expand groups
- Sort groups by name or total time

#### UI States
- **Grouped Table:** Parent rows with child entries indented
- **Group Totals:** Bold summary row with total hours
- **Multi-level Grouping:** Up to 2-3 levels of hierarchy

#### Feedback Messages
- "Grouped by: Project → User"
- "12 projects with 45 users tracked time"

## 3.4 Report Export

### 3.4.1 Export Formats
**Description:** Download report data in various formats.

#### Available Formats
- **PDF:** Formatted report with charts and branding
- **CSV:** Raw data for spreadsheet analysis
- **Excel:** Formatted XLSX with multiple sheets
- **JSON:** Structured data for integrations

#### User Actions
- Click "Export" button
- Select format from dropdown
- Choose to include/exclude charts
- Add custom cover page or notes (PDF)
- Download file

#### UI States
- **Export Menu:** Dropdown with format options
- **Generating:** Progress indicator while export processes
- **Ready:** Download button appears

#### Feedback Messages
- "Generating PDF export..."
- "Report downloaded: Time_Report_Jan_2026.pdf"
- "CSV export includes 1,243 time entries"

### 3.4.2 Custom Report Design (PDF)
**Description:** Configure PDF appearance and content.

#### User Actions
- Add company logo to PDF
- Customize color scheme
- Include/exclude specific columns
- Add report summary or notes
- Set page orientation (portrait/landscape)

#### Feedback Messages
- "PDF customization saved"
- "Report generated with company branding"

## 3.5 Report Sharing

### 3.5.1 Public Report Links
**Description:** Share live report via URL without requiring login.

#### User Actions
- Click "Share" button on report
- Toggle "Public Access" on
- Copy generated link
- Set link expiration (optional)
- Revoke link access anytime

#### UI States
- **Share Modal:** Dialog with sharing options
- **Link Generated:** Copyable URL field with "Copy" button
- **Public Indicator:** Globe icon showing report is public
- **Access Settings:** Dropdown for link permissions

#### Feedback Messages
- "Public link created - Anyone with link can view"
- "Link copied to clipboard"
- "Public access revoked - Link no longer works"

#### Security Options
- Require password to access link
- Set expiration date
- Restrict to specific email domains
- View-only access (cannot export)

### 3.5.2 Scheduled Reports
**Description:** Automatically email reports on recurring schedule.

#### User Actions
- Click "Schedule" button on report
- Choose frequency (daily, weekly, monthly)
- Select recipients (email addresses)
- Set delivery time
- Choose format (PDF or CSV)
- Enable/disable scheduled report

#### UI States
- **Schedule Configuration:** Form with frequency and recipient fields
- **Active Schedules:** List of scheduled reports with on/off toggle
- **Schedule Indicator:** Clock icon on report showing it's scheduled

#### Feedback Messages
- "Report scheduled: Weekly on Mondays at 9:00 AM"
- "Email sent to 5 recipients"
- "Next report delivery: Monday, Jan 22 at 9:00 AM"

#### Scheduled Options
- Daily: every day or weekdays only
- Weekly: choose day of week
- Monthly: choose date or last day of month
- Custom: specific intervals

**Availability:** Standard plan or higher required

---

# 4. Team Management & Roles

## 4.1 User Roles

### 4.1.1 Owner
**Description:** Highest level of access with full workspace control.

#### Exclusive Permissions
- Delete workspace
- Transfer ownership to another user
- Set up Single Sign-On (SSO)
- Manage subscription and billing
- Remove admin roles from users
- Access audit logs (Enterprise)

#### User Actions
- All admin capabilities plus exclusive owner functions
- Assign/remove admin roles
- Configure workspace-level integrations
- Set up custom subdomain (Enterprise)
- Manage workspace deletion

#### UI States
- **Owner Badge:** Gold crown icon next to name
- **Transfer Ownership:** Special dialog with confirmation steps
- **Owner Settings:** Additional settings section not visible to admins

#### Feedback Messages
- "You are the workspace owner"
- "Transfer ownership to [user]? This action cannot be undone."
- "Ownership transferred successfully"

### 4.1.2 Admin
**Description:** High-level access for workspace administration.

#### Permissions
- Invite and deactivate users
- Assign user roles (except remove admin role)
- Manage workspace settings
- Create and manage projects
- Edit subscription payment information
- Manage groups
- Set billable rates
- Approve timesheets
- View all tracked time
- Edit all time entries (if enabled)
- Launch Kiosk
- Manage integrations
- Configure custom fields
- Set required fields

#### User Actions
- Add team members to workspace
- Configure time tracking policies
- Set up approval workflows
- Manage project access
- Export all workspace data

#### UI States
- **Admin Badge:** Shield icon next to name
- **Admin Panel:** Access to settings and configuration sections
- **Full Visibility:** Can view all users' time entries

#### Feedback Messages
- "You have admin access to this workspace"
- "User invitation sent to john@example.com"

### 4.1.3 Project Manager
**Description:** Manages specific projects and their team members.

#### Permissions
- View tracked time on their projects only
- Manage project details (name, budget, estimates)
- Assign team members to their projects
- Approve timesheets for their project members
- Launch Kiosk (if enabled)
- Edit time entries on their projects (if enabled)

#### Cannot Do
- Invite new users to workspace
- Create new projects (unless specifically allowed)
- Access other projects they don't manage
- Change workspace settings
- Deactivate users

#### User Actions
- Assign tasks within their projects
- Set project budgets and estimates
- Review and approve time entries for project
- Generate project-specific reports

#### UI States
- **Project Manager Badge:** Blue badge on user profile
- **Managed Projects:** List showing which projects they manage
- **Limited View:** Only see data for assigned projects

#### Feedback Messages
- "You manage 3 projects"
- "Timesheet approved for Website Redesign project"

**Availability:** Standard, Pro, or Enterprise plan required

### 4.1.4 Team Manager
**Description:** Manages specific team members across all projects.

#### Permissions
- View all tracked time of their team members
- Edit team members' time entries (if enabled)
- Approve timesheets submitted by their team
- View reports filtered to their team
- See team member availability

#### Cannot Do
- Invite or deactivate users
- Edit user profile information
- Manage projects
- Change workspace settings
- Access other teams' data

#### User Actions
- Review team timesheets
- Approve or reject time submissions
- Monitor team productivity
- Generate team reports

#### UI States
- **Team Manager Badge:** Purple badge on user profile
- **Managed Team:** List of team members under management
- **Team View:** Dashboard showing only their team's activity

#### Feedback Messages
- "You manage 8 team members"
- "5 pending timesheets require approval"

**Availability:** Standard, Pro, or Enterprise plan required

### 4.1.5 Regular User
**Description:** Standard team member with basic time tracking capabilities.

#### Permissions
- Track their own time
- View their own time entries and reports
- Edit their own time entries (if not approved)
- Submit timesheets for approval
- View list of workspace members
- Create projects (if enabled by admin)
- Track time on assigned projects
- Log expenses (Pro plan+)

#### Cannot Do
- View other users' time entries
- Approve timesheets
- Manage projects they didn't create
- Invite new users
- Change workspace settings
- Access billing information

#### User Actions
- Start/stop timer
- Create manual time entries
- Switch between projects
- Add tasks and tags
- Submit timesheet for approval
- View personal reports

#### UI States
- **My Time View:** Personal dashboard and time entries only
- **Limited Project Access:** Only see projects they're assigned to
- **Pending Badge:** Yellow indicator when timesheet needs submission

#### Feedback Messages
- "Timer started for Project Alpha"
- "Timesheet submitted for approval"

## 4.2 Permissions Matrix

### 4.2.1 Permission Comparison Table

| Capability | Owner | Admin | Project Manager | Team Manager | Regular User |
|-----------|-------|-------|----------------|--------------|--------------|
| **Workspace Management** |
| Delete workspace | ✓ | ✗ | ✗ | ✗ | ✗ |
| Transfer ownership | ✓ | ✗ | ✗ | ✗ | ✗ |
| Manage subscription | ✓ | ✓ | ✗ | ✗ | ✗ |
| Configure SSO | ✓ | ✗ | ✗ | ✗ | ✗ |
| Access audit logs | ✓ | ✓ | ✗ | ✗ | ✗ |
| **User Management** |
| Invite users | ✓ | ✓ | ✗ | ✗ | ✗ |
| Deactivate users | ✓ | ✓ | ✗ | ✗ | ✗ |
| Assign admin role | ✓ | ✓ | ✗ | ✗ | ✗ |
| Remove admin role | ✓ | ✗ | ✗ | ✗ | ✗ |
| Assign manager roles | ✓ | ✓ | ✗ | ✗ | ✗ |
| View all members | ✓ | ✓ | ✗ | ✗ | Limited |
| **Project Management** |
| Create projects | ✓ | ✓ | Configurable | ✗ | Configurable |
| Edit all projects | ✓ | ✓ | Own only | ✗ | Own only |
| Delete projects | ✓ | ✓ | Own only | ✗ | Own only |
| Set project rates | ✓ | ✓ | Own only | ✗ | ✗ |
| Assign project team | ✓ | ✓ | Own only | ✗ | ✗ |
| **Time Tracking** |
| Track own time | ✓ | ✓ | ✓ | ✓ | ✓ |
| View own time | ✓ | ✓ | ✓ | ✓ | ✓ |
| View all time | ✓ | ✓ | Projects only | Team only | ✗ |
| Edit own time | ✓ | ✓ | ✓ | ✓ | ✓ |
| Edit others' time | ✓ | ✓ | Projects (if enabled) | Team (if enabled) | ✗ |
| **Approvals** |
| Submit timesheet | ✓ | ✓ | ✓ | ✓ | ✓ |
| Approve timesheets | ✓ | ✓ | Projects only | Team only | ✗ |
| Approve expenses | ✓ | ✓ | Projects only | Team only | ✗ |
| **Reporting** |
| Personal reports | ✓ | ✓ | ✓ | ✓ | ✓ |
| Team reports | ✓ | ✓ | Projects only | Team only | ✗ |
| Workspace reports | ✓ | ✓ | ✗ | ✗ | ✗ |
| Share reports | ✓ | ✓ | ✓ | ✓ | Own only |
| Schedule reports | ✓ | ✓ | ✓ | ✓ | ✗ |
| **Financial** |
| View billing rates | ✓ | ✓ | Projects only | ✗ | ✗ |
| Set billing rates | ✓ | ✓ | ✗ | ✗ | ✗ |
| Create invoices | ✓ | ✓ | Projects only | ✗ | ✗ |
| View invoices | ✓ | ✓ | Projects only | ✗ | ✗ |
| Track expenses | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Configuration** |
| Workspace settings | ✓ | ✓ | ✗ | ✗ | ✗ |
| Manage integrations | ✓ | ✓ | ✗ | ✗ | ✗ |
| Configure custom fields | ✓ | ✓ | ✗ | ✗ | ✗ |
| Manage tags | ✓ | ✓ | ✓ | ✓ | ✓ |
| Launch Kiosk | ✓ | ✓ | ✓ | ✗ | ✗ |

## 4.3 Workspace Management

### 4.3.1 Create Workspace
**Description:** Set up a new organization workspace.

#### User Actions
- Sign up for Clockify account
- Enter workspace name
- Choose workspace URL/subdomain (Enterprise)
- Set workspace timezone
- Configure default settings (first day of week, time format)

#### UI States
- **Workspace Creation Wizard:** Multi-step form
- **Workspace Dashboard:** Landing page after creation
- **Empty State:** Prompts to invite team and create first project

#### Feedback Messages
- "Workspace 'Acme Corp' created successfully"
- "You are the workspace owner"
- "Start by inviting your team members"

### 4.3.2 Workspace Settings
**Description:** Configure workspace-wide policies and preferences.

#### Configuration Options
- Workspace name and branding
- Time tracking settings (require description, project, task)
- Approval workflows
- Billable rates structure
- Integrations and API access
- Data retention policies
- Security settings

#### User Actions
- Update workspace preferences
- Set required fields for time entries
- Enable/disable features
- Configure alerts and notifications
- Manage workspace permissions

#### Feedback Messages
- "Workspace settings updated"
- "Project field is now required for all time entries"

## 4.4 Team Overview

### 4.4.1 Team Member List
**Description:** View and manage all workspace members.

#### User Actions
- View list of all team members
- See member role and status (active/deactivated)
- Filter by role, team, or status
- Search for specific members
- View member activity summary

#### UI States
- **Member Grid:** Cards showing avatar, name, role, status
- **Member Table:** List view with columns for details
- **Active Indicator:** Green dot for members currently tracking
- **Deactivated:** Gray badge for inactive members

#### Displayed Information
- Name and email
- Role (Owner, Admin, Manager, User)
- Last activity date
- Total tracked time
- Projects assigned
- Groups/teams

#### Feedback Messages
- "45 active members in workspace"
- "John Doe last tracked time 2 hours ago"

### 4.4.2 Invite Team Members
**Description:** Add new users to workspace.

#### User Actions
- Click "Invite Members" button
- Enter email addresses (multiple)
- Assign role for new members
- Assign to projects (optional)
- Assign to groups (optional)
- Send invitation

#### UI States
- **Invite Modal:** Form with email and role selection
- **Pending Invitations:** List of sent invites awaiting acceptance
- **Invitation Sent:** Confirmation with ability to resend

#### Feedback Messages
- "Invitation sent to john@example.com"
- "Invite pending - Waiting for user to accept"
- "User joined workspace and is now active"
- "Invitation expired - Resend to john@example.com"

### 4.4.3 Deactivate/Reactivate Members
**Description:** Manage member access without deleting accounts.

#### User Actions
- Select member to deactivate
- Confirm deactivation
- Deactivated members cannot log in
- Time entries remain in system
- Reactivate member to restore access

#### UI States
- **Active Member:** Green status badge
- **Deactivated Member:** Gray badge with "Deactivated" label
- **Confirmation Dialog:** Warning before deactivation

#### Feedback Messages
- "Member deactivated - No longer has access"
- "Time entries preserved in reports"
- "Member reactivated successfully"
- "1 license freed by deactivation" (on paid plans)

## 4.5 User Groups

### 4.5.1 Create User Groups
**Description:** Organize team members into logical groups.

#### User Actions
- Create new group
- Name group (e.g., "Design Team", "Developers")
- Add members to group
- Assign group to projects
- Use groups for filtering reports

#### UI States
- **Group Manager:** List of all groups with member count
- **Group Detail:** Members list for specific group
- **Group Badge:** Label showing group membership

#### Feedback Messages
- "Group 'Design Team' created with 8 members"
- "Members can belong to multiple groups"

### 4.5.2 Group-Based Permissions
**Description:** Apply settings and access control at group level.

#### User Actions
- Assign projects to entire group
- Set group-level billable rates
- Filter reports by group
- View group time summaries
- Configure group notifications

#### Feedback Messages
- "Design Team assigned to 5 projects"
- "Group tracked 156 hours this week"

---

# 5. Financial Features

## 5.1 Billing Rates

### 5.1.1 Workspace Default Rate
**Description:** Set default hourly rate for entire workspace.

#### User Actions
- Navigate to workspace settings
- Set default hourly rate (e.g., $75/hour)
- Choose currency
- Save as workspace default
- Applies to all time unless overridden

#### UI States
- **Rate Settings:** Input field with currency selector
- **Rate Display:** Shows rate next to billable time entries

#### Feedback Messages
- "Default rate set to $75/hour"
- "Rate applies to all billable time unless overridden"

### 5.1.2 Member-Level Rates
**Description:** Set individual hourly rates per team member.

#### User Actions
- Go to team member profile
- Set custom hourly rate for member
- Override workspace default
- Set different rates for different clients/projects
- Track member profitability

#### UI States
- **Member Rate:** Displayed in member settings
- **Rate Override:** Badge indicating custom rate active

#### Feedback Messages
- "Hourly rate for John Doe set to $95/hour"
- "Overrides workspace default rate"

### 5.1.3 Project-Level Rates
**Description:** Set custom rates specific to projects.

#### User Actions
- Open project settings
- Set project hourly rate
- Rate applies to all time on project
- Overrides member and workspace rates
- Useful for fixed-rate contracts

#### UI States
- **Project Rate Badge:** Shows project has custom rate
- **Rate Hierarchy Indicator:** Shows which rate is active

#### Feedback Messages
- "Project rate set to $85/hour"
- "Overrides workspace and member rates"

### 5.1.4 Task-Level Rates
**Description:** Most specific rate setting for individual tasks.

#### User Actions
- Open task settings
- Set task hourly rate
- Highest priority in rate hierarchy
- Useful for specialized work
- Rate shown in task details

#### Rate Hierarchy (highest to lowest priority)
1. Task rate (most specific)
2. Project rate
3. Member rate
4. Workspace rate (fallback)

#### Feedback Messages
- "Task rate set to $125/hour"
- "Takes priority over all other rates"

### 5.1.5 Multi-Currency Support
**Description:** Work with multiple currencies for international clients.

#### User Actions
- Set currency per project or client
- Choose from 150+ currencies
- View earnings in multiple currencies
- Generate invoices in client currency
- Track exchange rates (manual)

#### UI States
- **Currency Selector:** Dropdown with currency symbols and codes
- **Multi-Currency Report:** Shows amounts in different currencies

#### Feedback Messages
- "Project currency set to EUR (€)"
- "Invoice will be generated in euros"

## 5.2 Billable Time

### 5.2.1 Mark Time as Billable
**Description:** Designate time entries for client billing.

#### User Actions
- Toggle "Billable" checkbox when tracking time
- Set project as billable by default
- Edit billable status of existing entries
- Bulk edit billable status
- View billable amount based on rates

#### UI States
- **Billable Toggle:** Green checkbox when enabled
- **Billable Badge:** "$" icon on billable entries
- **Non-Billable:** Gray indicator for internal time

#### Feedback Messages
- "Time entry marked as billable"
- "Billable amount: $150 (2h @ $75/hour)"
- "Project set to billable by default"

### 5.2.2 Billable vs Non-Billable Reporting
**Description:** Analyze distribution of billable and non-billable time.

#### User Actions
- Generate billability report
- See percentage breakdown
- Filter by team member, project
- Identify low billability periods
- Export billability data

#### Metrics Displayed
- Total billable hours and amount
- Total non-billable hours
- Billability percentage
- Target vs actual billability
- Billability trends over time

#### Feedback Messages
- "Billability rate: 72% (156 of 216 hours)"
- "Target billability: 80%"
- "$11,700 billable this month"

## 5.3 Invoicing

### 5.3.1 Create Invoice
**Description:** Generate client invoices from tracked time and expenses.

#### User Actions
- Select project or client
- Choose date range for invoice
- Review billable time entries
- Include billable expenses
- Set invoice details (number, date, due date)
- Add tax rate if applicable
- Add notes or payment terms
- Generate PDF invoice

#### UI States
- **Invoice Builder:** Form with time entries selection
- **Invoice Preview:** Shows formatted invoice before generation
- **Invoice Draft:** Unsent invoice editable
- **Invoice Sent:** Locked invoice with "Sent" status

#### Feedback Messages
- "Invoice #2024-001 created"
- "45 hours + 3 expenses totaling $3,825"
- "Invoice generated - Download PDF"

**Availability:** Standard plan or higher required

### 5.3.2 Invoice Statuses
**Description:** Track invoice lifecycle and payment status.

#### Invoice States
- **Unsent:** Draft invoice not yet sent
- **Sent:** Invoice delivered to client
- **Paid:** Payment received
- **Void:** Cancelled invoice

#### User Actions
- Mark invoice as sent
- Mark invoice as paid
- Void invoice if needed
- Resend invoice to client
- Track payment due dates

#### UI States
- **Status Badge:** Color-coded indicator (gray/blue/green/red)
- **Payment Tracker:** Shows days until due or overdue
- **Invoice List:** Filterable by status

#### Feedback Messages
- "Invoice marked as sent"
- "Invoice #2024-001 is 5 days overdue"
- "Invoice marked as paid"

### 5.3.3 Recurring Invoices
**Description:** Automate invoices that repeat at regular intervals.

#### User Actions
- Set up recurring invoice schedule
- Choose frequency (weekly, monthly, quarterly)
- Define scope (project, client, specific tasks)
- Set start and end dates
- Auto-generate and optionally auto-send

#### UI States
- **Recurrence Settings:** Form with frequency options
- **Next Invoice Date:** Countdown to next generation
- **Recurrence Active:** Badge showing schedule

#### Feedback Messages
- "Recurring invoice set up: Monthly on the 1st"
- "Next invoice generates on Feb 1, 2026"
- "Recurring invoice sent automatically"

### 5.3.4 Invoice Customization
**Description:** Brand invoices with company details and styling.

#### User Actions
- Add company logo
- Set company information (name, address, tax ID)
- Customize invoice template
- Add payment instructions
- Set default payment terms
- Choose invoice numbering format

#### Feedback Messages
- "Invoice template customized with logo"
- "Default payment terms: Net 30"

## 5.4 Expense Tracking

### 5.4.1 Log Expenses
**Description:** Record project-related expenses beyond time tracking.

#### User Actions
- Click "Add Expense"
- Enter expense amount
- Select project and category
- Add description
- Attach receipt image/PDF
- Mark as billable or non-billable
- Save expense entry

#### UI States
- **Expense Form:** Fields for amount, date, project, description
- **Receipt Upload:** Drag-drop area or file selector
- **Expense List:** Table showing all expenses with totals

#### Expense Types
- Flat fee (one-time amount)
- Unit-based (quantity × unit price)
- Mileage (distance × rate)
- Custom categories

#### Feedback Messages
- "Expense logged: $125 - Hotel accommodation"
- "Receipt attached to expense"
- "Expense marked as billable"

**Availability:** Pro or Enterprise plan required

### 5.4.2 Expense Approval
**Description:** Submit and approve expenses for reimbursement.

#### User Actions
- Submit expenses for approval
- Manager reviews expense details and receipt
- Approve or reject with reason
- Track approval status
- Export approved expenses for payroll

#### UI States
- **Pending Approval:** Yellow badge on expense
- **Approved:** Green checkmark
- **Rejected:** Red X with rejection reason
- **Approval Queue:** List of expenses awaiting review

#### Feedback Messages
- "Expense submitted for approval"
- "Expense approved by manager"
- "Expense rejected: Receipt required"

### 5.4.3 Include Expenses in Invoices
**Description:** Add billable expenses to client invoices.

#### User Actions
- Select billable expenses when creating invoice
- Expenses automatically included if from project
- Show expense breakdown on invoice
- Calculate total with time + expenses

#### Feedback Messages
- "3 billable expenses added to invoice ($425)"
- "Invoice total: $3,825 (time) + $425 (expenses) = $4,250"

## 5.5 Budget Tracking

### 5.5.1 Set Project Budget
**Description:** Define time and cost limits for projects.

#### User Actions
- Set budget by hours or currency amount
- Choose budget type: total project or recurring (weekly/monthly)
- Set budget alert threshold (e.g., 80%)
- Enable budget notifications
- Track budget consumption in real-time

#### Budget Types
- **Time Budget:** Hours allocated to project
- **Money Budget:** Dollar amount cap
- **Combined:** Both time and money limits

#### UI States
- **Budget Progress Bar:** Visual indicator of consumption
- **Budget Warning:** Yellow when approaching limit (e.g., 80%)
- **Budget Exceeded:** Red indicator when over budget
- **No Budget:** Gray badge "No budget set"

#### Feedback Messages
- "Budget set: 100 hours / $7,500"
- "Budget at 75% (75 of 100 hours)"
- "Warning: Project will exceed budget by 15 hours"

### 5.5.2 Budget Alerts
**Description:** Automatic notifications when budget thresholds reached.

#### User Actions
- Configure alert thresholds (e.g., 50%, 80%, 100%)
- Choose notification recipients (project manager, owner)
- Select notification method (email, in-app)
- View alert history

#### Alert Triggers
- Budget reaches 50% consumed
- Budget reaches 80% consumed
- Budget reaches 100% consumed
- Budget exceeded

#### Feedback Messages
- "Alert sent: Project 'Website' at 80% of budget"
- "Email notification sent to project manager"
- "Budget alert: Project exceeded by $500"

### 5.5.3 Budget vs Actual Reporting
**Description:** Compare planned budget to actual spending.

#### User Actions
- Generate budget report
- View budget utilization across projects
- See projects over/under budget
- Analyze budget variance
- Export budget performance data

#### Metrics Displayed
- Budget allocated
- Actual time/cost tracked
- Remaining budget
- Percentage consumed
- Variance (over/under)
- Forecast to completion

#### UI States
- **Under Budget:** Green indicator, positive variance
- **On Track:** Blue indicator, within tolerance
- **Over Budget:** Red indicator, negative variance

#### Feedback Messages
- "Project under budget by $1,200 (16%)"
- "Project over budget by 25 hours"
- "5 projects under budget, 2 over budget"

## 5.6 Time Estimates

### 5.6.1 Set Estimates
**Description:** Define expected time for projects and tasks.

#### User Actions
- Set estimated hours for project
- Set estimated hours per task
- Choose estimate type: total or per member
- Set estimate reset schedule (for retainer work)
- Compare estimate vs tracked time

#### UI States
- **Estimate Badge:** Shows estimated hours on project/task
- **Progress Indicator:** Bar showing tracked vs estimated
- **Estimate Exceeded:** Red when tracked > estimated

#### Feedback Messages
- "Project estimate: 100 hours"
- "Tracked 75h of 100h estimated (75%)"
- "Task estimate exceeded by 5 hours"

### 5.6.2 Estimate vs Tracked Analysis
**Description:** Analyze accuracy of time estimates.

#### User Actions
- Generate estimate accuracy report
- See variance between estimated and actual
- Identify tasks consistently over/under estimated
- Improve future estimates based on data
- Track estimation accuracy over time

#### Metrics
- Estimated time
- Tracked time
- Variance (hours and percentage)
- Accuracy rate
- Most accurate estimator

#### Feedback Messages
- "Project completed in 105h vs 100h estimated (+5%)"
- "Estimation accuracy: 85%"
- "Design tasks typically 20% over estimate"

## 5.7 Forecasting

### 5.7.1 Project Forecasting
**Description:** Predict project completion and costs based on current trajectory.

#### User Actions
- View forecast on project dashboard
- See predicted completion date
- View projected total cost
- Compare forecast to budget
- Adjust project plan based on forecast

#### Forecast Calculations
- Based on: tracked time, scheduled tasks, historical velocity
- Predicts: completion date, total hours, total cost
- Shows: variance from original estimate
- Updates: in real-time as time tracked

#### UI States
- **Forecast Panel:** Widget showing predictions
- **On Track:** Green indicator if within budget
- **At Risk:** Yellow if trending over budget
- **Over Budget:** Red if forecast exceeds budget

#### Feedback Messages
- "Forecast: Project will complete in 15 days (Jan 27)"
- "Projected total: 105 hours ($7,875)"
- "Warning: Forecast exceeds budget by $375"

**Availability:** Pro plan or higher required

### 5.7.2 Resource Forecasting
**Description:** Predict team capacity and availability.

#### User Actions
- View team workload forecast
- See scheduled vs available hours
- Identify overallocation
- Forecast hiring needs
- Balance team workload

#### Feedback Messages
- "Team overallocated by 40 hours next week"
- "Sarah has 15 available hours this week"
- "Need 2 additional designers based on scheduled work"

## 5.8 Profit and Cost Analysis

### 5.8.1 Project Profitability
**Description:** Calculate profit margins on projects.

#### User Actions
- Set project billing rate (revenue)
- Set team member cost rates
- Track revenue vs cost
- View profit margin
- Identify most/least profitable projects

#### Metrics Calculated
- **Revenue:** Billable hours × billing rate
- **Cost:** Tracked hours × cost rate
- **Profit:** Revenue - Cost
- **Margin:** (Profit / Revenue) × 100%

#### UI States
- **Profitable Project:** Green indicator, positive margin
- **Break-Even:** Yellow indicator, ~0% margin
- **Unprofitable:** Red indicator, negative margin

#### Feedback Messages
- "Project profit: $2,500 (margin: 33%)"
- "Revenue: $7,500 | Cost: $5,000 | Profit: $2,500"
- "Warning: Project losing $500"

### 5.8.2 Cost Rate Configuration
**Description:** Set internal cost rates for profitability calculations.

#### User Actions
- Set cost rate per team member (salary equivalent)
- Different from billing rate
- Used for internal calculations only
- Not visible to regular users
- Calculate true project profitability

#### Feedback Messages
- "Cost rate for John: $60/hour (Billing rate: $95/hour)"
- "35% profit margin on John's time"

**Availability:** Pro or Enterprise plan required

---

# 6. Approval Workflows

## 6.1 Timesheet Submission

### 6.1.1 Submit Timesheet
**Description:** Submit tracked time for manager approval.

#### User Actions
- Navigate to Timesheet view
- Review time entries for period (week/month/semi-monthly)
- Ensure all required fields filled
- Click "Submit for Approval" button
- Add submission notes (optional)
- Confirm submission

#### UI States
- **Ready to Submit:** Blue "Submit" button enabled
- **Submitting:** Loading indicator
- **Submitted:** Yellow banner "Pending Approval"
- **Cannot Submit:** Gray button with tooltip explaining why

#### Submission Periods
- Weekly (Monday-Sunday or custom)
- Semi-monthly (1-15, 16-end of month)
- Monthly (calendar month)

#### Feedback Messages
- "Timesheet submitted successfully"
- "Week of Jan 15-21 submitted for approval"
- "Your manager will be notified"
- "Cannot submit: Missing project on 3 entries"

### 6.1.2 Withdraw Submission
**Description:** Retract submitted timesheet to make edits.

#### User Actions
- View submitted timesheet
- Click "Withdraw" button
- Timesheet returns to editable state
- Make necessary changes
- Resubmit for approval

#### UI States
- **Pending Approval:** "Withdraw" button visible
- **Withdrawing:** Loading indicator
- **Withdrawn:** Green banner "You can now edit your timesheet"
- **Cannot Withdraw:** Gray button if already approved

#### Feedback Messages
- "Timesheet withdrawn - Now editable"
- "Make your changes and resubmit"
- "Cannot withdraw approved timesheets"

### 6.1.3 Edit Pending Timesheet
**Description:** Make changes while submission is pending approval.

#### User Actions
- Timesheet remains editable while pending
- Changes automatically reflected in approval view
- No need to withdraw and resubmit
- Manager sees updates in real-time

#### Feedback Messages
- "Changes saved to pending timesheet"
- "Manager will see updated entries"

## 6.2 Timesheet Approval

### 6.2.1 Approval Queue
**Description:** Manager interface for reviewing submitted timesheets.

#### User Actions
- Navigate to Approvals page
- View list of pending submissions
- Filter by team member, date, project
- See submission date and period
- Orange notification dot indicates pending items

#### UI States
- **Approval List:** Table with submitted timesheets
- **Pending Badge:** Orange "Pending" status indicator
- **Approval Count:** Number showing "5 timesheets pending"
- **Empty State:** "No pending approvals"

#### Displayed Information
- Team member name
- Period (e.g., "Week of Jan 15-21")
- Total hours submitted
- Projects worked on
- Submission date
- Notes from submitter

#### Feedback Messages
- "5 timesheets pending approval"
- "New timesheet submitted by John Doe"

### 6.2.2 Review and Approve
**Description:** Examine timesheet details and approve.

#### User Actions
- Click on pending timesheet
- Review all time entries
- Check for accuracy and completeness
- View daily breakdown
- Add approval notes
- Click "Approve" button
- Or approve multiple in bulk "Approve All"

#### UI States
- **Review Mode:** Detailed view of all entries
- **Approving:** Loading indicator
- **Approved:** Green checkmark and "Approved" badge
- **Locked:** Entries become read-only after approval

#### Feedback Messages
- "Timesheet approved for John Doe"
- "Week of Jan 15-21: 42 hours approved"
- "Employee notified via email"
- "Timesheet is now locked"

### 6.2.3 Reject Timesheet
**Description:** Return timesheet to employee for corrections.

#### User Actions
- Click "Reject" button
- Enter rejection reason (required)
- Specify what needs correction
- Send rejection notification

#### UI States
- **Rejection Modal:** Text field for reason
- **Rejected:** Red badge showing rejected status
- **Editable:** Timesheet unlocked for employee

#### Feedback Messages
- "Timesheet rejected and returned to John Doe"
- "Rejection reason: Please add project details to Friday entries"
- "Employee can make changes and resubmit"

### 6.2.4 Bulk Approval
**Description:** Approve multiple timesheets at once.

#### User Actions
- Select multiple pending timesheets (checkboxes)
- Click "Approve Selected" or "Approve All"
- Confirm bulk approval
- All selected timesheets approved simultaneously

#### Feedback Messages
- "5 timesheets approved successfully"
- "Bulk approval completed - All employees notified"

### 6.2.5 Approval Permissions
**Description:** Who can approve timesheets.

#### Approval Hierarchy
- **Admins/Owners:** Can approve all timesheets
- **Team Managers:** Approve their team members only
- **Project Managers:** Approve timesheets with time on their projects

#### Feedback Messages
- "You can approve timesheets for 8 team members"
- "Requires Standard plan or higher"

**Availability:** Standard plan or higher required

## 6.3 Time Off Management

### 6.3.1 Time Off Policies
**Description:** Define leave types and accrual rules.

#### User Actions
- Create time off policy (e.g., "Vacation Days")
- Set accrual rate (hours per month)
- Set maximum balance cap
- Define carryover rules (year-end)
- Assign policy to team members or groups
- Set policy priority

#### Policy Types
- Vacation/PTO
- Sick leave
- Holidays
- Unpaid leave
- Custom leave types

#### UI States
- **Policy List:** Table showing all time off policies
- **Policy Details:** Configuration form for policy
- **Assignment View:** Team members assigned to policy

#### Feedback Messages
- "Policy 'Vacation Days' created"
- "Accrual: 10 hours/month, Max: 200 hours"
- "Assigned to 25 team members"

**Availability:** Standard plan or higher required

### 6.3.2 Request Time Off
**Description:** Submit leave requests for approval.

#### User Actions
- Click "Request Time Off"
- Select time off policy/type
- Choose dates (full day or partial)
- Enter total hours
- Add notes explaining request
- Submit request

#### UI States
- **Request Form:** Calendar picker and hours input
- **Submitting:** Loading indicator
- **Pending:** Yellow badge on request
- **Balance Display:** Shows available balance

#### Feedback Messages
- "Time off request submitted"
- "Jan 22-24 (24 hours) pending approval"
- "Remaining balance: 56 hours"
- "Insufficient balance for this request"

### 6.3.3 Approve Time Off
**Description:** Manager approval of leave requests.

#### User Actions
- View time off requests in Approvals page
- See employee, dates, type, hours
- Check team calendar for conflicts
- Approve or deny request
- Add approval notes

#### UI States
- **Request List:** Table of pending requests
- **Calendar View:** Visual timeline of team time off
- **Approved:** Green badge and calendar block
- **Denied:** Red badge with reason

#### Feedback Messages
- "Time off approved for John Doe"
- "Jan 22-24 marked as Vacation"
- "Employee notified of approval"
- "Request denied: Team coverage insufficient"

### 6.3.4 Time Off Calendar
**Description:** Visualize team availability and time off.

#### User Actions
- View team calendar with time off blocks
- See who's out today/this week
- Identify scheduling conflicts
- Plan projects around absences
- Export time off schedule

#### UI States
- **Calendar Grid:** Month or week view
- **Time Off Blocks:** Color-coded by type
- **Tooltip on Hover:** Shows employee and reason
- **Today Indicator:** Highlighted current date

#### Feedback Messages
- "3 team members out today"
- "John Doe on vacation Jan 22-24"

### 6.3.5 Holiday Calendars
**Description:** Configure company holidays and observances.

#### User Actions
- Create holiday calendar
- Add holidays manually or import
- Set holidays as paid/unpaid
- Apply calendar to team or groups
- Holidays auto-marked on timesheets

#### UI States
- **Holiday List:** Table of holidays with dates
- **Calendar View:** Holidays highlighted
- **Import Option:** Upload CSV of holidays

#### Feedback Messages
- "Holiday 'New Year's Day' added to Jan 1"
- "10 holidays configured for 2026"
- "Holidays applied to entire workspace"

### 6.3.6 Balance Tracking
**Description:** Monitor time off accruals and usage.

#### User Actions
- View personal time off balance
- See accrual history
- Track used vs available time
- Manager view of all team balances
- Manually adjust balances (admin)

#### UI States
- **Balance Widget:** Shows current hours available
- **Accrual Timeline:** Graph showing balance over time
- **Usage History:** List of approved time off

#### Feedback Messages
- "Current balance: 80 hours available"
- "Accrued 10 hours this month"
- "Used 24 hours in January"
- "Balance adjusted by admin: +16 hours"

### 6.3.7 Time Off Entries
**Description:** Track time off as time entries for reporting.

#### User Actions
- Enable "Time off entries" option
- Approved time off auto-creates time entries
- Time off appears in timesheet and reports
- Marked with special time off icon
- Excluded from project time

#### Feedback Messages
- "Time off entries created for Jan 22-24"
- "Time off visible in reports"

## 6.4 Approval Notifications

### 6.4.1 Submission Reminders
**Description:** Automatic reminders for timesheet submission.

#### User Actions
- Admin configures reminder schedule
- Reminders sent before deadline (e.g., Friday 4pm)
- Choose notification method (email, in-app)
- Snooze or dismiss reminder

#### Feedback Messages
- "Reminder: Submit your timesheet by 5pm today"
- "You have 2 hours to submit your timesheet"

### 6.4.2 Approval Notifications
**Description:** Alerts for managers about pending approvals.

#### User Actions
- Manager receives notification when timesheet submitted
- Orange dot indicator in sidebar
- Email notification (configurable)
- Push notification on mobile

#### Feedback Messages
- "5 timesheets pending your approval"
- "New timesheet submitted by John Doe"

### 6.4.3 Status Notifications
**Description:** Inform employees of approval/rejection.

#### User Actions
- Employee auto-notified when approved/rejected
- Email with approval status
- In-app notification
- Rejection includes manager's notes

#### Feedback Messages
- "Your timesheet was approved"
- "Your timesheet was rejected: Please revise Friday entries"

---

# 7. Activity Monitoring

## 7.1 Auto-Tracker

### 7.1.1 App & Website Tracking
**Description:** Automatically monitor desktop applications and websites during work time.

#### User Actions
- Install desktop app (Windows/Mac)
- Enable auto-tracker in settings
- Start timer to begin monitoring
- Apps/sites tracked if viewed for 10+ seconds
- Review tracked activity timeline
- Categorize apps as productive/unproductive/neutral

#### UI States
- **Tracker Active:** Blue indicator in system tray
- **Activity Timeline:** Bar chart showing app usage by hour
- **App List:** Table with app name, duration, percentage
- **Category Colors:** Green (productive), yellow (neutral), red (unproductive)

#### Privacy Settings
- User can enable/disable tracking
- Activity data stored locally on device
- Only user can see their activity details
- Admins see only summary if enabled

#### Feedback Messages
- "Auto-tracker enabled - Monitoring apps when timer runs"
- "Top app today: VS Code (4h 30m)"
- "10+ seconds in app required to track"

**Platform:** Desktop apps only (Windows/Mac - not available on Mac App Store version)

### 7.1.2 Activity Categorization
**Description:** Label apps and websites by productivity level.

#### User Actions
- View list of tracked apps/sites
- Click to categorize each
- Choose: Productive, Neutral, or Unproductive
- Categories used for productivity reports
- Pre-set categories for common apps

#### UI States
- **Uncategorized:** Gray badge "Not categorized"
- **Productive:** Green badge with checkmark
- **Neutral:** Yellow badge
- **Unproductive:** Red badge with X

#### Feedback Messages
- "VS Code categorized as Productive"
- "Productivity score: 78% (based on app categories)"

### 7.1.3 Auto-Start Time Entries
**Description:** Automatically create time entries based on app usage.

#### User Actions
- Set rules to auto-start timer for specific apps
- Example: Opening VS Code starts project "Development"
- Configure app → project/task mapping
- Review and edit auto-created entries
- Disable for specific apps

#### Feedback Messages
- "Timer auto-started for 'Development' project"
- "VS Code opened - Time tracking started"
- "Rule created: Figma → Design Project"

## 7.2 GPS Tracking

### 7.2.1 Mobile GPS Tracking
**Description:** Track location of field workers when clocking in.

#### User Actions
- Enable GPS tracking on mobile app (iOS/Android)
- Employee clocks in via mobile app
- GPS coordinates captured at clock-in/out
- Manager views employee location history
- Route replay shows path traveled

#### UI States
- **Location Permission:** Prompt to enable GPS
- **Tracking Active:** Location icon in app status bar
- **Map View:** Shows employee current location
- **Route History:** Timeline of locations visited

#### Privacy
- GPS only captured when user clocks in
- Location data visible to managers only
- Employees see notification when tracked
- Can be disabled per workspace

#### Feedback Messages
- "GPS tracking enabled"
- "Location captured: 123 Main St, Anytown"
- "John Doe at Client Site A (last updated 5 min ago)"

**Availability:** Pro or Enterprise plan required
**Platform:** Mobile apps only (iOS/Android)

### 7.2.2 Geolocation History
**Description:** View historical location data for field teams.

#### User Actions
- View 7 days of location history
- See all places visited during shifts
- Replay route taken during day
- Export location data
- Verify on-site presence

#### UI States
- **Map Timeline:** Shows points on map with timestamps
- **Route Replay:** Animated playback of movement
- **Location List:** Table with address, time, duration

#### Feedback Messages
- "Visited 5 client sites on Jan 15"
- "Total travel time: 2h 15m"
- "On-site at Client A: 3h 30m"

### 7.2.3 Geofencing
**Description:** Define location boundaries for clock-in restrictions.

#### Limitations
- **Not Currently Available:** Clockify does not support geofencing
- Cannot restrict clock-ins to specific locations
- No alerts when employees clock in from wrong location

## 7.3 Screenshots

### 7.3.1 Optional Screenshot Recording
**Description:** Capture periodic screenshots during time tracking.

#### User Actions
- Enable screenshots in workspace settings (admin)
- Screenshots taken every 5 minutes when timer runs
- User receives notification when active
- Screenshots blurred by default for privacy
- Can enable high-resolution mode
- Review screenshots in activity timeline

#### UI States
- **Screenshot Active:** Camera icon indicator
- **Screenshot Gallery:** Thumbnail grid with timestamps
- **Blurred View:** Default privacy mode
- **Full Resolution:** Click to view detail (if enabled)

#### Privacy Controls
- User notified before screenshot taken
- Blurred by default
- User can delete screenshots
- Admin can disable screenshots

#### Feedback Messages
- "Screenshot recording enabled"
- "Screenshots taken every 5 minutes"
- "Notification shown before capture"
- "25 screenshots captured today"

**Availability:** Pro or Enterprise plan required
**Platform:** Desktop apps only (Windows/Mac)

### 7.3.2 Screenshot Settings
**Description:** Configure screenshot behavior and quality.

#### Admin Configuration
- Enable/disable screenshots workspace-wide
- Set capture frequency (every 5 minutes)
- Choose blur level (default/high)
- Allow user deletion of screenshots
- Set retention period (days/weeks)

#### User Settings
- Enable/disable for personal use
- View notification preferences
- Delete individual screenshots
- Blur level preference

#### Feedback Messages
- "Screenshots enabled for Pro plan users"
- "Capture frequency: Every 5 minutes"
- "Retention period: 30 days"

## 7.4 Idle Time Detection

### 7.4.1 Automatic Idle Detection
**Description:** Identify periods of inactivity during time tracking.

#### How It Works
- Monitors keyboard and mouse activity
- Detects idle time after X minutes of inactivity (configurable)
- Notification shown when idle detected
- User chooses what to do with idle time

#### User Actions
- Configure idle threshold (e.g., 10 minutes)
- Receive idle detection notification
- Choose action: Discard, Discard & Continue, or Keep
- Review idle time before making decision

#### UI States
- **Idle Detected:** Popup with three action buttons
- **Timer Paused:** Yellow indicator during idle
- **Idle Time:** Gray highlighted section in timeline
- **Notification:** Desktop alert with options

#### Idle Time Actions
1. **Discard idle time:** Timer stopped, idle time removed
2. **Discard and continue:** Idle time removed, new timer starts
3. **Keep idle time:** Timer continues with idle time included

#### Feedback Messages
- "No activity for 10 minutes - What to do?"
- "Idle time (10m) removed - Timer stopped at 2:30 PM"
- "Timer resumed at 2:45 PM"
- "Idle time kept - Timer still running"

#### Privacy
- Idle detection data stays on local computer
- Admins cannot see user idle activity
- Data not synced to cloud

**Platform:** Desktop apps (Windows, Mac - not Mac App Store version)

### 7.4.2 Idle Detection Settings
**Description:** Configure idle detection behavior.

#### User Configuration
- Set idle threshold (5, 10, 15, 20 minutes)
- Choose default action (ask, auto-discard, auto-keep)
- Enable/disable notifications
- Configure notification sound

#### Feedback Messages
- "Idle detection set to 10 minutes"
- "Default action: Always ask"
- "Notifications enabled"

## 7.5 Activity Reports

### 7.5.1 Personal Activity Summary
**Description:** Review own productivity and app usage.

#### User Actions
- View daily/weekly activity report
- See top apps and websites used
- View productivity score (if categorized)
- Compare time tracked vs active time
- Identify distractions

#### Metrics Displayed
- Total tracked time
- Active time (excluding idle)
- Top 10 apps by duration
- Productivity breakdown (%)
- Most/least productive hours

#### Feedback Messages
- "Active time: 7h 30m of 8h tracked (94%)"
- "Productivity score: 82%"
- "Most productive: 10am-12pm"

### 7.5.2 Team Activity Overview (Manager)
**Description:** Manager view of team productivity (if enabled).

#### User Actions
- View team activity summaries
- See which apps teams are using
- Compare productivity across team
- Identify training needs
- Generate activity reports

#### Displayed Data
- Team member names
- Total tracked time
- Active vs idle time
- Top applications used (aggregated)
- Productivity trends

#### Privacy Considerations
- Detailed app data stays private
- Managers see only summaries
- Must be explicitly enabled by admin
- Users notified if monitoring active

#### Feedback Messages
- "Team average productivity: 76%"
- "Top team app: Slack (12% of time)"

---

# 8. Multi-Platform Access

## 8.1 Web Application

### 8.1.1 Web App Features
**Description:** Full-featured browser-based interface.

#### Access
- URL: clockify.me (or custom subdomain for Enterprise)
- Works in all modern browsers
- No installation required
- Responsive design for tablets
- Real-time sync across sessions

#### Full Feature Set
- Start/stop timer
- Manual time entry
- Calendar and timesheet views
- Projects and task management
- Reports and dashboard
- Team management (admins)
- Invoicing and expenses
- Settings and configuration

#### UI States
- **Dashboard:** Landing page with quick timer start
- **Responsive Layout:** Adapts to browser width
- **Sidebar Navigation:** Access to all sections
- **Timer Always Visible:** Persistent header with timer

#### Feedback Messages
- "Timer synced across all devices"
- "Data saved automatically"

### 8.1.2 Browser Requirements
**Description:** Supported browsers and versions.

#### Supported Browsers
- Google Chrome (latest)
- Mozilla Firefox (latest)
- Microsoft Edge (latest)
- Safari (latest on macOS)
- Brave, Vivaldi (Chromium-based)

#### Feedback Messages
- "Unsupported browser detected - Please update"
- "For best experience, use latest Chrome or Firefox"

## 8.2 Desktop Applications

### 8.2.1 Windows Desktop App
**Description:** Native Windows application with enhanced features.

#### Installation
- Download from clockify.me/downloads
- System requirements: Windows 7 or later
- Standalone installer, no admin rights required
- Auto-update functionality

#### Enhanced Features
- System tray integration
- Idle time detection
- Auto-tracker (apps/websites)
- Optional screenshots
- Offline tracking with sync
- Desktop notifications
- Pomodoro timer
- Start/stop with hotkeys

#### UI States
- **System Tray Icon:** Quick access menu
- **Mini Timer:** Small floating window option
- **Full Application:** Complete interface
- **Notification Center:** Desktop alerts

#### Feedback Messages
- "Clockify running in system tray"
- "Auto-tracker enabled - Monitoring apps"
- "Idle time detected - 10 minutes"

### 8.2.2 Mac Desktop App
**Description:** Native macOS application.

#### Installation Options
- **Direct Download:** From clockify.me/downloads (recommended)
- **Mac App Store:** Limited version (no idle detection)

#### Differences
- **Direct Version:** Full features including idle detection
- **App Store Version:** No idle detection due to Apple restrictions

#### Enhanced Features (Direct Download)
- Menu bar integration
- Idle time detection
- Auto-tracker
- Optional screenshots
- Offline tracking
- Desktop notifications
- Keyboard shortcuts

#### UI States
- **Menu Bar Icon:** Quick access dropdown
- **Notification Badge:** Shows active timer
- **Dark Mode Support:** Matches system theme

#### Feedback Messages
- "Running in menu bar"
- "Download direct version for idle detection feature"

### 8.2.3 Linux Desktop App
**Description:** Linux application for Debian/Ubuntu and RPM-based systems.

#### Installation
- .deb package for Debian/Ubuntu
- .rpm package for Fedora/RHEL
- AppImage for universal compatibility
- Available from clockify.me/downloads

#### Features
- Core time tracking functionality
- Desktop notifications
- System tray integration
- Offline sync

#### Feedback Messages
- "Clockify installed on Linux"
- "Integration with system notifications enabled"

## 8.3 Mobile Applications

### 8.3.1 iOS App
**Description:** Native iPhone and iPad application.

#### Installation
- Download from Apple App Store
- Requirements: iOS 13.0 or later
- Universal app (iPhone/iPad optimized)
- Free download

#### Mobile-Optimized Features
- Quick start/stop timer with widget
- GPS tracking for field work
- Clock in/out from anywhere
- Push notifications
- Offline tracking with sync
- Manual time entry
- View reports
- Request time off
- Log expenses (Pro+)

#### UI States
- **Home Screen Widget:** Quick timer control
- **Notification Badge:** Shows active timer
- **Today Widget:** Glanceable timer status

#### Feedback Messages
- "Timer running in background"
- "GPS tracking active"
- "Syncing 3 offline entries..."

### 8.3.2 Android App
**Description:** Native Android application.

#### Installation
- Download from Google Play Store
- Requirements: Android 6.0 or later
- Free download
- Regular updates

#### Mobile Features
- Quick timer start/stop
- Persistent notification with timer
- GPS tracking
- Clock in/out
- Offline mode
- Manual entries
- Expense logging (Pro+)
- Time off requests
- Basic reports

#### UI States
- **Persistent Notification:** Shows running timer, quick stop
- **Home Screen Widget:** Timer control
- **Material Design:** Native Android look and feel

#### Feedback Messages
- "Tracking time in background"
- "Battery optimization: Disable for accurate tracking"

### 8.3.3 Mobile Limitations
**Description:** Features not available on mobile apps.

#### Mobile Restrictions
- No detailed report creation (view only)
- No admin/workspace settings
- No project creation (track on existing only)
- Limited editing of time entries
- No invoicing
- No team management
- No desktop-specific features (auto-tracker, screenshots)

#### Feedback Messages
- "For full features, use web or desktop app"
- "Project creation available on web app"

## 8.4 Browser Extensions

### 8.4.1 Chrome Extension
**Description:** Track time directly from Chrome browser.

#### Installation
- Install from Chrome Web Store
- Free extension
- Works with Chromium browsers (Edge, Brave, Vivaldi)

#### Extension Features
- Start/stop timer from toolbar
- Mini timer display
- Quick project/task selection
- Pomodoro timer
- Idle detection reminders
- Integrations with web tools
- Time entry suggestions based on browser activity

#### Integrated Tools
- Jira, Trello, Asana, Monday.com
- GitHub, GitLab, Bitbucket
- Google Calendar, Gmail
- Slack, Pumble
- Basecamp, Xero
- 80+ other web apps

#### UI States
- **Extension Icon:** Shows timer status (active/stopped)
- **Popup Interface:** Click icon for quick timer control
- **Integration Buttons:** Appear on supported websites
- **Badge:** Shows elapsed time on icon

#### Usage Example
- Open Jira ticket → Clockify button appears
- Click to start timer with ticket info pre-filled
- Timer tracks time while working
- Stop when done

#### Feedback Messages
- "Timer started from Jira ticket #1234"
- "Clockify integrated with this page"
- "Time tracked: 1h 25m on this task"

### 8.4.2 Firefox Extension
**Description:** Mozilla Firefox browser extension.

#### Installation
- Install from Firefox Add-ons
- Same features as Chrome extension
- Works on Firefox for Desktop

#### Feedback Messages
- "Clockify for Firefox installed"
- "Integration active on 80+ websites"

### 8.4.3 Edge Extension
**Description:** Microsoft Edge browser extension.

#### Installation
- Install from Microsoft Edge Add-ons
- Or install Chrome version (compatible)
- Same functionality as Chrome extension

## 8.5 Data Synchronization

### 8.5.1 Real-Time Sync
**Description:** Instant synchronization across all platforms.

#### Sync Behavior
- Timer start/stop syncs immediately
- Changes reflect across all devices in seconds
- Cloud-based data storage
- Automatic conflict resolution
- No manual sync required

#### What Syncs
- Time entries
- Projects and tasks
- Tags and descriptions
- Approvals and submissions
- Settings and preferences
- Expenses and invoices

#### UI States
- **Syncing:** Brief indicator when saving
- **Synced:** Green checkmark "All changes saved"
- **Sync Error:** Red warning with retry option

#### Feedback Messages
- "Timer synced across all devices"
- "Changes saved to cloud"
- "Sync error - Check connection"

### 8.5.2 Offline Mode & Sync
**Description:** Work without internet, sync when reconnected.

#### Offline Capabilities
- Track time without connection
- Create manual entries
- Edit existing entries
- Data stored locally on device
- Automatic sync when online

#### Sync Process
- App detects connection restored
- Uploads offline changes to cloud
- Downloads changes from other devices
- Resolves conflicts automatically
- Notifies when sync complete

#### Conflict Resolution
- Last write wins for simple edits
- User prompted for overlapping entries
- Duplicate prevention

#### UI States
- **Offline Mode:** Orange cloud icon with slash
- **Syncing:** Spinning sync icon with progress
- **Synced:** Green checkmark
- **Conflict:** Warning dialog requiring user input

#### Feedback Messages
- "Working offline - Will sync when online"
- "Syncing 5 offline entries..."
- "All entries synced successfully"
- "Conflict detected - Please review entry overlap"

### 8.5.3 Cross-Platform Consistency
**Description:** Uniform experience across all platforms.

#### Consistent Features
- Timer functionality
- Time entry creation and editing
- Project/task selection
- Reports viewing
- Basic settings

#### Platform-Specific Features
- **Desktop Only:** Auto-tracker, screenshots, idle detection
- **Mobile Only:** GPS tracking
- **Web Only:** Full admin settings, advanced reporting
- **Browser Extension Only:** Integration buttons in web tools

#### Feedback Messages
- "Feature available on desktop app"
- "Use web app for full reporting capabilities"

---

# 9. Integrations & API

## 9.1 Integration Categories

### 9.1.1 Project Management Integrations
**Description:** Connect with popular project management tools.

#### Supported Tools
- **Asana:** Start timer from tasks
- **Trello:** Track time on cards
- **Jira:** Time tracking on issues
- **Monday.com:** Track directly from boards
- **Basecamp:** Time entry from to-dos
- **ClickUp:** Integrated time tracking
- **Notion:** Time tracking in pages
- **Wrike:** Task-level tracking

#### Integration Features
- One-click timer start from tasks/issues
- Automatic task name import
- Project mapping
- Time entry sync back to tool
- Bidirectional updates (some tools)

#### How to Use
1. Install Clockify browser extension
2. Navigate to integrated tool
3. Clockify button appears on tasks
4. Click to start timer with task details
5. Stop timer when complete

#### Feedback Messages
- "Timer started from Jira issue ABC-123"
- "Task name imported: 'Fix login bug'"
- "Time synced back to Asana"

### 9.1.2 Development Tool Integrations
**Description:** Integrate with developer platforms and tools.

#### Supported Platforms
- **GitHub:** Track time on issues and PRs
- **GitLab:** Issue and merge request tracking
- **Bitbucket:** Repository and issue tracking
- **Azure DevOps:** Work item tracking
- **Stack Overflow:** Track research time

#### Integration Use Cases
- Track time on code reviews
- Log debugging sessions
- Time spent on issues
- Research and learning time

#### Feedback Messages
- "Timer started from GitHub PR #456"
- "Tracking time on merge request review"

### 9.1.3 Communication Tool Integrations
**Description:** Connect with team communication platforms.

#### Supported Tools
- **Slack:** Start timers from Slack messages
- **Microsoft Teams:** Timer bot integration
- **Pumble:** Native Clockify integration
- **Discord:** Community bots available

#### Slack Integration Features
- `/clockify` slash commands
- Start/stop timer from any channel
- View current timer status
- Get time tracking reports
- Team reminders

#### Slack Commands
- `/clockify start` - Start timer
- `/clockify stop` - Stop timer
- `/clockify status` - See current timer
- `/clockify today` - View today's tracked time

#### Feedback Messages
- "Timer started: 0:00:05 - Project Alpha"
- "Timer stopped. Duration: 2h 15m"
- "Today's total: 6h 30m"

### 9.1.4 Accounting & Billing Integrations
**Description:** Sync time data with accounting software.

#### Supported Tools
- **QuickBooks:** Sync invoices and time entries
- **Xero:** Export billable time for invoicing
- **FreshBooks:** Time tracking to invoices
- **Harvest:** Data migration
- **Zoho Books:** Accounting sync

#### Integration Features
- Export billable hours to invoices
- Sync client information
- Track expenses alongside time
- Financial reporting
- Tax compliance data

#### Feedback Messages
- "156 hours exported to QuickBooks"
- "Invoice created in Xero from Clockify time"

### 9.1.5 Calendar Integrations
**Description:** Sync with calendar applications.

#### Supported Calendars
- **Google Calendar:** Two-way sync
- **Outlook Calendar:** Event sync
- **Calendar (iOS):** View only

#### Calendar Features
- View calendar events in Clockify
- Start timer from calendar event
- Create time entries from events
- Block time for meetings
- Visual timeline with events

#### How It Works
- Connect calendar in Clockify settings
- Events appear in Calendar view
- Click event to start tracking time
- Match meeting time to calendar event

#### Feedback Messages
- "Google Calendar connected"
- "5 events imported today"
- "Timer started from event: Team Standup"

### 9.1.6 Browser-Based Integration
**Description:** Universal integration via browser extension.

#### How It Works
- Install Clockify browser extension (Chrome/Firefox/Edge)
- Extension detects 80+ supported web apps
- Adds "Start timer" button to tasks/issues
- Works across project management, dev tools, help desks, CRMs

#### Supported Categories
- Project Management (Asana, Trello, etc.)
- Development (GitHub, GitLab, etc.)
- Help Desk (Zendesk, Freshdesk, etc.)
- CRM (Salesforce, HubSpot, etc.)
- Email (Gmail, Outlook web)
- Documents (Google Docs, Notion)

#### Feedback Messages
- "Clockify integrated with this page"
- "Start timer button available on tasks"

## 9.2 Clockify API

### 9.2.1 REST API Overview
**Description:** Programmatic access to Clockify data and functionality.

#### API Specifications
- **Type:** REST API
- **Authentication:** API key (X-Api-Key header)
- **Documentation:** docs.clockify.me
- **Base URL:** `https://api.clockify.me/api/v1`
- **Rate Limit:** 50 requests/second (with addon token)
- **Response Format:** JSON

#### Common API Operations
- Get/create/update/delete time entries
- Manage projects and tasks
- Get user information
- Retrieve reports
- Manage clients
- Handle tags

#### Authentication
```
X-Api-Key: YOUR_API_KEY_HERE
```

#### API Key Location
- User Settings → API section
- Generate personal API key
- Keep key secure (treat like password)

#### Feedback Messages
- "API key generated successfully"
- "API key copied to clipboard"
- "Warning: Do not share your API key"

### 9.2.2 API Rate Limits
**Description:** Request throttling to ensure service stability.

#### Rate Limits
- **With Addon Token:** 50 requests/second per workspace
- **With API Key:** Subject to fair use policy
- **Burst Allowance:** Short bursts allowed
- **Throttle Response:** HTTP 429 Too Many Requests

#### Best Practices
- Cache responses when possible
- Use pagination for large datasets
- Batch operations when available
- Implement exponential backoff on errors

#### Feedback Messages
- "Rate limit exceeded - Retry after X seconds"
- "429 Error: Too many requests"

### 9.2.3 API Use Cases
**Description:** Common scenarios for API integration.

#### Integration Scenarios
1. **Custom Dashboards:** Pull time data into BI tools
2. **Payroll Systems:** Export hours for payroll processing
3. **Project Management:** Sync time with custom PM tools
4. **Automation:** Auto-create projects/tasks
5. **Mobile Apps:** Build custom time tracking interfaces
6. **Data Analysis:** Export for advanced analytics
7. **Client Portals:** Show time tracking to clients

#### Example Integrations
- Power BI dashboards
- Custom invoicing systems
- Automated reporting scripts
- Slack bots for time tracking
- Internal tools and portals

## 9.3 Webhooks

### 9.3.1 Webhook Configuration
**Description:** Receive real-time notifications for Clockify events.

#### Webhook Setup
- Navigate to Workspace Settings → Webhooks
- Click "Add Webhook"
- Enter webhook name
- Provide endpoint URL (your server)
- Select events to subscribe to
- Save webhook

#### Access
- Available to Workspace Owners and Admins only
- Regular users cannot create webhooks
- Up to 10 webhooks per admin
- Maximum 100 webhooks per workspace

#### UI States
- **Webhook List:** Shows all configured webhooks
- **Edit Webhook:** Modify settings
- **Test Webhook:** Send test payload
- **Active Badge:** Green if webhook receiving events

#### Feedback Messages
- "Webhook created: Time Entry Updates"
- "Test payload sent to endpoint"
- "Webhook disabled - Endpoint returned errors"

### 9.3.2 Webhook Events
**Description:** Types of events that trigger webhooks.

#### Available Events
- **NEW_TIME_ENTRY:** Time entry created
- **TIME_ENTRY_UPDATED:** Time entry modified
- **TIME_ENTRY_DELETED:** Time entry removed
- **TIMER_STARTED:** User starts timer
- **TIMER_STOPPED:** User stops timer
- **PROJECT_CREATED:** New project added
- **PROJECT_UPDATED:** Project modified
- **PROJECT_DELETED:** Project removed
- **TASK_CREATED:** New task added
- **TASK_UPDATED:** Task modified
- **TASK_DELETED:** Task removed
- **TIMESHEET_SUBMITTED:** User submits timesheet
- **TIMESHEET_APPROVED:** Manager approves timesheet
- **TIMESHEET_REJECTED:** Manager rejects timesheet

#### Payload Structure
```json
{
  "event": "NEW_TIME_ENTRY",
  "workspaceId": "abc123",
  "userId": "user456",
  "timeEntry": {
    "id": "entry789",
    "description": "Working on feature",
    "start": "2026-01-15T09:00:00Z",
    "end": "2026-01-15T11:00:00Z",
    "duration": "PT2H"
  }
}
```

### 9.3.3 Webhook Use Cases
**Description:** Practical applications of webhooks.

#### Common Use Cases
1. **Real-time Dashboard Updates:** Push live time data to dashboards
2. **Slack Notifications:** Alert team when milestones hit
3. **Automated Billing:** Trigger invoice generation
4. **Integration Sync:** Keep other systems in sync
5. **Audit Logging:** Record all time tracking activity
6. **Approval Workflows:** Custom approval processes
7. **Analytics Pipelines:** Stream data to analytics platforms

#### Example Workflow
- User submits timesheet → Webhook fires
- Your server receives event
- Trigger custom approval email
- Log to audit database
- Update payroll system

#### Feedback Messages
- "Webhook triggered: TIMER_STARTED"
- "Payload delivered to endpoint (200 OK)"
- "Webhook failed: Endpoint timeout"

### 9.3.4 Webhook Security
**Description:** Secure webhook endpoints.

#### Security Measures
- Use HTTPS endpoints only
- Implement signature verification
- Validate webhook IP addresses
- Rate limit webhook handling
- Implement retry logic
- Log all webhook events

#### Feedback Messages
- "Warning: HTTP endpoint not secure - Use HTTPS"
- "Webhook signature verification enabled"

## 9.4 Zapier & Automation Platforms

### 9.4.1 Zapier Integration
**Description:** Connect Clockify with 3,000+ apps via Zapier.

#### How It Works
- Connect Clockify account to Zapier
- Create "Zaps" (automated workflows)
- Trigger: Event in Clockify
- Action: Do something in another app
- Or vice versa: Event in app → Action in Clockify

#### Trigger Examples (Clockify → Other Apps)
- New time entry created → Add row to Google Sheets
- Timer started → Post message in Slack
- Timesheet approved → Create invoice in QuickBooks
- Project created → Create channel in Slack

#### Action Examples (Other Apps → Clockify)
- New Trello card → Create Clockify project
- Calendar event starts → Start Clockify timer
- Email received → Create time entry
- Task completed → Stop timer

#### Popular Zaps
- Clockify + Google Sheets: Export time entries
- Clockify + Slack: Time tracking notifications
- Clockify + Trello: Auto-create projects from boards
- Clockify + Gmail: Track email time

#### Feedback Messages
- "Zapier connected to Clockify"
- "Zap created: New time entry → Google Sheets"
- "10 time entries exported via Zapier today"

### 9.4.2 Other Automation Platforms
**Description:** Integrate via additional automation tools.

#### Supported Platforms
- **Integromat (Make):** Visual workflow builder
- **Integrately:** Pre-built automation recipes
- **n8n:** Self-hosted workflow automation
- **Pipedream:** Developer-focused automation

#### Feedback Messages
- "Clockify connected to Make"
- "5 workflows active with Integromat"

## 9.5 Import & Export

### 9.5.1 Data Import
**Description:** Migrate data from other time tracking tools.

#### Import Options
- **CSV Import:** Bulk import via spreadsheet
- **Migration Tools:** From competitors (Toggl, Harvest, etc.)
- **API Import:** Programmatic data migration

#### Importable Data
- Time entries
- Projects
- Tasks
- Clients
- Tags
- Custom fields
- Users (invite-only)

#### CSV Format
- Required columns: Start, End, Project, Description
- Optional: Task, Tags, Billable, User
- Template CSV available in Clockify

#### Import Process
1. Prepare CSV file
2. Navigate to Settings → Import
3. Upload CSV
4. Map columns to Clockify fields
5. Preview import
6. Confirm import

#### Feedback Messages
- "CSV uploaded - 1,245 entries found"
- "Importing time entries..."
- "Import complete: 1,240 imported, 5 errors"
- "Review errors: Missing project on 5 entries"

### 9.5.2 Data Export
**Description:** Export Clockify data for backup or analysis.

#### Export Formats
- **PDF:** Formatted reports
- **CSV:** Raw data for spreadsheets
- **Excel (XLSX):** Formatted workbooks
- **JSON:** Structured data via API

#### Export Options
- All time entries
- Filtered time entries (date range, project, user)
- Summary reports
- Detailed reports
- Invoices
- Expenses

#### Bulk Export
- Export all workspace data
- Includes all members, projects, time entries
- For backup or migration purposes
- Admin-only feature

#### Feedback Messages
- "Export started: 10,000 time entries"
- "Download ready: Time_Entries_2026.csv"
- "Workspace backup exported successfully"

---

# 10. Pricing Tiers

## 10.1 Plan Comparison

### 10.1.1 Free Plan
**Description:** Unlimited users and time tracking at no cost.

#### Price
- **$0/month** - Forever free
- Unlimited users
- Unlimited projects
- No credit card required
- No time limit on free usage

#### Core Features Included
- Unlimited time tracking
- Unlimited projects
- Unlimited workspaces
- Basic reports (Summary, Detailed, Weekly)
- Web, desktop, mobile apps
- Browser extensions
- Manual time entry and timer
- Project and task management
- Tags
- Billable rates (basic)
- Calendar view
- Basic dashboard

#### Limitations
- Cannot hide tracked time from team
- No bulk edit
- No project templates
- No advanced features (kiosk customization, GPS, expenses)
- Basic support only

#### Ideal For
- Freelancers
- Small teams (under 10 people)
- Basic time tracking needs
- Teams on tight budget
- Testing Clockify before upgrading

#### Feedback Messages
- "You're on the Free plan - Upgrade anytime"
- "Free plan includes unlimited users"
- "Upgrade to hide your time from team"

### 10.1.2 Basic Plan
**Description:** Entry-level paid features for small teams.

#### Price
- **$6.99/user/month** (billed monthly)
- **$5.49/user/month** (billed annually - 20% discount)
- Minimum 1 user

#### Additional Features Beyond Free
- Hide tracked time from team members
- Bulk edit time entries
- Project templates
- Required fields enforcement
- Invoicing (basic)
- Kiosk PIN authentication (4-6 digit)
- Custom export fields
- Project favorites
- Advanced permissions

#### Use Cases
- Small teams needing privacy controls
- Teams requiring templates
- Basic invoicing needs
- Clock-in/out with PIN

#### Feedback Messages
- "Basic plan: $5.49/user/month (annual)"
- "20% savings with annual billing"
- "Hide your time from team members"

### 10.1.3 Standard Plan
**Description:** Mid-tier plan with approval workflows.

#### Price
- **$9.99/user/month** (billed monthly)
- **$7.99/user/month** (billed annually - 20% discount)

#### Additional Features Beyond Basic
- Timesheet approval workflows
- Time off management and PTO tracking
- Manager roles (Project Manager, Team Manager)
- Kiosk QR code authentication
- Custom invoicing with branding
- Scheduled reports (email automation)
- Labor cost tracking
- User groups
- Advanced permissions
- Lock time entries
- Custom branding on reports

#### Use Cases
- Teams needing approval workflows
- Companies with managers and hierarchy
- Time off policy management
- Branded invoicing for clients
- Labor cost analysis

#### Feedback Messages
- "Standard plan: $7.99/user/month (annual)"
- "Enable timesheet approvals"
- "Managers can approve team time"

### 10.1.4 Pro Plan
**Description:** Advanced features for growing teams.

#### Price
- **$11.99/user/month** (billed monthly)
- **$9.99/user/month** (billed annually - 20% discount)

#### Additional Features Beyond Standard
- **GPS tracking** for field workers
- **Screenshot monitoring** (optional, every 5 minutes)
- **Expense tracking** with receipts
- **Custom fields** (up to 50)
- **Forecasting** and predictions
- **Scheduling** and capacity planning
- **Profit calculations** and cost rates
- **Project budget alerts**
- **Time off balance accrual**
- **Advanced integrations**
- **Target tracking**
- **Task assignment management**

#### Use Cases
- Field service teams (GPS tracking)
- Professional services (expenses)
- Complex project tracking (custom fields)
- Resource planning (scheduling)
- Profitability analysis
- Teams needing screenshot monitoring

#### Feedback Messages
- "Pro plan: $9.99/user/month (annual)"
- "Track expenses with receipts"
- "GPS tracking for field teams"
- "Enable screenshot monitoring"

### 10.1.5 Enterprise Plan
**Description:** Full-featured plan for large organizations.

#### Price
- **$14.99/user/month** (billed monthly)
- **$11.99/user/month** (billed annually - 20% discount)
- Can go up to **$29.99/user/month** for volume pricing

#### Additional Features Beyond Pro
- **Single Sign-On (SSO)** - SAML integration
- **Audit logs** - Complete activity history
- **Custom subdomain** - yourcompany.clockify.me
- **Priority support** - Dedicated support team
- **Account manager** - Personal customer success
- **Custom data retention** policies
- **Advanced security** controls
- **Volume discounts** available
- **Invoicing address customization**
- **Custom workspace limits**
- **White-label options** (potential)

#### Use Cases
- Enterprise organizations (100+ users)
- Companies requiring SSO
- Security-conscious organizations
- Teams needing audit trails
- Organizations with compliance needs
- Companies wanting dedicated support

#### Feedback Messages
- "Enterprise plan: $11.99/user/month (annual)"
- "SSO, audit logs, custom subdomain"
- "Contact sales for volume pricing"
- "Dedicated account manager included"

## 10.2 Feature Availability Matrix

### 10.2.1 Comprehensive Feature Comparison

| Feature | Free | Basic | Standard | Pro | Enterprise |
|---------|------|-------|----------|-----|------------|
| **Core Time Tracking** |
| Unlimited users | ✓ | ✓ | ✓ | ✓ | ✓ |
| Unlimited projects | ✓ | ✓ | ✓ | ✓ | ✓ |
| Timer & manual entry | ✓ | ✓ | ✓ | ✓ | ✓ |
| Web, desktop, mobile apps | ✓ | ✓ | ✓ | ✓ | ✓ |
| Browser extensions | ✓ | ✓ | ✓ | ✓ | ✓ |
| Calendar view | ✓ | ✓ | ✓ | ✓ | ✓ |
| Timesheet view | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pomodoro timer | ✓ | ✓ | ✓ | ✓ | ✓ |
| Idle time detection | ✓ | ✓ | ✓ | ✓ | ✓ |
| Offline tracking | ✓ | ✓ | ✓ | ✓ | ✓ |
| Break tracking | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Project Management** |
| Projects & clients | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tasks & subtasks | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tags | ✓ | ✓ | ✓ | ✓ | ✓ |
| Project templates | ✗ | ✓ | ✓ | ✓ | ✓ |
| Custom fields | ✗ | ✗ | ✗ | ✓ (50) | ✓ (50) |
| Project favorites | ✗ | ✓ | ✓ | ✓ | ✓ |
| **Team & Permissions** |
| User roles (Owner, Admin, User) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manager roles (Project/Team) | ✗ | ✗ | ✓ | ✓ | ✓ |
| User groups | ✗ | ✗ | ✓ | ✓ | ✓ |
| Hide time from team | ✗ | ✓ | ✓ | ✓ | ✓ |
| Advanced permissions | ✗ | ✓ | ✓ | ✓ | ✓ |
| **Reporting** |
| Basic reports (Summary, Detailed) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Export (PDF, CSV, Excel) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Shared report links | ✓ | ✓ | ✓ | ✓ | ✓ |
| Scheduled reports | ✗ | ✗ | ✓ | ✓ | ✓ |
| Custom export fields | ✗ | ✓ | ✓ | ✓ | ✓ |
| **Financial** |
| Billable rates | ✓ | ✓ | ✓ | ✓ | ✓ |
| Basic invoicing | ✗ | ✓ | ✓ | ✓ | ✓ |
| Custom invoicing | ✗ | ✗ | ✓ | ✓ | ✓ |
| Expense tracking | ✗ | ✗ | ✗ | ✓ | ✓ |
| Budget tracking | ✓ | ✓ | ✓ | ✓ | ✓ |
| Labor costs | ✗ | ✗ | ✓ | ✓ | ✓ |
| Profit calculations | ✗ | ✗ | ✗ | ✓ | ✓ |
| Forecasting | ✗ | ✗ | ✗ | ✓ | ✓ |
| **Approval & Time Off** |
| Timesheet submission | ✓ | ✓ | ✓ | ✓ | ✓ |
| Timesheet approval | ✗ | ✗ | ✓ | ✓ | ✓ |
| Time off management | ✗ | ✗ | ✓ | ✓ | ✓ |
| Time off policies | ✗ | ✗ | ✓ | ✓ | ✓ |
| Balance accrual | ✗ | ✗ | ✗ | ✓ | ✓ |
| **Kiosk** |
| Basic kiosk | ✓ | ✓ | ✓ | ✓ | ✓ |
| PIN authentication (4-6 digit) | ✗ | ✓ | ✓ | ✓ | ✓ |
| QR code authentication | ✗ | ✗ | ✓ | ✓ | ✓ |
| Kiosk customization | ✗ | ✗ | ✓ | ✓ | ✓ |
| **Activity Monitoring** |
| Auto-tracker (apps/websites) | ✓ | ✓ | ✓ | ✓ | ✓ |
| GPS tracking | ✗ | ✗ | ✗ | ✓ | ✓ |
| Screenshots | ✗ | ✗ | ✗ | ✓ | ✓ |
| **Advanced Features** |
| Scheduling | ✗ | ✗ | ✗ | ✓ | ✓ |
| Required fields | ✗ | ✓ | ✓ | ✓ | ✓ |
| Lock time entries | ✗ | ✗ | ✓ | ✓ | ✓ |
| Bulk edit | ✗ | ✓ | ✓ | ✓ | ✓ |
| Task assignments | ✗ | ✗ | ✗ | ✓ | ✓ |
| **Enterprise Features** |
| Single Sign-On (SSO) | ✗ | ✗ | ✗ | ✗ | ✓ |
| Audit logs | ✗ | ✗ | ✗ | ✗ | ✓ |
| Custom subdomain | ✗ | ✗ | ✗ | ✗ | ✓ |
| Priority support | ✗ | ✗ | ✗ | ✗ | ✓ |
| Account manager | ✗ | ✗ | ✗ | ✗ | ✓ |
| **Integrations** |
| 80+ web integrations | ✓ | ✓ | ✓ | ✓ | ✓ |
| API access | ✓ | ✓ | ✓ | ✓ | ✓ |
| Webhooks | ✓ | ✓ | ✓ | ✓ | ✓ |
| Zapier | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Support** |
| Email support | ✓ | ✓ | ✓ | ✓ | ✓ |
| Help center | ✓ | ✓ | ✓ | ✓ | ✓ |
| Priority support | ✗ | ✗ | ✗ | ✗ | ✓ |

## 10.3 Billing & Subscription

### 10.3.1 Billing Cycles
**Description:** Choose monthly or annual billing.

#### Billing Options
- **Monthly:** Pay each month, cancel anytime
- **Annual:** Pay once per year, save 20%

#### Annual Discount
- All paid plans: 20% OFF when paying annually
- Example: Pro plan $11.99/mo → $9.99/mo (annual)
- Billed as one payment annually

#### Pricing Examples
| Plan | Monthly | Annual (per month) | Annual Savings |
|------|---------|-------------------|----------------|
| Basic | $6.99 | $5.49 | 22% ($18/year per user) |
| Standard | $9.99 | $7.99 | 20% ($24/year per user) |
| Pro | $11.99 | $9.99 | 17% ($24/year per user) |
| Enterprise | $14.99 | $11.99 | 20% ($36/year per user) |

#### Feedback Messages
- "Annual plan: Save 20% ($240/year for 10 users)"
- "Billed annually: $119.90/year per user"

### 10.3.2 User Licenses
**Description:** Per-user pricing model.

#### How It Works
- Price per active user per month
- Add users anytime
- Deactivated users don't count toward billing
- Prorated charges when adding mid-cycle
- Prorated credits when removing users

#### Active vs Inactive Users
- **Active:** Can log in, counts toward billing
- **Deactivated:** Cannot log in, no charge
- **Invited:** Counts once they accept

#### Feedback Messages
- "25 active users × $9.99 = $249.75/month"
- "Deactivate user to free up license"
- "New user charge prorated: $5.00 for 15 days"

### 10.3.3 Plan Changes
**Description:** Upgrade or downgrade subscription.

#### Upgrade
- Takes effect immediately
- Prorated charge for remainder of current cycle
- Access to new features instantly
- No data loss

#### Downgrade
- Takes effect at end of current billing cycle
- Keep features until cycle ends
- Data preserved, some features locked
- Can re-upgrade anytime

#### Cancel Subscription
- Downgrades to Free plan at end of cycle
- Data retained, premium features locked
- Can re-subscribe anytime
- No penalties for canceling

#### Feedback Messages
- "Upgraded to Pro plan - New features active now"
- "Downgrade scheduled for Feb 28"
- "Subscription canceled - Reverts to Free on March 1"

### 10.3.4 Payment Methods
**Description:** Accepted payment options.

#### Accepted Methods
- Credit cards (Visa, Mastercard, Amex)
- Debit cards
- Purchase orders (Enterprise)
- Invoice billing (Enterprise, high volume)

#### Billing Management
- Update payment method anytime
- View billing history
- Download invoices
- Change billing email
- Owners and Admins can manage billing

#### Feedback Messages
- "Payment method updated"
- "Next billing date: March 1, 2026"
- "Invoice available for download"

## 10.4 Trial & Free Migration

### 10.4.1 Paid Plan Trials
**Description:** Test paid features before committing.

#### Trial Availability
- Some paid plans offer trial periods
- Full access to plan features during trial
- No credit card required for some trials
- Cancel anytime during trial with no charge

#### Feedback Messages
- "Pro plan trial: 14 days remaining"
- "Trial ends Feb 28 - Subscribe to keep features"

### 10.4.2 Migration from Free
**Description:** Seamless upgrade from Free plan.

#### Migration Process
- One-click upgrade from any page
- All data automatically carried over
- No data export/import needed
- New features activate immediately
- Current settings preserved

#### Feedback Messages
- "Upgraded from Free to Pro"
- "All 156 projects and 12,450 time entries migrated"
- "New features now available"

## 10.5 Volume Discounts (Enterprise)

### 10.5.1 Large Team Pricing
**Description:** Special pricing for large organizations.

#### Volume Tiers
- 100+ users: Contact for custom pricing
- 500+ users: Significant discounts available
- 1000+ users: Enterprise pricing up to $29.99/user
- Custom contracts available

#### Contact Sales
- Request quote for large teams
- Negotiate custom pricing
- Annual commitments may offer additional savings
- Custom terms and SLAs available

#### Feedback Messages
- "Contact sales for 100+ user pricing"
- "Enterprise pricing: Volume discounts available"
- "Get quote for your team size"

---

## Document Metadata

**Document Version:** 1.0
**Last Updated:** January 15, 2026
**Based on Clockify:** 2026 feature set
**Purpose:** Competitive feature specification for time-tracking application development

**Research Sources:**
- Clockify official documentation and website
- Clockify Help Center
- Third-party reviews and comparisons
- Feature announcements and updates

---

## Sources

This specification was compiled from comprehensive web research about Clockify's features, capabilities, and pricing as of January 2026. Key sources include:

- [Clockify™ - FREE Time Tracking Software](https://clockify.me/)
- [Clockify Review 2026: Is It the Best Time Tracker for You?](https://work-management.org/productivity-tools/clockify-review/)
- [Clockify Review 2026 — Is It Still the Best Free Time Tracker?](https://www.anysecura.com/blogs/clockify.html)
- [Honest Clockify App Review 2026: Features, Pricing & More](https://connecteam.com/reviews/clockify/)
- [Clockify Help - Subscription plans](https://clockify.me/help/administration/subscription-plans)
- [Plans & Pricing - Clockify™](https://clockify.me/pricing)
- [Clockify Pricing 2026: Is the Free Plan Actually Enough for Enterprises?](https://flowace.ai/blog/clockify-pricing-free-tier-vs-enterprises/)
- [Project management in Clockify](https://clockify.me/learn/resources/manage-projects-in-clockify/)
- [Projects - Clockify Features](https://clockify.me/features/projects)
- [Understanding user roles & access permissions - Clockify Help](https://clockify.me/help/administration/user-roles-and-permissions/who-can-do-what)
- [Managers - Clockify Help](https://clockify.me/help/administration/user-roles-and-permissions/manager-role)
- [Dashboard - Clockify Help](https://clockify.me/help/reports/dashboard)
- [Reports - Clockify Features](https://clockify.me/features/reports)
- [Invoicing - Clockify Features](https://clockify.me/features/invoicing)
- [Track expenses - Clockify Help](https://clockify.me/help/track-time-and-expenses/expenses)
- [Approve time & expenses - Clockify Help](https://clockify.me/help/track-time-and-expenses/approval)
- [Submit time & expenses for approval - Clockify Help](https://clockify.me/help/track-time-and-expenses/submit-time-expenses-for-approval)
- [Clockify™ - Employee Monitoring Software](https://clockify.me/employee-monitoring-software)
- [GPS tracking - Clockify Help](https://clockify.me/help/track-time-and-expenses/gps-tracking)
- [Clockify API Documentation](https://docs.clockify.me/)
- [API & webhook settings - Clockify Help](https://clockify.me/help/administration/api-webhook-settings)
- [How to set up & use Clockify kiosk - Clockify Learn](https://clockify.me/learn/resources/clockify-kiosk/)
- [Create & manage time off policy - Clockify Help](https://clockify.me/help/track-time-and-expenses/create-manage-time-off-policy)
- [Time off - Clockify Features](https://clockify.me/features/time-off)
- [Custom fields - Clockify Help](https://clockify.me/help/track-time-and-expenses/custom-fields)
- [Time categorization & tags - Clockify Help](https://clockify.me/help/track-time-and-expenses/categorizing-time-entries)
- [Pomodoro, idle detection, reminders - Clockify Help](https://clockify.me/help/track-time-and-expenses/idle-detection-reminders)
- [Auto tracker - Clockify Features](https://clockify.me/features/auto-tracker)
