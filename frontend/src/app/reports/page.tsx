"use client"

import { useState, useEffect, useMemo } from 'react'
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Ticket, TeamMember, ProjectSpace } from "@/types"
import { getTeamMembers } from "@/lib/team-storage"
import { exportToCSV } from "@/lib/export-utils"
import { toast } from "sonner"
import { FileText, Download, Users, FolderKanban, Ticket as TicketIcon } from "lucide-react"

export default function ReportsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [projects, setProjects] = useState<ProjectSpace[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    setTickets(JSON.parse(localStorage.getItem('tickets') || '[]'))
    setMembers(getTeamMembers())
    setProjects(JSON.parse(localStorage.getItem('project_spaces') || '[]'))

    // Default date range: last 30 days
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
  }, [])

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const created = new Date(t.created_date)
      if (startDate && created < new Date(startDate)) return false
      if (endDate && created > new Date(endDate + 'T23:59:59')) return false
      return true
    })
  }, [tickets, startDate, endDate])

  const completedTickets = filteredTickets.filter(t => t.status === 'Live')
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredTickets.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [filteredTickets])

  const teamReport = useMemo(() => {
    return members.map(m => ({
      name: m.name,
      role: m.role,
      completedTickets: m.completedTickets,
      avgResolution: m.avgResolutionTime,
      performance: m.performanceScore,
    }))
  }, [members])

  const projectReport = useMemo(() => {
    return projects.map(p => {
      const pTickets = filteredTickets.filter(t => t.project_space_id === p.id)
      const completed = pTickets.filter(t => t.status === 'Live').length
      return {
        name: p.name,
        total: pTickets.length,
        completed,
        completionRate: pTickets.length > 0 ? Math.round((completed / pTickets.length) * 100) : 0,
        color: p.color,
      }
    })
  }, [projects, filteredTickets])

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate and export reports from your project data
          </p>
        </div>

        {/* Date Range Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-end gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
              <Badge variant="outline" className="mb-2">
                {filteredTickets.length} tickets in range
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="tickets">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <TicketIcon className="h-4 w-4" />
              Ticket Completion
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Performance
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4" />
              Project Status
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Ticket Completion Report</CardTitle>
                  <CardDescription>{completedTickets.length} tickets completed in selected period</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  exportToCSV(completedTickets.map(t => ({
                    id: t.id, title: t.title, status: t.status, priority: t.priority,
                    assignee: t.assignee || 'Unassigned', created: t.created_date, due: t.due_date
                  })), 'ticket-completion-report')
                  toast.success('Report exported')
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                {statusCounts.length > 0 ? (
                  <ChartContainer config={{ value: { label: "Tickets", color: "#3b82f6" } }} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusCounts}>
                        <XAxis dataKey="name" angle={-20} textAnchor="end" height={60} />
                        <YAxis />
                        <Bar dataKey="value" fill="#3b82f6" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                    No tickets in selected date range
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Team Performance Report</CardTitle>
                  <CardDescription>{members.length} team members</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  exportToCSV(teamReport, 'team-performance-report')
                  toast.success('Report exported')
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                {teamReport.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-medium">Name</th>
                          <th className="text-left py-2 font-medium">Role</th>
                          <th className="text-right py-2 font-medium">Completed</th>
                          <th className="text-right py-2 font-medium">Avg Resolution (hrs)</th>
                          <th className="text-right py-2 font-medium">Performance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamReport.map((m, i) => (
                          <tr key={i} className="border-b">
                            <td className="py-2">{m.name}</td>
                            <td className="py-2 text-muted-foreground">{m.role}</td>
                            <td className="py-2 text-right">{m.completedTickets}</td>
                            <td className="py-2 text-right">{m.avgResolution}</td>
                            <td className="py-2 text-right">
                              <Badge variant={m.performance >= 80 ? "default" : "secondary"}>
                                {m.performance}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    No team members found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Project Status Report</CardTitle>
                  <CardDescription>{projects.length} project spaces</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  exportToCSV(projectReport, 'project-status-report')
                  toast.success('Report exported')
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                {projectReport.length > 0 ? (
                  <div className="space-y-4">
                    {projectReport.map((p, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: p.color }} />
                            <span className="font-medium">{p.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={p.completionRate > 80 ? "default" : p.completionRate > 50 ? "secondary" : "destructive"}>
                              {p.completionRate}%
                            </Badge>
                            <span className="text-sm text-muted-foreground">{p.completed}/{p.total} tickets</span>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-primary rounded-full h-2" style={{ width: `${p.completionRate}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    No projects found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
