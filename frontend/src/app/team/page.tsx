"use client"

import { useState, useEffect } from 'react'
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts'
import {
  Plus,
  Users,
  Star,
  Clock,
  CheckCircle,
  TrendingUp,
  Award,
  Target,
  Calendar,
  Mail,
  Phone,
  MapPin,
  User,
  Settings,
  Filter,
  Download,
  MoreHorizontal,
  Edit,
  Eye,
  UserPlus,
  Search,
  Activity,
  Zap,
  BookOpen,
  Code,
  Palette,
  Database,
  Shield,
  Briefcase
} from "lucide-react"

// Mock data for team members
const teamMembers = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice.johnson@company.com",
    phone: "+1 (555) 123-4567",
    role: "Senior Frontend Developer",
    department: "Engineering",
    manager: "Tech Lead",
    joinDate: "2023-01-15",
    location: "San Francisco, CA",
    status: "active",
    availability: 95,
    currentProjects: ["Project Alpha", "Project Beta"],
    completedTickets: 45,
    avgResolutionTime: 3.2,
    skillLevel: "senior",
    performanceScore: 92,
    skills: [
      { name: "React", level: 95, category: "frontend" },
      { name: "TypeScript", level: 90, category: "programming" },
      { name: "Node.js", level: 75, category: "backend" },
      { name: "UI/UX Design", level: 80, category: "design" },
      { name: "Testing", level: 85, category: "quality" }
    ]
  },
  {
    id: 2,
    name: "Bob Wilson",
    email: "bob.wilson@company.com",
    phone: "+1 (555) 234-5678",
    role: "Backend Developer",
    department: "Engineering",
    manager: "Alice Johnson",
    joinDate: "2023-03-20",
    location: "Austin, TX",
    status: "active",
    availability: 88,
    currentProjects: ["Project Alpha", "Project Gamma"],
    completedTickets: 38,
    avgResolutionTime: 4.1,
    skillLevel: "mid",
    performanceScore: 87,
    skills: [
      { name: "Python", level: 92, category: "programming" },
      { name: "PostgreSQL", level: 88, category: "database" },
      { name: "Docker", level: 85, category: "devops" },
      { name: "API Design", level: 90, category: "backend" },
      { name: "Testing", level: 75, category: "quality" }
    ]
  },
  {
    id: 3,
    name: "Charlie Brown",
    email: "charlie.brown@company.com",
    phone: "+1 (555) 345-6789",
    role: "DevOps Engineer",
    department: "Engineering",
    manager: "Tech Lead",
    joinDate: "2022-08-10",
    location: "Seattle, WA",
    status: "active",
    availability: 92,
    currentProjects: ["Project Beta", "Infrastructure"],
    completedTickets: 52,
    avgResolutionTime: 2.8,
    skillLevel: "senior",
    performanceScore: 94,
    skills: [
      { name: "Kubernetes", level: 95, category: "devops" },
      { name: "AWS", level: 92, category: "cloud" },
      { name: "Terraform", level: 88, category: "infrastructure" },
      { name: "Python", level: 80, category: "programming" },
      { name: "Monitoring", level: 90, category: "operations" }
    ]
  },
  {
    id: 4,
    name: "Diana Prince",
    email: "diana.prince@company.com",
    phone: "+1 (555) 456-7890",
    role: "UI/UX Designer",
    department: "Design",
    manager: "Design Lead",
    joinDate: "2023-06-01",
    location: "New York, NY",
    status: "active",
    availability: 90,
    currentProjects: ["Project Alpha", "Project Delta"],
    completedTickets: 28,
    avgResolutionTime: 5.2,
    skillLevel: "mid",
    performanceScore: 89,
    skills: [
      { name: "Figma", level: 95, category: "design" },
      { name: "Adobe Creative Suite", level: 88, category: "design" },
      { name: "User Research", level: 85, category: "research" },
      { name: "Prototyping", level: 90, category: "design" },
      { name: "HTML/CSS", level: 70, category: "frontend" }
    ]
  },
  {
    id: 5,
    name: "Eve Adams",
    email: "eve.adams@company.com",
    phone: "+1 (555) 567-8901",
    role: "QA Engineer",
    department: "Quality Assurance",
    manager: "QA Lead",
    joinDate: "2023-09-15",
    location: "Denver, CO",
    status: "active",
    availability: 85,
    currentProjects: ["Project Alpha", "Project Beta"],
    completedTickets: 35,
    avgResolutionTime: 3.8,
    skillLevel: "junior",
    performanceScore: 85,
    skills: [
      { name: "Test Automation", level: 80, category: "testing" },
      { name: "Selenium", level: 75, category: "testing" },
      { name: "API Testing", level: 85, category: "testing" },
      { name: "Bug Tracking", level: 90, category: "quality" },
      { name: "JavaScript", level: 65, category: "programming" }
    ]
  }
]

