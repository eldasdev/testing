'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { FiBriefcase, FiMapPin, FiDollarSign, FiX, FiPlus, FiArrowLeft, FiCheck, FiArrowRight } from 'react-icons/fi'
import Link from 'next/link'
import LocationPicker from '@/components/jobs/LocationPicker'

export default function NewJobPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    address: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    placeId: '',
    type: 'FULL_TIME',
    experienceLevel: 'ENTRY',
    salaryMin: '',
    salaryMax: '',
    currency: 'UZS',
    applicationDeadline: '',
    requirements: [''],
    benefits: [''],
    tags: '',
  })

  const handleAddRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...formData.requirements, ''],
    })
  }

  const handleRemoveRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index),
    })
  }

  const handleRequirementChange = (index: number, value: string) => {
    const updated = [...formData.requirements]
    updated[index] = value
    setFormData({ ...formData, requirements: updated })
  }

  const handleAddBenefit = () => {
    setFormData({
      ...formData,
      benefits: [...formData.benefits, ''],
    })
  }

  const handleRemoveBenefit = (index: number) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((_, i) => i !== index),
    })
  }

  const handleBenefitChange = (index: number, value: string) => {
    const updated = [...formData.benefits]
    updated[index] = value
    setFormData({ ...formData, benefits: updated })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const requirements = formData.requirements.filter(r => r.trim() !== '')
      const benefits = formData.benefits.filter(b => b.trim() !== '')
      const tags = formData.tags.split(',').map(t => t.trim()).filter(t => t !== '')

      if (requirements.length === 0) {
        setError('Please add at least one requirement')
        setLoading(false)
        return
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        company: formData.company,
        location: formData.location,
        address: formData.address || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        placeId: formData.placeId || null,
        type: formData.type,
        experienceLevel: formData.experienceLevel,
        salaryMin: formData.salaryMin ? formData.salaryMin : null,
        salaryMax: formData.salaryMax ? formData.salaryMax : null,
        currency: formData.currency,
        applicationDeadline: formData.applicationDeadline || null,
        requirements,
        benefits,
        tags,
      }

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/jobs/${data.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create job posting')
      }
    } catch (error) {
      console.error('Failed to create job:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center px-4">
        <div className="card p-8 max-w-md w-full text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiBriefcase className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to post a job vacancy</p>
          <Link href="/auth/signin" className="btn btn-primary w-full justify-center">
            Sign In
            <FiArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    )
  }

  if (session.user.role !== 'COMPANY' && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center px-4">
        <div className="card p-8 max-w-md w-full text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiX className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">Only companies can post job vacancies</p>
          <Link href="/jobs" className="btn btn-primary w-full justify-center">
            Browse Jobs
            <FiArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-subtle">
      {/* Header */}
      <section className="bg-white border-b border-gray-100">
        <div className="container-custom py-6 md:py-8">
          <div className="flex items-center space-x-4 animate-fade-in-up">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Post a Job</h1>
              <p className="text-gray-600 mt-1">Fill out the form to post your job opening</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="section-sm">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {error && (
              <div className="mb-6 card p-4 bg-red-50 border-red-200 animate-fade-in">
                <p className="text-red-800 flex items-center">
                  <FiX className="w-5 h-5 mr-2 flex-shrink-0" />
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in-up">
              {/* Basic Information */}
              <div className="card p-6 md:p-8">
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <FiBriefcase className="w-5 h-5 text-primary-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="input"
                      placeholder="e.g., Frontend Developer"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="input"
                      placeholder="e.g., Tech Solutions Uzbekistan"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Job Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={6}
                      className="input resize-none"
                      placeholder="Describe the role, responsibilities, and what you're looking for..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Location & Type */}
              <div className="card p-6 md:p-8">
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <FiMapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Location & Type</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <LocationPicker
                      value={{
                        location: formData.location,
                        address: formData.address,
                        latitude: formData.latitude,
                        longitude: formData.longitude,
                        placeId: formData.placeId,
                      }}
                      onChange={(locationData) => {
                        setFormData({
                          ...formData,
                          location: locationData.location,
                          address: locationData.address || '',
                          latitude: locationData.latitude,
                          longitude: locationData.longitude,
                          placeId: locationData.placeId || '',
                        })
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Job Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      className="input"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="INTERNSHIP">Internship</option>
                      <option value="CONTRACT">Contract</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Experience Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      className="input"
                      value={formData.experienceLevel}
                      onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    >
                      <option value="ENTRY">Entry Level</option>
                      <option value="JUNIOR">Junior</option>
                      <option value="MID">Mid Level</option>
                      <option value="SENIOR">Senior</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Application Deadline
                    </label>
                    <input
                      type="date"
                      className="input"
                      value={formData.applicationDeadline}
                      onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Salary */}
              <div className="card p-6 md:p-8">
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <FiDollarSign className="w-5 h-5 text-amber-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Salary Information</h2>
                </div>

                <div className="grid sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Minimum Salary
                    </label>
                    <input
                      type="number"
                      className="input"
                      placeholder="5,000,000"
                      value={formData.salaryMin}
                      onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Maximum Salary
                    </label>
                    <input
                      type="number"
                      className="input"
                      placeholder="8,000,000"
                      value={formData.salaryMax}
                      onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      className="input"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    >
                      <option value="UZS">UZS</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Requirements & Benefits */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Requirements */}
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Requirements</h3>
                    <button
                      type="button"
                      onClick={handleAddRequirement}
                      className="btn btn-ghost text-sm py-1 px-3"
                    >
                      <FiPlus className="w-4 h-4 mr-1" />
                      Add
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.requirements.map((req, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          className="input py-2 text-sm"
                          placeholder={`Requirement ${index + 1}`}
                          value={req}
                          onChange={(e) => handleRequirementChange(index, e.target.value)}
                        />
                        {formData.requirements.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRequirement(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Benefits</h3>
                    <button
                      type="button"
                      onClick={handleAddBenefit}
                      className="btn btn-ghost text-sm py-1 px-3"
                    >
                      <FiPlus className="w-4 h-4 mr-1" />
                      Add
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          className="input py-2 text-sm"
                          placeholder={`Benefit ${index + 1}`}
                          value={benefit}
                          onChange={(e) => handleBenefitChange(index, e.target.value)}
                        />
                        {formData.benefits.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveBenefit(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="card p-6 md:p-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., React, JavaScript, Frontend"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
                <p className="mt-2 text-sm text-gray-500">Separate tags with commas to help candidates find your job</p>
              </div>

              {/* Submit */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex-1 justify-center py-4"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Posting Job...
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-5 h-5 mr-2" />
                      Post Job Vacancy
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn btn-secondary justify-center py-4"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
