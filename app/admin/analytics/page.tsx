import { prisma } from '@/lib/prisma'
import { FiTrendingUp, FiTrendingDown, FiUsers, FiBriefcase, FiFileText, FiActivity } from 'react-icons/fi'
import AnalyticsChart from '@/components/admin/AnalyticsChart'

export default async function AnalyticsPage() {
  const [
    totalUsers,
    totalJobs,
    totalApplications,
    usersByRole,
    applicationsByStatus,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.jobPost.count(),
    prisma.application.count(),
    prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    }),
    prisma.application.groupBy({
      by: ['status'],
      _count: { status: true },
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">
          Platform performance and insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
          <div className="flex items-center space-x-1 mt-4 text-green-600">
            <FiTrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">+12.5%</span>
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
          <div className="flex items-center space-x-1 mt-4 text-green-600">
            <FiTrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">+8.3%</span>
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
          <div className="flex items-center space-x-1 mt-4 text-green-600">
            <FiTrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">+24.1%</span>
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
          <div className="flex items-center space-x-1 mt-4 text-red-600">
            <FiTrendingDown className="w-4 h-4" />
            <span className="text-sm font-medium">-2.4%</span>
            <span className="text-sm text-gray-500">vs last month</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart title="Users by Role" data={roleData} type="users" />
        <AnalyticsChart title="Applications by Status" data={statusData} type="applications" />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">User Distribution</h2>
          <div className="space-y-4">
            {[
              { label: 'Students', value: roleData.STUDENT || 0, color: 'bg-blue-500' },
              { label: 'Companies', value: roleData.COMPANY || 0, color: 'bg-green-500' },
              { label: 'Mentors', value: roleData.MENTOR || 0, color: 'bg-purple-500' },
              { label: 'Admins', value: (roleData.ADMIN || 0) + (roleData.SUPER_ADMIN || 0), color: 'bg-red-500' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${totalUsers > 0 ? (item.value / totalUsers) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Stats */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Application Status</h2>
          <div className="space-y-4">
            {[
              { label: 'Pending', value: statusData.PENDING || 0, color: 'bg-yellow-500' },
              { label: 'Reviewed', value: statusData.REVIEWED || 0, color: 'bg-blue-500' },
              { label: 'Accepted', value: statusData.ACCEPTED || 0, color: 'bg-green-500' },
              { label: 'Rejected', value: statusData.REJECTED || 0, color: 'bg-red-500' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${totalApplications > 0 ? (item.value / totalApplications) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
