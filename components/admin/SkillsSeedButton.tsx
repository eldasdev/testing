'use client'

import { useState } from 'react'
import { FiDatabase, FiLoader, FiCheck } from 'react-icons/fi'

export default function SkillsSeedButton() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSeed = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/skills/catalog/seed', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to seed skills')
      }

      if (data.skipSeeding) {
        setError('Skills catalog already has data')
      } else {
        setSuccess(true)
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleSeed}
        disabled={loading || success}
        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
          success
            ? 'bg-green-600 text-white'
            : 'bg-slate-700 text-white hover:bg-slate-800'
        }`}
      >
        {loading ? (
          <FiLoader className="w-4 h-4 animate-spin" />
        ) : success ? (
          <FiCheck className="w-4 h-4" />
        ) : (
          <FiDatabase className="w-4 h-4" />
        )}
        <span>{loading ? 'Seeding...' : success ? 'Seeded!' : 'Seed Catalog'}</span>
      </button>
      
      {error && (
        <div className="absolute top-full mt-2 right-0 px-3 py-2 bg-red-100 text-red-700 text-sm rounded-lg whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  )
}