const skillCategories = [
  { name: "Frontend", icon: Code, color: "#3b82f6" },
  { name: "Backend", icon: Database, color: "#10b981" },
  { name: "DevOps", icon: Shield, color: "#f59e0b" },
  { name: "Design", icon: Palette, color: "#ec4899" },
  { name: "Quality", icon: CheckCircle, color: "#8b5cf6" },
  { name: "Management", icon: Briefcase, color: "#ef4444" }
]

const teamMetrics = {
  totalMembers: teamMembers.length,
  avgPerformance: Math.round(teamMembers.reduce((sum, member) => sum + member.performanceScore, 0) / teamMembers.length),
  avgAvailability: Math.round(teamMembers.reduce((sum, member) => sum + member.availability, 0) / teamMembers.length),
  totalProjects: [...new Set(teamMembers.flatMap(member => member.currentProjects))].length,
  skillDistribution: skillCategories.map(category => ({
    category: category.name,
    count: teamMembers.reduce((count, member) =>
      count + member.skills.filter(skill =>
        skill.category.toLowerCase().includes(category.name.toLowerCase())
      ).length, 0
    ),
    avgLevel: Math.round(
      teamMembers.reduce((sum, member) => {
        const categorySkills = member.skills.filter(skill =>
          skill.category.toLowerCase().includes(category.name.toLowerCase())
        )
        return sum + categorySkills.reduce((skillSum, skill) => skillSum + skill.level, 0)
      }, 0) / teamMembers.reduce((count, member) =>
        count + member.skills.filter(skill =>
          skill.category.toLowerCase().includes(category.name.toLowerCase())
        ).length, 0
      )
    )
  }))
}

const workloadData = teamMembers.map(member => ({
  name: member.name.split(' ')[0],
  availability: member.availability,
  workload: 100 - member.availability,
  projects: member.currentProjects.length,
  performance: member.performanceScore
}))

const performanceTrend = [
  { month: 'Jan', teamAvg: 85, alice: 88, bob: 82, charlie: 90, diana: 86, eve: 80 },
  { month: 'Feb', teamAvg: 87, alice: 90, bob: 85, charlie: 92, diana: 87, eve: 81 },
  { month: 'Mar', teamAvg: 89, alice: 91, bob: 86, charlie: 93, diana: 88, eve: 83 },
  { month: 'Apr', teamAvg: 88, alice: 89, bob: 87, charlie: 91, diana: 89, eve: 84 },
  { month: 'May', teamAvg: 90, alice: 92, bob: 87, charlie: 94, diana: 89, eve: 85 },
  { month: 'Jun', teamAvg: 89, alice: 92, bob: 87, charlie: 94, diana: 89, eve: 85 }
]

