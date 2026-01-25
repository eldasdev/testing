import { FiUsers, FiBriefcase, FiFileText, FiMessageSquare, FiTrendingUp, FiCheckCircle } from 'react-icons/fi'

interface Stats {
  totalUsers: number
  totalStudents: number
  totalCompanies: number
  totalMentors: number
  totalJobs: number
  activeJobs: number
  totalApplications: number
  pendingApplications: number
  totalThreads: number
  totalBlogPosts: number
}

interface AdminStatsGridProps {
  stats: Stats
}

export default function AdminStatsGrid({ stats }: AdminStatsGridProps) {
  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      subLabel: `${stats.totalStudents} ${stats.totalStudents === 1 ? 'student' : 'students'}, ${stats.totalCompanies} ${stats.totalCompanies === 1 ? 'company' : 'companies'}`,
      icon: FiUsers,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Job Posts',
      value: stats.totalJobs,
      subLabel: `${stats.activeJobs} ${stats.activeJobs === 1 ? 'active' : 'active'}`,
      icon: FiBriefcase,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Applications',
      value: stats.totalApplications,
      subLabel: `${stats.pendingApplications} ${stats.pendingApplications === 1 ? 'pending' : 'pending'} review`,
      icon: FiFileText,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Community Threads',
      value: stats.totalThreads,
      subLabel: `${stats.totalThreads} ${stats.totalThreads === 1 ? 'thread' : 'threads'}`,
      icon: FiMessageSquare,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className={`${stat.bgColor} rounded-2xl p-5 md:p-6 relative overflow-hidden border border-white/50 shadow-soft hover:shadow-soft-lg transition-all duration-300 group`}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} rounded-full -mr-8 -mt-8 opacity-20 group-hover:opacity-30 transition-opacity`} />
            <div className="relative z-10">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wide">
                {stat.label}
              </p>
              <p className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-1">
                {stat.value.toLocaleString()}
              </p>
              <p className="text-xs md:text-sm text-gray-500 mt-1">{stat.subLabel}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
