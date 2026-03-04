import { ProjectSpace, ProjectSpaceFilterState } from '../types'
import { getTicketCountForSpace } from './project-storage'

/**
 * Filter project spaces by search term (case-insensitive)
 * Searches in both name and description fields
 */
export function filterBySearch(
  spaces: ProjectSpace[],
  searchTerm: string
): ProjectSpace[] {
  if (!searchTerm || !searchTerm.trim()) {
    return spaces
  }

  const term = searchTerm.toLowerCase().trim()

  return spaces.filter(space => {
    const nameMatch = space.name.toLowerCase().includes(term)
    const descriptionMatch = space.description?.toLowerCase().includes(term) || false
    return nameMatch || descriptionMatch
  })
}

/**
 * Filter project spaces by ticket count
 * Options: 'all', 'empty' (0 tickets), '1-10', '10plus' (>10)
 */
export function filterByTicketCount(
  spaces: ProjectSpace[],
  filter: 'all' | 'empty' | '1-10' | '10plus'
): ProjectSpace[] {
  if (filter === 'all') {
    return spaces
  }

  return spaces.filter(space => {
    const count = getTicketCountForSpace(space.id)

    switch (filter) {
      case 'empty':
        return count === 0
      case '1-10':
        return count >= 1 && count <= 10
      case '10plus':
        return count > 10
      default:
        return true
    }
  })
}

/**
 * Sort project spaces by various criteria
 * Options: date (newest/oldest), ticket count (desc/asc)
 */
export function sortProjectSpaces(
  spaces: ProjectSpace[],
  sortOption: 'date-newest' | 'date-oldest' | 'tickets-desc' | 'tickets-asc'
): ProjectSpace[] {
  // Create a copy to avoid mutating the original array
  const sorted = [...spaces]

  sorted.sort((a, b) => {
    switch (sortOption) {
      case 'date-newest':
        return new Date(b.created_date).getTime() - new Date(a.created_date).getTime()

      case 'date-oldest':
        return new Date(a.created_date).getTime() - new Date(b.created_date).getTime()

      case 'tickets-desc':
        return getTicketCountForSpace(b.id) - getTicketCountForSpace(a.id)

      case 'tickets-asc':
        return getTicketCountForSpace(a.id) - getTicketCountForSpace(b.id)

      default:
        return 0
    }
  })

  return sorted
}

/**
 * Apply all filters to project spaces in sequence
 * Combines search, ticket count filter, and sorting (AND logic)
 */
export function applyAllFilters(
  spaces: ProjectSpace[],
  filters: ProjectSpaceFilterState
): ProjectSpace[] {
  let result = [...spaces]

  // Step 1: Apply search filter
  if (filters.searchTerm) {
    result = filterBySearch(result, filters.searchTerm)
  }

  // Step 2: Apply ticket count filter
  if (filters.ticketCountFilter && filters.ticketCountFilter !== 'all') {
    result = filterByTicketCount(result, filters.ticketCountFilter)
  }

  // Step 3: Apply sorting (always applied with default)
  const sortOption = filters.sortOption || 'date-newest'
  result = sortProjectSpaces(result, sortOption)

  return result
}
