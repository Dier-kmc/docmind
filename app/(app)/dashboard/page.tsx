import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UploadZone } from "@/components/upload/upload-zone"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const firstName = session?.user?.name ? session.user.name.split(" ")[0] : ""

  return (
    <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background/50">
      <div className="w-full max-w-xl mx-auto space-y-8">
        
        {/* Modern Minimal Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {firstName ? `Welcome back, ${firstName}` : "Welcome to DocMind"}
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Upload a document to train your custom context agent and start asking questions.
          </p>
        </div>

        {/* Action Container Card */}
        <div className="bg-card text-card-foreground rounded-3xl border border-border/60 shadow-xl shadow-foreground/[0.02] p-2">
          <UploadZone />
        </div>

      </div>
    </div>
  )
}