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
import { FiArrowRight, FiBriefcase, FiFileText, FiTarget, FiUser } from 'react-icons/fi'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

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
    },
  })

  const jobCount = await prisma.jobPost.count({ where: { isActive: true } })
  const internshipCount = await prisma.internship.count({ where: { isActive: true } })

  const quickLinks = [
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
                Here's your career journey overview
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
            <DashboardStats
              jobCount={jobCount}
              internshipCount={internshipCount}
              applicationCount={user?.applications.length || 0}
              skillCount={user?.skills.length || 0}
            />
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
