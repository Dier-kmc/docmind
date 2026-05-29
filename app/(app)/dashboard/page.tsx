import { getSupabaseServer } from "@/lib/supabase-server" // 🎯 Ton nouveau client serveur
import { redirect } from "next/navigation"
import { UploadZone } from "@/components/upload/upload-zone"
import { FinOpsAnalytics } from "@/components/dashboard/finops-analytics"

export default async function DashboardPage() {
  // 1. Initialiser le client Supabase côté serveur
  const supabase = await getSupabaseServer()

  // 2. Récupérer l'utilisateur de manière sécurisée
  const { data: { user } } = await supabase.auth.getUser()

  // 3. Si aucun utilisateur n'est connecté, redirection vers le login
  if (!user) {
    redirect("/login")
  }

  // 4. Extraire le prénom depuis les métadonnées de l'utilisateur (ou son profil)
  // Supabase stocke généralement le nom complet dans user_metadata lors des connexions OAuth (Google)
  const fullName = user.user_metadata?.full_name || user.email || ""
  const firstName = fullName.includes(" ") ? fullName.split(" ")[0] : fullName

  return (
    <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background/50">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        
        {/* Modern Minimal Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {firstName ? `Welcome back, ${firstName}` : "Welcome to DocMind"}
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Upload a document to train your custom context agent and start asking questions.
          </p>
        </div>

        <FinOpsAnalytics />

        {/* Action Container Card */}
        <div className="bg-card text-card-foreground rounded-3xl border border-border/60 shadow-xl shadow-foreground/[0.02] p-2">
          <UploadZone />
        </div>

      </div>
    </div>
  )
}