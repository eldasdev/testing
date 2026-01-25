import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ExportPanel from '@/components/admin/ExportPanel'

export default async function ExportPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
    redirect('/admin')
  }

  // Get counts for export options
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

  const exportOptions = [
    { name: 'Users', count: userCount, key: 'users' },
    { name: 'Job Posts', count: jobCount, key: 'jobs' },
    { name: 'Applications', count: applicationCount, key: 'applications' },
    { name: 'Community Threads', count: threadCount, key: 'threads' },
    { name: 'Blog Posts', count: blogCount, key: 'blog' },
  ]

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Data Export</h1>
        <p className="text-gray-600 mt-2 text-sm md:text-base">
          Export platform data in various formats for backup or analysis
        </p>
      </div>

      {/* Export Panel */}
      <ExportPanel exportOptions={exportOptions} />
    </div>
  )
}
