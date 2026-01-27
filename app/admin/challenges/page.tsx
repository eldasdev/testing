import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { format } from 'date-fns'
import { FiTarget, FiPlus, FiEdit2, FiEye, FiUsers, FiCalendar, FiAward } from 'react-icons/fi'
import ChallengeDeleteButton from '@/components/admin/ChallengeDeleteButton'

export default async function ChallengesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const session = await getServerSession(authOptions)
  const isSuperAdmin = session?.user.role === 'SUPER_ADMIN'
  
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const where: any = {}
  
  if (params.status === 'active') {
    where.isActive = true
    where.isPublic = true
    const now = new Date()
    where.OR = [
      { startDate: null },
      { startDate: { lte: now } },
    ]
    where.OR.push(
      { endDate: null },
      { endDate: { gte: now } },
    )
  } else if (params.status === 'upcoming') {
    where.isActive = true
    where.startDate = { gt: new Date() }
  } else if (params.status === 'completed') {
    where.endDate = { lt: new Date() }
  }

  const [challenges, totalCount, activeCount, distinctUsers, completedCount] = await Promise.all([
    prisma.challenge.findMany({
      where,
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.challenge.count({ where }),
    prisma.challenge.count({
      where: {
        isActive: true,
        isPublic: true,
      },
    }),
    prisma.practiceSubmission.findMany({
      select: {
        userId: true,
      },
      distinct: ['userId'],
    }),
    prisma.practiceSubmission.count({
      where: {
        score: {
          not: null,
        },
      },
    }),
  ])

  const participantsCount = distinctUsers.length

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Challenges Management</h1>
          <p className="text-gray-600 mt-1">
            Manage coding challenges and competitions ({totalCount} total)
          </p>
        </div>
        <Link
          href="/admin/challenges/new"
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all"
        >
          <FiPlus className="w-4 h-4" />
          <span>Create Challenge</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
              <FiTarget className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Challenges</p>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
              <FiCalendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Challenges</p>
              <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <FiUsers className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Participants</p>
              <p className="text-2xl font-bold text-gray-900">{participantsCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
              <FiAward className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-4">
        <div className="flex space-x-2">
          <Link
            href="/admin/challenges"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              !params.status
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Challenges
          </Link>
          <Link
            href="/admin/challenges?status=active"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              params.status === 'active'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active
          </Link>
          <Link
            href="/admin/challenges?status=upcoming"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              params.status === 'upcoming'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Upcoming
          </Link>
          <Link
            href="/admin/challenges?status=completed"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              params.status === 'completed'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed
          </Link>
        </div>
      </div>

      {/* Challenges Table */}
      {challenges.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Challenge
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Difficulty
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Participants
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
              {challenges.map((challenge) => (
                <tr key={challenge.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                        <FiTarget className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 line-clamp-1">{challenge.title}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{challenge.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium capitalize ${
                      challenge.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      challenge.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      challenge.difficulty === 'hard' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {challenge.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <FiUsers className="w-4 h-4" />
                      <span>{challenge._count.submissions}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      challenge.isActive && challenge.isPublic ? 'bg-green-100 text-green-700' :
                      !challenge.isActive ? 'bg-gray-100 text-gray-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {challenge.isActive && challenge.isPublic ? 'Active' :
                       !challenge.isActive ? 'Inactive' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {format(challenge.createdAt, 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/admin/challenges/${challenge.id}`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View"
                      >
                        <FiEye className="w-4 h-4 text-gray-600" />
                      </Link>
                      <Link
                        href={`/admin/challenges/${challenge.id}/edit`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 className="w-4 h-4 text-gray-600" />
                      </Link>
                      {isSuperAdmin && (
                        <ChallengeDeleteButton challengeId={challenge.id} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiTarget className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Challenges Yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first coding challenge or competition.
          </p>
          <Link
            href="/admin/challenges/new"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all"
          >
            <FiPlus className="w-5 h-5" />
            <span>Create First Challenge</span>
          </Link>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/challenges?page=${p}${params.status ? `&status=${params.status}` : ''}`}
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
