'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { FiMoreVertical, FiEye, FiEdit2, FiTrash2, FiMail } from 'react-icons/fi'
import { useConfirmModal } from '@/components/ui/ConfirmModal'
import { useAlertModal } from '@/components/ui/AlertModal'

interface MentorsManagementActionsProps {
  mentorId: string
  mentorEmail?: string
  isSuperAdmin: boolean
}

export default function MentorsManagementActions({ mentorId, mentorEmail, isSuperAdmin }: MentorsManagementActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [email, setEmail] = useState(mentorEmail || '')
  const menuRef = useRef<HTMLDivElement>(null)
  const { showConfirm, ConfirmComponent } = useConfirmModal()
  const { showAlert, AlertComponent } = useAlertModal()

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

  useEffect(() => {
    // Fetch mentor email if not provided
    if (!email && mentorId) {
      fetch(`/api/admin/mentors/${mentorId}`)
        .then(res => res.json())
        .then(data => {
          if (data.email) {
            setEmail(data.email)
          }
        })
        .catch(() => {})
    }
  }, [mentorId, email])

  const handleDelete = async () => {
    setMenuOpen(false)
    showConfirm({
      title: 'Delete Mentor',
      message: 'Are you sure you want to delete this mentor? This action cannot be undone.',
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/admin/mentors/${mentorId}`, { 
            method: 'DELETE' 
          })
          if (response.ok) {
            window.location.reload()
          } else {
            showAlert({
              type: 'error',
              title: 'Delete Failed',
              message: 'Failed to delete mentor. Please try again.',
            })
          }
        } catch (error) {
          showAlert({
            type: 'error',
            title: 'Delete Failed',
            message: 'Failed to delete mentor. Please try again.',
          })
        }
      },
    })
  }

  return (
    <>
      <ConfirmComponent />
      <AlertComponent />
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
            href={`/admin/mentors/${mentorId}`}
            onClick={() => setMenuOpen(false)}
            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FiEye className="w-4 h-4" />
            <span>View Mentor</span>
          </Link>
          <Link
            href={`/admin/mentors/${mentorId}/edit`}
            onClick={() => setMenuOpen(false)}
            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FiEdit2 className="w-4 h-4" />
            <span>Edit Mentor</span>
          </Link>
          {email && (
            <a
              href={`mailto:${email}`}
              onClick={() => setMenuOpen(false)}
              className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FiMail className="w-4 h-4" />
              <span>Send Email</span>
            </a>
          )}
          {isSuperAdmin && (
            <button
              onClick={handleDelete}
              className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <FiTrash2 className="w-4 h-4" />
              <span>Delete Mentor</span>
            </button>
          )}
        </div>
      )}
    </div>
    </>
  )
}
