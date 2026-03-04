"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  GitBranch,
  Copy,
  Link as LinkIcon,
  Ban,
  AlertCircle,
  Plus,
  X,
  ExternalLink,
} from "lucide-react"
import { toast } from "sonner"
import { TicketLink, TicketLinkType, Ticket } from "@/types"
import {
  getGroupedTicketLinks,
  deleteTicketLink,
  getTicketById,
  getLinkTypeColor,
} from "@/lib/ticket-links"

interface LinkedTicketsCardProps {
  ticketId: number
  onOpenLinkModal?: () => void
  onLinksChanged?: () => void
}

const linkTypeIcons: Record<TicketLinkType, any> = {
  'Parent/Child': GitBranch,
  'Duplicates': Copy,
  'Relates To': LinkIcon,
  'Blocks': Ban,
  'Blocked By': AlertCircle,
}

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

export function LinkedTicketsCard({ ticketId, onOpenLinkModal, onLinksChanged }: LinkedTicketsCardProps) {
  const [groupedLinks, setGroupedLinks] = useState<Record<TicketLinkType, TicketLink[]>>({
    'Parent/Child': [],
    'Duplicates': [],
    'Relates To': [],
    'Blocks': [],
    'Blocked By': [],
  })
  const [linkedTicketsData, setLinkedTicketsData] = useState<Record<number, Ticket | null>>({})

  // Load linked tickets
  useEffect(() => {
    loadLinks()
  }, [ticketId])

  const loadLinks = () => {
    const links = getGroupedTicketLinks(ticketId)
    setGroupedLinks(links)

    // Load ticket data for all linked tickets
    const ticketDataMap: Record<number, Ticket | null> = {}
    Object.values(links).flat().forEach((link) => {
      const linkedTicket = getTicketById(link.target_ticket_id)
      ticketDataMap[link.target_ticket_id] = linkedTicket
    })
    setLinkedTicketsData(ticketDataMap)
  }

  const handleRemoveLink = async (linkId: number, linkType: TicketLinkType) => {
    const result = deleteTicketLink(linkId)

    if (result.success) {
      toast.success('Link removed successfully')
      loadLinks()
      onLinksChanged?.()
    } else {
      toast.error(result.message)
    }
  }

  const totalLinks = Object.values(groupedLinks).flat().length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Linked Tickets</CardTitle>
            <CardDescription className="text-xs">
              Related and dependent tickets
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onOpenLinkModal}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {totalLinks === 0 ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No linked tickets
          </div>
        ) : (
          <div className="space-y-4">
            {(Object.entries(groupedLinks) as [TicketLinkType, TicketLink[]][]).map(
              ([linkType, links]) => {
                if (links.length === 0) return null

                const Icon = linkTypeIcons[linkType]
                const colorClass = getLinkTypeColor(linkType)

                return (
                  <div key={linkType} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${colorClass}`} />
                      <span className={`text-sm font-medium ${colorClass}`}>
                        {linkType} ({links.length})
                      </span>
                    </div>
                    <div className="space-y-2 ml-6">
                      {links.map((link) => {
                        const linkedTicket = linkedTicketsData[link.target_ticket_id]

                        if (!linkedTicket) {
                          return (
                            <div
                              key={link.id}
                              className="text-sm text-muted-foreground italic"
                            >
                              Ticket #{link.target_ticket_id} (not found)
                            </div>
                          )
                        }

                        return (
                          <div
                            key={link.id}
                            className="group flex items-start gap-2 rounded-md border p-2 hover:bg-accent transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/tickets/${linkedTicket.id}`}
                                className="flex items-center gap-2 text-sm font-medium hover:underline"
                              >
                                <span className="text-muted-foreground">
                                  #{linkedTicket.id}
                                </span>
                                <span className="truncate">{linkedTicket.title}</span>
                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                              </Link>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${statusColors[linkedTicket.status]}`}
                                >
                                  {linkedTicket.status}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${priorityColors[linkedTicket.priority]}`}
                                >
                                  {linkedTicket.priority}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveLink(link.id, linkType)}
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              }
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
