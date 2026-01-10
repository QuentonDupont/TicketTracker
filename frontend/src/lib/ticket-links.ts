// Utility functions for managing ticket links in localStorage

import { TicketLink, TicketLinkType, Ticket } from '@/types'

const LINKS_STORAGE_KEY = 'ticket_links'
const TICKETS_STORAGE_KEY = 'tickets'

// Get all ticket links from localStorage
export function getAllTicketLinks(): TicketLink[] {
  try {
    const stored = localStorage.getItem(LINKS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error reading ticket links from localStorage:', error)
    return []
  }
}

// Save ticket links to localStorage
export function saveTicketLinks(links: TicketLink[]): void {
  try {
    localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(links))
  } catch (error) {
    console.error('Error saving ticket links to localStorage:', error)
  }
}

// Get the reciprocal link type for bidirectional links
export function getReciprocalLinkType(linkType: TicketLinkType): TicketLinkType | null {
  const reciprocalMap: Record<string, TicketLinkType> = {
    'Parent/Child': 'Parent/Child',
    'Duplicates': 'Duplicates',
    'Blocks': 'Blocked By',
    'Blocked By': 'Blocks',
  }
  return reciprocalMap[linkType] || null
}

// Create a new ticket link (with automatic bidirectional linking)
export function createTicketLink(
  sourceTicketId: number,
  targetTicketId: number,
  linkType: TicketLinkType,
  createdBy?: string
): { success: boolean; message: string; link?: TicketLink } {
  // Validation
  if (sourceTicketId === targetTicketId) {
    return { success: false, message: 'Cannot link a ticket to itself' }
  }

  const links = getAllTicketLinks()

  // Check if link already exists
  const existingLink = links.find(
    (link) =>
      link.source_ticket_id === sourceTicketId &&
      link.target_ticket_id === targetTicketId &&
      link.link_type === linkType
  )

  if (existingLink) {
    return { success: false, message: 'This link already exists' }
  }

  // Create the primary link
  const newLinkId = links.length > 0 ? Math.max(...links.map((l) => l.id)) + 1 : 1
  const newLink: TicketLink = {
    id: newLinkId,
    source_ticket_id: sourceTicketId,
    target_ticket_id: targetTicketId,
    link_type: linkType,
    created_date: new Date().toISOString(),
    created_by: createdBy,
  }

  const updatedLinks = [...links, newLink]

  // Create reciprocal link if applicable
  const reciprocalType = getReciprocalLinkType(linkType)
  if (reciprocalType) {
    const reciprocalLinkId = newLinkId + 1
    const reciprocalLink: TicketLink = {
      id: reciprocalLinkId,
      source_ticket_id: targetTicketId,
      target_ticket_id: sourceTicketId,
      link_type: reciprocalType,
      created_date: new Date().toISOString(),
      created_by: createdBy,
    }
    updatedLinks.push(reciprocalLink)
  }

  // Update ticket's linked_tickets array
  updateTicketLinkedTickets(sourceTicketId, newLinkId, 'add')
  if (reciprocalType) {
    updateTicketLinkedTickets(targetTicketId, newLinkId + 1, 'add')
  }

  saveTicketLinks(updatedLinks)

  return { success: true, message: 'Link created successfully', link: newLink }
}

// Delete a ticket link (and its reciprocal if applicable)
export function deleteTicketLink(linkId: number): { success: boolean; message: string } {
  const links = getAllTicketLinks()
  const linkToDelete = links.find((link) => link.id === linkId)

  if (!linkToDelete) {
    return { success: false, message: 'Link not found' }
  }

  // Remove from ticket's linked_tickets array
  updateTicketLinkedTickets(linkToDelete.source_ticket_id, linkId, 'remove')

  // Find and remove reciprocal link
  const reciprocalType = getReciprocalLinkType(linkToDelete.link_type)
  if (reciprocalType) {
    const reciprocalLink = links.find(
      (link) =>
        link.source_ticket_id === linkToDelete.target_ticket_id &&
        link.target_ticket_id === linkToDelete.source_ticket_id &&
        link.link_type === reciprocalType
    )

    if (reciprocalLink) {
      updateTicketLinkedTickets(reciprocalLink.source_ticket_id, reciprocalLink.id, 'remove')
      const updatedLinks = links.filter((link) => link.id !== linkId && link.id !== reciprocalLink.id)
      saveTicketLinks(updatedLinks)
      return { success: true, message: 'Link and its reciprocal removed successfully' }
    }
  }

  const updatedLinks = links.filter((link) => link.id !== linkId)
  saveTicketLinks(updatedLinks)

  return { success: true, message: 'Link removed successfully' }
}

