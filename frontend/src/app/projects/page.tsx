'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Folder, Plus } from 'lucide-react'
import { ProjectSpace } from '@/types'
import { getProjectSpaces, getTicketCountForSpace } from '@/lib/project-storage'
import { applyAllFilters } from '@/lib/project-filters'
import { useProjectFilters } from '@/hooks/use-project-filters'
import ProjectSpaceFilters from '@/components/project-space-filters'
import ProjectSpaceCreateModal from '@/components/project-space-create-modal'
import ProjectSpaceManageModal from '@/components/project-space-manage-modal'
import { BackgroundGradientAnimation } from '@/components/ui/background-gradient-animation'
import { Grid } from '@/components/ui/grid'
import { Spotlight } from '@/components/ui/spotlight'

export default function ProjectsPage() {
  const [projectSpaces, setProjectSpaces] = useState<ProjectSpace[]>([])
  const [actionModal, setActionModal] = useState<'new' | 'manage' | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Filter state management with URL synchronization
  const {
    searchTerm,
    ticketCountFilter,
    sortOption,
    setSearchTerm,
    setTicketCountFilter,
    setSortOption,
    clearAllFilters
  } = useProjectFilters()

  // Load project spaces from localStorage
  useEffect(() => {
    loadProjectSpaces()

    // Handle action query params
    const params = new URLSearchParams(window.location.search)
    const action = params.get('action')
    if (action === 'new') {
      setActionModal('new')
    } else if (action === 'manage') {
      setActionModal('manage')
    }
  }, [])

  // Function to load/reload project spaces
  const loadProjectSpaces = () => {
    try {
      const spaces = getProjectSpaces()
      setProjectSpaces(spaces)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading project spaces:', error)
      setIsLoading(false)
    }
  }

  // Callback to refresh data when modals make changes
  const handleModalSuccess = () => {
    loadProjectSpaces()
  }

  // Apply filters to project spaces
  const filteredSpaces = useMemo(() => {
    return applyAllFilters(projectSpaces, {
      searchTerm,
      ticketCountFilter,
      sortOption
    })
  }, [projectSpaces, searchTerm, ticketCountFilter, sortOption])

  // Determine if clear button should be shown
  const showClearButton = !!(
    searchTerm ||
    ticketCountFilter !== 'all' ||
    sortOption !== 'date-newest'
  )

  return (
    <BackgroundGradientAnimation>
      <div className="relative">
        <Spotlight className="top-0 left-0 md:left-60 md:top-0" fill="white" />
        <Grid className="opacity-30" />

        <MainLayout>
          <div className="space-y-8 p-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-gradient text-glow">
                  Projects
                </h1>
                <p className="text-muted-foreground text-lg mt-2">
                  Manage and organize your project spaces
                </p>
              </div>
              <Button
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white glow-gradient"
                onClick={() => setActionModal('new')}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>

            {/* Filters */}
            <Card className="glass card-hover">
              <CardContent className="pt-6">
                <ProjectSpaceFilters
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  ticketCountFilter={ticketCountFilter}
                  onTicketCountChange={setTicketCountFilter}
                  sortOption={sortOption}
                  onSortChange={setSortOption}
                  onClearFilters={clearAllFilters}
                  showClearButton={showClearButton}
                />
              </CardContent>
            </Card>

            {/* Project Spaces Grid */}
            {isLoading ? (
              <div className="text-center text-muted-foreground py-12">
                Loading project spaces...
              </div>
            ) : filteredSpaces.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredSpaces.map(space => (
                  <ProjectSpaceCard
                    key={space.id}
                    space={space}
                    ticketCount={getTicketCountForSpace(space.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                hasFilters={showClearButton}
                onClearFilters={clearAllFilters}
                onCreateNew={() => setActionModal('new')}
              />
            )}

            {/* Action Modals */}
            <ProjectSpaceCreateModal
              open={actionModal === 'new'}
              onClose={() => setActionModal(null)}
              onSuccess={handleModalSuccess}
            />

            <ProjectSpaceManageModal
              open={actionModal === 'manage'}
              onClose={() => setActionModal(null)}
              onUpdate={handleModalSuccess}
            />
          </div>
        </MainLayout>
      </div>
    </BackgroundGradientAnimation>
  )
}

// Project Space Card Component
interface ProjectSpaceCardProps {
  space: ProjectSpace
  ticketCount: number
}

function ProjectSpaceCard({ space, ticketCount }: ProjectSpaceCardProps) {
  return (
    <Link href={`/projects/${space.id}`} className="block">
      <Card
        className="group cursor-pointer rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 glass card-hover hover-lift"
        style={{
          borderLeftWidth: '4px',
          borderLeftColor: space.color
        }}
      >
        <CardContent className="p-4">
          {/* Header with icon and badge */}
          <div className="flex items-start justify-between mb-3">
            <div
              className="p-2 rounded-lg transition-all duration-300"
              style={{
                backgroundColor: `${space.color}20`,
                color: space.color
              }}
            >
              <Folder className="h-5 w-5" />
            </div>

            <Badge variant="secondary" className="transition-all duration-300">
              {ticketCount} {ticketCount === 1 ? 'ticket' : 'tickets'}
            </Badge>
          </div>

          {/* Project Name */}
          <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
            {space.name}
          </h3>

          {/* Project Description */}
          {space.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {space.description}
            </p>
          )}

          {/* Creation Date */}
          <p className="text-xs text-muted-foreground/60 mt-2">
            Created {new Date(space.created_date).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}

// Empty State Component
interface EmptyStateProps {
  hasFilters: boolean
  onClearFilters: () => void
  onCreateNew: () => void
}

function EmptyState({ hasFilters, onClearFilters, onCreateNew }: EmptyStateProps) {
  return (
    <Card className="glass card-hover">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="p-4 rounded-full bg-muted mb-4">
          <Folder className="h-8 w-8 text-muted-foreground" />
        </div>

        {hasFilters ? (
          <>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No project spaces match your filters
            </h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              Try adjusting your search criteria or clear the filters to see all project spaces.
            </p>
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="glass border-border"
            >
              Clear Filters
            </Button>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No project spaces yet
            </h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              Create your first project space to organize your tickets and start tracking your work.
            </p>
            <Button
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white glow-gradient"
              onClick={onCreateNew}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Project Space
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
