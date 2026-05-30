interface RateLimitRecord {
  tokens: number
  lastRefill: number
}

// Map en mémoire stockant l'état par utilisateur
const storage = new Map<string, RateLimitRecord>()

const MAX_TOKENS = 10 // Nombre maximum de requêtes en stock (Capacité du réservoir)
const REFILL_RATE_MS = 60 * 1000 // Temps de recharge pour 1 token (ici, 1 requête par minute)

export function isRateLimited(userId: string): boolean {
  const now = Date.now()
  let record = storage.get(userId)

  if (!record) {
    // Premier accès : réservoir plein
    record = { tokens: MAX_TOKENS, lastRefill: now }
    storage.set(userId, record)
    return false
  }

  // Calcul du nombre de tokens rechargés depuis la dernière vérification
  const msPassed = now - record.lastRefill
  const tokensToAdd = Math.floor(msPassed / REFILL_RATE_MS)

  if (tokensToAdd > 0) {
    record.tokens = Math.min(MAX_TOKENS, record.tokens + tokensToAdd)
    record.lastRefill = now
  }

  // Vérification si le réservoir est vide
  if (record.tokens <= 0) {
    return true // L'utilisateur est limité (Bloqué !)
  }

  // Consommation d'un token (1 requête valide)
  record.tokens -= 1
  storage.set(userId, record)
  return false
}