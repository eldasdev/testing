'use client'

import { useState } from 'react'
import { FiRefreshCw, FiDownload, FiUpload, FiCheck, FiLoader } from 'react-icons/fi'

export default function DatabaseActions() {
  const [syncing, setSyncing] = useState(false)
  const [exporting, setExporting] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setSyncing(false)
    alert('Database synchronized successfully!')
  }

  const handleExport = async () => {
    setExporting(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setExporting(false)
    alert('Database export completed! Check your downloads.')
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center justify-center space-x-3 p-4 bg-cyan-50 text-cyan-700 rounded-xl hover:bg-cyan-100 transition-all disabled:opacity-50"
        >
          {syncing ? (
            <FiLoader className="w-5 h-5 animate-spin" />
          ) : (
            <FiRefreshCw className="w-5 h-5" />
          )}
          <span className="font-semibold">{syncing ? 'Syncing...' : 'Sync Database'}</span>
        </button>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center justify-center space-x-3 p-4 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-all disabled:opacity-50"
        >
          {exporting ? (
            <FiLoader className="w-5 h-5 animate-spin" />
          ) : (
            <FiDownload className="w-5 h-5" />
          )}
          <span className="font-semibold">{exporting ? 'Exporting...' : 'Export Data'}</span>
        </button>

        <button className="flex items-center justify-center space-x-3 p-4 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-all">
          <FiUpload className="w-5 h-5" />
          <span className="font-semibold">Import Data</span>
        </button>
      </div>
    </div>
  )
}
