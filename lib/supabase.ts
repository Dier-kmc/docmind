import { createClient, SupabaseClient } from "@supabase/supabase-js"

let clientInstance: SupabaseClient | null = null

export const getSupabaseBrowser = () => {
  if (typeof window === "undefined") {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"
    )
  }

  if (!clientInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey) {
      console.warn("⚠️ [SUPABASE] Missing browser environment variables.")
      return createClient("https://placeholder.supabase.co", "placeholder")
    }

    clientInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // 🎯 FORCE SUPABASE À CRÉER LES COOKIES DU NAVIGATEUR EN DIRECT
        storage: {
          getItem: (key) => {
            if (typeof document === "undefined") return null
            const cookie = document.cookie
              .split("; ")
              .find((row) => row.startsWith(`${key}=`))
            return cookie ? decodeURIComponent(cookie.split("=")[1]) : null
          },
          setItem: (key, value) => {
            if (typeof document === "undefined") return
            // Cookie valide pendant 1 an
            document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax; Secure`
          },
          removeItem: (key) => {
            if (typeof document === "undefined") return
            document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
          }
        }
      }
    })
  }

  return clientInstance
}

export const supabase = typeof window !== "undefined" 
  ? getSupabaseBrowser() 
  : createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"
    )