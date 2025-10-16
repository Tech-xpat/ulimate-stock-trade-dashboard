"use client"

import { useState } from "react"
import { Bitcoin, Wallet, AlertCircle, Check } from "lucide-react"
import { createWithdrawalRequest } from "@/lib/admin-service"

interface WithdrawViewProps {
  userId: string
  username: string
  availableBalance: number
}

export function WithdrawView({ userId, username, availableBalance }: WithdrawViewProps) {
  const [amount, setAmount] = useState("")
  const [selectedCrypto, setSelectedCrypto] = useState<"BTC" | "USDT">("BTC")
  const [walletAddress, setWalletAddress] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const quickPercentages = [25, 50, 75, 100]

  const handlePercentage = (percentage: number) => {
    const withdrawAmount = ((availableBalance * percentage) / 100).toFixed(2)
    setAmount(withdrawAmount)
  }

  const handleWithdraw = async () => {
    if (!amount || !walletAddress || Number.parseFloat(amount) <= 0 || Number.parseFloat(amount) > availableBalance) {
      return
    }

    setIsLoading(true)
    const result = await createWithdrawalRequest(
      userId,
      username,
      Number.parseFloat(amount),
      selectedCrypto,
      walletAddress,
    )

    if (result.success) {
      setIsSubmitted(true)
    } else {
      alert("Failed to submit withdrawal request. Please try again.")
    }
    setIsLoading(false)
  }

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-emerald-400 mb-2">Withdrawal Request Submitted!</h3>
            <p className="text-slate-300 text-sm">
              Your withdrawal request for ${amount} has been submitted and is pending admin approval. You will be
              notified once it's processed.
            </p>
          </div>
          <button
            onClick={() => {
              setIsSubmitted(false)
              setAmount("")
              setWalletAddress("")
            }}
            className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
          >
            Make Another Withdrawal
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 md:space-y-6 pb-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold mb-1">Withdraw Funds</h2>
        <p className="text-slate-400 text-xs md:text-sm">Transfer money from your account</p>
      </div>

      {/* Available Balance */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 md:p-5 border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs md:text-sm mb-1">Available Balance</p>
            <p className="text-2xl md:text-3xl font-bold">${availableBalance.toFixed(2)}</p>
          </div>
          <Wallet className="w-8 h-8 md:w-10 md:h-10 text-slate-600" />
        </div>
      </div>

      {/* Crypto Selection */}
      <div className="space-y-2">
        <label className="text-xs md:text-sm font-medium">Select Cryptocurrency</label>
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <button
            onClick={() => setSelectedCrypto("BTC")}
            className={`p-3 md:p-4 rounded-xl border-2 transition-all ${
              selectedCrypto === "BTC"
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
            className={`p-3 md:p-4 rounded-xl border-2 transition-all ${
              selectedCrypto === "USDT"
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

      {/* Amount Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6">
        <label className="text-xs md:text-sm text-slate-400 mb-2 block">Withdrawal Amount (USD)</label>
        <div className="relative mb-3 md:mb-4">
          <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-xl md:text-2xl font-bold text-slate-400">
            $
          </span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            max={availableBalance}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 md:pl-10 pr-4 py-3 md:py-4 text-2xl md:text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Quick Percentage Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {quickPercentages.map((percentage) => (
            <button
              key={percentage}
              onClick={() => handlePercentage(percentage)}
              className="bg-slate-800 hover:bg-slate-700 rounded-lg py-2 text-xs md:text-sm font-medium transition-colors active:scale-95"
            >
              {percentage}%
            </button>
          ))}
        </div>
      </div>

      {/* Wallet Address Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6">
        <label className="text-xs md:text-sm text-slate-400 mb-2 block">{selectedCrypto} Wallet Address</label>
        <input
          type="text"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder={`Enter your ${selectedCrypto} wallet address`}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Warning */}
      {Number.parseFloat(amount) > availableBalance && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 md:p-4 flex items-start gap-2 md:gap-3">
          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs md:text-sm text-red-300">Withdrawal amount exceeds available balance</p>
        </div>
      )}

      {/* Withdraw Button */}
      <button
        onClick={handleWithdraw}
        disabled={
          !amount ||
          !walletAddress ||
          Number.parseFloat(amount) <= 0 ||
          Number.parseFloat(amount) > availableBalance ||
          isLoading
        }
        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-3 md:py-4 rounded-xl transition-all duration-300 transform active:scale-95 text-sm md:text-base"
      >
        {isLoading ? "Submitting..." : `Request Withdrawal $${amount || "0.00"}`}
      </button>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 md:p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-300">
          <p className="font-semibold mb-1">Important:</p>
          <ul className="space-y-1 text-xs">
            <li>• Withdrawal requests require admin approval</li>
            <li>• Processing typically takes 24-48 hours</li>
            <li>• Ensure your wallet address is correct</li>
            <li>• You will be notified once processed</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
