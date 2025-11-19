# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 🔄 Session Continuity (READ THIS FIRST!)

### ⚡ AUTO-START PROTOCOL

**WHENEVER CLAUDE CODE STARTS, AUTOMATICALLY DO THIS**:

The user will ALWAYS say: **"Continue where we left off"**

This is your trigger to:
1. ✅ Read `SESSION_STATE.md` immediately
2. ✅ Check the project status and recent work
3. ✅ Verify the development server status (http://localhost:3000)
4. ✅ Summarize what was last completed
5. ✅ Note any blockers or pending user actions
6. ✅ Ask what the user wants to work on next

**DO NOT wait for other instructions** - treat this as your startup routine.

### Session State File

**Before starting any work, read `SESSION_STATE.md`** - It contains:
- Current project status
- Recently completed tasks
- In-progress work
- Next planned tasks
- Important notes and blockers
- Environment status

### Quick Start Protocol

When the user says "Continue where we left off" (which they ALWAYS will):

**Your Response Should**:
1. Read `SESSION_STATE.md` first
2. Read this `CLAUDE.md` for project context
3. Check `git status` for uncommitted changes
4. Summarize recent work completed
5. Note any blockers or pending actions
6. Ask what the user wants to work on next

### Ending a Session

When the user says "Update session state" or "Document our progress":
1. Update `SESSION_STATE.md` with:
   - Completed tasks (move from "In Progress" to "Recently Completed")
   - Current blockers
   - Next recommended tasks
   - Any important notes
2. Commit changes if appropriate

---

## Project Overview

This is a Next.js/React-based project management dashboard for tracking tickets, projects, and team performance. The application uses localStorage for client-side data persistence and features a modern, futuristic UI design.

## ⚠️ CRITICAL: Development Port

**ALWAYS run and test this project on: http://localhost:3000**

This is the primary development port for the Next.js frontend application. All feature updates, testing, and development work should be performed on this port. When making changes or testing new features, always verify functionality at this URL.

## Core Architecture

### Technology Stack
- **Frontend**: Next.js 15.5.4 with React 19
- **UI Framework**: shadcn/ui components with Tailwind CSS v4
- **State Management**: React hooks and localStorage
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with custom futuristic theme

### Main Components
- **frontend/src/app/page.tsx**: Application entry point with sidebar and dashboard
- **frontend/src/app/dashboard/page.tsx**: Main dashboard with metrics and charts
- **frontend/src/app/tickets/page.tsx**: Ticket management with list and Kanban views
- **frontend/src/app/tickets/[id]/page.tsx**: Individual ticket detail view with inline editing
- **frontend/src/app/epics/page.tsx**: Epic management for grouping related tickets
- **frontend/src/components/**: Reusable UI components (forms, tables, modals, etc.)
- **frontend/src/lib/auth.tsx**: Authentication context and protected routes
- **frontend/src/types/index.ts**: TypeScript type definitions for Ticket and Epic

### Data Flow
1. User authentication managed via AuthContext with localStorage persistence
2. All ticket and epic data stored in browser localStorage
3. Components read/write data directly to localStorage
4. Form submissions validated using Zod schemas
5. State updates trigger re-renders and localStorage sync

### Key Features
- **Ticket Management**: Create, edit, delete tickets with mandatory fields (title, description, current results, expected results)
- **Status Workflow**: 7-stage workflow (To Do → In Progress → Ready for Code Review → Ready For QA → In QA → Ready to Release → Live)
- **Epic Tracking**: Group related tickets into epics with color-coding
- **Dashboard Analytics**: Interactive charts showing ticket distribution, status, and trends
- **Inline Editing**: Edit ticket fields directly from detail view
- **Kanban & List Views**: Toggle between different visualization modes
- **Authentication**: JWT-based mock authentication with protected routes
- **Light/Dark Theme**: Full light and dark mode support with theme toggle on all pages

## Development Commands

### Setup and Run
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server (ALWAYS use port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Important Scripts
- `npm run dev` - Starts Next.js dev server with Turbopack on **http://localhost:3000**
- `npm run build` - Creates optimized production build
- `npm start` - Runs production server
- `npm run lint` - Runs ESLint for code quality

## Data Schema

### Ticket Interface (TypeScript)
```typescript
interface Ticket {
  id: number
  title: string
  description: string
  current_results: string        // MANDATORY: What is currently happening
  expected_results: string        // MANDATORY: What should happen
  status: 'To Do' | 'In Progress' | 'Ready for Code Review' | 'Ready For QA' | 'In QA' | 'Ready to Release' | 'Live'
  priority: 'Low' | 'Medium' | 'High'
  due_date: string
  created_date: string
  assignee?: string
  tags?: string[]
  epic_id?: number
}
```

### Epic Interface (TypeScript)
```typescript
interface Epic {
  id: number
  title: string
  description: string
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold'
  color: string  // Hex color for visual identification
  start_date: string
  end_date: string
  owner?: string
  created_date: string
}
```

### Data Storage
- All data stored in browser **localStorage**
- Keys: `tickets`, `epics`, `auth_token`, `user_data`
- Data persists across browser sessions
- No backend database required

## Environment Configuration

Authentication is handled client-side with mock data. Default login credentials:
- Email: `quentondupont@gmail.com` | Password: `1234567`
- Email: `admin@tickettracker.com` | Password: `admin123`

## MCP Configuration

This project includes Model Context Protocol (MCP) configuration for multiple servers:

### GitHub MCP (Automated Deployments)
- **Configuration**: `.mcp.json` in project root
- **Purpose**: Enables automated code deployments and GitHub operations
- **Server**: `@modelcontextprotocol/server-github`
- **Authentication**: Personal Access Token (PAT) via environment variable

#### Setup Instructions
1. **Create GitHub Personal Access Token**:
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Give it a descriptive name (e.g., "TicketTracker MCP")
   - Select scopes:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Actions workflows)
     - ✅ `write:packages` (Upload packages - optional)
     - ✅ `delete_repo` (Delete repositories - optional)
   - Click "Generate token" and copy it immediately

2. **Add Token to Environment**:
   - Copy `.env.example` to `.env`
   - Replace `your_github_personal_access_token_here` with your actual token
   - NEVER commit the `.env` file to git

3. **Capabilities**:
   - ✅ Create commits automatically
   - ✅ Push code to GitHub repositories
   - ✅ Create and manage pull requests
   - ✅ Create and manage branches
   - ✅ Update repository files
   - ✅ Manage issues and labels
   - ✅ Monitor GitHub Actions workflows

### Playwright MCP
- **Configuration**: `.mcp.json` in project root
- **Purpose**: Enables browser automation for testing Next.js interface
- **Server**: `@modelcontextprotocol/server-playwright`
- **Default Browser**: Chromium (headless mode)

### shadcn MCP
- **Configuration**: `.mcp.json` in project root
- **Purpose**: UI component management and shadcn/ui tooling
- **Server**: `shadcn@latest mcp`

### Other UI Component Servers
- **shadcn-ui-enhanced**: Enhanced shadcn/ui components
- **magic-ui**: Magic UI component library
- **material-ui**: Material-UI components
- **magic-builder**: 21st.dev UI component builder

### Usage
The MCP servers can be used for:
- **GitHub Operations**: Automated deployments, commits, PRs, and repository management
- **Testing**: Automated testing of the Next.js web interface at http://localhost:3000
- **E2E Testing**: End-to-end testing of ticket workflows
- **Documentation**: Screenshot capture for documentation
- **UI Development**: Component management (shadcn/ui, Material-UI, Magic UI)
- **Browser Automation**: Testing user interactions

### ⚠️ CRITICAL: MCP Preservation Rule
**NEVER remove or overwrite existing MCP configurations**. Always add new MCP servers alongside existing ones in the `.mcp.json` file. Each MCP server provides unique capabilities and removing them breaks functionality.

### ⚠️ SECURITY: Environment Variables
- The `.env` file contains sensitive tokens and should NEVER be committed to git
- Always use `.env.example` as a template for new developers
- Rotate tokens immediately if they are accidentally exposed
- Use scoped permissions (only grant what's needed)

## Important Implementation Notes

### Critical Requirements
- **Development Port**: ALWAYS use http://localhost:3000 for all development and testing
- **Mandatory Fields**: Tickets MUST include `current_results` and `expected_results` (minimum 10 characters each)
- **Type Safety**: All components use TypeScript with strict type checking
- **Data Persistence**: localStorage is the single source of truth for all data

### Best Practices
- Use React hooks (useState, useEffect) for state management
- Implement form validation with Zod schemas
- Apply Tailwind CSS utility classes for styling
- Use shadcn/ui components for consistent UI
- Implement inline editing for better UX
- Toast notifications for user feedback (sonner library)
- Protected routes require authentication via AuthContext

### Theme Implementation
- **Theme Provider**: Powered by `next-themes` library
- **Light Mode**: Bright backgrounds with dark text (defined in `:root` CSS selector)
- **Dark Mode**: Futuristic dark theme with cyan accents (defined in `.dark` CSS selector)
- **Theme Toggle Location**:
  - Main app pages: Top-right header (via `SiteHeader` component)
  - Auth pages: Fixed position top-right corner
  - Future pages: Automatically inherited via `MainLayout` wrapper
- **Adding Theme Toggle to New Pages**:
  - Authenticated pages: Use `MainLayout` component (auto-includes theme toggle)
  - Auth/standalone pages: Add `<ThemeToggle />` in fixed position `<div className="fixed top-4 right-4 z-50">`
- **Theme Persistence**: User preference saved to localStorage by `next-themes`

### Code Organization
- Page components in `frontend/src/app/`
- Reusable components in `frontend/src/components/`
- Type definitions in `frontend/src/types/`
- Utility functions in `frontend/src/lib/`
- UI components follow shadcn/ui patterns

### Testing & Validation
- All forms validate on submit
- Required fields show asterisk (*) indicators
- Error messages display inline with fields
- Toast notifications confirm successful actions
- localStorage operations are try/catch wrapped