import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { format } from 'date-fns'
import { FiUserCheck, FiMail, FiMapPin, FiCalendar, FiAward, FiMessageSquare } from 'react-icons/fi'
import MentorsManagementActions from '@/components/admin/MentorsManagementActions'

export default async function MentorsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const session = await getServerSession(authOptions)
  const isSuperAdmin = session?.user.role === 'SUPER_ADMIN'
  
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const where: any = {
    role: 'MENTOR'
  }
  
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { email: { contains: params.search, mode: 'insensitive' } },
      { bio: { contains: params.search, mode: 'insensitive' } },
    ]
  }

  const [mentors, totalCount, totalMentors, activeMentors] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        location: true,
        image: true,
        createdAt: true,
        profile: {
          select: {
            linkedinUrl: true,
            githubUrl: true,
            portfolioUrl: true,
          },
        },
        _count: {
          select: {
            threads: true,
            posts: true,
            roadmaps: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.user.count({ where }),
    prisma.user.count({ where: { role: 'MENTOR' } }),
    prisma.user.count({ 
      where: { 
        role: 'MENTOR',
        threads: {
          some: {}
        }
      } 
    }),
  ])

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mentors Management</h1>
          <p className="text-gray-600 mt-1">
            Manage mentors and their profiles ({totalCount} total)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/mentors/new"
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all"
          >
            <FiUserCheck className="w-4 h-4" />
            <span>Add Mentor</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <FiUserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Mentors</p>
              <p className="text-2xl font-bold text-gray-900">{totalMentors}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
              <FiAward className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Mentors</p>
              <p className="text-2xl font-bold text-gray-900">{activeMentors}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
              <FiMessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">
                {mentors.reduce((sum, m) => sum + m._count.posts, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
              <FiCalendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Engagement</p>
              <p className="text-2xl font-bold text-gray-900">
                {mentors.length > 0 
                  ? Math.round(mentors.reduce((sum, m) => sum + m._count.threads + m._count.posts, 0) / mentors.length)
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-4">
        <form method="get" className="flex space-x-2">
          <input
            type="text"
            name="search"
            placeholder="Search mentors by name, email, or bio..."
            defaultValue={params.search || ''}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all"
          >
            Search
          </button>
          {params.search && (
            <Link
              href="/admin/mentors"
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Mentors Table */}
      {mentors.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Mentor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Engagement
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Joined
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mentors.map((mentor) => (
                <tr key={mentor.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        {mentor.image ? (
                          <img 
                            src={mentor.image} 
                            alt={mentor.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <FiUserCheck className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 line-clamp-1">{mentor.name}</p>
                        {mentor.bio && (
                          <p className="text-sm text-gray-500 line-clamp-1 mt-1">{mentor.bio}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          {mentor.profile?.linkedinUrl && (
                            <a
                              href={mentor.profile.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-xs"
                            >
                              LinkedIn
                            </a>
                          )}
                          {mentor.profile?.githubUrl && (
                            <a
                              href={mentor.profile.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-700 text-xs"
                            >
                              GitHub
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <FiMail className="w-4 h-4" />
                      <span className="truncate max-w-[200px]">{mentor.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {mentor.location ? (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FiMapPin className="w-4 h-4" />
                        <span>{mentor.location}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Not specified</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1 text-sm">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <FiMessageSquare className="w-4 h-4" />
                        <span>{mentor._count.threads} threads</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <FiMessageSquare className="w-4 h-4" />
                        <span>{mentor._count.posts} posts</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <FiAward className="w-4 h-4" />
                        <span>{mentor._count.roadmaps} roadmaps</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {format(new Date(mentor.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <MentorsManagementActions mentorId={mentor.id} mentorEmail={mentor.email} isSuperAdmin={isSuperAdmin} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUserCheck className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Mentors Found</h3>
          <p className="text-gray-600 mb-6">
            {params.search 
              ? 'Try adjusting your search criteria.'
              : 'Get started by adding your first mentor to the platform.'}
          </p>
          {!params.search && (
            <Link
              href="/admin/mentors/new"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all"
            >
              <FiUserCheck className="w-5 h-5" />
              <span>Add First Mentor</span>
            </Link>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/mentors?page=${p}${params.search ? `&search=${encodeURIComponent(params.search)}` : ''}`}
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
