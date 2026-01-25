import Link from 'next/link'
import { format } from 'date-fns'
import { FiMessageSquare, FiEye, FiHeart, FiBookmark } from 'react-icons/fi'

interface Thread {
  id: string
  title: string
  category: string
  author: {
    name: string
    image: string | null
  }
  views: number
  likes: number
  isPinned: boolean
  createdAt: Date
  posts: any[]
  _count: {
    posts: number
  }
}

interface CommunityThreadListProps {
  threads: Thread[]
}

export default function CommunityThreadList({ threads }: CommunityThreadListProps) {
  if (threads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-500 text-lg">No threads yet. Be the first to start a discussion!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {threads.map((thread, index) => (
        <Link
          key={thread.id}
          href={`/community/${thread.id}`}
          className={`group block bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border ${
            thread.isPinned 
              ? 'border-l-4 border-l-primary-600 border-t border-r border-b border-gray-100' 
              : 'border-gray-100'
          } p-6 card-hover animate-slide-up relative overflow-hidden`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full -mr-12 -mt-12 opacity-50 group-hover:opacity-75 transition-opacity" />
          <div className="flex items-start justify-between relative z-10">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                {thread.isPinned && (
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-lg">
                    <FiBookmark className="w-4 h-4 text-white" />
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors flex-1">
                  {thread.title}
                </h3>
                <span className="px-3 py-1.5 bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 text-xs font-semibold rounded-lg border border-primary-200">
                  {thread.category}
                </span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4 pl-11">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {thread.author.name.charAt(0)}
                  </div>
                  <span className="font-semibold">{thread.author.name}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">{format(new Date(thread.createdAt), 'MMM d, yyyy')}</span>
              </div>

              <div className="flex items-center space-x-6 text-sm pl-11">
                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                  <FiMessageSquare className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-700">
                    {thread._count.posts} {thread._count.posts === 1 ? 'reply' : 'replies'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <FiEye className="w-4 h-4" />
                  <span className="font-medium">{thread.views}</span>
                </div>
                <div className="flex items-center space-x-2 text-red-500">
                  <FiHeart className="w-4 h-4" />
                  <span className="font-medium">{thread.likes}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
