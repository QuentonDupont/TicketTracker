"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  User,
  Tag,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { format, isToday, isPast, isFuture } from "date-fns"

export interface Ticket {
  id: number
  title: string
  description: string
  status: 'To Do' | 'In Progress' | 'Done'
  priority: 'Low' | 'Medium' | 'High'
  due_date: string
  created_date: string
  assignee?: string
  tags?: string[]
}

interface TicketCategory {
  name: string
  status: 'To Do' | 'In Progress' | 'Done'
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  tickets: Ticket[]
  isOpen: boolean
}

interface EnhancedTicketSidebarProps {
  tickets: Ticket[]
  onTicketSelect: (ticket: Ticket) => void
  onTicketEdit: (ticket: Ticket) => void
  onTicketDelete: (ticketId: number) => void
  onCreateTicket: () => void
  selectedTicketId?: number
}

const statusIcons = {
  'To Do': Circle,
  'In Progress': Clock,
  'Done': CheckCircle2
}

const statusColors = {
  'To Do': {
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    badgeColor: 'bg-gray-500'
  },
  'In Progress': {
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    badgeColor: 'bg-blue-500'
  },
  'Done': {
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    badgeColor: 'bg-green-500'
  }
}

const priorityColors = {
  'Low': 'border-l-green-500',
  'Medium': 'border-l-yellow-500',
  'High': 'border-l-red-500'
}

export function EnhancedTicketSidebar({
  tickets,
  onTicketSelect,
  onTicketEdit,
  onTicketDelete,
  onCreateTicket,
  selectedTicketId
}: EnhancedTicketSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'To Do': true,
    'In Progress': true,
    'Done': false
  })

  // Group tickets by status
  const categorizeTickets = (): TicketCategory[] => {
    const filteredTickets = tickets.filter(ticket =>
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.assignee && ticket.assignee.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return [
      {
        name: 'To Do',
        status: 'To Do',
        icon: Circle,
        color: statusColors['To Do'].color,
        bgColor: statusColors['To Do'].bgColor,
        tickets: filteredTickets.filter(t => t.status === 'To Do'),
        isOpen: expandedCategories['To Do']
      },
      {
        name: 'In Progress',
        status: 'In Progress',
        icon: Clock,
        color: statusColors['In Progress'].color,
        bgColor: statusColors['In Progress'].bgColor,
        tickets: filteredTickets.filter(t => t.status === 'In Progress'),
        isOpen: expandedCategories['In Progress']
      },
      {
        name: 'Done',
        status: 'Done',
        icon: CheckCircle2,
        color: statusColors['Done'].color,
        bgColor: statusColors['Done'].bgColor,
        tickets: filteredTickets.filter(t => t.status === 'Done'),
        isOpen: expandedCategories['Done']
      }
    ]
  }

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }))
  }

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'Done') return false
    return isPast(new Date(dueDate)) && !isToday(new Date(dueDate))
  }

  const isDueToday = (dueDate: string) => {
    return isToday(new Date(dueDate))
  }

  const categories = categorizeTickets()
  const totalTickets = tickets.length
  const overdueTickets = tickets.filter(t => isOverdue(t.due_date, t.status)).length

  return (
    <div className="w-80 border-r bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Tickets</h2>
          <Button size="sm" onClick={onCreateTicket}>
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Summary Stats */}
        <div className="flex gap-2 mb-2">
          <Badge variant="outline" className="text-xs">
            Total: {totalTickets}
          </Badge>
          {overdueTickets > 0 && (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              {overdueTickets} Overdue
            </Badge>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto">
        {categories.map((category) => (
          <Collapsible
            key={category.name}
            open={category.isOpen}
            onOpenChange={() => toggleCategory(category.name)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  {category.isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <category.icon className={cn("h-4 w-4", category.color)} />
                  <span className="font-medium">{category.name}</span>
                </div>
                <Badge
                  className={cn(
                    "text-white text-xs",
                    statusColors[category.status].badgeColor
                  )}
                >
                  {category.tickets.length}
                </Badge>
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-1 px-2 pb-2">
              {category.tickets.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No tickets in {category.name.toLowerCase()}
                </div>
              ) : (
                category.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={cn(
                      "group relative p-3 rounded-lg border cursor-pointer transition-colors border-l-4",
                      priorityColors[ticket.priority],
                      selectedTicketId === ticket.id
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted/50",
                      isOverdue(ticket.due_date, ticket.status) && "bg-red-50 border-red-200"
                    )}
                    onClick={() => onTicketSelect(ticket)}
                  >
                    {/* Ticket Content */}
                    <div className="space-y-2">
                      {/* Title and Priority */}
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm line-clamp-2 pr-8">
                          {ticket.title}
                        </h4>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                onTicketSelect(ticket)
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                onTicketEdit(ticket)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                onTicketDelete(ticket.id)
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Priority Badge */}
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs w-fit",
                          ticket.priority === 'High' && "border-red-200 text-red-700 bg-red-50",
                          ticket.priority === 'Medium' && "border-yellow-200 text-yellow-700 bg-yellow-50",
                          ticket.priority === 'Low' && "border-green-200 text-green-700 bg-green-50"
                        )}
                      >
                        {ticket.priority}
                      </Badge>

                      {/* Due Date */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span
                          className={cn(
                            isOverdue(ticket.due_date, ticket.status) && "text-red-600 font-medium",
                            isDueToday(ticket.due_date) && "text-orange-600 font-medium"
                          )}
                        >
                          {format(new Date(ticket.due_date), 'MMM dd')}
                          {isDueToday(ticket.due_date) && " (Today)"}
                          {isOverdue(ticket.due_date, ticket.status) && " (Overdue)"}
                        </span>
                      </div>

                      {/* Assignee */}
                      {ticket.assignee && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{ticket.assignee}</span>
                        </div>
                      )}

                      {/* Tags */}
                      {ticket.tags && ticket.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {ticket.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {ticket.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{ticket.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  )
}