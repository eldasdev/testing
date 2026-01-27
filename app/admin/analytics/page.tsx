import { prisma } from '@/lib/prisma'
import { FiTrendingUp, FiTrendingDown, FiUsers, FiBriefcase, FiFileText, FiActivity, FiAward, FiMessageSquare, FiTarget, FiCalendar } from 'react-icons/fi'
import AnalyticsChart from '@/components/admin/AnalyticsChart'
import LineChart from '@/components/admin/LineChart'
import BarChart from '@/components/admin/BarChart'

export default async function AnalyticsPage() {
  // Get current date and calculate date ranges
  const now = new Date()
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    totalUsers,
    totalJobs,
    totalApplications,
    totalSkills,
    totalThreads,
    totalPosts,
    totalBlogPosts,
    totalChallenges,
    usersByRole,
    applicationsByStatus,
    jobsByType,
    jobsByExperienceLevel,
    recentUsers,
    recentJobs,
    recentApplications,
    monthlyUserGrowth,
    monthlyJobGrowth,
    monthlyApplicationGrowth,
    topCompanies,
    topSkills,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.jobPost.count(),
    prisma.application.count(),
    prisma.skillCatalog.count(),
    prisma.communityThread.count(),
    prisma.communityPost.count(),
    prisma.blogPost.count(),
    prisma.practiceSubmission.count(),
    prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    }),
    prisma.application.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    prisma.jobPost.groupBy({
      by: ['type'],
      _count: { type: true },
    }),
    prisma.jobPost.groupBy({
      by: ['experienceLevel'],
      _count: { experienceLevel: true },
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.jobPost.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        company: true,
        type: true,
        createdAt: true,
        _count: {
          select: { applications: true },
        },
      },
    }),
    prisma.application.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
        jobPost: {
          select: { title: true, company: true },
        },
      },
    }),
    // Monthly growth data (last 6 months)
    (async () => {
      const months = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
        const count = await prisma.user.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextMonth,
            },
          },
        })
        months.push({
          label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          value: count,
        })
      }
      return months
    })(),
    (async () => {
      const months = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
        const count = await prisma.jobPost.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextMonth,
            },
          },
        })
        months.push({
          label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          value: count,
        })
      }
      return months
    })(),
    (async () => {
      const months = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
        const count = await prisma.application.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextMonth,
            },
          },
        })
        months.push({
          label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          value: count,
        })
      }
      return months
    })(),
    // Top companies by job posts
    prisma.jobPost.groupBy({
      by: ['company'],
      _count: { company: true },
      orderBy: { _count: { company: 'desc' } },
      take: 5,
    }),
    // Top skills
    prisma.userSkill.groupBy({
      by: ['name'],
      _count: { name: true },
      orderBy: { _count: { name: 'desc' } },
      take: 10,
    }),
  ])

  const roleData = usersByRole.reduce((acc: any, item) => {
    acc[item.role] = item._count.role
    return acc
  }, {})

  const statusData = applicationsByStatus.reduce((acc: any, item) => {
    acc[item.status] = item._count.status
    return acc
  }, {})

  const typeData = jobsByType.reduce((acc: any, item) => {
    acc[item.type] = item._count.type
    return acc
  }, {})

  const experienceData = jobsByExperienceLevel.reduce((acc: any, item) => {
    acc[item.experienceLevel] = item._count.experienceLevel
    return acc
  }, {})

  // Calculate growth percentages
  const usersLast30Days = await prisma.user.count({
    where: { createdAt: { gte: last30Days } },
  })
  const usersPrevious30Days = await prisma.user.count({
    where: {
      createdAt: {
        gte: new Date(last30Days.getTime() - 30 * 24 * 60 * 60 * 1000),
        lt: last30Days,
      },
    },
  })
  const userGrowth = usersPrevious30Days > 0
    ? ((usersLast30Days - usersPrevious30Days) / usersPrevious30Days * 100).toFixed(1)
    : '0.0'

  const jobsLast30Days = await prisma.jobPost.count({
    where: { createdAt: { gte: last30Days } },
  })
  const jobsPrevious30Days = await prisma.jobPost.count({
    where: {
      createdAt: {
        gte: new Date(last30Days.getTime() - 30 * 24 * 60 * 60 * 1000),
        lt: last30Days,
      },
    },
  })
  const jobGrowth = jobsPrevious30Days > 0
    ? ((jobsLast30Days - jobsPrevious30Days) / jobsPrevious30Days * 100).toFixed(1)
    : '0.0'

  const applicationsLast30Days = await prisma.application.count({
    where: { createdAt: { gte: last30Days } },
  })
  const applicationsPrevious30Days = await prisma.application.count({
    where: {
      createdAt: {
        gte: new Date(last30Days.getTime() - 30 * 24 * 60 * 60 * 1000),
        lt: last30Days,
      },
    },
  })
  const applicationGrowth = applicationsPrevious30Days > 0
    ? ((applicationsLast30Days - applicationsPrevious30Days) / applicationsPrevious30Days * 100).toFixed(1)
    : '0.0'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Comprehensive platform statistics and insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className={`flex items-center space-x-1 mt-4 ${parseFloat(userGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {parseFloat(userGrowth) >= 0 ? (
              <FiTrendingUp className="w-4 h-4" />
            ) : (
              <FiTrendingDown className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{userGrowth}%</span>
            <span className="text-sm text-gray-500">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Total Jobs</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalJobs}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FiBriefcase className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className={`flex items-center space-x-1 mt-4 ${parseFloat(jobGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {parseFloat(jobGrowth) >= 0 ? (
              <FiTrendingUp className="w-4 h-4" />
            ) : (
              <FiTrendingDown className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{jobGrowth}%</span>
            <span className="text-sm text-gray-500">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Applications</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalApplications}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FiFileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className={`flex items-center space-x-1 mt-4 ${parseFloat(applicationGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {parseFloat(applicationGrowth) >= 0 ? (
              <FiTrendingUp className="w-4 h-4" />
            ) : (
              <FiTrendingDown className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{applicationGrowth}%</span>
            <span className="text-sm text-gray-500">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {totalApplications > 0 
                  ? ((statusData.ACCEPTED || 0) / totalApplications * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <FiActivity className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center space-x-1 mt-4 text-gray-500">
            <span className="text-sm">{(statusData.ACCEPTED || 0)} accepted</span>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <FiAward className="w-5 h-5 text-blue-600" />
            <p className="text-xs text-gray-600">Skills</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalSkills}</p>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <FiMessageSquare className="w-5 h-5 text-purple-600" />
            <p className="text-xs text-gray-600">Threads</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalThreads}</p>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <FiFileText className="w-5 h-5 text-green-600" />
            <p className="text-xs text-gray-600">Posts</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalPosts}</p>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <FiFileText className="w-5 h-5 text-orange-600" />
            <p className="text-xs text-gray-600">Blog Posts</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalBlogPosts}</p>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <FiTarget className="w-5 h-5 text-red-600" />
            <p className="text-xs text-gray-600">Challenges</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalChallenges}</p>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <FiCalendar className="w-5 h-5 text-indigo-600" />
            <p className="text-xs text-gray-600">Active Jobs</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {await prisma.jobPost.count({ where: { isActive: true } })}
          </p>
        </div>
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LineChart
          data={monthlyUserGrowth}
          title="User Growth (Last 6 Months)"
          color="#3b82f6"
        />
        <LineChart
          data={monthlyJobGrowth}
          title="Job Post Growth (Last 6 Months)"
          color="#22c55e"
        />
        <LineChart
          data={monthlyApplicationGrowth}
          title="Application Growth (Last 6 Months)"
          color="#a855f7"
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart title="Users by Role" data={roleData} type="users" />
        <AnalyticsChart title="Applications by Status" data={statusData} type="applications" />
      </div>

      {/* Job Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          title="Jobs by Type"
          data={Object.entries(typeData).map(([key, value]) => ({
            label: key.replace('_', ' '),
            value: value as number,
            color: key === 'FULL_TIME' ? '#22c55e' : key === 'PART_TIME' ? '#3b82f6' : key === 'INTERNSHIP' ? '#a855f7' : '#f97316',
          }))}
        />
        <BarChart
          title="Jobs by Experience Level"
          data={Object.entries(experienceData).map(([key, value]) => ({
            label: key,
            value: value as number,
            color: key === 'ENTRY' ? '#3b82f6' : key === 'JUNIOR' ? '#22c55e' : key === 'MID' ? '#f97316' : '#a855f7',
          }))}
        />
      </div>

      {/* Top Companies and Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top Companies by Job Posts</h2>
          <div className="space-y-3">
            {topCompanies.map((company, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-600">{index + 1}</span>
                  </div>
                  <span className="font-medium text-gray-900">{company.company}</span>
                </div>
                <span className="text-sm font-bold text-gray-700">{company._count.company} jobs</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top Skills</h2>
          <div className="space-y-3">
            {topSkills.map((skill, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiAward className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900">{skill.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-700">{skill._count.name} users</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Users</h2>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Jobs</h2>
          <div className="space-y-3">
            {recentJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{job.title}</p>
                  <p className="text-xs text-gray-500">{job.company}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-primary-600">{job._count.applications} apps</p>
                  <p className="text-xs text-gray-400">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Applications</h2>
          <div className="space-y-3">
            {recentApplications.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{app.user.name}</p>
                  <p className="text-xs text-gray-500">{app.jobPost?.title || 'Unknown Position'}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  app.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                  app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  app.status === 'REVIEWED' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
