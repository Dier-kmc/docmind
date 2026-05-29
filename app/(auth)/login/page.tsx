"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase" // 🎯 Import de votre client Supabase
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = getSupabaseBrowser()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  // Gestion des erreurs passées dans l'URL (par exemple via OAuth ou votre Proxy)
  useEffect(() => {
    const errorType = searchParams.get("error")
    if (errorType) {
      toast.error("Authentication failed", {
        description: "Something went wrong during authentication. Please try again.",
      })
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Missing fields", { description: "Please enter both email and password." })
      return
    }

    setLoading(true)
    const loginToast = toast.loading("Signing you in...")

    // ➔ Connexion directe avec Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    toast.dismiss(loginToast)

    if (error) {
      toast.error("Authentication failed", { 
        description: error.message 
      })
      setLoading(false)
      return
    }

    toast.success("Welcome back!", { description: "Redirecting to your dashboard." })
    
    // 🎯 Option ultra-fiable : On utilise window.location pour forcer un cycle complet 
    // et s'assurer que le proxy serveur lise proprement les cookies tout frais
    setTimeout(() => {
      window.location.href = "/dashboard"
    }, 500)
  
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    
    // ➔ Connexion OAuth directe avec Supabase
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Redirige vers la route d'échange de token que nous avons créée précédemment
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error("Google Auth failed", { description: error.message })
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">DocMind</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          
          <Button type="submit" className="w-full font-semibold" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-4 space-y-4">
          <Button
            variant="outline"
            className="w-full"
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
          >
            Continue with Google
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-primary font-medium hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md p-6 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading login page...</p>
        </Card>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}