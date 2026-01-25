'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiCheck } from 'react-icons/fi'

interface ApplyButtonProps {
  jobId: string
  hasApplied: boolean
}

export default function ApplyButton({ jobId, hasApplied }: ApplyButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleApply = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobPostId: jobId }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to apply:', error)
    } finally {
      setLoading(false)
    }
  }

  if (hasApplied) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2 text-green-700">
        <FiCheck className="w-5 h-5" />
        <span>You have already applied for this position</span>
      </div>
    )
  }

  return (
    <button
      onClick={handleApply}
      disabled={loading}
      className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
    >
      {loading ? 'Applying...' : 'Apply Now'}
    </button>
  )
}
