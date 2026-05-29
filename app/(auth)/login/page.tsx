"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Missing fields", { description: "Please enter both email and password." })
      return
    }

    setLoading(true)
    const loginToast = toast.loading("Signing you in...")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirectTo: "/dashboard",
        redirect: true, // On laisse NextAuth gérer la redirection
      })

      // Note: Avec redirect: true, ce code ne sera normalement jamais atteint en cas de succès
      toast.dismiss(loginToast)
    } catch (error: any) {
      toast.dismiss(loginToast)
      setLoading(false)

      // IMPORTANT: Si l'erreur contient "NEXT_REDIRECT", c'est que la connexion a RÉUSSI
      // et que Next.js essaie de rediriger. On ne doit PAS afficher d'erreur.
      if (error?.message === "NEXT_REDIRECT") {
        throw error; // Laisse Next.js gérer la redirection
      }

      toast.error("Authentication failed", { 
        description: "Invalid email or password. Please try again." 
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
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
              onClick={() => signIn("google", { redirectTo: "/dashboard" })}
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
    </div>
  )
}