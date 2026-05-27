"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { supabase } from "@/lib/supabase"
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

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    if (signUpError) {
      toast.error("Erreur d'inscription", { description: signUpError.message })
      setLoading(false)
      return
    }

    // Lance un toast de chargement pendant que NextAuth valide la session
    const authToast = toast.loading("Connexion automatique en cours...")

    // 2. Connexion via NextAuth (Credentials Provider)
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      toast.dismiss(authToast)
      toast.warning("Compte créé avec succès", {
        description: "La connexion automatique a échoué. Redirection vers la page de connexion...",
      })
      setTimeout(() => router.push("/login"), 2000)
      return
    }

    toast.success(authToast, { description: "Bienvenue sur Docmind !" })
    router.push("/dashboard")
    router.refresh()
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
        {/* 💡 On englobe le tout dans un vrai composant HTML <form> pour gérer le raccourci "Entrée" proprement */}
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
            />
          </div>

          <Button
            type="submit" // 💡 Déclenche le handleRegister automatiquement
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
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
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