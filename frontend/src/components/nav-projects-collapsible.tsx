'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconFolder, IconFolderOpen, IconPlus, IconSettings, IconChevronRight } from '@tabler/icons-react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from './ui/sidebar'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'
import { getProjectSpaces, getTicketCountForSpace } from '@/lib/project-storage'
import { ProjectSpace } from '@/types'

const STORAGE_KEY = 'sidebar_projects_expanded'

export function NavProjectsCollapsible() {
  const pathname = usePathname()
  const [projectSpaces, setProjectSpaces] = useState<ProjectSpace[]>([])
  const [isOpen, setIsOpen] = useState(true)

  // Load project spaces from localStorage
  useEffect(() => {
    const spaces = getProjectSpaces()
    setProjectSpaces(spaces)
  }, [])

  // Load expanded state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored !== null) {
        setIsOpen(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Error loading sidebar projects expanded state:', error)
    }
  }, [])

  // Save expanded state to localStorage
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(open))
    } catch (error) {
      console.error('Error saving sidebar projects expanded state:', error)
    }
  }

  // Check if a project space is active
  const isProjectActive = (spaceId: number): boolean => {
    // Check if we're on the /projects page with this space selected
    if (pathname.startsWith('/projects')) {
      const params = new URLSearchParams(window.location.search)
      const selectedSpace = params.get('space')
      return selectedSpace === String(spaceId)
    }
    return false
  }

  // Check if "All Projects" is active
  const isAllProjectsActive = (): boolean => {
    return pathname === '/projects' && !window.location.search.includes('space=')
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={handleOpenChange}
      className="group/collapsible"
    >
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              {isOpen ? (
                <IconFolderOpen className="h-4 w-4 text-blue-400" />
              ) : (
                <IconFolder className="h-4 w-4 text-blue-400" />
              )}
              <span>Projects</span>
            </div>
            <IconChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>

        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* "All Projects" item */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="All Projects"
                  isActive={isAllProjectsActive()}
                >
                  <Link href="/projects">
                    <IconFolder className="h-4 w-4" />
                    <span>All Projects</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Scrollable list of project spaces */}
              {projectSpaces.length > 0 && (
                <ScrollArea className="max-h-[300px]">
                  {projectSpaces.map((space) => {
                    const ticketCount = getTicketCountForSpace(space.id)
                    const isActive = isProjectActive(space.id)

                    return (
                      <SidebarMenuItem key={space.id}>
                        <SidebarMenuButton
                          asChild
                          tooltip={space.name}
                          isActive={isActive}
                          className="group/item"
                        >
                          <Link href={`/projects?space=${space.id}`}>
                            {/* Color dot indicator */}
                            <div
                              className="h-2 w-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: space.color }}
                            />

                            {/* Project name */}
                            <span className="flex-1 truncate">{space.name}</span>

                            {/* Ticket count badge */}
                            <Badge
                              variant="secondary"
                              className="ml-auto h-5 px-1.5 text-xs"
                            >
                              {ticketCount}
                            </Badge>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </ScrollArea>
              )}

              {/* Divider */}
              <Separator className="my-2" />

              {/* Action items */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Create New Project"
                >
                  <Link href="/projects?action=new">
                    <IconPlus className="h-4 w-4" />
                    <span>Create New Project</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Manage Projects"
                >
                  <Link href="/projects?action=manage">
                    <IconSettings className="h-4 w-4" />
                    <span>Manage Projects</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
}
