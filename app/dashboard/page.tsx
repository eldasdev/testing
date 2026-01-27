import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DashboardStats from '@/components/dashboard/DashboardStats'
import RecentJobs from '@/components/dashboard/RecentJobs'
import PerformanceCard from '@/components/dashboard/PerformanceCard'
import QuickActions from '@/components/dashboard/QuickActions'
import ReportIssueButton from '@/components/ReportIssueButton'
import Link from 'next/link'
import { FiArrowRight, FiBriefcase, FiFileText, FiTarget, FiUser, FiUsers, FiPlus } from 'react-icons/fi'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const isCompany = session.user.role === 'COMPANY'

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      skills: true,
      applications: {
        take: 5,
        include: {
          jobPost: true,
          internship: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      ...(isCompany ? {
        jobPosts: {
          take: 5,
          include: {
            _count: {
              select: { applications: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      } : {}),
    },
  })

  const jobCount = await prisma.jobPost.count({ where: { isActive: true } })
  const internshipCount = await prisma.internship.count({ where: { isActive: true } })

  // Company-specific data
  let companyStats = null
  if (isCompany) {
    const myJobs = await prisma.jobPost.findMany({
      where: { postedById: session.user.id },
      select: { id: true },
    })
    const jobIds = myJobs.map(job => job.id)
    
    const totalApplications = await prisma.application.count({
      where: { jobPostId: { in: jobIds } },
    })
    
    const pendingApplications = await prisma.application.count({
      where: {
        jobPostId: { in: jobIds },
        status: 'PENDING',
      },
    })

    companyStats = {
      myJobsCount: myJobs.length,
      totalApplications,
      pendingApplications,
    }
  }

  const quickLinks = isCompany
    ? [
        { href: '/jobs/my-jobs', label: 'My Jobs', icon: FiBriefcase, color: 'from-blue-500 to-blue-600' },
        { href: '/jobs/new', label: 'Post Job', icon: FiPlus, color: 'from-green-500 to-green-600' },
        { href: '/jobs', label: 'Browse Jobs', icon: FiTarget, color: 'from-purple-500 to-purple-600' },
        { href: '/profile', label: 'Edit Profile', icon: FiUser, color: 'from-orange-500 to-orange-600' },
      ]
    : [
        { href: '/jobs', label: 'Browse Jobs', icon: FiBriefcase, color: 'from-blue-500 to-blue-600' },
        { href: '/resume-builder', label: 'Build Resume', icon: FiFileText, color: 'from-green-500 to-green-600' },
        { href: '/roadmap', label: 'Career Roadmap', icon: FiTarget, color: 'from-purple-500 to-purple-600' },
        { href: '/profile', label: 'Edit Profile', icon: FiUser, color: 'from-orange-500 to-orange-600' },
      ]

  return (
    <div className="min-h-screen gradient-subtle">
      {/* Header Section */}
      <section className="bg-white border-b border-gray-100">
        <div className="container-custom py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="mt-2 text-gray-600">
                {isCompany ? 'Manage your job postings and applications' : "Here's your career journey overview"}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {quickLinks.slice(0, 2).map((link, index) => {
                const Icon = link.icon
                return (
                  <Link
                    key={index}
                    href={link.href}
                    className="btn btn-outline text-sm"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {link.label}
                  </Link>
                )
              })}
              <ReportIssueButton variant="button" className="text-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-sm">
        <div className="container-custom">
          {/* Stats Cards */}
          <div className="mb-8 animate-fade-in-up">
            {isCompany && companyStats ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                      <FiBriefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">My Job Posts</p>
                      <p className="text-2xl font-bold text-gray-900">{companyStats.myJobsCount}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                      <FiUsers className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Applications</p>
                      <p className="text-2xl font-bold text-gray-900">{companyStats.totalApplications}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                      <FiTarget className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pending Reviews</p>
                      <p className="text-2xl font-bold text-gray-900">{companyStats.pendingApplications}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                      <FiBriefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Active Jobs</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {user?.jobPosts?.filter(job => job.isActive).length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <DashboardStats
                jobCount={jobCount}
                internshipCount={internshipCount}
                applicationCount={user?.applications.length || 0}
                skillCount={user?.skills.length || 0}
              />
            )}
          </div>

          {/* Quick Actions - Mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 md:hidden animate-fade-in-up animation-delay-100">
            {quickLinks.map((link, index) => {
              const Icon = link.icon
              return (
                <Link
                  key={index}
                  href={link.href}
                  className="card p-4 text-center card-hover"
                >
                  <div className={`w-10 h-10 mx-auto bg-gradient-to-br ${link.color} rounded-xl flex items-center justify-center mb-2`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{link.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column - Recent Activity */}
            <div className="lg:col-span-2 space-y-6 animate-fade-in-up animation-delay-100">
              {isCompany ? (
                <>
                  {/* My Job Posts */}
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-gray-900">My Job Posts</h2>
                      <Link href="/jobs/my-jobs" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center">
                        View All
                        <FiArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                    {user?.jobPosts && user.jobPosts.length > 0 ? (
                      <div className="space-y-4">
                        {user.jobPosts.map((job) => {
                          const applicationCount = (job as any)._count?.applications || 0
                          return (
                          <Link
                            key={job.id}
                            href={`/jobs/my-jobs/${job.id}`}
                            className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
                                <p className="text-sm text-gray-600 mb-2">{job.company} • {job.location}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span className="flex items-center space-x-1">
                                    <FiUsers className="w-4 h-4" />
                                    <span>{applicationCount} application{applicationCount !== 1 ? 's' : ''}</span>
                                  </span>
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    job.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {job.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">No job posts yet</p>
                        <Link href="/jobs/new" className="btn btn-primary text-sm">
                          <FiPlus className="w-4 h-4 mr-2" />
                          Post Your First Job
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Recent Applications */}
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-gray-900">Recent Applications</h2>
                      <Link href="/jobs" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center">
                        View All
                        <FiArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                    <RecentJobs applications={user?.applications || []} />
                  </div>
                </>
              )}

              {/* Profile Completion */}
              {!user?.profile && (
                <div className="card p-6 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-100">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Complete Your Profile</h3>
                      <p className="text-sm text-gray-600">
                        Add more details to increase your visibility to employers
                      </p>
                    </div>
                    <Link href="/profile" className="btn btn-primary text-sm">
                      Complete Profile
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6 animate-fade-in-up animation-delay-200">
              {/* Performance */}
              <div className="card p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Performance Score</h2>
                <PerformanceCard userId={session.user.id} />
              </div>

              {/* Quick Actions */}
              <div className="card p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                <QuickActions />
              </div>

              {/* Tips */}
              <div className="card p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
                <h3 className="font-bold text-gray-900 mb-3">💡 Pro Tip</h3>
                <p className="text-sm text-gray-600">
                  Companies are 3x more likely to contact candidates with complete profiles 
                  and updated resumes. Keep your information current!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
