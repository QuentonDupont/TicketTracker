"use client"

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Ticket, Epic, ProjectSpace, TeamMember } from "@/types"
import { getTeamMembers } from "@/lib/team-storage"
import { Search, Ticket as TicketIcon, Target, FolderKanban, Users } from "lucide-react"

interface SearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SearchResult {
  type: 'ticket' | 'epic' | 'project' | 'team'
  id: number
  title: string
  subtitle: string
  href: string
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
    }
  }, [open])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const q = query.toLowerCase()
    const found: SearchResult[] = []

    // Search tickets
    try {
      const tickets: Ticket[] = JSON.parse(localStorage.getItem('tickets') || '[]')
      tickets.forEach(t => {
        if (t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags?.some(tag => tag.toLowerCase().includes(q))) {
          found.push({ type: 'ticket', id: t.id, title: t.title, subtitle: `${t.status} · ${t.priority}`, href: `/tickets/${t.id}` })
        }
      })
    } catch {}

    // Search epics
    try {
      const epics: Epic[] = JSON.parse(localStorage.getItem('epics') || '[]')
      epics.forEach(e => {
        if (e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)) {
          found.push({ type: 'epic', id: e.id, title: e.title, subtitle: e.status, href: `/epics/${e.id}` })
        }
      })
    } catch {}

    // Search projects
    try {
      const projects: ProjectSpace[] = JSON.parse(localStorage.getItem('project_spaces') || '[]')
      projects.forEach(p => {
        if (p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)) {
          found.push({ type: 'project', id: p.id, title: p.name, subtitle: p.description || 'Project space', href: `/projects/${p.id}` })
        }
      })
    } catch {}

    // Search team members
    try {
      const members = getTeamMembers()
      members.forEach(m => {
        if (m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.role.toLowerCase().includes(q)) {
          found.push({ type: 'team', id: m.id, title: m.name, subtitle: `${m.role} · ${m.department}`, href: `/team/${m.id}` })
        }
      })
    } catch {}

    setResults(found.slice(0, 20))
  }, [query])

  const iconForType = (type: string) => {
    switch (type) {
      case 'ticket': return <TicketIcon className="h-4 w-4" />
      case 'epic': return <Target className="h-4 w-4" />
      case 'project': return <FolderKanban className="h-4 w-4" />
      case 'team': return <Users className="h-4 w-4" />
      default: return null
    }
  }

  const handleSelect = (result: SearchResult) => {
    onOpenChange(false)
    router.push(result.href)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 gap-0">
        <div className="flex items-center border-b px-4">
          <Search className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
          <Input
            placeholder="Search tickets, epics, projects, team..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 h-12"
            autoFocus
          />
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {query.trim() && results.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No results found for &quot;{query}&quot;
            </div>
          )}
          {results.length > 0 && (
            <div className="py-2">
              {['ticket', 'epic', 'project', 'team'].map(type => {
                const typeResults = results.filter(r => r.type === type)
                if (typeResults.length === 0) return null
                return (
                  <div key={type}>
                    <div className="px-4 py-1.5 text-xs font-medium text-muted-foreground uppercase">
                      {type === 'team' ? 'Team Members' : `${type}s`}
                    </div>
                    {typeResults.map(result => (
                      <button
                        key={`${result.type}-${result.id}`}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                        onClick={() => handleSelect(result)}
                      >
                        <span className="text-muted-foreground">{iconForType(result.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{result.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          )}
          {!query.trim() && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Start typing to search...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
