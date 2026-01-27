'use client'

import { useState } from 'react'
import { FiDownload, FiLoader } from 'react-icons/fi'
import DateRangeFilter from './DateRangeFilter'
import { useAlertModal } from '@/components/ui/AlertModal'

export default function JobsExportButton() {
  const [exporting, setExporting] = useState(false)
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  })
  const { showAlert, AlertComponent } = useAlertModal()

  const handleDateRangeChange = (start: string | null, end: string | null) => {
    setDateRange({ start, end })
  }

  const handleExport = async () => {
    if (!dateRange.start || !dateRange.end) {
      showAlert({
        type: 'warning',
        title: 'Date Range Required',
        message: 'Please select both start and end dates',
      })
      return
    }

    setExporting(true)
    try {
      const response = await fetch(
        `/api/admin/jobs/export?startDate=${dateRange.start}&endDate=${dateRange.end}`
      )

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `jobs_export_${dateRange.start}_to_${dateRange.end}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      showAlert({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export jobs. Please try again.',
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <AlertComponent />
      <div className="flex items-center space-x-3">
      <DateRangeFilter
        onDateRangeChange={handleDateRangeChange}
        onExport={handleExport}
      />
      <button
        onClick={handleExport}
        disabled={exporting || !dateRange.start || !dateRange.end}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {exporting ? (
          <FiLoader className="w-4 h-4 animate-spin" />
        ) : (
          <FiDownload className="w-4 h-4" />
        )}
        <span>{exporting ? 'Exporting...' : 'Export'}</span>
      </button>
    </div>
    </>
  )
}