// Get all links for a specific ticket
export function getTicketLinks(ticketId: number): TicketLink[] {
  const allLinks = getAllTicketLinks()
  return allLinks.filter((link) => link.source_ticket_id === ticketId)
}

// Get grouped links for a ticket (organized by link type)
export function getGroupedTicketLinks(ticketId: number): Record<TicketLinkType, TicketLink[]> {
  const links = getTicketLinks(ticketId)

  const grouped: Record<TicketLinkType, TicketLink[]> = {
    'Parent/Child': [],
    'Duplicates': [],
    'Relates To': [],
    'Blocks': [],
    'Blocked By': [],
  }

  links.forEach((link) => {
    grouped[link.link_type].push(link)
  })

  return grouped
}

// Clean up orphaned links when a ticket is deleted
export function cleanupOrphanedLinks(deletedTicketId: number): void {
  const links = getAllTicketLinks()
  const updatedLinks = links.filter(
    (link) =>
      link.source_ticket_id !== deletedTicketId &&
      link.target_ticket_id !== deletedTicketId
  )
  saveTicketLinks(updatedLinks)
}

// Helper function to update a ticket's linked_tickets array
function updateTicketLinkedTickets(
  ticketId: number,
  linkId: number,
  action: 'add' | 'remove'
): void {
  try {
    const storedTickets = localStorage.getItem(TICKETS_STORAGE_KEY)
    if (!storedTickets) return

    const tickets: Ticket[] = JSON.parse(storedTickets)
    const ticketIndex = tickets.findIndex((t) => t.id === ticketId)

    if (ticketIndex === -1) return

    const ticket = tickets[ticketIndex]
    const linkedTickets = ticket.linked_tickets || []

    if (action === 'add' && !linkedTickets.includes(linkId)) {
      ticket.linked_tickets = [...linkedTickets, linkId]
    } else if (action === 'remove') {
      ticket.linked_tickets = linkedTickets.filter((id) => id !== linkId)
    }

    tickets[ticketIndex] = ticket
    localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets))
  } catch (error) {
    console.error('Error updating ticket linked_tickets:', error)
  }
}

// Get ticket by ID (helper function)
export function getTicketById(ticketId: number): Ticket | null {
  try {
    const storedTickets = localStorage.getItem(TICKETS_STORAGE_KEY)
    if (!storedTickets) return null

    const tickets: Ticket[] = JSON.parse(storedTickets)
    return tickets.find((t) => t.id === ticketId) || null
  } catch (error) {
    console.error('Error getting ticket by ID:', error)
    return null
  }
}

// Get link type icon name (for lucide-react)
export function getLinkTypeIcon(linkType: TicketLinkType): string {
  const iconMap: Record<TicketLinkType, string> = {
    'Parent/Child': 'GitBranch',
    'Duplicates': 'Copy',
    'Relates To': 'Link',
    'Blocks': 'Ban',
    'Blocked By': 'AlertCircle',
  }
  return iconMap[linkType]
}

// Get link type color
export function getLinkTypeColor(linkType: TicketLinkType): string {
  const colorMap: Record<TicketLinkType, string> = {
    'Parent/Child': 'text-purple-500',
    'Duplicates': 'text-yellow-500',
    'Relates To': 'text-blue-500',
    'Blocks': 'text-red-500',
    'Blocked By': 'text-orange-500',
  }
  return colorMap[linkType]
}
