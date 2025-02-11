Every time you choose to apply a rule(s), explicitly state the rule(s) in the output. You can abbreviate the rule description to a single word or phrase.
Project Context

# Task List App Documentation

## Overview
This task list application allows users to create and manage tasks within customizable columns, similar to Trello. It includes features like priority toggling, drag-and-drop, and visual indicators for completed tasks.

## Features
- **Create Columns**: Users can add new columns to organize their tasks.
- **Add Tasks**: Within each column, users can create individual tasks.
- **Rich Text Support**: Task descriptions support markdown formatting
- **Task Metadata**: Optional due dates and task age indicator (e.g., "6d")
- **Toggle Priority**: If a task is marked as priority, the text turns red.
- **Global Categories**: Filter tasks across all columns by category
- **Drag and Drop**: Tasks can be moved between columns using drag-and-drop functionality.
- **Completed Tasks**: Tasks can be completed via drag or button click, with sound feedback
- **Real-time Updates**: Supports real-time syncing across devices with presence indicators
- **Task Categories**: Unlimited global categories with custom labels
- **Responsive Layout**: Vertical scrollbar appears when content exceeds viewport
- **Filter by Priority**: Users can filter to view only priority tasks
- **Completed Items Grouped by Day**: Tasks are grouped by their completion date
- **Hide and Show Columns**: Expanding reveals tasks, collapsing hides them while displaying the count. State persists across sessions.
- **Task Visualization**: Stacked bar chart showing completed vs incomplete tasks by day

## Data Structure
### Tasks Collection
- `id`: Unique identifier
- `title`: Task title
- `description`: Rich text description (stored as markdown)
- `category`: Assigned category
- `priority`: Boolean indicating priority
- `completed`: Boolean indicating completion
- `order`: Spaced index for sorting
- `columnId`: Column reference
- `createdAt`: Timestamp of creation
- `completedAt`: Timestamp of completion
- `dueDate`: Optional timestamp for due date
- `lastEditedBy`: User ID of last editor
- `lastEditedAt`: Timestamp of last edit

### Activity Collection (for real-time collaboration)
- `id`: Unique identifier
- `taskId`: Reference to task
- `userId`: User performing action
- `action`: Type of action (edit, move, complete, etc.)
- `timestamp`: When action occurred
- `details`: Additional action details

### Comments Collection
- `id`: Unique identifier
- `taskId`: Reference to task
- `userId`: Comment author
- `content`: Comment text
- `timestamp`: When comment was made
- `edited`: Boolean if comment was edited

### Columns Collection
- `id`: Unique identifier.
- `title`: Column title.
- `order`: Sorting index.

### Categories Collection
- `id`: Unique identifier.
- `name`: Category name.

## Data Visualization
    • Stacked Bar Chart
        ○ X-axis: Days
        ○ Y-axis: Task count
        ○ Red bars: Incomplete tasks
        ○ Green bars stacked on top: Completed tasks
        ○ Interactive tooltips showing exact counts
        ○ Daily aggregation of task status

## Task Completion Feedback
    • Sound Effects
        ○ Load custom sounds from /public/sounds directory
        ○ Per-user volume settings stored in Firestore
        ○ Mute option with persistence
    
    • Visual Celebrations
        ○ Primary Effects:
            - Confetti burst (using canvas-confetti)
            - Fireworks display
            - Floating balloons
            - Rainbow arc
            - Exploding stars
        ○ Task-specific Effects:
            - Sparkles around completed task
            - Check mark animation with trail
            - Success toast with particle effects
            - Task card flip with sparkle trail
            - Shooting stars with color gradient
            - Ripple effect from task
            - Floating hearts/stars
            - Glowing outline pulse
            - Achievement badge popup
            - Progress milestone celebration
        ○ Customization:
            - Intensity levels (subtle/medium/celebratory)
            - Color schemes
            - Effect duration
            - Combination effects
            - Position (around task/full screen)
        ○ Accessibility:
            - Option to disable animations
            - Reduced motion support
            - Alternative celebration indicators

