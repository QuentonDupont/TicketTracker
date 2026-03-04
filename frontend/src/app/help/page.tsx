"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { HelpCircle, Keyboard, BookOpen, Mail, ChevronDown } from "lucide-react"
import { useState } from "react"

const faqs = [
  {
    question: "How do I create a new ticket?",
    answer: "Navigate to the Tickets page and click the 'Create Ticket' button. Fill in the required fields (title, description, current results, expected results) and click Save. You can also use the quick create button in the sidebar."
  },
  {
    question: "What are Epics and how do I use them?",
    answer: "Epics are large bodies of work that can be broken down into individual tickets. Navigate to the Epics page to create one, then link tickets to it from the ticket detail page using the Epic dropdown in the sidebar."
  },
  {
    question: "How does the Kanban board work?",
    answer: "On the Tickets page, switch to Kanban view using the toggle at the top. You can drag and drop tickets between status columns to update their status. The columns represent the 7 workflow stages."
  },
  {
    question: "How do I link related tickets?",
    answer: "Open a ticket's detail page and scroll to the 'Linked Tickets' card in the right sidebar. Click 'Link Ticket' to create a relationship (Parent/Child, Blocks, Blocked By, Duplicates, or Relates To)."
  },
  {
    question: "Can I export my data?",
    answer: "Yes! Go to Settings > Data Management to export all data as JSON. You can also use the Data Export page for more granular control, including CSV format."
  },
  {
    question: "How do I switch between light and dark mode?",
    answer: "Click the theme toggle button in the top-right corner of any page. You can also set a default theme in Settings > Preferences."
  },
  {
    question: "Where is my data stored?",
    answer: "All data is stored locally in your browser's localStorage. This means your data persists between sessions but is specific to your browser. Use the export feature to back up your data."
  },
]

const shortcuts = [
  { keys: ["⌘", "K"], description: "Open global search" },
  { keys: ["⌘", "N"], description: "Quick create ticket (from tickets page)" },
  { keys: ["Esc"], description: "Close modals and cancel editing" },
  { keys: ["Enter"], description: "Save inline edits" },
]

const features = [
  { name: "Tickets", description: "Create, manage, and track tickets through a 7-stage workflow with Kanban and list views." },
  { name: "Epics", description: "Group related tickets into epics with color-coding and status tracking." },
  { name: "Projects", description: "Organize tickets into project spaces with dedicated Kanban boards." },
  { name: "Team", description: "Manage team members, track performance metrics, skills, and custom fields." },
  { name: "Dashboard", description: "View real-time metrics, activity feed, and progress charts." },
  { name: "Analytics", description: "Comprehensive charts and reports for ticket distribution, team performance, and project metrics." },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left hover:bg-muted/50 rounded-lg transition-colors">
        <span className="font-medium">{question}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p className="px-4 pb-4 text-sm text-muted-foreground">{answer}</p>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default function HelpPage() {
  return (
    <MainLayout>
      <div className="space-y-6 p-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <HelpCircle className="h-8 w-8" />
            Help & Support
          </h1>
          <p className="text-muted-foreground mt-1">
            Find answers, learn shortcuts, and explore features
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {faqs.map((faq, i) => (
                <FAQItem key={i} {...faq} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {shortcuts.map((shortcut, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm">{shortcut.description}</span>
                  <div className="flex gap-1">
                    {shortcut.keys.map((key, j) => (
                      <Badge key={j} variant="outline" className="font-mono text-xs px-2">
                        {key}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Feature Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {features.map((feature, i) => (
                <div key={i} className="p-4 rounded-lg border">
                  <h3 className="font-medium mb-1">{feature.name}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Need more help? Reach out to our support team at{' '}
              <span className="font-medium text-foreground">support@tickettracker.app</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
