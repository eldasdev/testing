import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import DatabaseSyncPanel from '@/components/admin/DatabaseSyncPanel'

export default async function DatabaseSyncPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect('/admin')
  }

  // Get current database stats for display
  const [
    userCount,
    jobCount,
    applicationCount,
    threadCount,
    blogCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.jobPost.count(),
    prisma.application.count(),
    prisma.communityThread.count(),
    prisma.blogPost.count(),
  ])

  const stats = {
    users: userCount,
    jobs: jobCount,
    applications: applicationCount,
    threads: threadCount,
    blogPosts: blogCount,
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Database Synchronization</h1>
        <p className="text-gray-600 mt-2 text-sm md:text-base">
          Synchronize database connections, refresh indexes, and perform maintenance tasks
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-2xl p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">What is Database Sync?</h3>
            <p className="text-gray-700 text-sm md:text-base leading-relaxed">
              Database synchronization ensures your database is properly connected, indexes are up-to-date, 
              and all cached data is refreshed. This is useful when:
            </p>
            <ul className="mt-3 space-y-2 text-sm md:text-base text-gray-700">
              <li className="flex items-start">
                <span className="text-cyan-600 mr-2">•</span>
                <span>After database migrations or schema changes</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-600 mr-2">•</span>
                <span>When experiencing connection issues or slow queries</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-600 mr-2">•</span>
                <span>To refresh database statistics and optimize performance</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-600 mr-2">•</span>
                <span>After bulk data imports or external data updates</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Current Database Stats */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Current Database Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Users</p>
            <p className="text-2xl font-bold text-gray-900">{stats.users.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Jobs</p>
            <p className="text-2xl font-bold text-gray-900">{stats.jobs.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Applications</p>
            <p className="text-2xl font-bold text-gray-900">{stats.applications.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Threads</p>
            <p className="text-2xl font-bold text-gray-900">{stats.threads.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-pink-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Blog Posts</p>
            <p className="text-2xl font-bold text-gray-900">{stats.blogPosts.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Sync Panel */}
      <DatabaseSyncPanel />
    </div>
  )
}
