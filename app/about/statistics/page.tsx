import { prisma } from '@/lib/prisma'
import { FiUsers, FiBriefcase, FiFileText, FiMessageSquare, FiTrendingUp, FiAward, FiBookOpen, FiTarget } from 'react-icons/fi'

export default async function StatisticsPage() {
  const [
    totalUsers,
    totalStudents,
    totalCompanies,
    totalMentors,
    totalJobs,
    activeJobs,
    totalApplications,
    totalThreads,
    totalPosts,
    totalBlogPosts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'COMPANY' } }),
    prisma.user.count({ where: { role: 'MENTOR' } }),
    prisma.jobPost.count(),
    prisma.jobPost.count({ where: { isActive: true } }),
    prisma.application.count(),
    prisma.communityThread.count(),
    prisma.communityPost.count(),
    prisma.blogPost.count(),
  ])

  const stats = [
    {
      category: 'Users',
      icon: FiUsers,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      items: [
        { label: 'Total Users', value: totalUsers },
        { label: 'Students', value: totalStudents },
        { label: 'Companies', value: totalCompanies },
        { label: 'Mentors', value: totalMentors },
      ],
    },
    {
      category: 'Jobs & Applications',
      icon: FiBriefcase,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      items: [
        { label: 'Total Jobs Posted', value: totalJobs },
        { label: 'Active Jobs', value: activeJobs },
        { label: 'Applications', value: totalApplications },
      ],
    },
    {
      category: 'Community',
      icon: FiMessageSquare,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      items: [
        { label: 'Discussion Threads', value: totalThreads },
        { label: 'Community Posts', value: totalPosts },
        { label: 'Blog Posts', value: totalBlogPosts },
      ],
    },
  ]

  const highlights = [
    {
      icon: FiTrendingUp,
      value: `${Math.round((activeJobs / (totalJobs || 1)) * 100)}%`,
      label: 'Active Job Rate',
      description: 'Percentage of jobs currently accepting applications',
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      icon: FiAward,
      value: `${totalApplications > 0 ? Math.round(totalApplications / (totalStudents || 1)) : 0}`,
      label: 'Avg. Applications',
      description: 'Average applications per student',
      color: 'from-amber-500 to-amber-600',
    },
    {
      icon: FiBookOpen,
      value: `${totalPosts + totalBlogPosts}`,
      label: 'Content Pieces',
      description: 'Total community and blog content',
      color: 'from-rose-500 to-rose-600',
    },
    {
      icon: FiTarget,
      value: `${totalMentors}`,
      label: 'Active Mentors',
      description: 'Professionals ready to guide you',
      color: 'from-indigo-500 to-indigo-600',
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative gradient-primary text-white overflow-hidden">
        <div className="absolute inset-0 pattern-grid" />
        
        <div className="relative container-custom py-16 md:py-24">
          <div className="max-w-3xl animate-fade-in-up">
            <span className="badge bg-white/20 text-white mb-6">Transparency</span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Open Statistics</h1>
            <p className="text-xl text-primary-100">
              Real-time platform data showcasing our growing community and impact.
            </p>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16 md:h-24" viewBox="0 0 1440 74" fill="none">
            <path d="M0 74V25.5C240 -8.5 480 -8.5 720 25.5C960 59.5 1200 59.5 1440 25.5V74H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Highlights */}
      <section className="section-sm gradient-subtle">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {highlights.map((item, index) => {
              const Icon = item.icon
              return (
                <div 
                  key={index}
                  className="card p-6 text-center card-hover animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-12 h-12 mx-auto bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl md:text-4xl font-extrabold gradient-text mb-1">
                    {item.value}
                  </div>
                  <div className="font-semibold text-gray-900 mb-1">{item.label}</div>
                  <p className="text-sm text-gray-500 hidden sm:block">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Detailed Stats */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Platform Statistics
            </h2>
            <p className="text-lg text-gray-600">
              Detailed breakdown of our platform metrics
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {stats.map((category, catIndex) => {
              const Icon = category.icon
              return (
                <div 
                  key={catIndex}
                  className="card overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${catIndex * 100}ms` }}
                >
                  <div className={`${category.bgColor} p-6 border-b border-gray-100`}>
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{category.category}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {category.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center justify-between">
                          <span className="text-gray-600">{item.label}</span>
                          <span className="text-2xl font-bold text-gray-900">{item.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="section-sm bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <div className="card p-8 md:p-10">
              <h3 className="text-xl font-bold text-gray-900 mb-4">About This Data</h3>
              <p className="text-gray-600 leading-relaxed">
                All statistics are updated in real-time and reflect the current state of our platform. 
                We believe in transparency and want our users to see the impact we're making together 
                in helping students launch their careers in Uzbekistan.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
