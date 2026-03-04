'use client'

import { useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

/**
 * Custom hook for managing project space filter state with URL synchronization
 * Reads filter state from URL query parameters and updates URL when filters change
 */
export function useProjectFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Read current filter state from URL
  const searchTerm = searchParams.get('search') || ''
  const ticketCountFilter = (searchParams.get('tickets') || 'all') as 'all' | 'empty' | '1-10' | '10plus'
  const sortOption = (searchParams.get('sort') || 'date-newest') as
    'date-newest' | 'date-oldest' | 'tickets-desc' | 'tickets-asc'
  const selectedSpaceId = searchParams.get('space') ? Number(searchParams.get('space')) : null

  /**
   * Helper function to update URL query parameters
   */
  const updateURL = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())

      // Apply updates
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })

      // Remove default values to keep URL clean
      if (params.get('tickets') === 'all') {
        params.delete('tickets')
      }
      if (params.get('sort') === 'date-newest') {
        params.delete('sort')
      }

      // Build new URL
      const queryString = params.toString()
      const newURL = queryString ? `${pathname}?${queryString}` : pathname

      // Update URL without page reload
      router.push(newURL)
    },
    [searchParams, router, pathname]
  )

  /**
   * Set search term and update URL
   */
  const setSearchTerm = useCallback(
    (value: string) => {
      updateURL({ search: value || null })
    },
    [updateURL]
  )

  /**
   * Set ticket count filter and update URL
   */
  const setTicketCountFilter = useCallback(
    (value: string) => {
      updateURL({ tickets: value === 'all' ? null : value })
    },
    [updateURL]
  )

  /**
   * Set sort option and update URL
   */
  const setSortOption = useCallback(
    (value: string) => {
      updateURL({ sort: value === 'date-newest' ? null : value })
    },
    [updateURL]
  )

  /**
   * Set selected project space ID and update URL
   */
  const setSelectedSpaceId = useCallback(
    (id: number | null) => {
      updateURL({ space: id ? String(id) : null })
    },
    [updateURL]
  )

  /**
   * Clear all filters and reset URL to default state
   */
  const clearAllFilters = useCallback(() => {
    router.push(pathname)
  }, [router, pathname])

  return {
    // Current filter state
    searchTerm,
    ticketCountFilter,
    sortOption,
    selectedSpaceId,

    // Setter functions
    setSearchTerm,
    setTicketCountFilter,
    setSortOption,
    setSelectedSpaceId,

    // Reset function
    clearAllFilters
  }
}
