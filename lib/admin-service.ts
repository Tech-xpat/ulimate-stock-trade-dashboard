// lightweight client API helpers (avoid client-only imports at module scope)

export interface AdminWalletSettings {
  btcAddress: string
  btcTag: string
  usdtAddress: string
  usdtTag: string
  bankAccountNumber: string
  bankName: string
  bankAccountName: string
  lastUpdated: string
  updatedBy: string
}

async function getIdTokenFromClient() {
  try {
    // dynamic import only when needed (avoids SSR/runtime import problems)
    const mod = await import("./firebase-client")
    if (mod && typeof mod.getClientAuth === "function") {
      const auth = mod.getClientAuth()
      const user = auth && auth.currentUser
      if (user && typeof user.getIdToken === "function") {
        return await user.getIdToken()
      }
    }
  } catch (err) {
    // ignore: token not available on server or firebase not configured
  }
  return null
}

async function authFetch(input, method = "GET", body, idToken) {
  let token = idToken ?? null
  if (!token) {
    token = await getIdTokenFromClient()
  }

  const headers = {}
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

export async function updateAdminWalletSettings(settings: Partial<AdminWalletSettings>, options) {
  try {
    const res = await authFetch("/api/admin/wallet-settings", "PUT", settings, options && options.idToken)
    return await res.json()
  } catch (err) {
    console.error("updateAdminWalletSettings error:", err)
    return { success: false, error: "Network error" }
  }
}

export async function createDepositRequest(userId, username, amount, currency, screenshotBase64, options) {
  try {
    const payload = { userId, username, amount, currency, screenshot: screenshotBase64 }
    const res = await authFetch("/api/deposits", "POST", payload, options && options.idToken)
    return await res.json()
  } catch (err) {
    console.error("createDepositRequest error:", err)
    return { success: false, message: "Network error" }
  }
}

export async function createWithdrawalRequest(
  userId,
  username,
  amount,
  currencyOrMethod,
  walletAddress,
  bankDetails,
  options
) {
  try {
    const payload = {
      userId,
      username,
      amount,
      payoutMethod: currencyOrMethod,
      walletAddress: walletAddress || undefined,
      bankDetails: bankDetails || undefined,
      autoApprove: options && options.autoApprove === true,
    }
    const res = await authFetch("/api/withdrawals", "POST", payload, options && options.idToken)
    return await res.json()
  } catch (err) {
    console.error("createWithdrawalRequest error:", err)
    return { success: false, message: "Network error" }
  }
}
// im done with this 
