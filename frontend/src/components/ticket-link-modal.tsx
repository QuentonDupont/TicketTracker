"use client"

import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, GitBranch, Copy, Link as LinkIcon, Ban, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Ticket, TicketLinkType } from "@/types"
import { createTicketLink } from "@/lib/ticket-links"

interface TicketLinkModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTicketId: number
  onLinkCreated?: () => void
}

const linkTypeOptions: { value: TicketLinkType; label: string; description: string; icon: any }[] = [
  {
    value: 'Parent/Child',
    label: 'Parent/Child',
    description: 'Hierarchical relationship (subtasks)',
    icon: GitBranch,
  },
  {
    value: 'Duplicates',
    label: 'Duplicates',
    description: 'Mark as duplicate of another ticket',
    icon: Copy,
  },
  {
    value: 'Relates To',
    label: 'Relates To',
    description: 'General relationship between tickets',
    icon: LinkIcon,
  },
  {
    value: 'Blocks',
    label: 'Blocks',
    description: 'This ticket blocks another ticket',
    icon: Ban,
  },
  {
    value: 'Blocked By',
    label: 'Blocked By',
    description: 'This ticket is blocked by another ticket',
    icon: AlertCircle,
  },
]

const statusColors = {
  'To Do': 'bg-gray-500 text-white',
  'In Progress': 'bg-blue-500 text-white',
  'Ready for Code Review': 'bg-purple-500 text-white',
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

export function TicketLinkModal({
  open,
  onOpenChange,
  currentTicketId,
  onLinkCreated,
}: TicketLinkModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)
  const [selectedLinkType, setSelectedLinkType] = useState<TicketLinkType>('Relates To')
  const [allTickets, setAllTickets] = useState<Ticket[]>([])
  const [isCreating, setIsCreating] = useState(false)

  // Load all tickets when modal opens
  useEffect(() => {
    if (open) {
      loadTickets()
      // Reset state
      setSearchQuery('')
      setSelectedTicketId(null)
      setSelectedLinkType('Relates To')
    }
  }, [open])

  const loadTickets = () => {
    try {
      const storedTickets = localStorage.getItem('tickets')
      if (storedTickets) {
        const tickets: Ticket[] = JSON.parse(storedTickets)
        // Filter out the current ticket
        const filteredTickets = tickets.filter((t) => t.id !== currentTicketId)
        setAllTickets(filteredTickets)
      }
    } catch (error) {
      console.error('Error loading tickets:', error)
      toast.error('Failed to load tickets')
    }
  }

  // Filter tickets based on search query
  const filteredTickets = useMemo(() => {
    if (!searchQuery.trim()) {
      return allTickets
    }

    const query = searchQuery.toLowerCase()
    return allTickets.filter(
      (ticket) =>
        ticket.id.toString().includes(query) ||
        ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query) ||
        ticket.status.toLowerCase().includes(query) ||
        ticket.priority.toLowerCase().includes(query)
    )
  }, [allTickets, searchQuery])

  const handleCreateLink = async () => {
    if (!selectedTicketId) {
      toast.error('Please select a ticket to link')
      return
    }

    setIsCreating(true)

    const result = createTicketLink(currentTicketId, selectedTicketId, selectedLinkType)

    if (result.success) {
      toast.success(result.message)
      onLinkCreated?.()
      onOpenChange(false)
    } else {
      toast.error(result.message)
    }

    setIsCreating(false)
  }

  const selectedTicket = allTickets.find((t) => t.id === selectedTicketId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Link Ticket</DialogTitle>
          <DialogDescription>
            Create a relationship between this ticket and another ticket
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Link Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="link-type">Link Type</Label>
            <Select
              value={selectedLinkType}
              onValueChange={(value) => setSelectedLinkType(value as TicketLinkType)}
            >
              <SelectTrigger id="link-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {linkTypeOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Ticket Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Tickets</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by ID, title, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Ticket List */}
          <div className="space-y-2">
            <Label>Select Ticket ({filteredTickets.length} available)</Label>
            <ScrollArea className="h-[300px] rounded-md border">
              <div className="p-4 space-y-2">
                {filteredTickets.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    {searchQuery ? 'No tickets found' : 'No tickets available'}
                  </div>
                ) : (
                  filteredTickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={`w-full text-left p-3 rounded-md border transition-colors ${
                        selectedTicketId === ticket.id
                          ? 'border-primary bg-accent'
                          : 'border-border hover:bg-accent'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-sm font-mono text-muted-foreground">
                              #{ticket.id}
                            </span>
                            <span className="text-sm font-medium truncate">
                              {ticket.title}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {ticket.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${statusColors[ticket.status]}`}
                          >
                            {ticket.status}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${priorityColors[ticket.priority]}`}
                          >
                            {ticket.priority}
                          </Badge>
                          {ticket.assignee && (
                            <span className="text-xs text-muted-foreground">
                              {ticket.assignee}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Selected Ticket Preview */}
          {selectedTicket && (
            <div className="rounded-md border p-3 bg-accent/50">
              <Label className="text-xs text-muted-foreground mb-2 block">
                Selected Ticket
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-muted-foreground">
                  #{selectedTicket.id}
                </span>
                <span className="text-sm font-medium">{selectedTicket.title}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateLink}
            disabled={!selectedTicketId || isCreating}
          >
            {isCreating ? 'Creating...' : 'Create Link'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
