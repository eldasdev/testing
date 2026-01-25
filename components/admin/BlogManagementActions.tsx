'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiMoreVertical, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi'

interface BlogManagementActionsProps {
  postId: string
  isSuperAdmin: boolean
}

export default function BlogManagementActions({ postId, isSuperAdmin }: BlogManagementActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleDelete = async () => {
    setMenuOpen(false)
    if (confirm('Are you sure you want to delete this blog post?')) {
      await fetch(`/api/admin/blog/${postId}`, { method: 'DELETE' })
      window.location.reload()
    }
  }

  return (
    <div className="relative flex justify-end">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <FiMoreVertical className="w-5 h-5 text-gray-500" />
      </button>
      
      {menuOpen && (
        <div className="absolute right-0 mt-10 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-10">
          <Link
            href={`/blog`}
            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <FiEye className="w-4 h-4" />
            <span>View Post</span>
          </Link>
          <Link
            href={`/admin/blog/${postId}/edit`}
            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <FiEdit2 className="w-4 h-4" />
            <span>Edit Post</span>
          </Link>
          {isSuperAdmin && (
            <button
              onClick={handleDelete}
              className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <FiTrash2 className="w-4 h-4" />
              <span>Delete Post</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
