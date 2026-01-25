import { FiBriefcase, FiTarget, FiFileText, FiAward } from 'react-icons/fi'

interface DashboardStatsProps {
  jobCount: number
  internshipCount: number
  applicationCount: number
  skillCount: number
}

export default function DashboardStats({
  jobCount,
  internshipCount,
  applicationCount,
  skillCount,
}: DashboardStatsProps) {
  const stats = [
    {
      label: 'Available Jobs',
      value: jobCount,
      icon: FiBriefcase,
      color: 'bg-blue-500',
    },
    {
      label: 'Internships',
      value: internshipCount,
      icon: FiTarget,
      color: 'bg-green-500',
    },
    {
      label: 'My Applications',
      value: applicationCount,
      icon: FiFileText,
      color: 'bg-purple-500',
    },
    {
      label: 'Skills Added',
      value: skillCount,
      icon: FiAward,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        const gradients = [
          'from-blue-500 to-blue-600',
          'from-green-500 to-green-600',
          'from-purple-500 to-purple-600',
          'from-orange-500 to-orange-600',
        ]
        return (
          <div 
            key={index} 
            className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-gray-100 p-6 card-hover animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{stat.label}</p>
                <p className="text-3xl font-extrabold gradient-text">{stat.value}</p>
              </div>
              <div className={`bg-gradient-to-br ${gradients[index]} p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
