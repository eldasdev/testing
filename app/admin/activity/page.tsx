import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { FiActivity, FiUser, FiBriefcase, FiFileText, FiMessageSquare, FiUserPlus } from 'react-icons/fi'

export default async function ActivityLogsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect('/admin')
  }

  // Get recent activities from various models
  const [recentUsers, recentJobs, recentApplications, recentThreads, recentPosts] = await Promise.all([
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.jobPost.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, company: true, createdAt: true },
    }),
    prisma.application.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        jobPost: { select: { title: true } },
        internship: { select: { title: true } },
      },
    }),
    prisma.communityThread.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } } },
    }),
    prisma.communityPost.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } }, thread: { select: { title: true } } },
    }),
  ])

  // Combine and sort all activities
  const activities = [
    ...recentUsers.map(u => ({
      type: 'user_registered',
      icon: FiUserPlus,
      color: 'bg-blue-500',
      title: `New user registered`,
      description: `${u.name} (${u.email}) joined as ${u.role}`,
      timestamp: u.createdAt,
    })),
    ...recentJobs.map(j => ({
      type: 'job_posted',
      icon: FiBriefcase,
      color: 'bg-green-500',
      title: `New job posted`,
      description: `${j.title} at ${j.company}`,
      timestamp: j.createdAt,
    })),
    ...recentApplications
      .filter(a => a.user && (a.jobPost || a.internship)) // Filter out applications with null user or both jobPost and internship
      .map(a => ({
        type: 'application_submitted',
        icon: FiFileText,
        color: 'bg-purple-500',
        title: `Application submitted`,
        description: `${a.user.name} applied for ${a.jobPost?.title || a.internship?.title || 'Unknown Position'}`,
        timestamp: a.createdAt,
      })),
    ...recentThreads.map(t => ({
      type: 'thread_created',
      icon: FiMessageSquare,
      color: 'bg-orange-500',
      title: `New thread created`,
      description: `${t.author.name} created "${t.title}"`,
      timestamp: t.createdAt,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 50)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
        <p className="text-gray-600 mt-1">
          Monitor all platform activities in real-time
        </p>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiUserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">New Users Today</p>
              <p className="text-2xl font-bold text-gray-900">{recentUsers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiBriefcase className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Jobs Posted</p>
              <p className="text-2xl font-bold text-gray-900">{recentJobs.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiFileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Applications</p>
              <p className="text-2xl font-bold text-gray-900">{recentApplications.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiMessageSquare className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Threads Created</p>
              <p className="text-2xl font-bold text-gray-900">{recentThreads.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <FiActivity className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        </div>

        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activity.icon
            return (
              <div
                key={index}
                className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className={`w-10 h-10 ${activity.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm text-gray-500">
                    {format(new Date(activity.timestamp), 'MMM d')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(activity.timestamp), 'h:mm a')}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
