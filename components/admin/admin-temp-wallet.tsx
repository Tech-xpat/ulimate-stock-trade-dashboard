"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"

interface AdminTempWalletProps {
  adminId: string
}

interface TempWallet {
  mainBalance: number
  profitBalance: number
  totalBalance: number
  lastUpdated: string
}

export function AdminTempWallet({ adminId }: AdminTempWalletProps) {
  const [tempWallet, setTempWallet] = useState<TempWallet>({
    mainBalance: 0,
    profitBalance: 0,
    totalBalance: 0,
    lastUpdated: new Date().toISOString(),
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editValues, setEditValues] = useState(tempWallet)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    loadTempWallet()
  }, [])

  const loadTempWallet = async () => {
    try {
      const docRef = doc(db, "admin", "tempWallet")
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data() as TempWallet
        setTempWallet(data)
        setEditValues(data)
      }
      setLoading(false)
    } catch (error) {
      console.error("Error loading temp wallet:", error)
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage("")

    try {
      const updatedWallet = {
        ...editValues,
        totalBalance: editValues.mainBalance + editValues.profitBalance,
        lastUpdated: new Date().toISOString(),
      }

      const docRef = doc(db, "admin", "tempWallet")
      await setDoc(docRef, updatedWallet)

      setTempWallet(updatedWallet)
      setIsEditing(false)
      setMessage("Temp wallet updated successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("Error saving temp wallet:", error)
      setMessage("Error saving temp wallet")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-lime-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Admin Temporary Wallet</h2>
        <p className="text-slate-400">Manage temporary wallet balances for testing (editable)</p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg mb-6 ${message.includes("Error") ? "bg-red-500/10 border border-red-500/20 text-red-500" : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500"}`}
        >
          {message}
        </div>
      )}

      <div className="bg-slate-900 rounded-lg p-6 border border-slate-800 space-y-6">
        {/* Display Mode */}
        {!isEditing && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Main Balance */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-sm font-medium mb-2">Main Balance</p>
                <p className="text-3xl font-bold text-white">${tempWallet.mainBalance.toFixed(2)}</p>
              </div>

              {/* Profit Balance */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-sm font-medium mb-2">Profit Balance</p>
                <p className="text-3xl font-bold text-lime-400">${tempWallet.profitBalance.toFixed(2)}</p>
              </div>

              {/* Total Balance */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-sm font-medium mb-2">Total Balance</p>
                <p className="text-3xl font-bold text-white">${tempWallet.totalBalance.toFixed(2)}</p>
              </div>
            </div>

            <div className="text-xs text-slate-500">Last updated: {new Date(tempWallet.lastUpdated).toLocaleString()}</div>

            <Button
              onClick={() => {
                setIsEditing(true)
                setEditValues(tempWallet)
              }}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
            >
              Edit Wallet
            </Button>
          </>
        )}

        {/* Edit Mode */}
        {isEditing && (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Main Balance ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editValues.mainBalance}
                  onChange={(e) =>
                    setEditValues({
                      ...editValues,
                      mainBalance: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Profit Balance ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editValues.profitBalance}
                  onChange={(e) =>
                    setEditValues({
                      ...editValues,
                      profitBalance: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-sm font-medium mb-2">Total Balance (Auto-calculated)</p>
                <p className="text-2xl font-bold text-white">
                  ${(editValues.mainBalance + editValues.profitBalance).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false)
                  setEditValues(tempWallet)
                }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold"
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
