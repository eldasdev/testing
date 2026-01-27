'use client'

import { useState } from 'react'
import Modal from './Modal'
import { FiAlertTriangle } from 'react-icons/fi'

interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  type?: 'danger' | 'warning' | 'info'
}

export default function ConfirmModal({
  open,
  onClose,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  type = 'warning',
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose()
        }
      }}
      title={title || 'Confirm Action'}
      size="sm"
      showCloseButton={false}
    >
      <div className="space-y-4">
        <div className="flex items-start space-x-4">
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              type === 'danger'
                ? 'bg-red-100'
                : type === 'warning'
                ? 'bg-yellow-100'
                : 'bg-blue-100'
            }`}
          >
            <FiAlertTriangle
              className={`w-6 h-6 ${
                type === 'danger'
                  ? 'text-red-600'
                  : type === 'warning'
                  ? 'text-yellow-600'
                  : 'text-blue-600'
              }`}
            />
          </div>
          <div className="flex-1 pt-1">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{message}</p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2.5 font-semibold rounded-xl transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-6 py-2.5 font-semibold rounded-xl transition-all duration-200 text-white shadow-lg hover:shadow-xl ${
              type === 'danger'
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                : type === 'warning'
                ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800'
                : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// Hook for easy usage
export function useConfirmModal() {
  const [confirmState, setConfirmState] = useState<{
    open: boolean
    title?: string
    message: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    type?: 'danger' | 'warning' | 'info'
  }>({
    open: false,
    message: '',
    onConfirm: () => {},
  })

  const showConfirm = (options: {
    title?: string
    message: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    type?: 'danger' | 'warning' | 'info'
  }) => {
    setConfirmState({
      open: true,
      ...options,
    })
  }

  const closeConfirm = () => {
    setConfirmState((prev) => ({ ...prev, open: false }))
  }

  const ConfirmComponent = () => (
    <ConfirmModal
      title={confirmState.title}
      message={confirmState.message}
      open={confirmState.open}
      onClose={closeConfirm}
      confirmText={confirmState.confirmText}
      cancelText={confirmState.cancelText}
      onConfirm={confirmState.onConfirm}
      type={confirmState.type}
    />
  )

  return {
    showConfirm,
    closeConfirm,
    ConfirmComponent,
  }
}