## Quick Add Feature
    • Implementation
        ○ "+" button at top of each column (except completed)
        ○ Floating action button (FAB) in bottom right
    
    • Keyboard Shortcuts
        ○ Global:
            - Alt + N: New task in focused column
            - Alt + [1-9]: Focus column by number
            - Ctrl + Space: Open quick add anywhere
            - Esc: Cancel current action
        ○ Within Quick Add:
            - Tab/Shift+Tab: Navigate fields
            - Ctrl + Enter: Save and add another
            - Alt + P: Toggle priority
            - Alt + D: Open date picker
            - Alt + C: Focus category dropdown
        ○ Task Management:
            - Alt + ←/→: Move task between columns
            - Alt + ↑/↓: Reorder within column
            - Ctrl + S: Save changes
            - Delete: Move to trash
            - Ctrl + Z: Undo last action

## Trash Can Feature
    • Visual Implementation
        ○ Persistent trash can icon at bottom center
        ○ Subtle bounce animation on hover
        ○ Expands when task is dragged near
        ○ Red highlight when task is draggable over
        ○ Shake animation when rejecting invalid drops
    
    • Functionality
        ○ Drag and drop tasks to delete
        ○ Confirmation modal with task details
        ○ 'Delete' keyboard shortcut moves to trash
        ○ Trash counter shows number of items
    
    • Trash Management
        ○ View trash contents in modal
        ○ Restore items with drag or button
        ○ Empty trash with confirmation
        ○ Auto-empty after 30 days
        ○ Batch restore/delete options
    
    • Safety Features
        ○ Confirmation required for delete
        ○ Undo restore for 5 seconds
        ○ Prevent deleting active references
        ○ Warning for deleting items with comments

## UI/UX Considerations
    • Scrolling Behavior
        ○ Vertical scrollbar appears when content exceeds viewport
        ○ Smooth scrolling enabled
        ○ Maintain fixed header for navigation
        ○ Column headers remain visible while scrolling
    
    • Real-time Collaboration
        ○ Show user presence indicators on boards
        ○ Display currently active users
        ○ Show real-time cursor positions
        ○ Indicate when someone is editing a task

    • Responsive Design
        ○ Horizontal scrolling for many columns
        ○ Maintain minimum column width for readability
        ○ Collapse navigation on smaller screens
        ○ Touch-friendly drag handles for mobile

## UI Components
    • Task Card
        ○ Rich text description with markdown support
        ○ Age indicator (e.g., "6d") in subtle gray
        ○ Optional due date with visual indicators
        ○ Category label with global filtering
        ○ Real-time edit indicators
        ○ Comment thread access

    • Global Filters
        ○ Category filter at page top
        ○ Priority filter toggle
        ○ Clear all filters option

    • Collaboration Features
        ○ User presence indicators
        ○ Active task viewers/editors
        ○ Comment threads on tasks
        ○ Activity history
        ○ Real-time cursor positions

## Storage Optimization
    • Rich Text
        ○ Store markdown as plain text
        ○ Limit description length based on Firestore free tier
        ○ Compress markdown content if needed
        ○ Cache rendered markdown locally

    • Activity History
        ○ Limit history retention period
        ○ Batch write operations
        ○ Clean up old activity records
        ○ Optimize queries with composite indexes

## Development Stages

### Stage 1: Core Foundation
    • Basic Setup
        ○ Project initialization with React, TypeScript, Tailwind
        ○ Firebase/Firestore configuration
        ○ Authentication setup (Google, Microsoft, Email)
        ○ Basic routing and layout
    
    • Essential UI Components
        ○ Column component
        ○ Task card component
        ○ Quick add button
        ○ Basic theme support (light/dark)
    
    • Core Functionality
        ○ Create/edit tasks
        ○ Drag and drop between columns
        ○ Priority task support
        ○ Basic real-time updates
        ○ Task age indicator

### Stage 2: Enhanced Features
    • Task Management
        ○ Rich text editor integration
        ○ Category system
        ○ Due date support
        ○ Global search functionality
        ○ Trash can implementation
    
    • UI Improvements
        ○ Stacked bar chart
        ○ Column customization
        ○ Compact/comfortable view options
        ○ Advanced theme customization
    
    • Collaboration Features
        ○ Comments system
        ○ @mentions
        ○ User presence indicators
        ○ Activity history

### Stage 3: Polish and Optimization
    • Performance
        ○ Firestore query optimization
        ○ Batch operations
        ○ Lazy loading improvements
        ○ Cache implementation
    
    • Visual Feedback
        ○ Sound effect system
        ○ Completion celebrations
        ○ Loading states
        ○ Error handling UI
    
    • Mobile Support
        ○ Responsive layouts
        ○ Touch interactions
        ○ Mobile-specific UI
        ○ Performance optimization

