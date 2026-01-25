import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { format } from 'date-fns'
import { FiMessageSquare, FiFlag, FiEye, FiTrash2, FiBookmark } from 'react-icons/fi'
import CommunityModerationActions from '@/components/admin/CommunityModerationActions'

export default async function CommunityModerationPage({
  searchParams,
}: {
  searchParams: { filter?: string; page?: string }
}) {
  const session = await getServerSession(authOptions)
  const isSuperAdmin = session?.user.role === 'SUPER_ADMIN'
  
  const page = parseInt(searchParams.page || '1')
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const where: any = {}
  if (searchParams.filter === 'pinned') {
    where.isPinned = true
  }

  const [threads, totalCount, totalPosts] = await Promise.all([
    prisma.communityThread.findMany({
      where,
      include: {
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
              !searchParams.filter
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Threads
          </Link>
          <Link
            href="/admin/community?filter=pinned"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              searchParams.filter === 'pinned'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pinned
          </Link>
        </div>
      </div>

      {/* Threads Table */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
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
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                      <FiMessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 line-clamp-1">{thread.title}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{thread.category}</p>
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
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center space-x-1">
                      <FiMessageSquare className="w-4 h-4 text-gray-400" />
                      <span>{thread._count.posts}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <FiEye className="w-4 h-4 text-gray-400" />
                      <span>{thread.views}</span>
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {thread.isPinned && (
                      <span className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium">
                        <FiBookmark className="w-3 h-3" />
                        <span>Pinned</span>
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
              href={`/admin/community?page=${p}${searchParams.filter ? `&filter=${searchParams.filter}` : ''}`}
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
