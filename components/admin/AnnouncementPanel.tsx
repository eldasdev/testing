'use client'

import { useState } from 'react'
import { FiMail, FiUsers, FiSend, FiLoader, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'

type RecipientType = 'all' | 'students' | 'companies' | 'mentors'

export default function AnnouncementPanel() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    recipientType: 'all' as RecipientType,
    priority: 'normal' as 'low' | 'normal' | 'high',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In production, this would call an API endpoint
      // const response = await fetch('/api/admin/announcements', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // })

      setSuccess(true)
      setFormData({
        subject: '',
        message: '',
        recipientType: 'all',
        priority: 'normal',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send announcement')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const recipientCounts = {
    all: 'All Users',
    students: 'Students Only',
    companies: 'Companies Only',
    mentors: 'Mentors Only',
  }

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <FiMail className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Send Platform Announcements</h3>
            <p className="text-gray-700 text-sm md:text-base">
              Send important announcements, updates, or notifications to users. 
              Announcements will be delivered via email and in-app notifications.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
              <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start space-x-3">
              <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">Announcement Sent!</p>
                <p className="text-sm text-green-700">
                  Your announcement has been sent successfully to all recipients.
                </p>
              </div>
            </div>
          )}

          {/* Recipient Type */}
          <div>
            <label htmlFor="recipientType" className="block text-sm font-semibold text-gray-900 mb-2">
              Recipients <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiUsers className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                id="recipientType"
                name="recipientType"
                required
                value={formData.recipientType}
                onChange={handleChange}
                className="input input-icon w-full pl-12 appearance-none"
              >
                <option value="all">{recipientCounts.all}</option>
                <option value="students">{recipientCounts.students}</option>
                <option value="companies">{recipientCounts.companies}</option>
                <option value="mentors">{recipientCounts.mentors}</option>
              </select>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-semibold text-gray-900 mb-2">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="input w-full"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
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
              placeholder="Enter announcement subject"
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={8}
              value={formData.message}
              onChange={handleChange}
              className="input w-full resize-none"
              placeholder="Enter your announcement message here..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.message.length} characters
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex items-center justify-center space-x-2 px-6 py-3 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <FiSend className="w-5 h-5" />
                  <span>Send Announcement</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