### Stage 4: Advanced Features
    • Offline Support
        ○ IndexedDB setup
        ○ Offline state management
        ○ Conflict resolution
        ○ Background sync
    
    • Data Analysis
        ○ Enhanced chart interactions
        ○ Data export functionality
        ○ Performance metrics
        ○ Usage analytics
    
    • Advanced UI
        ○ Keyboard shortcuts
        ○ Accessibility improvements
        ○ Animation refinements
        ○ UI/UX polish

### Stage 5: Final Touches
    • Testing
        ○ Unit tests
        ○ Integration tests
        ○ Performance testing
        ○ Cross-browser testing
    
    • Documentation
        ○ User documentation
        ○ API documentation
        ○ Deployment guide
        ○ Contributing guide
    
    • Deployment
        ○ Production optimization
        ○ Error monitoring setup
        ○ Analytics integration
        ○ Performance monitoring

### Stage 6: Maintenance and Updates
    • Monitoring
        ○ Error tracking
        ○ Performance metrics
        ○ Usage analytics
        ○ User feedback
    
    • Optimization
        ○ Performance improvements
        ○ Code refactoring
        ○ Bundle size optimization
        ○ Database optimization
    
    • Updates
        ○ Security patches
        ○ Dependency updates
        ○ Feature enhancements
        ○ Bug fixes

## Version Control Strategy

### Version Numbers
    • v1.0.0 - Stage 1: Core Foundation
        ○ Basic task management
        ○ Authentication
        ○ Real-time updates
    
    • v2.0.0 - Stage 2: Enhanced Features
        ○ Rich text and categories
        ○ Search and trash system
        ○ Collaboration features
    
    • v3.0.0 - Stage 3: Polish and Optimization
        ○ Performance improvements
        ○ Visual feedback
        ○ Mobile support
    
    • v4.0.0 - Stage 4: Advanced Features
        ○ Offline capabilities
        ○ Enhanced analytics
        ○ Advanced UI features
    
    • v5.0.0 - Stage 5: Final Touches
        ○ Testing complete
        ○ Documentation
        ○ Production ready
    
    • v6.0.0 - Stage 6: Maintenance
        ○ Post-launch updates
        ○ Optimizations
        ○ Bug fixes

