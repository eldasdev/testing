import Link from 'next/link'
import { format } from 'date-fns'
import { FiEye, FiHeart } from 'react-icons/fi'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  author: {
    name: string
    image: string | null
  }
  isAIGenerated: boolean
  views: number
  likes: number
  createdAt: Date
}

interface BlogListProps {
  posts: BlogPost[]
}

export default function BlogList({ posts }: BlogListProps) {
  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-500 text-lg">No blog posts yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post, index) => (
        <Link
          key={post.id}
          href={`/blog/${post.slug || post.id}`}
          className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-gray-100 p-6 card-hover overflow-hidden relative animate-slide-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-75 transition-opacity" />
          {post.isAIGenerated && (
            <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 text-xs font-semibold rounded-full mb-4 border border-purple-200">
              ✨ AI Generated
            </span>
          )}
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors relative z-10">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed relative z-10">{post.excerpt}</p>
          )}
          <div className="flex items-center justify-between text-sm relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                {post.author.name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{post.author.name}</div>
                <div className="text-gray-500 text-xs">{format(new Date(post.createdAt), 'MMM d, yyyy')}</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-gray-600">
                <FiEye className="w-4 h-4" />
                <span className="font-medium">{post.views}</span>
              </div>
              <div className="flex items-center space-x-1 text-red-500">
                <FiHeart className="w-4 h-4" />
                <span className="font-medium">{post.likes}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
