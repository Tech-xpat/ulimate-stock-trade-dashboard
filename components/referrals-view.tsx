"use client"

import { Users, Copy, Share2, Gift } from "lucide-react"

export function ReferralsView() {
  const referralCode = "UST2025XYZ"
  const referralLink = `https://ultimatestcktrader.online/ref/${referralCode}`

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-8 h-8 text-lime-400" />
        <div>
          <h2 className="text-2xl font-bold">Referral Program</h2>
          <p className="text-sm text-slate-400">Invite friends and earn rewards</p>
        </div>
      </div>

      {/* Referral Stats */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Gift className="w-6 h-6 text-white" />
          <h3 className="text-xl font-bold text-white">Your Earnings</h3>
        </div>
        <p className="text-4xl font-bold text-white mb-2">$250.00</p>
        <p className="text-blue-100 text-sm">From 5 successful referrals</p>
      </div>

      {/* Referral Code */}
      <div className="bg-slate-700/50 rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-lg">Your Referral Code</h3>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600">
          <p className="text-xs text-slate-400 mb-2">Referral Code</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-lime-400">{referralCode}</p>
            <button className="bg-lime-400 text-slate-900 p-3 rounded-lg active:scale-95 transition-transform">
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600">
          <p className="text-xs text-slate-400 mb-2">Referral Link</p>
          <div className="flex items-center gap-2">
            <p className="text-sm text-white flex-1 truncate">{referralLink}</p>
            <button className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg transition-colors">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button className="w-full bg-lime-400 text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <Share2 className="w-5 h-5" />
          Share Referral Link
        </button>
      </div>

      {/* Referral List */}
      <div className="bg-slate-700/50 rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-lg">Your Referrals</h3>
        <div className="space-y-3">
          <ReferralItem name="John Doe" date="Jan 15, 2025" earnings="$50.00" status="active" />
          <ReferralItem name="Jane Smith" date="Jan 10, 2025" earnings="$50.00" status="active" />
          <ReferralItem name="Mike Johnson" date="Jan 5, 2025" earnings="$50.00" status="active" />
          <ReferralItem name="Sarah Williams" date="Dec 28, 2024" earnings="$50.00" status="active" />
          <ReferralItem name="Tom Brown" date="Dec 20, 2024" earnings="$50.00" status="active" />
        </div>
      </div>
    </div>
  )
}

function ReferralItem({
  name,
  date,
  earnings,
  status,
}: {
  name: string
  date: string
  earnings: string
  status: string
}) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </span>
        </div>
        <div>
          <p className="font-medium text-sm">{name}</p>
          <p className="text-xs text-slate-400">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-lime-400">{earnings}</p>
        <p className="text-xs text-slate-400 capitalize">{status}</p>
      </div>
    </div>
  )
}
