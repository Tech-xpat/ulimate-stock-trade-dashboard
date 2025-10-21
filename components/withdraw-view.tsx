// ...existing code...
"use client"

import React, { useEffect, useState } from "react"
import { Bitcoin, Wallet, AlertCircle, Check, X } from "lucide-react"
import { createWithdrawalRequest } from "@/lib/admin-service"
import { getClientAuth } from "@/lib/firebase-client"

interface WithdrawViewProps {
  userId: string
  username: string
  availableBalance: number
}

export function WithdrawView({ userId, username, availableBalance }: WithdrawViewProps) {
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState<"CRYPTO" | "BANK">("CRYPTO")
  const [selectedCrypto, setSelectedCrypto] = useState<"BTC" | "USDT">("BTC")

  // crypto wallet
  const [walletAddress, setWalletAddress] = useState("")

  // bank fields
  const [bankCountry, setBankCountry] = useState<"US" | "UK" | "EU" | "OTHER">("US")
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [routingNumber, setRoutingNumber] = useState("") // US ABA
  const [sortCode, setSortCode] = useState("") // UK
  const [iban, setIban] = useState("") // IBAN for EU/other
  const [swiftBic, setSwiftBic] = useState("") // SWIFT/BIC optional

  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // local balance state so UI updates immediately after approval
  const [localBalance, setLocalBalance] = useState<number>(Number(availableBalance || 0))

  // success popup
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [approvedAmount, setApprovedAmount] = useState<number | null>(null)

  useEffect(() => {
    setLocalBalance(Number(availableBalance || 0))
  }, [availableBalance])

  const MIN_WITHDRAWAL = 100
  const quickPercentages = [25, 50, 75, 100]

  const handlePercentage = (percentage: number) => {
    const withdrawAmount = ((localBalance * percentage) / 100).toFixed(2)
    setAmount(withdrawAmount)
  }

  const validateBankFields = () => {
    if (!bankName || !accountNumber) return "Please provide bank name and account number."
    if (bankCountry === "US" && !routingNumber) return "Please provide routing (ABA) number for US banks."
    if (bankCountry === "UK" && !sortCode) return "Please provide sort code for UK banks."
    if ((bankCountry === "EU" || bankCountry === "OTHER") && !iban) return "Please provide IBAN for international/EU banks."
    return ""
  }

  const handleWithdraw = async () => {
    setErrorMessage("")
    const parsedAmount = Number.parseFloat(amount || "0")

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Please enter a valid amount.")
      return
    }
    if (parsedAmount < MIN_WITHDRAWAL) {
      setErrorMessage(`Minimum withdrawal is $${MIN_WITHDRAWAL}.`)
      return
    }
    if (parsedAmount > localBalance) {
      setErrorMessage("Withdrawal amount exceeds available balance.")
      return
    }

    if (method === "CRYPTO") {
      if (!walletAddress) {
        setErrorMessage("Please add a wallet address.")
        return
      }
    } else {
      const bankErr = validateBankFields()
      if (bankErr) {
        setErrorMessage(bankErr)
        return
      }
    }

    setIsLoading(true)

    // attempt to get idToken from firebase client
    let idToken: string | null = null
    try {
      const auth = getClientAuth()
      const user = auth.currentUser
      if (!user) {
        setErrorMessage("Authentication required. Please sign in.")
        setIsLoading(false)
        return
      }
      if (user.uid !== userId) {
        setErrorMessage("Authenticated user mismatch.")
        setIsLoading(false)
        return
      }
      idToken = await user.getIdToken()
    } catch (err) {
      console.warn("Could not obtain idToken:", err)
      // continue — server should validate, but we proceed to send request without token as fallback
    }

    const bankDetails =
      method === "BANK"
        ? {
            bankCountry,
            bankName,
            accountNumber,
            routingNumber: routingNumber || undefined,
            sortCode: sortCode || undefined,
            iban: iban || undefined,
            swiftBic: swiftBic || undefined,
          }
        : undefined

    try {
      const result = await createWithdrawalRequest(
        userId,
        username,
        parsedAmount,
        method === "CRYPTO" ? selectedCrypto : "BANK",
        method === "CRYPTO" ? walletAddress : "",
        bankDetails,
        { idToken },
      )

      if (result && result.success) {
        setLocalBalance((prev) => Math.max(0, +(prev - parsedAmount).toFixed(2)))
        setApprovedAmount(parsedAmount)
        setShowSuccessPopup(true)
        setIsSubmitted(true)
        setTimeout(() => setShowSuccessPopup(false), 3000)
      } else {
        setErrorMessage(result?.message || "Failed to submit withdrawal request. Please try again.")
      }
    } catch (err) {
      console.error("Withdraw error:", err)
      setErrorMessage("Network or server error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const parsedAmountForWarning = Number.parseFloat(amount || "0")
  const formDisabled = isLoading || localBalance < MIN_WITHDRAWAL

  // Render
  return (
    <div className="max-w-2xl mx-auto space-y-4 md:space-y-6 pb-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold mb-1">Withdraw Funds</h2>
        <p className="text-slate-400 text-xs md:text-sm">Transfer money from your account</p>
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 md:p-5 border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs md:text-sm mb-1">Available Balance</p>
            <p className="text-2xl md:text-3xl font-bold">${localBalance.toFixed(2)}</p>
          </div>
          <Wallet className="w-8 h-8 md:w-10 md:h-10 text-slate-600" />
        </div>
      </div>

      {localBalance < MIN_WITHDRAWAL && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 md:p-4 flex items-start gap-2 md:gap-3">
          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs md:text-sm text-yellow-300">
            Your available balance is below the minimum withdrawal amount of ${MIN_WITHDRAWAL}. Add funds to withdraw.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs md:text-sm font-medium">Payout Method</label>
        <div className="flex gap-2">
          <button
            onClick={() => setMethod("CRYPTO")}
            disabled={formDisabled}
            className={`px-4 py-2 rounded-xl border ${method === "CRYPTO" ? "border-emerald-500 bg-emerald-500/10" : "border-slate-800 bg-slate-900"}`}
          >
            Crypto
          </button>
          <button
            onClick={() => setMethod("BANK")}
            disabled={formDisabled}
            className={`px-4 py-2 rounded-xl border ${method === "BANK" ? "border-emerald-500 bg-emerald-500/10" : "border-slate-800 bg-slate-900"}`}
          >
            Bank Transfer
          </button>
        </div>
      </div>

      {method === "CRYPTO" && (
        <div className="space-y-2">
          <label className="text-xs md:text-sm font-medium">Select Cryptocurrency</label>
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <button
              onClick={() => setSelectedCrypto("BTC")}
              disabled={formDisabled}
              className={`p-3 md:p-4 rounded-xl border-2 transition-all ${selectedCrypto === "BTC"
                ? "border-emerald-500 bg-emerald-500/10"
                : "border-slate-800 bg-slate-900 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-2 md:gap-3">
                <Bitcoin className="w-5 h-5 md:w-6 md:h-6 text-orange-400" />
                <div className="text-left">
                  <p className="font-bold text-sm md:text-base">Bitcoin</p>
                  <p className="text-xs text-slate-400">BTC</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => setSelectedCrypto("USDT")}
              disabled={formDisabled}
              className={`p-3 md:p-4 rounded-xl border-2 transition-all ${selectedCrypto === "USDT"
                ? "border-emerald-500 bg-emerald-500/10"
                : "border-slate-800 bg-slate-900 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-5 h-5 md:w-6 md:h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-xs md:text-sm font-bold">₮</span>
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm md:text-base">Tether</p>
                  <p className="text-xs text-slate-400">USDT</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6">
        <label className="text-xs md:text-sm text-slate-400 mb-2 block">Withdrawal Amount (USD)</label>
        <p className="text-xs text-amber-400 mb-3">Minimum withdrawal: ${MIN_WITHDRAWAL}</p>
        <div className="relative mb-3 md:mb-4">
          <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-xl md:text-2xl font-bold text-slate-400">
            $
          </span>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min={MIN_WITHDRAWAL}
            max={localBalance}
            disabled={formDisabled}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 md:pl-10 pr-4 py-3 md:py-4 text-2xl md:text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {quickPercentages.map((percentage) => (
            <button
              key={percentage}
              onClick={() => handlePercentage(percentage)}
              disabled={formDisabled}
              className="bg-slate-800 hover:bg-slate-700 rounded-lg py-2 text-xs md:text-sm font-medium transition-colors active:scale-95 disabled:opacity-60"
            >
              {percentage}%
            </button>
          ))}
        </div>
      </div>

      {method === "CRYPTO" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6">
          <label className="text-xs md:text-sm text-slate-400 mb-2 block">{selectedCrypto} Wallet Address</label>
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder={`Enter your ${selectedCrypto} wallet address`}
            disabled={formDisabled}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
          />
        </div>
      )}

      {method === "BANK" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 space-y-3">
          <label className="text-xs md:text-sm text-slate-400 mb-1 block">Bank Transfer Details</label>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={bankCountry}
              onChange={(e) => setBankCountry(e.target.value as any)}
              disabled={formDisabled}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="EU">European / IBAN</option>
              <option value="OTHER">Other (International)</option>
            </select>

            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Bank name"
              disabled={formDisabled}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Account number"
            disabled={formDisabled}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          {bankCountry === "US" && (
            <input
              type="text"
              value={routingNumber}
              onChange={(e) => setRoutingNumber(e.target.value)}
              placeholder="Routing (ABA) number"
              disabled={formDisabled}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          )}

          {bankCountry === "UK" && (
            <input
              type="text"
              value={sortCode}
              onChange={(e) => setSortCode(e.target.value)}
              placeholder="Sort code"
              disabled={formDisabled}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          )}

          {(bankCountry === "EU" || bankCountry === "OTHER") && (
            <input
              type="text"
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              placeholder="IBAN"
              disabled={formDisabled}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          )}

          <input
            type="text"
            value={swiftBic}
            onChange={(e) => setSwiftBic(e.target.value)}
            placeholder="SWIFT / BIC (optional)"
            disabled={formDisabled}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      )}

      {amount && (parsedAmountForWarning > localBalance || parsedAmountForWarning < MIN_WITHDRAWAL) && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 md:p-4 flex items-start gap-2 md:gap-3">
          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs md:text-sm text-red-300">
            {parsedAmountForWarning > localBalance
              ? "Withdrawal amount exceeds available balance"
              : `Minimum withdrawal amount is $${MIN_WITHDRAWAL}`}
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-600/10 border border-red-600/20 rounded-xl p-3 md:p-4 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      <button
        onClick={handleWithdraw}
        disabled={
          !amount ||
          Number.parseFloat(amount || "0") <= 0 ||
          Number.parseFloat(amount || "0") > localBalance ||
          Number.parseFloat(amount || "0") < MIN_WITHDRAWAL ||
          isLoading ||
          localBalance < MIN_WITHDRAWAL ||
          (method === "CRYPTO" && !walletAddress) ||
          (method === "BANK" && (!bankName || !accountNumber))
        }
        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-3 md:py-4 rounded-xl transition-all duration-300 transform active:scale-95 text-sm md:text-base disabled:opacity-60"
      >
        {isLoading ? "Submitting..." : `Request Withdrawal $${amount || "0.00"}`}
      </button>

      {/* Success popup overlay */}
      {showSuccessPopup && approvedAmount !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSuccessPopup(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full text-center shadow-xl transform transition-all">
            <div className="flex items-center justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-7 h-7 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-bold mb-1">Payment Approved</h3>
            <p className="text-sm text-slate-500 mb-4">${approvedAmount.toFixed(2)} has been approved and deducted from your balance.</p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
            >
              Close <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 md:p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-300">
          <p className="font-semibold mb-1">Important:</p>
          <ul className="space-y-1 text-xs">
            <li>• Processing typically takes 15 to 30 minutes</li>
            <li>• Ensure your wallet or bank details are correct</li>
            <li>• Server must validate your identity and balance before processing</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
// ...existing code...
