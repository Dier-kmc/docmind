import { createClient } from "@supabase/supabase-js"

// 1. Client pour le Browser / Client Components (Sécurisé pour le Build)
export const getSupabaseBrowser = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    // Pendant le build Vercel, on retourne un client factice ou null pour éviter le crash global
    // Si on est côté client en runtime, cela lèvera une alerte propre
    console.warn("⚠️ [SUPABASE] Missing browser environment variables during execution.")
    return createClient(url || "https://placeholder.supabase.co", anonKey || "placeholder")
  }

  return createClient(url, anonKey)
}

// Pour des raisons de compatibilité avec ton code existant qui importerait `supabase` directement :
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"
)

// 2. Client Admin pour le Server (API Routes / Server Actions)
export const supabaseAdmin = () => {
  if (typeof window !== "undefined") {
    throw new Error("supabaseAdmin ne peut pas être utilisé côté client")
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    console.warn("⚠️ [SUPABASE ADMIN] Missing service role keys during build/runtime.")
    return createClient(url || "https://placeholder.supabase.co", serviceKey || "placeholder")
  }

  return createClient(url, serviceKey)
}