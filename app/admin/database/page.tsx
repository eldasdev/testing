import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { FiDatabase, FiHardDrive, FiServer, FiRefreshCw, FiDownload, FiUpload, FiAlertTriangle } from 'react-icons/fi'
import DatabaseActions from '@/components/admin/DatabaseActions'

export default async function DatabasePage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect('/admin')
  }

  // Get database stats
  const [
    userCount,
    jobCount,
    applicationCount,
    threadCount,
    postCount,
    blogCount,
    resumeCount,
    roadmapCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.jobPost.count(),
    prisma.application.count(),
    prisma.communityThread.count(),
    prisma.communityPost.count(),
    prisma.blogPost.count(),
    prisma.resume.count(),
    prisma.careerRoadmap.count(),
  ])

  const tables = [
    { name: 'Users', count: userCount, icon: '👤' },
    { name: 'Job Posts', count: jobCount, icon: '💼' },
    { name: 'Applications', count: applicationCount, icon: '📄' },
    { name: 'Community Threads', count: threadCount, icon: '💬' },
    { name: 'Community Posts', count: postCount, icon: '📝' },
    { name: 'Blog Posts', count: blogCount, icon: '📰' },
    { name: 'Resumes', count: resumeCount, icon: '📋' },
    { name: 'Career Roadmaps', count: roadmapCount, icon: '🗺️' },
  ]

  const totalRecords = tables.reduce((acc, t) => acc + t.count, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Database Management</h1>
        <p className="text-gray-600 mt-1">
          Monitor and manage database resources
        </p>
      </div>

      {/* Database Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FiDatabase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-cyan-100 text-sm">Total Records</p>
              <p className="text-3xl font-bold">{totalRecords.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-cyan-100 text-sm">Across {tables.length} tables</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FiServer className="w-6 h-6" />
            </div>
            <div>
              <p className="text-green-100 text-sm">Database Status</p>
              <p className="text-3xl font-bold">Healthy</p>
            </div>
          </div>
          <p className="text-green-100 text-sm">PostgreSQL connected</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FiHardDrive className="w-6 h-6" />
            </div>
            <div>
              <p className="text-purple-100 text-sm">Last Backup</p>
              <p className="text-3xl font-bold">Today</p>
            </div>
          </div>
          <p className="text-purple-100 text-sm">Auto-backup enabled</p>
        </div>
      </div>

      {/* Tables Overview */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Database Tables</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tables.map((table, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{table.icon}</span>
                <span className="font-semibold text-gray-900">{table.name}</span>
              </div>
              <p className="text-2xl font-bold text-primary-600">
                {table.count.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">records</p>
            </div>
          ))}
        </div>
      </div>

      {/* Database Actions */}
      <DatabaseActions />

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FiAlertTriangle className="w-5 h-5 text-red-500" />
          <h2 className="text-xl font-bold text-red-700">Danger Zone</h2>
        </div>
        <p className="text-red-600 mb-6">
          These actions are irreversible. Please proceed with extreme caution.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-xl border border-red-200">
            <h3 className="font-semibold text-gray-900 mb-2">Reset All Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Delete all records except admin accounts. This cannot be undone.
            </p>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm">
              Reset Database
            </button>
          </div>
          <div className="p-4 bg-white rounded-xl border border-red-200">
            <h3 className="font-semibold text-gray-900 mb-2">Run Migrations</h3>
            <p className="text-sm text-gray-600 mb-4">
              Apply pending database migrations. Make sure to backup first.
            </p>
            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all text-sm">
              Run Migrations
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
