"use client"

import { useState, useEffect } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { UserProfile } from "@/lib/auth-service"

export function UsersManagement() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

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
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Balance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Country</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Joined</th>
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
                  <td className="px-4 py-4 text-slate-300">{user.email}</td>
                  <td className="px-4 py-4">
                    <span className="text-emerald-500 font-semibold">${user.balance.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-4 text-slate-300">{user.country}</td>
                  <td className="px-4 py-4 text-slate-400 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center text-slate-400 text-sm">
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </div>
  )
}
