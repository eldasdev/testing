'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { FiMessageSquare, FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi'
import MediaUpload from '@/components/MediaUpload'
import { useAlertModal } from '@/components/ui/AlertModal'

export default function NewThreadPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { AlertComponent } = useAlertModal()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Career Advice',
    media: [] as string[],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categories = [
    'Career Advice',
    'Interview Tips',
    'Networking',
    'Skills Development',
    'Job Search',
    'General Discussion',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/community/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          category: formData.category,
          media: formData.media,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/community/${data.slug || data.id}`)
      } else {
        setError('Failed to create thread. Please try again.')
      }
    } catch (error) {
      console.error('Failed to create thread:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center px-4">
        <div className="card p-8 max-w-md w-full text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiMessageSquare className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to start a discussion</p>
          <Link href="/auth/signin" className="btn btn-primary w-full justify-center">
            Sign In
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Start a Discussion</h1>
              <p className="text-gray-600 mt-1">Share your thoughts with the community</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="section-sm">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            {error && (
              <div className="mb-6 card p-4 bg-red-50 border-red-200 animate-fade-in">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="card p-6 md:p-8 animate-fade-in-up">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="What would you like to discuss?"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setFormData({ ...formData, category })}
                        className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                          formData.category === category
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={8}
                    className="input resize-none"
                    placeholder="Share your thoughts, questions, or experiences..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Tip: Be specific and provide context to get better responses
                  </p>
                </div>

                <div>
                  <MediaUpload
                    media={formData.media}
                    onChange={(media) => setFormData({ ...formData, media })}
                    maxFiles={5}
                    maxSize={10}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex-1 justify-center py-3"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-5 h-5 mr-2" />
                      Create Discussion
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn btn-secondary justify-center py-3"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
      <AlertComponent />
    </div>
  )
}
