import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { format, differenceInDays } from 'date-fns'
import { FiTrash2, FiRotateCw, FiX, FiClock, FiUser, FiBriefcase, FiTarget, FiFileText, FiMessageSquare } from 'react-icons/fi'
import TrashBinActions from '@/components/admin/TrashBinActions'

export default async function TrashBinPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; page?: string }>
}) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect('/admin')
  }

  const params = await searchParams
  const page = parseInt(params.page || '1')
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const where: any = {
    restored: false,
    permanentlyDeleted: false,
  }

  if (params.type) {
    where.itemType = params.type
  }

  // Clean up expired items
  const now = new Date()
  await prisma.trashBin.updateMany({
    where: {
      expiresAt: { lt: now },
      permanentlyDeleted: false,
    },
    data: {
      permanentlyDeleted: true,
    },
  })

  const [items, totalCount, typeCounts] = await Promise.all([
    prisma.trashBin.findMany({
      where,
      include: {
        deletedByUser: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { deletedAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.trashBin.count({ where }),
    prisma.trashBin.groupBy({
      by: ['itemType'],
      where: {
        restored: false,
        permanentlyDeleted: false,
      },
      _count: {
        itemType: true,
      },
    }),
  ])

  const totalPages = Math.ceil(totalCount / pageSize)

  const itemTypes = [
    { value: 'all', label: 'All Items', icon: FiTrash2 },
    { value: 'User', label: 'Users', icon: FiUser },
    { value: 'JobPost', label: 'Job Posts', icon: FiBriefcase },
    { value: 'Challenge', label: 'Challenges', icon: FiTarget },
    { value: 'BlogPost', label: 'Blog Posts', icon: FiFileText },
    { value: 'CommunityThread', label: 'Threads', icon: FiMessageSquare },
  ]

  const getTypeIcon = (type: string) => {
    const itemType = itemTypes.find(t => t.value === type)
    return itemType?.icon || FiTrash2
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      User: 'bg-blue-100 text-blue-700',
      JobPost: 'bg-green-100 text-green-700',
      Challenge: 'bg-orange-100 text-orange-700',
      BlogPost: 'bg-purple-100 text-purple-700',
      CommunityThread: 'bg-indigo-100 text-indigo-700',
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trash Bin</h1>
          <p className="text-gray-600 mt-1">
            Deleted items are kept for 30 days ({totalCount} items)
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
              <FiTrash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            </div>
          </div>
        </div>
        {typeCounts.map((type) => {
          const Icon = getTypeIcon(type.itemType)
          return (
            <div key={type.itemType} className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{type.itemType}</p>
                  <p className="text-2xl font-bold text-gray-900">{type._count.itemType}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-4">
        <div className="flex flex-wrap gap-2">
          {itemTypes.map((type) => {
            const Icon = type.icon
            return (
              <a
                key={type.value}
                href={`/admin/trash${type.value === 'all' ? '' : `?type=${type.value}`}`}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  (type.value === 'all' && !params.type) || params.type === type.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{type.label}</span>
              </a>
            )
          })}
        </div>
      </div>

      {/* Trash Items Table */}
      {items.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Item
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Deleted By
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Deleted At
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Expires In
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => {
                const Icon = getTypeIcon(item.itemType)
                const itemData = item.itemData as any
                const daysUntilExpiry = differenceInDays(item.expiresAt, new Date())
                const isExpiringSoon = daysUntilExpiry <= 7

                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 ${getTypeColor(item.itemType)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 line-clamp-1">
                            {itemData?.title || itemData?.name || itemData?.email || `Item ${item.itemId.slice(0, 8)}`}
                          </p>
                          {itemData?.description && (
                            <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                              {itemData.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getTypeColor(item.itemType)}`}>
                        {item.itemType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FiUser className="w-4 h-4" />
                        <span>{item.deletedByUser.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {format(item.deletedAt, 'MMM d, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <FiClock className={`w-4 h-4 ${isExpiringSoon ? 'text-red-600' : 'text-gray-400'}`} />
                        <span className={`text-sm ${isExpiringSoon ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                          {daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : 'Expired'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <TrashBinActions itemId={item.id} itemType={item.itemType} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiTrash2 className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Trash Bin is Empty</h3>
          <p className="text-gray-600">
            {params.type 
              ? `No ${params.type} items in trash.`
              : 'No deleted items found. Deleted items are kept for 30 days.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/trash?page=${p}${params.type ? `&type=${params.type}` : ''}`}
              className={`px-4 py-2 rounded-lg ${
                p === page
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
