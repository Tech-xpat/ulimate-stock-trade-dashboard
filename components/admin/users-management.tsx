"use client"

import { useState, useEffect } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { updateUserBalances, updateUserProfile } from "@/lib/auth-service"
import type { UserProfile } from "@/lib/auth-service"

export function UsersManagement() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({})
  const [balanceAdjustment, setBalanceAdjustment] = useState({ amount: 0, type: "add" as "add" | "deduct" })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"))
      const usersData: UserProfile[] = []
      usersSnapshot.forEach((doc) => {
        usersData.push(doc.data() as UserProfile)
      })
      setUsers(usersData)
    } catch (error) {
      console.error("[v0] Load users error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (user: UserProfile) => {
    setEditingUser(user)
    setEditForm(user)
    setBalanceAdjustment({ amount: 0, type: "add" })
  }

  const handleSaveUser = async () => {
    if (!editingUser) return

    const result = await updateUserProfile(editingUser.uid, editForm)
    if (result.success) {
      setUsers(users.map((u) => (u.uid === editingUser.uid ? { ...u, ...editForm } : u)))
      setEditingUser(null)
    }
  }

  const handleAdjustBalance = async (userId: string, balanceType: "main" | "profit") => {
    const user = users.find((u) => u.uid === userId)
    if (!user || balanceAdjustment.amount <= 0) return

    let newMainBalance = user.balance
    let newProfitBalance = user.profitBalance

    if (balanceType === "main") {
      newMainBalance =
        balanceAdjustment.type === "add"
          ? user.balance + balanceAdjustment.amount
          : Math.max(0, user.balance - balanceAdjustment.amount)
    } else {
      newProfitBalance =
        balanceAdjustment.type === "add"
          ? user.profitBalance + balanceAdjustment.amount
          : Math.max(0, user.profitBalance - balanceAdjustment.amount)
    }

    const result = await updateUserBalances(userId, newMainBalance, newProfitBalance)
    if (result.success) {
      setUsers(
        users.map((u) => (u.uid === userId ? { ...u, balance: newMainBalance, profitBalance: newProfitBalance } : u)),
      )
      setBalanceAdjustment({ amount: 0, type: "add" })
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (editingUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Edit User</h2>
          <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="bg-slate-900 rounded-lg border border-slate-800 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">First Name</label>
              <input
                type="text"
                value={editForm.firstName || ""}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Last Name</label>
              <input
                type="text"
                value={editForm.lastName || ""}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Main Balance</label>
            <div className="space-y-2">
              <input
                type="number"
                value={editForm.balance || 0}
                onChange={(e) => setEditForm({ ...editForm, balance: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
              />
              <div className="flex gap-2">
                <div className="flex-1 flex gap-2">
                  <input
                    type="number"
                    value={balanceAdjustment.amount}
                    onChange={(e) => setBalanceAdjustment({ ...balanceAdjustment, amount: Number(e.target.value) })}
                    placeholder="Amount"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                  <select
                    value={balanceAdjustment.type}
                    onChange={(e) =>
                      setBalanceAdjustment({ ...balanceAdjustment, type: e.target.value as "add" | "deduct" })
                    }
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="add">Add</option>
                    <option value="deduct">Deduct</option>
                  </select>
                </div>
                <button
                  onClick={() => handleAdjustBalance(editingUser.uid, "main")}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Profit Balance</label>
            <div className="space-y-2">
              <input
                type="number"
                value={editForm.profitBalance || 0}
                onChange={(e) => setEditForm({ ...editForm, profitBalance: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
              />
              <div className="flex gap-2">
                <div className="flex-1 flex gap-2">
                  <input
                    type="number"
                    value={balanceAdjustment.amount}
                    onChange={(e) => setBalanceAdjustment({ ...balanceAdjustment, amount: Number(e.target.value) })}
                    placeholder="Amount"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                  <select
                    value={balanceAdjustment.type}
                    onChange={(e) =>
                      setBalanceAdjustment({ ...balanceAdjustment, type: e.target.value as "add" | "deduct" })
                    }
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="add">Add</option>
                    <option value="deduct">Deduct</option>
                  </select>
                </div>
                <button
                  onClick={() => handleAdjustBalance(editingUser.uid, "profit")}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">KYC Status</label>
            <select
              value={editForm.kycStatus || "pending"}
              onChange={(e) => setEditForm({ ...editForm, kycStatus: e.target.value as any })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveUser}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 rounded-lg"
            >
              Save Changes
            </button>
            <button
              onClick={() => setEditingUser(null)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Users Management</h2>
        <p className="text-slate-400">View and manage all registered users</p>
      </div>

      <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
        <input
          type="text"
          placeholder="Search users by name, username, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Main Balance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Profit Balance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">KYC Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.uid} className="hover:bg-slate-800/50">
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-white font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-slate-400">@{user.username}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-emerald-500 font-semibold">${user.balance.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-blue-500 font-semibold">${user.profitBalance.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.kycStatus === "approved"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : user.kycStatus === "rejected"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {user.kycStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-amber-500 hover:text-amber-400 font-medium text-sm"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
