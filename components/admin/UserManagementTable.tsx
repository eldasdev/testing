'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { FiEdit2, FiTrash2, FiMoreVertical, FiMail, FiShield, FiUser, FiLoader, FiAlertCircle, FiX } from 'react-icons/fi'

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: Date
  _count: {
    applications: number
    jobPosts: number
    threads: number
  }
}

interface UserManagementTableProps {
  users: User[]
  isSuperAdmin: boolean
}

export default function UserManagementTable({ users, isSuperAdmin }: UserManagementTableProps) {
  const router = useRouter()
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const toggleSelect = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map((u) => u.id))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return
    
    const selectedUserNames = users
      .filter(u => selectedUsers.includes(u.id))
      .map(u => u.name)
      .join(', ')
    
    const confirmMessage = `Are you sure you want to delete ${selectedUsers.length} user(s)?\n\nUsers: ${selectedUserNames}\n\nThis action cannot be undone.`
    
    if (!confirm(confirmMessage)) return
    
    setDeleting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/users/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedUsers }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete users')
      }
      
      setSelectedUsers([])
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete users')
    } finally {
      setDeleting(false)
    }
  }

  const handleAction = async (action: string, userId: string) => {
    setActionMenuOpen(null)
    
    switch (action) {
      case 'delete':
        if (confirm('Are you sure you want to delete this user?')) {
          try {
            const response = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
            if (!response.ok) {
              const data = await response.json()
              alert(data.error || 'Failed to delete user')
              return
            }
            router.refresh()
          } catch (err) {
            alert('Failed to delete user')
          }
        }
        break
      case 'promote':
        try {
          const response = await fetch(`/api/admin/users/${userId}/role`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'ADMIN' }),
          })
          if (response.ok) {
            router.refresh()
          }
        } catch (err) {
          alert('Failed to promote user')
        }
        break
      case 'demote':
        try {
          const response = await fetch(`/api/admin/users/${userId}/role`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'STUDENT' }),
          })
          if (response.ok) {
            router.refresh()
          }
        } catch (err) {
          alert('Failed to demote user')
        }
        break
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-red-100 text-red-700'
      case 'ADMIN':
        return 'bg-purple-100 text-purple-700'
      case 'COMPANY':
        return 'bg-green-100 text-green-700'
      case 'MENTOR':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-blue-100 text-blue-700'
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-primary-50 px-6 py-3 flex items-center justify-between border-b border-primary-100">
          <span className="text-sm font-medium text-primary-700">
            {selectedUsers.length} {selectedUsers.length === 1 ? 'user' : 'users'} selected
          </span>
          <div className="flex items-center space-x-2">
            {error && (
              <div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-1.5 rounded-lg mr-2">
                <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-2 hover:text-red-900"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </div>
            )}
            <button 
              className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Send email to selected users"
            >
              <FiMail className="w-4 h-4" />
            </button>
            {isSuperAdmin && (
              <button
                onClick={handleBulkDelete}
                disabled={deleting || selectedUsers.length === 0}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                title="Delete selected users"
              >
                {deleting ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Deleting...</span>
                  </>
                ) : (
                  <FiTrash2 className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-left">
              <input
                type="checkbox"
                checked={selectedUsers.length === users.length}
                onChange={toggleSelectAll}
                className="rounded border-gray-300"
              />
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              User
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Role
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Activity
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Joined
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => toggleSelect(user.id)}
                  className="rounded border-gray-300"
                />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${getRoleBadgeColor(user.role)}`}>
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-600">
                  {user._count.applications > 0 && (
                    <span>{user._count.applications} applications</span>
                  )}
                  {user._count.jobPosts > 0 && (
                    <span>{user._count.jobPosts} job posts</span>
                  )}
                  {user._count.threads > 0 && (
                    <span>{user._count.threads} threads</span>
                  )}
                  {user._count.applications === 0 && user._count.jobPosts === 0 && user._count.threads === 0 && (
                    <span className="text-gray-400">No activity</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {format(new Date(user.createdAt), 'MMM d, yyyy')}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="relative">
                  <button
                    onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiMoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                  {actionMenuOpen === user.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-10">
                      <button
                        onClick={() => handleAction('edit', user.id)}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <FiEdit2 className="w-4 h-4" />
                        <span>Edit User</span>
                      </button>
                      <button
                        onClick={() => handleAction('email', user.id)}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <FiMail className="w-4 h-4" />
                        <span>Send Email</span>
                      </button>
                      {isSuperAdmin && user.role !== 'SUPER_ADMIN' && (
                        <>
                          {user.role !== 'ADMIN' ? (
                            <button
                              onClick={() => handleAction('promote', user.id)}
                              className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50"
                            >
                              <FiShield className="w-4 h-4" />
                              <span>Promote to Admin</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAction('demote', user.id)}
                              className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
                            >
                              <FiUser className="w-4 h-4" />
                              <span>Remove Admin</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleAction('delete', user.id)}
                            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <FiTrash2 className="w-4 h-4" />
                            <span>Delete User</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
