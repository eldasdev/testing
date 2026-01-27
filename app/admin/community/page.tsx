import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { format } from 'date-fns'
import { FiMessageSquare, FiFlag, FiEye, FiTrash2, FiBookmark, FiThumbsUp, FiThumbsDown, FiHeart, FiLock, FiExternalLink } from 'react-icons/fi'
import CommunityModerationActions from '@/components/admin/CommunityModerationActions'

export default async function CommunityModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; page?: string }>
}) {
  const session = await getServerSession(authOptions)
  const isSuperAdmin = session?.user.role === 'SUPER_ADMIN'
  
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const where: any = {}
  if (params.filter === 'pinned') {
    where.isPinned = true
  }

  const [threads, totalCount, totalPosts] = await Promise.all([
    prisma.communityThread.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        views: true,
        likes: true,
        upvotes: true,
        downvotes: true,
        isPinned: true,
        isLocked: true,
        createdAt: true,
        author: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.communityThread.count({ where }),
    prisma.communityPost.count(),
  ])

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Moderation</h1>
          <p className="text-gray-600 mt-1">
            {totalCount} threads, {totalPosts} total posts
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <p className="text-sm text-gray-600">Total Threads</p>
          <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <p className="text-sm text-gray-600">Total Posts</p>
          <p className="text-2xl font-bold text-gray-900">{totalPosts}</p>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <p className="text-sm text-gray-600">Pinned Threads</p>
          <p className="text-2xl font-bold text-gray-900">
            {threads.filter(t => t.isPinned).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <p className="text-sm text-gray-600">Avg Posts/Thread</p>
          <p className="text-2xl font-bold text-gray-900">
            {totalCount > 0 ? (totalPosts / totalCount).toFixed(1) : 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-4">
        <div className="flex space-x-2">
          <Link
            href="/admin/community"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              !params.filter
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Threads
          </Link>
          <Link
            href="/admin/community?filter=pinned"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              params.filter === 'pinned'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pinned
          </Link>
        </div>
      </div>

      {/* Threads Table */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Thread
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Author
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Engagement
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Status
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
            {threads.map((thread) => (
              <tr key={thread.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiMessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <Link 
                          href={`/community/${thread.slug || thread.id}`}
                          className="font-semibold text-gray-900 line-clamp-1 hover:text-primary-600 transition-colors"
                          target="_blank"
                        >
                          {thread.title}
                        </Link>
                        <FiExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-1">{thread.category}</p>
                      {thread.slug && (
                        <p className="text-xs text-gray-400 mt-1 font-mono">/{thread.slug}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{thread.author.name}</p>
                    <p className="text-sm text-gray-500">{thread.author.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="flex items-center space-x-1 text-blue-600">
                      <FiMessageSquare className="w-4 h-4" />
                      <span className="font-semibold">{thread._count.posts}</span>
                      <span className="text-gray-500">replies</span>
                    </span>
                    <span className="flex items-center space-x-1 text-gray-600">
                      <FiEye className="w-4 h-4" />
                      <span className="font-semibold">{thread.views}</span>
                      <span className="text-gray-500">views</span>
                    </span>
                    <span className="flex items-center space-x-1 text-green-600">
                      <FiThumbsUp className="w-4 h-4" />
                      <span className="font-semibold">{thread.upvotes}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-red-600">
                      <FiThumbsDown className="w-4 h-4" />
                      <span className="font-semibold">{thread.downvotes}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-pink-600">
                      <FiHeart className="w-4 h-4" />
                      <span className="font-semibold">{thread.likes}</span>
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {thread.isPinned && (
                      <span className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium">
                        <FiBookmark className="w-3 h-3" />
                        <span>Pinned</span>
                      </span>
                    )}
                    {thread.isLocked && (
                      <span className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium">
                        <FiLock className="w-3 h-3" />
                        <span>Locked</span>
                      </span>
                    )}
                    {!thread.isPinned && !thread.isLocked && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                        Active
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {format(new Date(thread.createdAt), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4">
                  <CommunityModerationActions 
                    threadId={thread.id} 
                    isPinned={thread.isPinned} 
                    isSuperAdmin={isSuperAdmin} 
                  />
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
              href={`/admin/community?page=${p}${params.filter ? `&filter=${params.filter}` : ''}`}
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
