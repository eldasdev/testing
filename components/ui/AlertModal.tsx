'use client'

import { useState, useEffect } from 'react'
import Modal from './Modal'
import { FiAlertCircle, FiCheckCircle, FiInfo, FiXCircle } from 'react-icons/fi'

export type AlertType = 'info' | 'success' | 'warning' | 'error'

interface AlertModalProps {
  type?: AlertType
  title?: string
  message: string
  open: boolean
  onClose: () => void
  confirmText?: string
  showCancel?: boolean
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}

const alertConfig = {
  info: {
    icon: FiInfo,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    titleColor: 'text-blue-900',
  },
  success: {
    icon: FiCheckCircle,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    titleColor: 'text-green-900',
  },
  warning: {
    icon: FiAlertCircle,
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
    titleColor: 'text-yellow-900',
  },
  error: {
    icon: FiXCircle,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    titleColor: 'text-red-900',
  },
}

export default function AlertModal({
  type = 'info',
  title,
  message,
  open,
  onClose,
  confirmText = 'OK',
  showCancel = false,
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: AlertModalProps) {
  const config = alertConfig[type]
  const Icon = config.icon

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    } else {
      onClose()
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose()
        }
      }}
      title={title}
      size="sm"
      showCloseButton={!showCancel}
    >
      <div className="space-y-4">
        <div className="flex items-start space-x-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${config.iconColor}`} />
          </div>
          <div className="flex-1 pt-1">
            {!title && (
              <h3 className={`text-lg font-semibold mb-2 ${config.titleColor}`}>
                {type === 'info' && 'Information'}
                {type === 'success' && 'Success'}
                {type === 'warning' && 'Warning'}
                {type === 'error' && 'Error'}
              </h3>
            )}
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{message}</p>
          </div>
        </div>

        <div className={`flex ${showCancel ? 'justify-end space-x-3' : 'justify-end'} pt-4 border-t border-gray-100`}>
          {showCancel && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 font-semibold rounded-xl transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-6 py-2.5 font-semibold rounded-xl transition-all duration-200 text-white shadow-lg hover:shadow-xl ${
              type === 'error'
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                : type === 'warning'
                ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800'
                : type === 'success'
                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
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
export function useAlertModal() {
  const [alertState, setAlertState] = useState<{
    open: boolean
    type?: AlertType
    title?: string
    message: string
    confirmText?: string
    showCancel?: boolean
    cancelText?: string
    onConfirm?: () => void
    onCancel?: () => void
  }>({
    open: false,
    message: '',
  })

  const showAlert = (options: {
    type?: AlertType
    title?: string
    message: string
    confirmText?: string
    showCancel?: boolean
    cancelText?: string
    onConfirm?: () => void
    onCancel?: () => void
  }) => {
    setAlertState({
      open: true,
      ...options,
    })
  }

  const closeAlert = () => {
    setAlertState((prev) => ({ ...prev, open: false }))
  }

  const AlertComponent = () => (
    <AlertModal
      type={alertState.type}
      title={alertState.title}
      message={alertState.message}
      open={alertState.open}
      onClose={closeAlert}
      confirmText={alertState.confirmText}
      showCancel={alertState.showCancel}
      cancelText={alertState.cancelText}
      onConfirm={alertState.onConfirm}
      onCancel={alertState.onCancel}
    />
  )

  return {
    showAlert,
    closeAlert,
    AlertComponent,
  }
}
