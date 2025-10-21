import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore"
import { db } from "./firebase"

// admin client helpers — attaches Firebase ID token when available

export type AdminWalletSettings = {
  btcAddress?: string | null
  btcTag?: string | null
  usdtAddress?: string | null
  usdtTag?: string | null
  lastUpdated?: string | null
  updatedBy?: string | null
}

/**
 * Internal helper that attaches Authorization header when an ID token is available.
 * If idToken is not provided it will attempt to read one from Firebase Auth (dynamic import).
 */
async function authFetch(
  input: RequestInfo,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: any,
  idToken?: string | null,
): Promise<Response> {
  let token = idToken ?? null

  if (!token) {
    try {
      // dynamic import so firebase is optional for builds that don't include it
      const { getAuth } = await import("firebase/auth")
      const auth = getAuth()
      const user = auth.currentUser
      if (user) token = await user.getIdToken()
    } catch (err) {
      // no firebase available or user not signed in — proceed without token
      // console.debug("authFetch: no firebase token available", err)
    }
  }

  const headers: Record<string, string> = {}
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(input, {
    method,
    headers,
    body: body && !(body instanceof FormData) ? JSON.stringify(body) : body,
    credentials: "same-origin",
  })

  return res
}

export async function getAdminWalletSettings(options?: { idToken?: string | null }): Promise<AdminWalletSettings | null> {
  try {
    const res = await authFetch("/api/admin/wallet-settings", "GET", undefined, options?.idToken ?? null)
    if (!res.ok) {
      return null
    }
    const data = await res.json()
    return data as AdminWalletSettings
  } catch (err) {
    console.error("getAdminWalletSettings error:", err)
    return null
  }
}

export async function createDepositRequest(
  userId: string,
  username: string,
  amount: number,
  currency: "BTC" | "USDT",
  screenshotBase64: string,
  options?: { idToken?: string | null },
): Promise<{ success: boolean; message?: string }> {
  try {
    const payload = { userId, username, amount, currency, screenshot: screenshotBase64 }
    const res = await authFetch("/api/deposits", "POST", payload, options?.idToken ?? null)
    const data = await res.json()
    return data as { success: boolean; message?: string }
  } catch (err) {
    console.error("createDepositRequest error:", err)
    return { success: false, message: "Network error" }
  }
}

export async function createWithdrawalRequest(
  userId: string,
  username: string,
  amount: number,
  currencyOrMethod: string,
  walletAddress?: string,
  bankDetails?: Record<string, any> | undefined,
  options?: { idToken?: string | null },
): Promise<{ success: boolean; message?: string }> {
  try {
    const payload = {
      userId,
      username,
      amount,
      payoutMethod: currencyOrMethod,
      walletAddress: walletAddress || undefined,
      bankDetails: bankDetails || undefined,
    }
    const res = await authFetch("/api/withdrawals", "POST", payload, options?.idToken ?? null)
    const data = await res.json()
    return data as { success: boolean; message?: string }
  } catch (err) {
    console.error("createWithdrawalRequest error:", err)
    return { success: false, message: "Network error" }
  }
}
