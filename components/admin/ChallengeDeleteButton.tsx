'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiTrash2, FiLoader } from 'react-icons/fi'
import { useConfirmModal } from '@/components/ui/ConfirmModal'
import { useAlertModal } from '@/components/ui/AlertModal'

interface ChallengeDeleteButtonProps {
  challengeId: string
}

export default function ChallengeDeleteButton({ challengeId }: ChallengeDeleteButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { showConfirm, ConfirmComponent } = useConfirmModal()
  const { showAlert, AlertComponent } = useAlertModal()

  const handleDelete = async () => {
    showConfirm({
      title: 'Delete Challenge',
      message: 'Are you sure you want to delete this challenge? This action cannot be undone.',
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        setLoading(true)
        try {
          const response = await fetch(`/api/admin/challenges/${challengeId}`, {
            method: 'DELETE',
          })

          if (!response.ok) {
            throw new Error('Failed to delete challenge')
          }

          router.refresh()
        } catch (error) {
          console.error('Error deleting challenge:', error)
          showAlert({
            type: 'error',
            title: 'Delete Failed',
            message: 'Failed to delete challenge. Please try again.',
          })
        } finally {
          setLoading(false)
        }
      },
    })
  }

  return (
    <>
      <ConfirmComponent />
      <AlertComponent />
      <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      title="Delete"
    >
      {loading ? (
        <FiLoader className="w-4 h-4 text-red-600 animate-spin" />
      ) : (
        <FiTrash2 className="w-4 h-4 text-red-600" />
      )}
    </button>
    </>
  )
}
