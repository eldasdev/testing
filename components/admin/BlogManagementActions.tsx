'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { FiMoreVertical, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { useConfirmModal } from '@/components/ui/ConfirmModal'

interface BlogManagementActionsProps {
  postId: string
  isSuperAdmin: boolean
}

export default function BlogManagementActions({ postId, isSuperAdmin }: BlogManagementActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { showConfirm, ConfirmComponent } = useConfirmModal()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  const handleDelete = async () => {
    setMenuOpen(false)
    showConfirm({
      title: 'Delete Blog Post',
      message: 'Are you sure you want to delete this blog post? This action cannot be undone.',
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        await fetch(`/api/admin/blog/${postId}`, { method: 'DELETE' })
        window.location.reload()
      },
    })
  }

  return (
    <>
      <ConfirmComponent />
      <div className="relative flex justify-end" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setMenuOpen(!menuOpen)
        }}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        type="button"
      >
        <FiMoreVertical className="w-5 h-5 text-gray-500" />
      </button>
      
      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-[9999]">
          <Link
            href={`/blog`}
            onClick={() => setMenuOpen(false)}
            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FiEye className="w-4 h-4" />
            <span>View Post</span>
          </Link>
          <Link
            href={`/admin/blog/${postId}/edit`}
            onClick={() => setMenuOpen(false)}
            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FiEdit2 className="w-4 h-4" />
            <span>Edit Post</span>
          </Link>
          {isSuperAdmin && (
            <button
              onClick={handleDelete}
              className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <FiTrash2 className="w-4 h-4" />
              <span>Delete Post</span>
            </button>
          )}
        </div>
      )}
    </div>
    </>
  )
}
