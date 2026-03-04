"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Ticket, Target, FolderKanban, Users, BarChart3, Layout, Link2 } from "lucide-react"

const sections = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: BookOpen,
    content: [
      "TicketTracker is a project management dashboard for tracking tickets, projects, and team performance.",
      "All data is stored locally in your browser — no server or account setup needed beyond the initial login.",
      "To begin, log in with your credentials and explore the Dashboard for an overview of your work."
    ]
  },
  {
    id: "tickets",
    title: "Ticket Management",
    icon: Ticket,
    content: [
      "Tickets are the core work items in TicketTracker. Each ticket has a title, description, current results, and expected results.",
      "Tickets follow a 7-stage workflow: To Do → In Progress → Ready for Code Review → Ready For QA → In QA → Ready to Release → Live.",
      "Use the list view for quick scanning or the Kanban board for visual status management with drag-and-drop.",
      "Tickets can be filtered by status, priority, and assignee. Use tags for additional categorization."
    ]
  },
  {
    id: "ticket-linking",
    title: "Ticket Linking",
    icon: Link2,
    content: [
      "Link related tickets to track dependencies and relationships.",
      "Available link types: Parent/Child, Blocks, Blocked By, Duplicates, and Relates To.",
      "Links are bidirectional — creating a 'Blocks' link on ticket A automatically creates a 'Blocked By' on ticket B.",
      "View and manage links from the ticket detail page sidebar."
    ]
  },
  {
    id: "epics",
    title: "Epic Management",
    icon: Target,
    content: [
      "Epics are large bodies of work that group related tickets together.",
      "Each epic has a color for visual identification and a status (Planning, In Progress, Completed, On Hold).",
      "Link tickets to epics from the ticket detail page to organize work into larger initiatives.",
      "The epic detail page shows all associated tickets and overall progress."
    ]
  },
  {
    id: "projects",
    title: "Project Spaces",
    icon: FolderKanban,
    content: [
      "Project spaces allow you to organize tickets into separate workstreams.",
      "Each project has its own Kanban board showing tickets filtered to that space.",
      "Create project spaces from the sidebar or the Projects page.",
      "Tickets are assigned to projects and can be filtered by project across the app."
    ]
  },
  {
    id: "team",
    title: "Team Management",
    icon: Users,
    content: [
      "Manage your team members with detailed profiles including role, department, skills, and performance metrics.",
      "The team page offers three views: Overview, Performance, and Skills Matrix.",
      "Define custom fields for team members in Settings > Custom Fields to track additional data.",
      "Assign tickets to team members and track completion rates and resolution times."
    ]
  },
  {
    id: "analytics",
    title: "Dashboard & Analytics",
    icon: BarChart3,
    content: [
      "The Dashboard shows real-time metrics computed from your actual ticket and project data.",
      "The Analytics page provides deeper insights with charts for status distribution, priority breakdown, team performance, and monthly trends.",
      "All charts update automatically as you create and modify tickets.",
      "Use the Custom Report Builder on the Analytics page to generate focused reports."
    ]
  },
  {
    id: "views",
    title: "Views & Navigation",
    icon: Layout,
    content: [
      "The sidebar provides quick access to all major sections: Dashboard, Tickets, Epics, Analytics, Projects, and Team.",
      "Project spaces are listed in a collapsible section of the sidebar for fast switching.",
      "Use the global search (⌘K) to quickly find tickets, epics, projects, or team members.",
      "Toggle between light and dark mode using the theme button in the header."
    ]
  },
]

export default function DocsPage() {
  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Documentation
          </h1>
          <p className="text-muted-foreground mt-1">
            Learn how to use TicketTracker effectively
          </p>
        </div>

        {/* Table of Contents */}
        <Card>
          <CardHeader>
            <CardTitle>Contents</CardTitle>
          </CardHeader>
          <CardContent>
            <nav className="grid gap-2 md:grid-cols-2">
              {sections.map(section => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors text-sm"
                >
                  <section.icon className="h-4 w-4 text-muted-foreground" />
                  {section.title}
                </a>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Content Sections */}
        {sections.map(section => (
          <Card key={section.id} id={section.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <section.icon className="h-5 w-5" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {section.content.map((paragraph, i) => (
                  <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </MainLayout>
  )
}
