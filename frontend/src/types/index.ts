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
  linked_tickets?: number[]  // Array of TicketLink IDs
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

export type TicketLinkType = 'Parent/Child' | 'Duplicates' | 'Relates To' | 'Blocks' | 'Blocked By'

export interface TicketLink {
  id: number
  source_ticket_id: number  // The ticket initiating the link
  target_ticket_id: number  // The linked ticket
  link_type: TicketLinkType
  created_date: string
  created_by?: string
}

export type TicketStatus = Ticket['status']
export type TicketPriority = Ticket['priority']
export type EpicStatus = Epic['status']

export interface TeamMember {
  id: number
  name: string
  email: string
  phone: string
  role: string
  department: string
  manager?: string
  joinDate: string
  location: string
  status: 'active' | 'inactive'
  availability: number  // Percentage (0-100)
  currentProjects: string[]
  completedTickets: number
  avgResolutionTime: number  // In hours
  skillLevel: 'senior' | 'mid' | 'junior'
  performanceScore: number  // Percentage (0-100)
  skills: Array<{
    name: string
    level: number  // Percentage (0-100)
    category: string
  }>
  customFieldValues?: Record<string, any>
  createdDate: string
  lastModified: string
}

export interface CustomFieldDefinition {
  id: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean'
  required: boolean
  options?: string[]  // For select/multiselect types
  defaultValue?: any
  helpText?: string
  order: number  // For display ordering
}

export type TeamMemberStatus = TeamMember['status']
export type TeamMemberSkillLevel = TeamMember['skillLevel']
export type CustomFieldType = CustomFieldDefinition['type']
