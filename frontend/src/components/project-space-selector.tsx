'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ProjectSpace, ProjectSpaceFilterState } from '../types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Plus, Folder, FolderOpen } from 'lucide-react'
import { getTicketCountForSpace } from '../lib/project-storage'
import { applyAllFilters } from '../lib/project-filters'
import ProjectSpaceFilters from './project-space-filters'

interface ProjectSpaceSelectorProps {
  spaces: ProjectSpace[]
  selectedSpaceId: number | null
  onSpaceSelect: (spaceId: number | null) => void
  onManageSpaces?: () => void
  filterState?: ProjectSpaceFilterState
  onFilterChange?: (filters: ProjectSpaceFilterState) => void
}

export default function ProjectSpaceSelector({
  spaces,
  selectedSpaceId,
  onSpaceSelect,
  onManageSpaces,
  filterState,
  onFilterChange
}: ProjectSpaceSelectorProps) {
  // Apply filters to project spaces
  const filteredSpaces = useMemo(() => {
    if (!filterState) return spaces
    return applyAllFilters(spaces, filterState)
  }, [spaces, filterState])

  // Extract filter values with defaults
  const searchTerm = filterState?.searchTerm || ''
  const ticketCountFilter = filterState?.ticketCountFilter || 'all'
  const sortOption = filterState?.sortOption || 'date-newest'

  // Determine if clear button should be shown
  const showClearButton = !!(searchTerm || ticketCountFilter !== 'all' || sortOption !== 'date-newest')

  return (
    <Card className="glass card-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Folder className="h-5 w-5 text-blue-400" />
              Project Spaces
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Select a project to filter tickets and charts
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filter controls */}
        {filterState && onFilterChange && (
          <div className="mb-6">
            <ProjectSpaceFilters
              searchTerm={searchTerm}
              onSearchChange={(value) => onFilterChange({ ...filterState, searchTerm: value })}
              ticketCountFilter={ticketCountFilter}
              onTicketCountChange={(value) => onFilterChange({ ...filterState, ticketCountFilter: value as any })}
              sortOption={sortOption}
              onSortChange={(value) => onFilterChange({ ...filterState, sortOption: value as any })}
              onClearFilters={() => onFilterChange({ searchTerm: '', ticketCountFilter: 'all', sortOption: 'date-newest' })}
              showClearButton={showClearButton}
            />
          </div>
        )}

        {/* Filtered grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* "All Projects" card */}
          <ProjectSpaceCard
            name="All Projects"
            description="View all tickets"
            color="#10b981"
            ticketCount={spaces.reduce((sum, space) => sum + getTicketCountForSpace(space.id), 0)}
            selected={selectedSpaceId === null}
            onClick={() => onSpaceSelect(null)}
            isAllCard
          />

          {/* Individual project space cards */}
          {filteredSpaces.map(space => (
            <Link key={space.id} href={`/projects/${space.id}`} className="block">
              <ProjectSpaceCard
                name={space.name}
                description={space.description}
                color={space.color}
                ticketCount={getTicketCountForSpace(space.id)}
                selected={selectedSpaceId === space.id}
                onClick={() => {}} // No-op since navigation is handled by Link
              />
            </Link>
          ))}

          {/* Add new project card */}
          {onManageSpaces && (
            <AddProjectCard onClick={onManageSpaces} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface ProjectSpaceCardProps {
  name: string
  description?: string
  color: string
  ticketCount: number
  selected: boolean
  onClick: () => void
  isAllCard?: boolean
}

function ProjectSpaceCard({
  name,
  description,
  color,
  ticketCount,
  selected,
  onClick,
  isAllCard = false
}: ProjectSpaceCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative group cursor-pointer rounded-lg p-4 transition-all duration-300
        ${selected
          ? 'border-2 border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
          : 'border border-border/50 bg-card/50 hover:border-blue-500/50 hover:shadow-lg hover:scale-105'
        }
      `}
      style={{
        borderLeftWidth: selected || !isAllCard ? '4px' : '1px',
        borderLeftColor: selected || !isAllCard ? color : undefined
      }}
    >
      {/* Project Icon */}
      <div className="flex items-start justify-between mb-3">
        <div
          className="p-2 rounded-lg transition-all duration-300"
          style={{
            backgroundColor: `${color}20`,
            color: color
          }}
        >
          {isAllCard ? (
            <FolderOpen className="h-5 w-5" />
          ) : (
            <Folder className="h-5 w-5" />
          )}
        </div>

        {/* Ticket Count Badge */}
        <Badge
          variant={selected ? 'default' : 'secondary'}
          className="transition-all duration-300"
        >
          {ticketCount} {ticketCount === 1 ? 'ticket' : 'tickets'}
        </Badge>
      </div>

      {/* Project Name */}
      <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
        {name}
      </h3>

      {/* Project Description */}
      {description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
      )}

      {/* Selection Indicator */}
      {selected && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        </div>
      )}
    </div>
  )
}

interface AddProjectCardProps {
  onClick: () => void
}

function AddProjectCard({ onClick }: AddProjectCardProps) {
  return (
    <div
      onClick={onClick}
      className="
        group cursor-pointer rounded-lg p-4 transition-all duration-300
        border-2 border-dashed border-border/50 bg-card/30
        hover:border-blue-500 hover:bg-blue-500/5 hover:scale-105
        flex flex-col items-center justify-center min-h-[140px]
      "
    >
      <div className="p-3 rounded-full bg-blue-500/10 mb-3 group-hover:bg-blue-500/20 transition-colors">
        <Plus className="h-6 w-6 text-blue-400" />
      </div>
      <p className="font-medium text-foreground mb-1">Add Project Space</p>
      <p className="text-sm text-muted-foreground text-center">
        Create a new project
      </p>
    </div>
  )
}
