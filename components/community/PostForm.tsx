'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MediaUpload from '@/components/MediaUpload'
import { useAlertModal } from '@/components/ui/AlertModal'

interface PostFormProps {
  threadId: string
}

export default function PostForm({ threadId }: PostFormProps) {
  const router = useRouter()
  const { AlertComponent } = useAlertModal()
  const [content, setContent] = useState('')
  const [media, setMedia] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, content, media }),
      })

      if (response.ok) {
        setContent('')
        setMedia([])
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to post reply:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Post a Reply</h3>
      <textarea
        required
        rows={4}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 mb-4"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your reply..."
      />
      <div className="mb-4">
        <MediaUpload
          media={media}
          onChange={setMedia}
          maxFiles={3}
          maxSize={10}
        />
      </div>
      <button
        type="submit"
        disabled={!content.trim() || loading}
        className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
      >
        {loading ? 'Posting...' : 'Post Reply'}
      </button>
      <AlertComponent />
    </form>
  )
}
