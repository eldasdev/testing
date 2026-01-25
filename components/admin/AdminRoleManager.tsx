'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { FiTrash2, FiShield } from 'react-icons/fi'

interface Admin {
  id: string
  name: string
  email: string
  role: string
  createdAt: Date
}

interface AdminRoleManagerProps {
  admin: Admin
}

export default function AdminRoleManager({ admin }: AdminRoleManagerProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleRemoveAdmin = async () => {
    if (!confirm(`Are you sure you want to remove admin privileges from ${admin.name}?`)) {
      return
    }

    setIsLoading(true)
    try {
      await fetch(`/api/admin/users/${admin.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'STUDENT' }),
      })
      window.location.reload()
    } catch (error) {
      alert('Failed to update role')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePromoteToSuperAdmin = async () => {
    if (!confirm(`Are you sure you want to promote ${admin.name} to Super Admin? This will give them full platform control.`)) {
      return
    }

    setIsLoading(true)
    try {
      await fetch(`/api/admin/users/${admin.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'SUPER_ADMIN' }),
      })
      window.location.reload()
    } catch (error) {
      alert('Failed to update role')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
          {admin.name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{admin.name}</p>
          <p className="text-sm text-gray-500">{admin.email}</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold">
          Admin
        </span>
        <span className="text-sm text-gray-500">
          Since {format(new Date(admin.createdAt), 'MMM yyyy')}
        </span>
        <div className="flex space-x-2 ml-4">
          <button
            onClick={handlePromoteToSuperAdmin}
            disabled={isLoading}
            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
            title="Promote to Super Admin"
          >
            <FiShield className="w-4 h-4" />
          </button>
          <button
            onClick={handleRemoveAdmin}
            disabled={isLoading}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Remove Admin"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