function TeamHeader() {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
        <p className="text-muted-foreground">
          Manage your team members, track skills, and monitor performance across projects.
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Add a new team member to your organization
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first-name">First Name</Label>
                  <Input id="first-name" placeholder="First name" />
                </div>
                <div>
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input id="last-name" placeholder="Last name" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="email@company.com" type="email" />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frontend">Frontend Developer</SelectItem>
                    <SelectItem value="backend">Backend Developer</SelectItem>
                    <SelectItem value="fullstack">Full Stack Developer</SelectItem>
                    <SelectItem value="designer">UI/UX Designer</SelectItem>
                    <SelectItem value="qa">QA Engineer</SelectItem>
                    <SelectItem value="devops">DevOps Engineer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancel</Button>
                <Button>Add Member</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

function TeamOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Team Members</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{teamMetrics.totalMembers}</div>
          <p className="text-xs text-muted-foreground">
            Across {teamMetrics.totalProjects} active projects
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{teamMetrics.avgPerformance}%</div>
          <p className="text-xs text-muted-foreground flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            +3% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Availability</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{teamMetrics.avgAvailability}%</div>
          <Progress value={teamMetrics.avgAvailability} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Skill Coverage</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {teamMetrics.skillDistribution.length}
          </div>
          <p className="text-xs text-muted-foreground">
            Skill categories covered
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function TeamDirectory() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {teamMembers.map((member) => (
        <Card key={member.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <h3 className="font-medium leading-none">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{member.location}</span>
                </div>
              </div>
              <Badge
                variant={member.skillLevel === 'senior' ? 'default' :
                        member.skillLevel === 'mid' ? 'secondary' : 'outline'}
              >
                {member.skillLevel}
              </Badge>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Performance</span>
                <span className="text-sm text-muted-foreground">{member.performanceScore}%</span>
              </div>
              <Progress value={member.performanceScore} className="h-2" />

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Availability</span>
                <span className="text-sm text-muted-foreground">{member.availability}%</span>
              </div>
              <Progress value={member.availability} className="h-2" />

              <div className="pt-2">
                <div className="text-sm font-medium mb-2">Current Projects</div>
                <div className="flex flex-wrap gap-1">
                  {member.currentProjects.map((project, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {project}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <div className="text-sm font-medium mb-2">Top Skills</div>
                <div className="flex flex-wrap gap-1">
                  {member.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill.name} {skill.level}%
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-1 pt-2">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function SkillMatrix() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Team Skills Matrix
        </CardTitle>
        <CardDescription>Comprehensive view of team skills and competencies</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {skillCategories.map((category) => {
            const IconComponent = category.icon
            const categorySkills = teamMembers.flatMap(member =>
              member.skills.filter(skill =>
                skill.category.toLowerCase().includes(category.name.toLowerCase())
              ).map(skill => ({
                ...skill,
                memberName: member.name
              }))
            )

            return (
              <div key={category.name} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <IconComponent className="h-5 w-5" style={{ color: category.color }} />
                  <h3 className="font-medium">{category.name}</h3>
                  <Badge variant="outline">
                    {categorySkills.length} skills
                  </Badge>
                </div>

                <div className="grid gap-2">
                  {[...new Set(categorySkills.map(skill => skill.name))].map(skillName => {
                    const skillInstances = categorySkills.filter(skill => skill.name === skillName)
                    const avgLevel = Math.round(skillInstances.reduce((sum, skill) => sum + skill.level, 0) / skillInstances.length)

                    return (
                      <div key={skillName} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">{skillName}</span>
                            <Badge variant="secondary" className="text-xs">
                              {skillInstances.length} member{skillInstances.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">Avg: {avgLevel}%</span>
                        </div>
                        <div className="grid gap-1">
                          {skillInstances.map((skill, index) => (
                            <div key={index} className="flex items-center space-x-2 text-xs">
                              <span className="w-20 truncate text-muted-foreground">
                                {skill.memberName.split(' ')[0]}
                              </span>
                              <div className="flex-1">
                                <Progress value={skill.level} className="h-1" />
                              </div>
                              <span className="w-10 text-right">{skill.level}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function WorkloadDistribution() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Workload Distribution
        </CardTitle>
        <CardDescription>Current team workload and availability</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            availability: { label: "Available", color: "#10b981" },
            workload: { label: "Workload", color: "#3b82f6" }
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workloadData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Bar dataKey="availability" fill="#10b981" name="Available" />
              <Bar dataKey="workload" fill="#3b82f6" name="Workload" />
              <ChartTooltip content={<ChartTooltipContent />} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="mt-6">
          <h4 className="font-medium mb-4">Individual Workload Details</h4>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {member.currentProjects.length} project{member.currentProjects.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">{member.availability}% available</div>
                    <div className="text-xs text-muted-foreground">
                      {member.completedTickets} tickets completed
                    </div>
                  </div>
                  <Badge
                    variant={member.availability > 90 ? "secondary" :
                            member.availability > 70 ? "outline" : "destructive"}
                  >
                    {member.availability > 90 ? "Available" :
                     member.availability > 70 ? "Busy" : "Overloaded"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PerformanceTracking() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Performance Trends
        </CardTitle>
        <CardDescription>Team and individual performance over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            teamAvg: { label: "Team Average", color: "#6b7280" },
            alice: { label: "Alice", color: "#3b82f6" },
            bob: { label: "Bob", color: "#10b981" },
            charlie: { label: "Charlie", color: "#f59e0b" },
            diana: { label: "Diana", color: "#ec4899" },
            eve: { label: "Eve", color: "#8b5cf6" }
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceTrend}>
              <XAxis dataKey="month" />
              <YAxis domain={[75, 100]} />
              <Line type="monotone" dataKey="teamAvg" stroke="#6b7280" strokeWidth={3} strokeDasharray="5 5" />
              <Line type="monotone" dataKey="alice" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="bob" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="charlie" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="diana" stroke="#ec4899" strokeWidth={2} />
              <Line type="monotone" dataKey="eve" stroke="#8b5cf6" strokeWidth={2} />
              <ChartTooltip content={<ChartTooltipContent />} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="mt-6">
          <h4 className="font-medium mb-4">Performance Insights</h4>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <div className="font-medium text-sm">Top Performers</div>
              {teamMembers
                .sort((a, b) => b.performanceScore - a.performanceScore)
                .slice(0, 3)
                .map((member, index) => (
                  <div key={member.id} className="flex items-center justify-between p-2 rounded bg-muted">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span className="text-sm">{member.name}</span>
                    </div>
                    <span className="text-sm font-medium">{member.performanceScore}%</span>
                  </div>
                ))
              }
            </div>

            <div className="space-y-2">
              <div className="font-medium text-sm">Improvement Areas</div>
              {teamMembers
                .filter(member => member.performanceScore < teamMetrics.avgPerformance)
                .map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 rounded bg-muted">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{member.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      -{Math.abs(member.performanceScore - teamMetrics.avgPerformance)}% gap
                    </span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TeamPage() {
  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <TeamHeader />

        <TeamOverview />

        <Tabs defaultValue="directory" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="directory">Directory</TabsTrigger>
            <TabsTrigger value="skills">Skills Matrix</TabsTrigger>
            <TabsTrigger value="workload">Workload</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="directory" className="space-y-4">
            <TeamDirectory />
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <SkillMatrix />
          </TabsContent>

          <TabsContent value="workload" className="space-y-4">
            <WorkloadDistribution />
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <PerformanceTracking />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}