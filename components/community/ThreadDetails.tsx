'use client'

import { format } from 'date-fns'
import { FiUser, FiHeart, FiMessageSquare } from 'react-icons/fi'
import VoteButtons from './VoteButtons'
import MediaDisplay from '@/components/MediaDisplay'

interface Thread {
  id: string
  title: string
  content: string
  category: string
  media?: string[]
  author: {
    id: string
    name: string
    image: string | null
  }
  views: number
  likes: number
  upvotes: number
  downvotes: number
  createdAt: Date
  posts: any[]
}

interface ThreadDetailsProps {
  thread: Thread
}

export default function ThreadDetails({ thread }: ThreadDetailsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded">
              {thread.category}
            </span>
          </div>
          <VoteButtons
            threadId={thread.id}
            initialUpvotes={thread.upvotes}
            initialDownvotes={thread.downvotes}
            size="md"
            orientation="vertical"
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{thread.title}</h1>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
          <div className="flex items-center">
            <FiUser className="w-4 h-4 mr-1" />
            {thread.author.name}
          </div>
          <span>•</span>
          <span>{format(new Date(thread.createdAt), 'MMM d, yyyy')}</span>
          <span>•</span>
          <div className="flex items-center">
            <FiHeart className="w-4 h-4 mr-1" />
            {thread.likes} likes
          </div>
          <span>•</span>
          <div className="flex items-center">
            <FiMessageSquare className="w-4 h-4 mr-1" />
            {thread.posts.length} replies
          </div>
        </div>

        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-line">{thread.content}</p>
        </div>

        {thread.media && thread.media.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {thread.media.map((url, index) => (
              <div key={index} className="rounded-lg overflow-hidden border border-gray-200">
                <MediaDisplay url={url} alt={`Media ${index + 1}`} index={index} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">
          Replies ({thread.posts.length})
        </h2>
        <div className="space-y-6">
          {thread.posts.map((post) => (
            <div key={post.id} className="border-l-4 border-primary-200 pl-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-semibold text-gray-900">{post.author.name}</span>
                <span className="text-sm text-gray-500">
                  {format(new Date(post.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
              {post.media && post.media.length > 0 && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {post.media.map((url: string, index: number) => (
                    <div key={index} className="rounded-lg overflow-hidden border border-gray-200">
                      <MediaDisplay url={url} alt={`Media ${index + 1}`} index={index} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
