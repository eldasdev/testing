'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiUser, FiMail, FiLock, FiBriefcase, FiSave, FiLoader, FiAlertCircle } from 'react-icons/fi'

type UserRole = 'STUDENT' | 'COMPANY' | 'MENTOR' | 'ADMIN'

export default function AddUserForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT' as UserRole,
    location: '',
    phone: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user')
      }

      router.push('/admin/users')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
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

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="input input-icon w-full pl-12"
              placeholder="John Doe"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="input input-icon w-full pl-12"
              placeholder="john@example.com"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              id="password"
              name="password"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              className="input input-icon w-full pl-12"
              placeholder="Minimum 6 characters"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-sm font-semibold text-gray-900 mb-2">
            User Role <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FiBriefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              id="role"
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="input input-icon w-full pl-12 appearance-none"
            >
              <option value="STUDENT">Student</option>
              <option value="COMPANY">Company</option>
              <option value="MENTOR">Mentor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-semibold text-gray-900 mb-2">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="input w-full"
            placeholder="Tashkent, Uzbekistan"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="input w-full"
            placeholder="+998 90 123 4567"
          />
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
                <span>Creating User...</span>
              </>
            ) : (
              <>
                <FiSave className="w-5 h-5" />
                <span>Create User</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-outline px-6 py-3"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
