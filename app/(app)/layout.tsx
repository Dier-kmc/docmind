import { redirect } from "next/navigation"
import { getSupabaseServer } from "@/lib/supabase-server" // 🎯 Import du client serveur Supabase
import { DocumentSidebar } from "@/components/sidebar/document-sidebar"
import { ModeToggle } from "@/components/theme-toggle"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 1. Initialisation du client Supabase et récupération de la session
  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Si aucun utilisateur n'est connecté, redirection immédiate
  if (!user) {
    redirect("/login")
  }

  // 3. Transformation légère pour la compatibilité avec vos composants existants
  // Supabase stocke le nom de l'utilisateur dans user_metadata
  const displayUser = {
    ...user,
    name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0]
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar - On passe l'utilisateur Supabase adapté */}
      <DocumentSidebar user={displayUser} />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col min-w-0">
        
        {/* Shared Header with Theme Toggle */}
        <header className="h-14 border-b border-border px-6 flex items-center justify-between bg-card/50 backdrop-blur-sm shrink-0">
          <div className="text-sm font-medium text-muted-foreground">
            Welcome back, {displayUser.name || "User"}
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