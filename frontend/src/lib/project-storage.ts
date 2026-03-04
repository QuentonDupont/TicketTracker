import { ProjectSpace, Ticket } from '../types'

const PROJECT_SPACES_KEY = 'project_spaces'
const TICKETS_KEY = 'tickets'

/**
 * Get all project spaces from localStorage
 */
export function getProjectSpaces(): ProjectSpace[] {
  try {
    const data = localStorage.getItem(PROJECT_SPACES_KEY)
    if (!data) {
      return []
    }
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading project spaces:', error)
    return []
  }
}

/**
 * Save project spaces to localStorage
 */
export function saveProjectSpaces(spaces: ProjectSpace[]): void {
  try {
    localStorage.setItem(PROJECT_SPACES_KEY, JSON.stringify(spaces))
  } catch (error) {
    console.error('Error saving project spaces:', error)
  }
}

/**
 * Initialize default project space if none exists
 */
export function initializeDefaultSpace(): ProjectSpace {
  const spaces = getProjectSpaces()

  if (spaces.length === 0) {
    const defaultSpace: ProjectSpace = {
      id: 1,
      name: 'Default Project',
      description: 'Uncategorized tickets',
      color: '#6366f1', // Indigo
      created_date: new Date().toISOString()
    }

    saveProjectSpaces([defaultSpace])
    return defaultSpace
  }

  return spaces[0]
}

/**
 * Add a new project space
 */
export function addProjectSpace(space: Omit<ProjectSpace, 'id' | 'created_date'>): ProjectSpace {
  const spaces = getProjectSpaces()
  const maxId = spaces.length > 0 ? Math.max(...spaces.map(s => s.id)) : 0

  const newSpace: ProjectSpace = {
    ...space,
    id: maxId + 1,
    created_date: new Date().toISOString()
  }

  spaces.push(newSpace)
  saveProjectSpaces(spaces)

  return newSpace
}

/**
 * Update an existing project space
 */
export function updateProjectSpace(id: number, updates: Partial<Omit<ProjectSpace, 'id' | 'created_date'>>): ProjectSpace | null {
  const spaces = getProjectSpaces()
  const index = spaces.findIndex(s => s.id === id)

  if (index === -1) {
    console.error(`Project space with id ${id} not found`)
    return null
  }

  spaces[index] = {
    ...spaces[index],
    ...updates
  }

  saveProjectSpaces(spaces)
  return spaces[index]
}

/**
 * Delete a project space and handle orphaned tickets
 */
export function deleteProjectSpace(id: number): boolean {
  const spaces = getProjectSpaces()
  const filteredSpaces = spaces.filter(s => s.id !== id)

  if (filteredSpaces.length === spaces.length) {
    console.error(`Project space with id ${id} not found`)
    return false
  }

  // Move tickets from deleted space to default space (id: 1)
  const defaultSpace = filteredSpaces.find(s => s.id === 1)
  if (defaultSpace) {
    const tickets = getTickets()
    const updatedTickets = tickets.map(ticket => {
      if (ticket.project_space_id === id) {
        return {
          ...ticket,
          project_space_id: 1
        }
      }
      return ticket
    })
    saveTickets(updatedTickets)
  }

  saveProjectSpaces(filteredSpaces)
  return true
}

/**
 * Get count of tickets for a specific project space
 */
export function getTicketCountForSpace(spaceId: number): number {
  const tickets = getTickets()
  return tickets.filter(t => t.project_space_id === spaceId).length
}

/**
 * Get tickets from localStorage
 */
function getTickets(): Ticket[] {
  try {
    const data = localStorage.getItem(TICKETS_KEY)
    if (!data) {
      return []
    }
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading tickets:', error)
    return []
  }
}

/**
 * Save tickets to localStorage
 */
function saveTickets(tickets: Ticket[]): void {
  try {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets))
  } catch (error) {
    console.error('Error saving tickets:', error)
  }
}

/**
 * Assign unassigned tickets to default project space
 */
export function migrateTicketsToDefaultSpace(): void {
  const defaultSpace = initializeDefaultSpace()
  const tickets = getTickets()

  let needsUpdate = false
  const updatedTickets = tickets.map(ticket => {
    if (!ticket.project_space_id) {
      needsUpdate = true
      return {
        ...ticket,
        project_space_id: defaultSpace.id
      }
    }
    return ticket
  })

  if (needsUpdate) {
    saveTickets(updatedTickets)
    console.log(`Migrated ${tickets.length} tickets to default project space`)
  }
}

/**
 * Get tickets filtered by project space
 */
export function getTicketsBySpace(spaceId: number | null): Ticket[] {
  const tickets = getTickets()

  if (spaceId === null) {
    // Return all tickets
    return tickets
  }

  return tickets.filter(t => t.project_space_id === spaceId)
}

/**
 * Get a single project space by ID
 */
export function getProjectSpaceById(id: number): ProjectSpace | null {
  const spaces = getProjectSpaces()
  return spaces.find(s => s.id === id) || null
}
