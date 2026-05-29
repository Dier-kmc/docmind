import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

// 1. Client Admin pour le Server (API Routes / Server Actions)
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

// 2. Client SSR basé sur les cookies
export const getSupabaseServer = async () => {
  if (typeof window !== "undefined") {
    throw new Error("getSupabaseServer ne peut pas être utilisé côté client")
  }

  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Géré par le middleware si appelé depuis un Server Component
          }
        },
      },
    }
  )
}