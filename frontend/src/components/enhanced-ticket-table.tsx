"use client"

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  AlertCircle,
  Target
} from "lucide-react"
import { Ticket, Epic, TeamMember } from "@/types"
import { getTeamMembers } from "@/lib/team-storage"

interface EnhancedTicketTableProps {
  tickets: Ticket[]
  onEdit: (ticket: Ticket) => void
  onDelete: (ticketId: number) => void
  onView: (ticket: Ticket) => void
  onQuickUpdate?: (ticketId: number, updates: Partial<Ticket>) => void
}

type SortField = 'title' | 'status' | 'priority' | 'due_date' | 'created_date'
type SortDirection = 'asc' | 'desc'

const statusColors = {
  'To Do': 'bg-gray-500 text-white',
  'In Progress': 'bg-blue-500 text-white',
  'Ready for Code Review': 'bg-blue-600 text-white',
  'Ready For QA': 'bg-orange-500 text-white',
  'In QA': 'bg-yellow-500 text-white',
  'Ready to Release': 'bg-indigo-500 text-white',
  'Live': 'bg-green-500 text-white'
}

const priorityColors = {
  'Low': 'bg-green-100 text-green-800 border-green-200',
  'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'High': 'bg-red-100 text-red-800 border-red-200'
}

export function EnhancedTicketTable({ tickets, onEdit, onDelete, onView, onQuickUpdate }: EnhancedTicketTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [epicFilter, setEpicFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('created_date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [availableEpics, setAvailableEpics] = useState<Epic[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])

  // Load available epics and team members
  useEffect(() => {
    try {
      const storedEpics = localStorage.getItem('epics')
      if (storedEpics) {
        const epics: Epic[] = JSON.parse(storedEpics)
        setAvailableEpics(epics)
      }
    } catch (error) {
      console.error('Error loading epics:', error)
    }
    try {
      setTeamMembers(getTeamMembers())
    } catch (error) {
      console.error('Error loading team members:', error)
    }
  }, [])

  // Filtered and sorted tickets
  const filteredAndSortedTickets = useMemo(() => {
    let filtered = tickets.filter(ticket => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
      const matchesEpic = epicFilter === 'all' ||
                         (epicFilter === 'none' && !ticket.epic_id) ||
                         (ticket.epic_id && ticket.epic_id.toString() === epicFilter)

      return matchesSearch && matchesStatus && matchesPriority && matchesEpic
    })

    // Sort tickets
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      // Handle date sorting
      if (sortField === 'due_date' || sortField === 'created_date') {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }

      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [tickets, searchTerm, statusFilter, priorityFilter, epicFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortDirection === 'asc' ?
      <ArrowUp className="h-4 w-4" /> :
      <ArrowDown className="h-4 w-4" />
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'To Do':
        return <AlertCircle className="h-4 w-4" />
      case 'In Progress':
        return <Calendar className="h-4 w-4" />
      case 'Done':
        return <Calendar className="h-4 w-4" />
      default:
        return null
    }
  }

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'Live' || status === 'Ready to Release') return false
    const due = new Date(dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return due < today
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Ticket Management
          </div>
          <Badge variant="outline" className="ml-auto">
            {filteredAndSortedTickets.length} of {tickets.length} tickets
          </Badge>
        </CardTitle>
        <CardDescription>
          Manage and track your project tickets with advanced filtering and sorting
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="To Do">To Do</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Ready for Code Review">Ready for Code Review</SelectItem>
              <SelectItem value="Ready For QA">Ready For QA</SelectItem>
              <SelectItem value="In QA">In QA</SelectItem>
              <SelectItem value="Ready to Release">Ready to Release</SelectItem>
              <SelectItem value="Live">Live</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="High">High Priority</SelectItem>
              <SelectItem value="Medium">Medium Priority</SelectItem>
              <SelectItem value="Low">Low Priority</SelectItem>
            </SelectContent>
          </Select>

          {/* Epic Filter */}
          <Select value={epicFilter} onValueChange={setEpicFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by epic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Epics</SelectItem>
              <SelectItem value="none">No Epic</SelectItem>
              {availableEpics.map((epic) => (
                <SelectItem key={epic.id} value={epic.id.toString()}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: epic.color }}
                    />
                    {epic.title}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('')
              setStatusFilter('all')
              setPriorityFilter('all')
              setEpicFilter('all')
            }}
            className="w-full sm:w-auto"
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('title')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Title {getSortIcon('title')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('status')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Status {getSortIcon('status')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('priority')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Priority {getSortIcon('priority')}
                  </Button>
                </TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('due_date')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Due Date {getSortIcon('due_date')}
                  </Button>
                </TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || epicFilter !== 'all'
                          ? 'No tickets match your filters'
                          : 'No tickets found'
                        }
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedTickets.map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    className="hover:bg-muted/70 cursor-pointer"
                    onClick={() => router.push(`/tickets/${ticket.id}`)}
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium flex items-center gap-2">
                          {getStatusIcon(ticket.status)}
                          <Link
                            href={`/tickets/${ticket.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-blue-400 hover:underline transition-colors"
                          >
                            {ticket.title}
                          </Link>
                          {isOverdue(ticket.due_date, ticket.status) && (
                            <Badge variant="destructive" className="text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {ticket.description.length > 60
                            ? `${ticket.description.substring(0, 60)}...`
                            : ticket.description
                          }
                        </div>
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {onQuickUpdate ? (
                        <Select
                          value={ticket.status}
                          onValueChange={(value) => onQuickUpdate(ticket.id, { status: value as Ticket['status'] })}
                        >
                          <SelectTrigger className="h-7 w-auto min-w-0 border-none bg-transparent p-0 shadow-none hover:bg-accent rounded-full [&>svg]:hidden">
                            <Badge className={`${statusColors[ticket.status]} cursor-pointer`}>
                              {ticket.status}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="To Do">To Do</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Ready for Code Review">Ready for Code Review</SelectItem>
                            <SelectItem value="Ready For QA">Ready For QA</SelectItem>
                            <SelectItem value="In QA">In QA</SelectItem>
                            <SelectItem value="Ready to Release">Ready to Release</SelectItem>
                            <SelectItem value="Live">Live</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={statusColors[ticket.status]}>
                          {ticket.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {onQuickUpdate ? (
                        <Select
                          value={ticket.priority}
                          onValueChange={(value) => onQuickUpdate(ticket.id, { priority: value as Ticket['priority'] })}
                        >
                          <SelectTrigger className="h-7 w-auto min-w-0 border-none bg-transparent p-0 shadow-none hover:bg-accent rounded-full [&>svg]:hidden">
                            <Badge variant="outline" className={`${priorityColors[ticket.priority]} cursor-pointer`}>
                              {ticket.priority}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className={priorityColors[ticket.priority]}>
                          {ticket.priority}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {onQuickUpdate ? (
                        <Select
                          value={ticket.assignee || '__unassigned__'}
                          onValueChange={(value) => onQuickUpdate(ticket.id, { assignee: value === '__unassigned__' ? undefined : value })}
                        >
                          <SelectTrigger className="h-7 w-auto min-w-[100px] border-none bg-transparent px-1 shadow-none hover:bg-accent">
                            <div className="flex items-center gap-1.5 text-sm">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className={ticket.assignee ? '' : 'text-muted-foreground'}>
                                {ticket.assignee || 'Unassigned'}
                              </span>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__unassigned__">Unassigned</SelectItem>
                            {teamMembers.map((member) => (
                              <SelectItem key={member.id} value={member.name}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        ticket.assignee ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {ticket.assignee}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {onQuickUpdate ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <input
                            type="date"
                            value={ticket.due_date}
                            onChange={(e) => onQuickUpdate(ticket.id, { due_date: e.target.value })}
                            className={`bg-transparent border-none outline-none text-sm cursor-pointer hover:text-primary ${
                              isOverdue(ticket.due_date, ticket.status) ? 'text-red-600 font-medium' : ''
                            }`}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className={isOverdue(ticket.due_date, ticket.status) ? 'text-red-600 font-medium' : ''}>
                            {new Date(ticket.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {ticket.tags && ticket.tags.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
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
                      ) : (
                        <span className="text-muted-foreground text-sm">No tags</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(ticket); }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(ticket); }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Ticket
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); onDelete(ticket.id); }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Ticket
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        {filteredAndSortedTickets.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredAndSortedTickets.length} of {tickets.length} tickets
            {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || epicFilter !== 'all') && ' (filtered)'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}