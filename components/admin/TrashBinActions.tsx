'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiRotateCw, FiX, FiLoader } from 'react-icons/fi'
import { useConfirmModal } from '@/components/ui/ConfirmModal'
import { useAlertModal } from '@/components/ui/AlertModal'

interface TrashBinActionsProps {
  itemId: string
  itemType: string
}

export default function TrashBinActions({ itemId, itemType }: TrashBinActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const { showConfirm, ConfirmComponent } = useConfirmModal()
  const { showAlert, AlertComponent } = useAlertModal()

  const handleAction = async (action: 'restore' | 'delete') => {
    if (loading) return

    const confirmMessage = action === 'restore'
      ? `Are you sure you want to restore this ${itemType}?`
      : `Are you sure you want to permanently delete this ${itemType}? This action cannot be undone.`

    showConfirm({
      title: action === 'restore' ? 'Restore Item' : 'Permanently Delete Item',
      message: confirmMessage,
      type: action === 'restore' ? 'warning' : 'danger',
      confirmText: action === 'restore' ? 'Restore' : 'Delete',
      onConfirm: async () => {

        setLoading(action)

        try {
          const response = await fetch(`/api/admin/trash/${itemId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action }),
          })

          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || 'Operation failed')
          }

          router.refresh()
        } catch (error) {
          console.error(`Error ${action}ing item:`, error)
          showAlert({
            type: 'error',
            title: 'Operation Failed',
            message: error instanceof Error ? error.message : `Failed to ${action} item`,
          })
        } finally {
          setLoading(null)
        }
      },
    })
  }

  return (
    <>
      <ConfirmComponent />
      <AlertComponent />
      <div className="flex items-center justify-end space-x-2">
      <button
        onClick={() => handleAction('restore')}
        disabled={!!loading}
        className="p-2 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
        title="Restore"
      >
        {loading === 'restore' ? (
          <FiLoader className="w-4 h-4 text-green-600 animate-spin" />
        ) : (
          <FiRotateCw className="w-4 h-4 text-green-600" />
        )}
      </button>
      <button
        onClick={() => handleAction('delete')}
        disabled={!!loading}
        className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        title="Permanently Delete"
      >
        {loading === 'delete' ? (
          <FiLoader className="w-4 h-4 text-red-600 animate-spin" />
        ) : (
          <FiX className="w-4 h-4 text-red-600" />
        )}
      </button>
    </div>
    </>
  )
}
