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
  project_space_id?: number  // Link to ProjectSpace
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

export interface ProjectSpace {
  id: number
  name: string
  description?: string
  color: string  // Hex color for visual identification
  created_date: string
  icon?: string  // Optional icon name
}

export interface ProjectSpaceFilterState {
  searchTerm?: string
  ticketCountFilter?: 'all' | 'empty' | '1-10' | '10plus'
  sortOption?: 'date-newest' | 'date-oldest' | 'tickets-desc' | 'tickets-asc'
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

// Activity tracking for ticket changes
export type TicketActivityType =
  | 'created'
  | 'status_change'
  | 'field_edit'
  | 'comment_added'
  | 'comment_edited'
  | 'comment_deleted'
  | 'assignee_change'
  | 'priority_change'
  | 'tag_change'
  | 'epic_change'
  | 'link_change'

export interface TicketActivity {
  id: number
  ticket_id: number
  type: TicketActivityType
  description: string
  field_name?: string
  old_value?: string
  new_value?: string
  user_name: string
  timestamp: string
}

export interface TicketComment {
  id: number
  ticket_id: number
  author_name: string
  author_email: string
  content: string
  created_date: string
  updated_date: string
  is_edited: boolean
}

export interface UserSettings {
  theme_default: 'light' | 'dark' | 'system'
  notifications_enabled: boolean
  notification_types: {
    ticket_updates: boolean
    mentions: boolean
    due_date_reminders: boolean
  }
  display_name: string
  email: string
}

export interface AppExportData {
  version: string
  exported_at: string
  tickets: Ticket[]
  epics: Epic[]
  project_spaces: ProjectSpace[]
  team_members: TeamMember[]
  ticket_links: TicketLink[]
  custom_fields: CustomFieldDefinition[]
  activities: TicketActivity[]
  comments: TicketComment[]
  documents: Document[]
}

// ========== Document System Types ==========

export interface Document {
  id: number
  title: string
  icon: string              // Emoji icon, default "📄"
  content: string           // Tiptap JSON serialized as string
  parent_id: number | null  // null = root-level, number = child of another document
  order: number             // Sort order among siblings
  created_date: string
  updated_date: string
  is_favorite: boolean
  cover_image?: string
}

export type DocumentTreeNode = Document & {
  children: DocumentTreeNode[]
}

export interface DocumentLink {
  id: number
  ticket_id: number
  document_id: number
  created_date: string
}

// ========== Messaging System Types ==========

export interface MessageAttachment {
  id: number
  type: 'code' | 'file' | 'image'
  // Code snippet fields
  language?: string
  code?: string
  filename?: string
  // File/image fields
  name?: string
  mimeType?: string
  size?: number
  dataUrl?: string
}

export interface MessageReaction {
  emoji: string
  user_ids: string[]
}

export type UserRole = 'super_admin' | 'admin' | 'member'

export interface RolePermissions {
  can_create_channels: boolean
  can_manage_members: boolean
  can_delete_messages: boolean
  can_manage_roles: boolean
}

export interface Channel {
  id: number
  name: string
  description: string
  is_private: boolean
  member_ids: string[]
  created_by: string
  created_date: string
}

export interface Conversation {
  id: number
  type: 'dm' | 'group_dm'
  participant_ids: string[]
  name?: string
  created_date: string
  last_message_date?: string
}

export interface Message {
  id: number
  channel_id?: number
  conversation_id?: number
  sender_id: string
  sender_name: string
  content: string
  created_date: string
  is_edited: boolean
  edited_date?: string
  attachments?: MessageAttachment[]
  reactions?: MessageReaction[]
  reply_to_id?: number
}
