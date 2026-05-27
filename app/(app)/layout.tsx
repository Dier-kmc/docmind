import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DocumentSidebar } from "@/components/sidebar/document-sidebar"
import { ModeToggle } from "@/components/theme-toggle" // 🎯 Import the toggle button

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const user = session.user
  if (!user) redirect("/login")

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <DocumentSidebar user={user} />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col min-w-0">
        
        {/* 🎯 Shared Header with Theme Toggle */}
        <header className="h-14 border-b border-border px-6 flex items-center justify-between bg-card/50 backdrop-blur-sm shrink-0">
          <div className="text-sm font-medium text-muted-foreground">
            Welcome back, {user.name || "User"}
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </header>

        {/* Dynamic Inner Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}