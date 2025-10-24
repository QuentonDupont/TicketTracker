// Shared type definitions for the TicketTracker application

export interface Ticket {
  id: number
  title: string
  description: string
  current_results: string
  expected_results: string
  status: 'To Do' | 'In Progress' | 'Ready for Code Review' | 'Ready For QA' | 'In QA' | 'Ready to Release' | 'Live'
  priority: 'Low' | 'Medium' | 'High'
  due_date: string
  created_date: string
  assignee?: string
  tags?: string[]
  epic_id?: number  // Link to parent epic
}

export interface Epic {
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

export type TicketStatus = Ticket['status']
export type TicketPriority = Ticket['priority']
export type EpicStatus = Epic['status']
