'use client'

import { useState } from 'react'
import { FiDownload, FiFile, FiLoader, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'

interface ExportOption {
  name: string
  count: number
  key: string
}

interface ExportPanelProps {
  exportOptions: ExportOption[]
}

type ExportFormat = 'csv' | 'json' | 'xlsx'

export default function ExportPanel({ exportOptions }: ExportPanelProps) {
  const [exporting, setExporting] = useState<string | null>(null)
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async (key: string, name: string) => {
    setExporting(key)
    setError(null)
    setSuccess(null)

    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In production, this would call an API endpoint
      // const response = await fetch(`/api/admin/export?type=${key}&format=${format}`)
      // const blob = await response.blob()
      // const url = window.URL.createObjectURL(blob)
      // const a = document.createElement('a')
      // a.href = url
      // a.download = `${key}_export.${format}`
      // a.click()

      setSuccess(`${name} exported successfully!`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExporting(null)
    }
  }

  const handleExportAll = async () => {
    setExporting('all')
    setError(null)
    setSuccess(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      setSuccess('All data exported successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <FiDownload className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Platform Data</h3>
            <p className="text-gray-700 text-sm md:text-base">
              Export data in CSV, JSON, or Excel format for backup, analysis, or migration purposes. 
              All exports include complete data with relationships preserved.
            </p>
          </div>
        </div>
      </div>

      {/* Format Selection */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Export Format</h2>
        <div className="flex flex-wrap gap-3">
          {(['csv', 'json', 'xlsx'] as ExportFormat[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFormat(fmt)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                format === fmt
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {fmt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Export Options</h2>
          <button
            onClick={handleExportAll}
            disabled={!!exporting}
            className="btn btn-primary flex items-center space-x-2 px-4 py-2 text-sm disabled:opacity-50"
          >
            {exporting === 'all' ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                <span>Exporting All...</span>
              </>
            ) : (
              <>
                <FiDownload className="w-4 h-4" />
                <span>Export All</span>
              </>
            )}
          </button>
        </div>

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
          {exportOptions.map((option) => (
            <div
              key={option.key}
              className="p-4 border-2 border-gray-200 rounded-xl hover:border-primary-300 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <FiFile className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{option.name}</h3>
                    <p className="text-sm text-gray-500">{option.count.toLocaleString()} records</p>
                  </div>
                </div>
                <button
                  onClick={() => handleExport(option.key, option.name)}
                  disabled={!!exporting}
                  className="btn btn-outline px-4 py-2 text-sm disabled:opacity-50"
                >
                  {exporting === option.key ? (
                    <FiLoader className="w-4 h-4 animate-spin" />
                  ) : (
                    <FiDownload className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Export Information</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="text-gray-400 mr-2">•</span>
            <span>CSV format is best for spreadsheet applications (Excel, Google Sheets)</span>
          </li>
          <li className="flex items-start">
            <span className="text-gray-400 mr-2">•</span>
            <span>JSON format preserves data structure and relationships</span>
          </li>
          <li className="flex items-start">
            <span className="text-gray-400 mr-2">•</span>
            <span>Excel format includes formatting and multiple sheets</span>
          </li>
          <li className="flex items-start">
            <span className="text-gray-400 mr-2">•</span>
            <span>Large exports may take several minutes to process</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
