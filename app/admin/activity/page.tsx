import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { 
  FiActivity, 
  FiUser, 
  FiBriefcase, 
  FiFileText, 
  FiMessageSquare, 
  FiUserPlus,
  FiLogIn,
  FiLogOut,
  FiEdit2,
  FiTrash2,
  FiTarget,
  FiCheckCircle,
  FiXCircle,
  FiRotateCw,
  FiDownload,
  FiSearch,
  FiFilter
} from 'react-icons/fi'
import Link from 'next/link'

export default async function ActivityLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    action?: string
    actionType?: string
    entityType?: string
    userId?: string
    page?: string
    search?: string
  }>
}) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect('/admin')
  }

  const params = await searchParams
  const page = parseInt(params.page || '1')
  const pageSize = 50
  const skip = (page - 1) * pageSize

  const where: any = {}

  if (params.action) {
    where.action = { contains: params.action, mode: 'insensitive' }
  }

  if (params.actionType) {
    where.actionType = params.actionType
  }

  if (params.entityType) {
    where.entityType = params.entityType
  }

  if (params.userId) {
    where.userId = params.userId
  }

  if (params.search) {
    where.OR = [
      { description: { contains: params.search, mode: 'insensitive' } },
      { action: { contains: params.search, mode: 'insensitive' } },
    ]
  }

  const [activities, totalCount, actionTypeCounts, entityTypeCounts, recentUsers] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.activityLog.count({ where }),
    prisma.activityLog.groupBy({
      by: ['actionType'],
      _count: { actionType: true },
    }),
    prisma.activityLog.groupBy({
      by: ['entityType'],
      _count: { entityType: true },
    }),
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true },
    }),
  ])

  const totalPages = Math.ceil(totalCount / pageSize)

  const getActionIcon = (action: string, actionType: string) => {
    if (action.includes('login')) return FiLogIn
    if (action.includes('logout')) return FiLogOut
    if (action.includes('register') || action.includes('created') && action.includes('user')) return FiUserPlus
    if (action.includes('deleted')) return FiTrash2
    if (action.includes('updated') || action.includes('edit')) return FiEdit2
    if (action.includes('restore')) return FiRotateCw
    if (action.includes('export')) return FiDownload
    if (action.includes('job')) return FiBriefcase
    if (action.includes('application')) return FiFileText
    if (action.includes('thread') || action.includes('post')) return FiMessageSquare
    if (action.includes('challenge')) return FiTarget
    if (action.includes('accept')) return FiCheckCircle
    if (action.includes('reject')) return FiXCircle
    return FiActivity
  }

  const getActionColor = (actionType: string) => {
    const colors: Record<string, string> = {
      CREATE: 'bg-green-500',
      UPDATE: 'bg-blue-500',
      DELETE: 'bg-red-500',
      VIEW: 'bg-gray-500',
      LOGIN: 'bg-purple-500',
      LOGOUT: 'bg-orange-500',
      RESTORE: 'bg-cyan-500',
      EXPORT: 'bg-indigo-500',
      IMPORT: 'bg-teal-500',
      OTHER: 'bg-gray-500',
    }
    return colors[actionType] || 'bg-gray-500'
  }

  const actionTypes = ['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT', 'RESTORE', 'EXPORT']
  const entityTypes = ['User', 'JobPost', 'Application', 'Challenge', 'BlogPost', 'CommunityThread', 'CommunityPost', 'Mentor']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
        <p className="text-gray-600 mt-1">
          Comprehensive audit trail of all platform activities ({totalCount} total)
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiActivity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiUserPlus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today's Activities</p>
              <p className="text-2xl font-bold text-gray-900">
                {await prisma.activityLog.count({
                  where: {
                    createdAt: {
                      gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                  },
                })}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiLogIn className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Unique Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {await prisma.activityLog.findMany({
                  select: { userId: true },
                  distinct: ['userId'],
                }).then(results => results.filter(r => r.userId).length)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiBriefcase className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Action Types</p>
              <p className="text-2xl font-bold text-gray-900">{actionTypeCounts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <form method="get" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="search"
                  defaultValue={params.search || ''}
                  placeholder="Search activities..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action Type
              </label>
              <select
                name="actionType"
                defaultValue={params.actionType || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                {actionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entity Type
              </label>
              <select
                name="entityType"
                defaultValue={params.entityType || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Entities</option>
                {entityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all"
              >
                <FiFilter className="w-4 h-4 inline mr-2" />
                Apply Filters
              </button>
            </div>
          </div>

          {(params.search || params.actionType || params.entityType) && (
            <div className="flex items-center space-x-2">
              <Link
                href="/admin/activity"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Clear all filters
              </Link>
            </div>
          )}
        </form>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <FiActivity className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Activity Timeline</h2>
          </div>
          <div className="text-sm text-gray-500">
            Showing {skip + 1}-{Math.min(skip + pageSize, totalCount)} of {totalCount}
          </div>
        </div>

        <div className="space-y-3">
          {activities.length > 0 ? (
            activities.map((activity) => {
              const Icon = getActionIcon(activity.action, activity.actionType)
              const color = getActionColor(activity.actionType)
              const metadata = activity.metadata as Record<string, any> | null

              return (
                <div
                  key={activity.id}
                  className={`flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border-l-4 ${color.replace('bg-', 'border-')}`}
                >
                  <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">
                          {activity.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${color} text-white`}>
                            {activity.actionType}
                          </span>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700">
                            {activity.entityType}
                          </span>
                          {activity.action && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                              {activity.action}
                            </span>
                          )}
                        </div>
                        {metadata && Object.keys(metadata).length > 0 && (
                          <div className="mt-2 text-xs text-gray-500">
                            {Object.entries(metadata).slice(0, 3).map(([key, value]) => (
                              <span key={key} className="mr-3">
                                <strong>{key}:</strong> {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm text-gray-500">
                          {format(activity.createdAt, 'MMM d, yyyy')}
                        </p>
                        <p className="text-xs text-gray-400">
                          {format(activity.createdAt, 'h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      {activity.user && (
                        <div className="flex items-center space-x-1">
                          <FiUser className="w-3 h-3" />
                          <span>{activity.user.name} ({activity.user.role})</span>
                        </div>
                      )}
                      {activity.ipAddress && (
                        <div className="flex items-center space-x-1">
                          <span>IP: {activity.ipAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-12">
              <FiActivity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No activities found matching your filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => {
            const searchParams = new URLSearchParams()
            if (params.search) searchParams.set('search', params.search)
            if (params.actionType) searchParams.set('actionType', params.actionType)
            if (params.entityType) searchParams.set('entityType', params.entityType)
            if (params.userId) searchParams.set('userId', params.userId)
            if (p > 1) searchParams.set('page', p.toString())

            return (
              <Link
                key={p}
                href={`/admin/activity${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
                className={`px-4 py-2 rounded-lg ${
                  p === page
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
