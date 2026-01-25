import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { FiUser, FiEye, FiHeart } from 'react-icons/fi'

export default async function BlogPostPage({ params }: { params: { id: string } }) {
  const post = await prisma.blogPost.findUnique({
    where: { id: params.id },
    include: {
      author: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  })

  if (!post) {
    notFound()
  }

  // Increment view count
  await prisma.blogPost.update({
    where: { id: params.id },
    data: { views: { increment: 1 } },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <article className="bg-white rounded-lg shadow-md p-8">
        {post.isAIGenerated && (
          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded mb-4">
            AI Generated
          </span>
        )}
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
          <div className="flex items-center">
            <FiUser className="w-4 h-4 mr-1" />
            {post.author.name}
          </div>
          <span>•</span>
          <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
          <span>•</span>
          <div className="flex items-center">
            <FiEye className="w-4 h-4 mr-1" />
            {post.views} views
          </div>
          <span>•</span>
          <div className="flex items-center">
            <FiHeart className="w-4 h-4 mr-1" />
            {post.likes} likes
          </div>
        </div>

        <div className="prose max-w-none">
          <div className="text-gray-700 whitespace-pre-line">{post.content}</div>
        </div>

        {post.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}
