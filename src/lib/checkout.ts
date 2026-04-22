export type CheckoutRole = 'subscriber' | 'professional'

export type PendingCheckout = {
  planId: string
  planName: string
  planPrice: number
  role: CheckoutRole
}

const CHECKOUT_STORAGE_KEY = 'pendingCheckout'

export function savePendingCheckout(checkout: PendingCheckout) {
  sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(checkout))
}

export function getPendingCheckout(): PendingCheckout | null {
  const raw = sessionStorage.getItem(CHECKOUT_STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as PendingCheckout
  } catch {
    sessionStorage.removeItem(CHECKOUT_STORAGE_KEY)
    return null
  }
}

export function clearPendingCheckout() {
  sessionStorage.removeItem(CHECKOUT_STORAGE_KEY)
}
