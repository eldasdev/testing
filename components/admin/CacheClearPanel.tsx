'use client'

import { useState } from 'react'
import { FiTrash2, FiRefreshCw, FiCheckCircle, FiAlertCircle, FiLoader, FiDatabase, FiGlobe, FiFile } from 'react-icons/fi'

interface CacheType {
  id: string
  name: string
  description: string
  icon: typeof FiDatabase
  color: string
  bgColor: string
}

export default function CacheClearPanel() {
  const [clearing, setClearing] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const cacheTypes: CacheType[] = [
    {
      id: 'query',
      name: 'Query Cache',
      description: 'Clear cached database query results',
      icon: FiDatabase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'api',
      name: 'API Response Cache',
      description: 'Clear cached API responses',
      icon: FiGlobe,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'static',
      name: 'Static Assets Cache',
      description: 'Clear cached static files and images',
      icon: FiFile,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'all',
      name: 'All Caches',
      description: 'Clear all cached data (recommended for major updates)',
      icon: FiTrash2,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ]

  const handleClear = async (cacheId: string, cacheName: string) => {
    setClearing(cacheId)
    setError(null)
    setSuccess(null)

    try {
      // Simulate cache clearing process
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // In production, this would call an API endpoint
      // const response = await fetch('/api/admin/cache/clear', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ cacheType: cacheId }),
      // })

      setSuccess(`${cacheName} cleared successfully!`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cache')
    } finally {
      setClearing(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <FiTrash2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Clear Platform Cache</h3>
            <p className="text-gray-700 text-sm md:text-base">
              Clearing cache can help resolve data inconsistencies and improve performance. 
              Use this feature when you notice stale data or after major updates.
            </p>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <FiAlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-900 mb-1">Important Notice</p>
            <p className="text-sm text-yellow-700">
              Clearing cache may temporarily slow down the platform as caches rebuild. 
              This operation is safe and won't affect your data.
            </p>
          </div>
        </div>
      </div>

      {/* Cache Options */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 md:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Cache Types</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 mb-6">
            <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start space-x-3 mb-6">
            <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Success</p>
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cacheTypes.map((cache) => {
            const Icon = cache.icon
            const isClearing = clearing === cache.id

            return (
              <div
                key={cache.id}
                className={`p-5 rounded-xl border-2 transition-all ${
                  cache.id === 'all'
                    ? 'border-red-200 bg-red-50'
                    : 'border-gray-200 bg-white hover:border-primary-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${cache.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${cache.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{cache.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{cache.description}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleClear(cache.id, cache.name)}
                  disabled={!!clearing}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 ${
                    cache.id === 'all'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isClearing ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      <span>Clearing...</span>
                    </>
                  ) : (
                    <>
                      <FiRefreshCw className="w-4 h-4" />
                      <span>Clear Cache</span>
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Cache Information</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="text-gray-400 mr-2">•</span>
            <span>Query cache stores frequently accessed database query results</span>
          </li>
          <li className="flex items-start">
            <span className="text-gray-400 mr-2">•</span>
            <span>API cache stores responses from external APIs to reduce load</span>
          </li>
          <li className="flex items-start">
            <span className="text-gray-400 mr-2">•</span>
            <span>Static assets cache includes images, fonts, and other static files</span>
          </li>
          <li className="flex items-start">
            <span className="text-gray-400 mr-2">•</span>
            <span>Caches will automatically rebuild as users interact with the platform</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
