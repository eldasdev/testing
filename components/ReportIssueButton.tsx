'use client'

import { useState } from 'react'
import { FiAlertCircle, FiX, FiLoader, FiCheckCircle } from 'react-icons/fi'

interface ReportIssueButtonProps {
  variant?: 'button' | 'link' | 'icon'
  className?: string
}

export default function ReportIssueButton({ variant = 'button', className = '' }: ReportIssueButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    category: 'bug',
    subject: '',
    description: '',
    pageUrl: '',
  })

  const handleOpen = () => {
    setIsOpen(true)
    // Update page URL when opening modal
    if (typeof window !== 'undefined') {
      setFormData(prev => ({
        ...prev,
        pageUrl: window.location.href,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/report-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit report')
      }

      setSuccess(true)
      setFormData({
        category: 'bug',
        subject: '',
        description: '',
        pageUrl: typeof window !== 'undefined' ? window.location.href : '',
      })

      setTimeout(() => {
        setIsOpen(false)
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const buttonContent = (
    <>
      <div className="relative">
        <FiAlertCircle className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
      </div>
      <span className="font-semibold">Report Issue</span>
    </>
  )

  return (
    <>
      {variant === 'button' && (
        <button
          onClick={handleOpen}
          className={`group relative inline-flex items-center space-x-2.5 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 overflow-hidden ${className}`}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
          <div className="relative flex items-center space-x-2.5">
            <div className="relative">
              <FiAlertCircle className="w-5 h-5 drop-shadow-sm" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></span>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-400 rounded-full"></span>
            </div>
            <span className="font-semibold drop-shadow-sm">Report Issue</span>
          </div>
        </button>
      )}
      {variant === 'link' && (
        <button
          onClick={handleOpen}
          className={`group inline-flex items-center space-x-2.5 text-sm font-semibold transition-all duration-200 ${className || 'text-orange-400 hover:text-orange-300'}`}
        >
          <div className="relative">
            <FiAlertCircle className="w-5 h-5 group-hover:scale-110 transition-transform drop-shadow-sm" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full opacity-75 group-hover:opacity-100 group-hover:animate-pulse transition-all"></span>
          </div>
          <span className="font-semibold">Report Issue</span>
        </button>
      )}
      {variant === 'icon' && (
        <button
          onClick={handleOpen}
          className={`group relative p-3 text-white bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200 ${className}`}
          title="Report Issue"
        >
          <div className="relative">
            <FiAlertCircle className="w-5 h-5 drop-shadow-sm" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-yellow-300 rounded-full animate-pulse"></span>
          </div>
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Report an Issue</h2>
              <button
                onClick={() => {
                  setIsOpen(false)
                  setError(null)
                  setSuccess(false)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                  <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-900">Error</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start space-x-3">
                  <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">Report Submitted!</p>
                    <p className="text-sm text-green-700">
                      Thank you for your feedback. We'll review your report and get back to you soon.
                    </p>
                  </div>
                </div>
              )}

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-900 mb-2">
                  Issue Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="input w-full"
                >
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="ui">UI/UX Issue</option>
                  <option value="performance">Performance Issue</option>
                  <option value="security">Security Concern</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-900 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="Brief description of the issue"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={6}
                  value={formData.description}
                  onChange={handleChange}
                  className="input w-full resize-none"
                  placeholder="Please provide detailed information about the issue, including steps to reproduce if applicable..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length} characters
                </p>
              </div>

              {/* Page URL (auto-filled) */}
              <div>
                <label htmlFor="pageUrl" className="block text-sm font-semibold text-gray-900 mb-2">
                  Page URL
                </label>
                <input
                  type="url"
                  id="pageUrl"
                  name="pageUrl"
                  value={formData.pageUrl}
                  onChange={handleChange}
                  className="input w-full bg-gray-50"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  Automatically captured from current page
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting || success}
                  className="btn btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <FiLoader className="w-5 h-5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : success ? (
                    <>
                      <FiCheckCircle className="w-5 h-5" />
                      <span>Submitted!</span>
                    </>
                  ) : (
                    <>
                      <FiAlertCircle className="w-5 h-5" />
                      <span>Submit Report</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    setError(null)
                    setSuccess(false)
                  }}
                  className="btn btn-outline"
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
