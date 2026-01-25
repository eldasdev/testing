import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { format } from 'date-fns'
import { FiFileText, FiPlus, FiEdit2, FiTrash2, FiEye, FiMoreVertical, FiCpu } from 'react-icons/fi'
import BlogManagementActions from '@/components/admin/BlogManagementActions'

export default async function BlogManagementPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const session = await getServerSession(authOptions)
  const isSuperAdmin = session?.user.role === 'SUPER_ADMIN'
  
  const page = parseInt(searchParams.page || '1')
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const [posts, totalCount] = await Promise.all([
    prisma.blogPost.findMany({
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.blogPost.count(),
  ])

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600 mt-1">
            Manage all blog posts ({totalCount} total)
          </p>
        </div>
        <Link
          href="/blog/new"
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all"
        >
          <FiPlus className="w-4 h-4" />
          <span>Create Post</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <p className="text-sm text-gray-600">Total Posts</p>
          <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <p className="text-sm text-gray-600">AI Generated</p>
          <p className="text-2xl font-bold text-gray-900">
            {posts.filter(p => p.isAIGenerated).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <p className="text-sm text-gray-600">User Written</p>
          <p className="text-2xl font-bold text-gray-900">
            {posts.filter(p => !p.isAIGenerated).length}
          </p>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Post
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Author
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Tags
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Created
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                      <FiFileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 line-clamp-1">{post.title}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{post.content.substring(0, 60)}...</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{post.author.name}</p>
                    <p className="text-sm text-gray-500">{post.author.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {post.isAIGenerated ? (
                    <span className="flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                      <FiCpu className="w-3 h-3" />
                      <span>AI Generated</span>
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                      User Written
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 2).map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 2 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        +{post.tags.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {format(new Date(post.createdAt), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4">
                  <BlogManagementActions postId={post.id} isSuperAdmin={isSuperAdmin} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/blog?page=${p}`}
              className={`px-4 py-2 rounded-lg ${
                p === page
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
