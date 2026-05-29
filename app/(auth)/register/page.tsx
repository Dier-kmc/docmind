"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

export default function RegisterPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowser() // Initialisation du client

  const [name, setName]         = useState("")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading]   = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email || !password) {
      toast.error("Champs requis", { description: "Veuillez remplir tous les champs du formulaire." })
      return
    }
    if (password.length < 6) {
      toast.error("Mot de passe trop court", { description: "Le mot de passe doit faire au moins 6 caractères." })
      return
    }

    setLoading(true)
    const registerToast = toast.loading("Création de votre compte...")

    // 1. Inscription native sur Supabase avec stockage du nom dans les métadonnées
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          name: name,
          full_name: name // On met les deux clés par sécurité pour tes composants
        },
      },
    })

    toast.dismiss(registerToast)

    if (signUpError) {
      toast.error("Erreur d'inscription", { description: signUpError.message })
      setLoading(false)
      return
    }

    // 2. Connexion automatique directe après l'inscription
    const authToast = toast.loading("Connexion automatique en cours...")

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    toast.dismiss(authToast)

    if (signInError) {
      // Si l'inscription a marché mais que la connexion automatique coince (ex: email de confirmation requis configuré sur Supabase)
      toast.warning("Compte créé avec succès", {
        description: "Veuillez vous connecter manuellement ou vérifier vos emails.",
      })
      setTimeout(() => router.push("/login"), 2000)
      return
    }

    // Succès total !
    toast.success("Bienvenue sur Docmind !", { description: "Votre compte a été configuré." })
    
    // Redirection et rechargement des cookies d'authentification pour le Proxy
    router.push("/dashboard")
    router.refresh()
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error("Erreur Google Auth", { description: error.message })
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
        <CardDescription>
          Commencez à interroger vos documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              type="text"
              placeholder="Didier Komaclo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="vous@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 6 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full font-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création du compte...
              </>
            ) : (
              "S'inscrire"
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
            Continuer avec Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <a href="/login" className="text-primary font-medium hover:underline">
              Se connecter
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}