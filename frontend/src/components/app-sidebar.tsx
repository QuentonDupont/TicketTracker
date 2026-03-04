"use client"

import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconMessage,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconTarget,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavProjectsCollapsible } from "@/components/nav-projects-collapsible"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { SearchModal } from "@/components/search-modal"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Tickets",
      url: "/tickets",
      icon: IconListDetails,
    },
    {
      title: "Epics",
      url: "/epics",
      icon: IconTarget,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: IconChartBar,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: IconFolder,
    },
    {
      title: "Team",
      url: "/team",
      icon: IconUsers,
    },
    {
      title: "Messages",
      url: "/messages",
      icon: IconMessage,
    },
  ],
  navClouds: [
    {
      title: "Active Tickets",
      icon: IconFileDescription,
      isActive: true,
      url: "#",
      items: [
        {
          title: "To Do",
          url: "#",
        },
        {
          title: "In Progress",
          url: "#",
        },
        {
          title: "Done",
          url: "#",
        },
      ],
    },
    {
      title: "Projects",
      icon: IconFolder,
      url: "#",
      items: [
        {
          title: "Active Projects",
          url: "#",
        },
        {
          title: "Completed",
          url: "#",
        },
        {
          title: "On Hold",
          url: "#",
        },
      ],
    },
    {
      title: "Team Management",
      icon: IconUsers,
      url: "#",
      items: [
        {
          title: "Team Members",
          url: "#",
        },
        {
          title: "Skills Matrix",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Data Export",
      url: "/data-export",
      icon: IconDatabase,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: IconReport,
    },
    {
      title: "Documentation",
      url: "/docs",
      icon: IconFileWord,
    },
    {
      title: "Get Help",
      url: "/help",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const [searchOpen, setSearchOpen] = React.useState(false)

  // Global Cmd+K shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSecondaryClick = (title: string) => {
    if (title === 'Search') {
      setSearchOpen(true)
    }
  }

  const userData = {
    name: user?.name || "User",
    email: user?.email || "",
    avatar: user?.avatar || "",
  }

  return (
    <>
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!p-1.5"
              >
                <a href="#">
                  <IconInnerShadowTop className="!size-5" />
                  <span className="text-base font-semibold">TicketTracker</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain.filter(item => item.title !== 'Projects')} />
          <NavProjectsCollapsible />
          <NavDocuments />
          <NavSecondary items={data.navSecondary} onItemClick={handleSecondaryClick} className="mt-auto" />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={userData} />
        </SidebarFooter>
      </Sidebar>
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
