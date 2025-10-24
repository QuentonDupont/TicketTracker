import { AppSidebar } from "@/components/app-sidebar"
import { ProjectDashboard } from "@/components/project-dashboard"
import { SiteHeader } from "@/components/site-header"
import { ProtectedRoute } from "@/lib/auth"
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"
import { Grid } from "@/components/ui/grid"
import { Spotlight } from "@/components/ui/spotlight"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function Home() {
  return (
    <ProtectedRoute>
      <BackgroundGradientAnimation>
        <div className="relative">
          <Spotlight className="top-0 left-0 md:left-60 md:top-0" fill="white" />
          <Grid className="opacity-30" />
          
          <SidebarProvider
            style={
              {
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
              } as React.CSSProperties
            }
          >
            <AppSidebar variant="inset" />
            <SidebarInset>
              <SiteHeader />
              <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                  <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <ProjectDashboard />
                  </div>
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </BackgroundGradientAnimation>
    </ProtectedRoute>
  )
}