### Branch Strategy
    • main
        ○ Stable production code
        ○ Tagged with version numbers
        ○ Protected branch
    
    • develop
        ○ Integration branch
        ○ Feature branches merge here
        ○ Staging for next release
    
    • feature/*
        ○ New features
        ○ Branch from develop
        ○ Merge back to develop
    
    • release/*
        ○ Version preparation
        ○ Branch from develop
        ○ Merge to main and develop
    
    • hotfix/*
        ○ Production bug fixes
        ○ Branch from main
        ○ Merge to main and develop

### Release Process
    1. Create release branch from develop
    2. Version bump and changelog update
    3. Testing and bug fixes
    4. Merge to main with version tag
    5. Merge back to develop

### Commit Guidelines
    • Conventional Commits
        ○ feat: New features
        ○ fix: Bug fixes
        ○ docs: Documentation
        ○ style: Formatting
        ○ refactor: Code restructuring
        ○ test: Testing
        ○ chore: Maintenance

## GitHub Versioning
Each development stage will be committed separately to track progress effectively.

## UI Considerations
- **Column Scrollbars**: When too many tasks exist, a scrollbar is added instead of extending the page.
- **Task Title Overflow**: Titles are limited to two lines, with overflow handled gracefully.

## Authentication
    • Methods
        ○ Microsoft authentication
        ○ Google authentication
        ○ Email/password authentication
        ○ Passwordless email authentication (magic links)
    
    • User Profile
        ○ Customizable display name
        ○ Upload or change avatar
        ○ Last seen status
        ○ Default notification preferences

## Task Age Visualization
    • Time Format
        ○ < 24h: Show hours (e.g., "5h")
        ○ 1-7d: Show days (e.g., "6d")
        ○ > 7d: Keep showing days (e.g., "12d")
    
    • Color Progression
        ○ 0-24h: Default text color
        ○ 1-3d: Slight orange tint (#FFA07A)
        ○ 4-7d: Medium orange (#FF7F50)
        ○ 8-14d: Light red (#FF6B6B)
        ○ 15d+: Bright red (#FF4444)
        ○ Completed tasks: Reset to default color

## Notifications & Comments
    • Comment Features
        ○ Rich text formatting support
        ○ @mentions with user autocomplete
        ○ Emoji support
        ○ File/image attachments (within free tier limits)
    
    • Notification Types
        ○ Browser notifications (with permission)
        ○ In-app notifications
        ○ Email notifications (optional)
        ○ @mention notifications
    
    • Notification Settings
        ○ Per-board notification preferences
        ○ Mute threads option
        ○ Notification schedule (working hours)

## Activity Tracking
    • History Retention
        ○ Keep history until 1 month after task completion
        ○ Auto-cleanup of older records
        ○ Export option before deletion
    
    • Activity Modal
        ○ Chronological activity feed
        ○ Filter by action type
        ○ Group by date
        ○ Show creator and creation date
        ○ Track all task modifications

## User Presence
    • Status Indicators
        ○ Online (green)
        ○ Away after 5 minutes inactivity (yellow)
        ○ Offline (gray)
    
    • Activity Tracking
        ○ Current column view
        ○ Time since active
        ○ Current task being viewed/edited
    
    • Optimization
        ○ Batch presence updates
        ○ Update status every 30 seconds
        ○ Clean up offline presence data
        ○ Limit real-time listeners

## Storage Optimization
    • Free Tier Considerations
        ○ Compress activity history
        ○ Limit attachment sizes
        ○ Clean up inactive user presence data
        ○ Batch write operations
        ○ Index optimization for common queries

## Tech Stack
    • React
    • TypeScript
    • Tailwind CSS
    • Shadcn UI
    • Chrome Extension
    • Express.js
    • React DnD (for optimized drag and drop with Firestore)
    • Firebase/Firestore

## Drag and Drop Implementation
    • Use React DnD for efficient Firestore integration
    • Implement optimistic updates for smooth UX
    • Batch Firestore writes for task reordering
    • Use order field (spaced numbers) for task positioning
    • Debounce position updates during rapid drag operations
    • Handle concurrent updates gracefully
    • Maintain local state for drag preview
    • Update Firestore only on drop completion

## Firestore Optimization Strategies
    • Task Ordering
        ○ Use 1000-point spacing between tasks (e.g., 1000, 2000, 3000)
        ○ When space is full, rebalance affected column only
        ○ Store order as number type for efficient querying
        ○ Index order field for better query performance

    • Real-time Updates
        ○ Use collection group queries for efficient multi-column updates
        ○ Implement snapshot listeners at column level, not individual tasks
        ○ Unsubscribe from listeners when columns are hidden
        ○ Cache column data in local state to reduce reads

    • Batch Operations
        ○ Use batch writes when reordering multiple tasks
        ○ Implement position calculations client-side
        ○ Handle offline support with optimistic UI updates
        ○ Retry failed batch operations with exponential backoff

    • Performance Monitoring
        ○ Track Firestore usage metrics (reads/writes per drag)
        ○ Monitor rebalancing frequency
        ○ Log performance issues for tasks with many position updates
        ○ Set up Firestore usage alerts

    • Error Handling
        ○ Implement rollback mechanism for failed drag operations
        ○ Show visual feedback for network issues
        ○ Cache last known good state
        ○ Provide manual refresh option for sync issues

## Naming Conventions
    • Use lowercase with dashes for directories (e.g., components/form-wizard)
    • Favor named exports for components and utilities
    • Use PascalCase for component files (e.g., VisaForm.tsx)
    • Use camelCase for utility files (e.g., formValidator.ts)

## TypeScript Usage
    • Use TypeScript for all code; prefer interfaces over types
    • Avoid enums; use const objects with 'as const' assertion
    • Use functional components with TypeScript interfaces
    • Define strict types for message passing between different parts of the extension
    • Use absolute imports for all files @/...
    • Avoid try/catch blocks unless there's good reason to translate or handle error in that abstraction
    • Use explicit return types for all functions

## Chrome Extension Specific
    • Use Manifest V3 standards
    • Implement proper message passing between components:
interface MessagePayload {
  type: string;
  data: unknown;
}
    • Handle permissions properly in manifest.json
    • Use chrome.storage.local for persistent data
    • Implement proper error boundaries and fallbacks
    • Use lib/storage for storage related logic
    • For the async injected scripts in content/,
        ○ they must not close over variables from the outer scope
        ○ they must not use imported functions from the outer scope
        ○ they must have wrapped error handling so the error message is returned to the caller

## State Management
    • Use React Context for global state when needed
    • Keep state management simple - no need for additional state management libraries
    • Implement proper state persistence using chrome.storage (for extension)
    • Implement proper cleanup in useEffect hooks

## Shadcn UI Components
    • Use npx shadcn@latest add <component-name> to add new components
    • Maintain a list of installed components in components/shadcn/COMPONENTS.md
    • Document installation command and any custom modifications for each component
    • Follow Shadcn's accessibility guidelines

## Error Handling
    • Implement proper error boundaries at the page/feature level
    • Use a centralized error logging utility in utils/errorLogger.ts
    • Log errors with relevant context (user action, component, error stack)
    • Categories errors by severity: INFO, WARNING, ERROR
    • Store logs in chrome.storage.local with rotation (keep last 100 errors)
    • Provide user-friendly error messages through a toast notification system
    • Include error reporting mechanism for critical errors
    • Handle network failures gracefully with retry mechanisms

## Syntax and Formatting
    • Use "function" keyword for pure functions
    • Avoid unnecessary curly braces in conditionals
    • Use declarative JSX
    • Implement proper TypeScript discriminated unions for message types

## UI and Styling
    • Use Shadcn UI and Radix for components
    • use npx shadcn@latest add <component-name> to add new shadcn components
    • Implement Tailwind CSS for styling
    • Consider extension-specific constraints (popup dimensions, permissions)
    • Follow Material Design guidelines for Chrome extensions
    • When adding new shadcn component, document the installation command

## Testing
    • Write unit tests for utilities and components
    • Implement E2E tests for critical flows
    • Test across different Chrome versions
    • Test memory usage and performance

## Security
    • Implement Content Security Policy
    • Sanitize user inputs
    • Handle sensitive data properly
    • Follow Chrome extension security best practices
    • Implement proper CORS handling

## Git Usage
Commit Message Prefixes:
    • "fix:" for bug fixes
    • "feat:" for new features
    • "perf:" for performance improvements
    • "docs:" for documentation changes
    • "style:" for formatting changes
    • "refactor:" for code refactoring
    • "test:" for adding missing tests
    • "chore:" for maintenance tasks
Rules:
    • Use lowercase for commit messages
    • Keep the summary line concise
    • Include description for non-obvious changes
    • Reference issue numbers when applicable

## Documentation
    • Maintain clear README with setup instructions
    • Document API interactions and data flows
    • Keep manifest.json well-documented
    • Don't include comments unless it's for complex logic
    • Document permission requirements

## Development Workflow
    • Use proper version control
    • Implement proper code review process
    • Test in multiple environments
    • Follow semantic versioning for releases
    • Maintain changelog

## Search Functionality
    • Global Search
        ○ Search bar in top navigation
        ○ Real-time search results
        ○ Keyboard shortcut: Ctrl + F
        ○ Search across all columns
        ○ Highlight matching text
    
    • Search Results
        ○ Modal presentation
        ○ Group by column
        ○ Click to navigate to task
        ○ Show task preview
        ○ Keyboard navigation in results

## Task Visualization
    • Stacked Bar Chart
        ○ Interactive Features:
            - Hover tooltips with exact counts
            - Click bars to view tasks from that day
            - Double-click to filter main view
        ○ Data Export
            - Download as CSV
            - Export chart as image
            - Copy data to clipboard
        ○ Customization
            - Date range selection
            - Toggle between day/week view
            - Custom color schemes

## Mobile Support
    • Touch Optimization
        ○ Touch-friendly drag handles
        ○ Swipe gestures for common actions
        ○ Long press for context menu
        ○ Haptic feedback
    
    • Responsive Layout
        ○ Single column view on mobile
        ○ Swipe between columns
        ○ Column picker dropdown
        ○ Collapse/expand all option
    
    • Mobile-specific Features
        ○ Bottom navigation bar
        ○ Pull to refresh
        ○ Mobile-optimized modals
        ○ Simplified animations for performance

## Task Organization
    • Priority Tasks
        ○ Always displayed at top of column
        ○ Visual priority indicator
        ○ Maintain priority order when dragging
        ○ Priority section divider
        ○ Quick priority toggle

## User Settings
    • Preferences Page
        ○ Theme selection
        ○ Animation toggles
        ○ Sound settings
        ○ Notification preferences
        ○ Display density options
        ○ Keyboard shortcut customization
        ○ Language selection
        ○ Accessibility options
