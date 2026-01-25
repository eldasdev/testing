import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import AdminStatsGrid from '@/components/admin/AdminStatsGrid'
import RecentActivityFeed from '@/components/admin/RecentActivityFeed'
import QuickActionsPanel from '@/components/admin/QuickActionsPanel'
import UserGrowthChart from '@/components/admin/UserGrowthChart'
import TopPerformers from '@/components/admin/TopPerformers'
import ReportIssueButton from '@/components/ReportIssueButton'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  const isSuperAdmin = session?.user.role === 'SUPER_ADMIN'

  // Fetch comprehensive stats
  const [
    totalUsers,
    totalStudents,
    totalCompanies,
    totalMentors,
    totalJobs,
    activeJobs,
    totalApplications,
    pendingApplications,
    totalThreads,
    totalBlogPosts,
    recentUsers,
    recentJobs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'COMPANY' } }),
    prisma.user.count({ where: { role: 'MENTOR' } }),
    prisma.jobPost.count(),
    prisma.jobPost.count({ where: { isActive: true } }),
    prisma.application.count(),
    prisma.application.count({ where: { status: 'PENDING' } }),
    prisma.communityThread.count(),
    prisma.blogPost.count(),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.jobPost.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, company: true, createdAt: true, isActive: true },
    }),
  ])

  const stats = {
    totalUsers,
    totalStudents,
    totalCompanies,
    totalMentors,
    totalJobs,
    activeJobs,
    totalApplications,
    pendingApplications,
    totalThreads,
    totalBlogPosts,
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Welcome back, <span className="font-semibold text-gray-900">{session?.user.name}</span>. Here's your platform overview.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ReportIssueButton variant="icon" />
          <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
            isSuperAdmin 
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
              : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
          }`}>
            {isSuperAdmin ? 'Super Admin' : 'Admin'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <AdminStatsGrid stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          <UserGrowthChart totalUsers={totalUsers} />
          <RecentActivityFeed recentUsers={recentUsers} recentJobs={recentJobs} />
        </div>

        {/* Right Column - Quick Actions & Top Performers */}
        <div className="space-y-6">
          <QuickActionsPanel isSuperAdmin={isSuperAdmin} />
          <TopPerformers />
        </div>
      </div>
    </div>
  )
}
