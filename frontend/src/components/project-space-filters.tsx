'use client'

import { Search, Filter, X } from 'lucide-react'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Button } from './ui/button'

interface ProjectSpaceFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  ticketCountFilter: 'all' | 'empty' | '1-10' | '10plus'
  onTicketCountChange: (value: string) => void
  sortOption: 'date-newest' | 'date-oldest' | 'tickets-desc' | 'tickets-asc'
  onSortChange: (value: string) => void
  onClearFilters: () => void
  showClearButton?: boolean
}

export default function ProjectSpaceFilters({
  searchTerm,
  onSearchChange,
  ticketCountFilter,
  onTicketCountChange,
  sortOption,
  onSortChange,
  onClearFilters,
  showClearButton = false
}: ProjectSpaceFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left side: Search and filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-1">
        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search project spaces..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 glass border-border"
          />
        </div>

        {/* Ticket Count Filter */}
        <Select value={ticketCountFilter} onValueChange={onTicketCountChange}>
          <SelectTrigger className="w-full sm:w-[180px] glass border-border">
            <SelectValue placeholder="Ticket count" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            <SelectItem value="empty">Empty (0 tickets)</SelectItem>
            <SelectItem value="1-10">1-10 tickets</SelectItem>
            <SelectItem value="10plus">10+ tickets</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Options */}
        <Select value={sortOption} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-[200px] glass border-border">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-newest">Newest first</SelectItem>
            <SelectItem value="date-oldest">Oldest first</SelectItem>
            <SelectItem value="tickets-desc">Most tickets</SelectItem>
            <SelectItem value="tickets-asc">Least tickets</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Right side: Clear filters button */}
      {showClearButton && (
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="glass border-border hover:bg-muted"
        >
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}
