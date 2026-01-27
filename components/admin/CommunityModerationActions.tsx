'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { FiMoreVertical, FiEye, FiBookmark, FiTrash2 } from 'react-icons/fi'

interface CommunityModerationActionsProps {
  threadId: string
  isPinned: boolean
  isSuperAdmin: boolean
}

export default function CommunityModerationActions({ 
  threadId, 
  isPinned, 
  isSuperAdmin 
}: CommunityModerationActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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

  const handlePin = async () => {
    setMenuOpen(false)
    await fetch(`/api/admin/community/threads/${threadId}/pin`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPinned: !isPinned }),
    })
    window.location.reload()
  }

  const handleDelete = async () => {
    setMenuOpen(false)
    if (confirm('Are you sure you want to delete this thread? This will also delete all replies.')) {
      await fetch(`/api/admin/community/threads/${threadId}`, { method: 'DELETE' })
      window.location.reload()
    }
  }

  return (
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
            href={`/community/${threadId}`}
            onClick={() => setMenuOpen(false)}
            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FiEye className="w-4 h-4" />
            <span>View Thread</span>
          </Link>
          <button
            onClick={handlePin}
            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50 transition-colors"
          >
            <FiBookmark className="w-4 h-4" />
            <span>{isPinned ? 'Unpin Thread' : 'Pin Thread'}</span>
          </button>
          {isSuperAdmin && (
            <button
              onClick={handleDelete}
              className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <FiTrash2 className="w-4 h-4" />
              <span>Delete Thread</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
