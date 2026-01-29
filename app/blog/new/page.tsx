'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { FiCpu, FiArrowLeft, FiArrowRight, FiSend, FiZap, FiEdit3, FiFileText } from 'react-icons/fi'
import MediaUpload from '@/components/MediaUpload'
import { useAlertModal } from '@/components/ui/AlertModal'

type TabMode = 'manual' | 'ai'

export default function NewBlogPostPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { AlertComponent } = useAlertModal()
  const [mode, setMode] = useState<TabMode>('manual')

  // Manual post state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [manualMedia, setManualMedia] = useState<string[]>([])

  // AI post state
  const [question, setQuestion] = useState('')
  const [aiMedia, setAiMedia] = useState<string[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const suggestedQuestions = [
    'How do I prepare for a technical interview?',
    'What skills are most in demand for IT jobs in Uzbekistan?',
    'How can I build a strong professional network as a student?',
    'What should I include in my first resume?',
  ]

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setLoading(true)
    setError('')

    try {
      const tags = tagsInput
        .split(/[,;]/)
        .map((t) => t.trim())
        .filter(Boolean)

      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt.trim() || undefined,
          tags,
          media: manualMedia,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/blog/${data.slug || data.id}`)
      } else {
        const err = await response.json().catch(() => ({}))
        setError(err.error || 'Failed to publish post. Please try again.')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/blog/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, media: aiMedia }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/blog/${data.slug || data.postId || data.id}`)
      } else {
        setError('Failed to generate and publish. Please try again.')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center px-4">
        <div className="card p-8 max-w-md w-full text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiFileText className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to create a blog post</p>
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
      <section className="bg-white border-b border-gray-100">
        <div className="container-custom py-6 md:py-8">
          <div className="flex items-center space-x-4 animate-fade-in-up">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">New blog post</h1>
              <p className="text-gray-600 mt-1">Write manually or generate with AI</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            {/* Tabs */}
            <div className="flex rounded-xl bg-gray-100 p-1 mb-6 animate-fade-in-up">
              <button
                type="button"
                onClick={() => setMode('manual')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'manual'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiEdit3 className="w-5 h-5" />
                Write post
              </button>
              <button
                type="button"
                onClick={() => setMode('ai')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'ai'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiCpu className="w-5 h-5" />
                Generate with AI
              </button>
            </div>

            {error && (
              <div className="mb-6 card p-4 bg-red-50 border-red-200 animate-fade-in">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {mode === 'manual' ? (
              <form onSubmit={handleManualSubmit} className="card p-6 md:p-8 animate-fade-in-up">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Manual post</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      required
                      maxLength={300}
                      className="input"
                      placeholder="Post title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
                    <textarea
                      required
                      rows={12}
                      className="input resize-y"
                      placeholder="Write your post content..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Excerpt <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      maxLength={500}
                      className="input resize-none"
                      placeholder="Short summary for previews"
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tags <span className="text-gray-400 font-normal">(optional, comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Career, Interview, Resume"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Media</label>
                    <MediaUpload
                      media={manualMedia}
                      onChange={setManualMedia}
                      maxFiles={5}
                      maxSize={10}
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={loading || !title.trim() || !content.trim()}
                    className="btn btn-primary flex-1 justify-center py-3"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Publishing...
                      </>
                    ) : (
                      <>
                        <FiFileText className="w-5 h-5 mr-2" />
                        Publish post
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
            ) : (
              <form onSubmit={handleAiSubmit} className="card p-6 md:p-8 animate-fade-in-up">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FiCpu className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Generate with AI</h2>
                    <p className="text-sm text-gray-600">Ask a question; AI writes the post and publishes it</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Your question</label>
                    <textarea
                      required
                      rows={4}
                      className="input resize-none"
                      placeholder="What would you like to know about your career journey?"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Or try one of these:</label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {suggestedQuestions.map((q, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setQuestion(q)}
                          className={`p-3 rounded-xl border-2 text-left text-sm transition-all ${
                            question === q
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Media</label>
                    <MediaUpload
                      media={aiMedia}
                      onChange={setAiMedia}
                      maxFiles={5}
                      maxSize={10}
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={loading || !question.trim()}
                    className="btn btn-primary flex-1 justify-center py-3"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Generating & publishing...
                      </>
                    ) : (
                      <>
                        <FiSend className="w-5 h-5 mr-2" />
                        Generate & publish
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
            )}

            {mode === 'ai' && (
              <div className="mt-6 card p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-100 animate-fade-in-up animation-delay-100">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiZap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">How AI posts work</h3>
                    <p className="text-sm text-gray-600">
                      Enter a career-related question. The AI will generate an article and publish it as a blog post under your account.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <AlertComponent />
    </div>
  )
}
