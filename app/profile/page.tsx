import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { recalculateCareerReadiness } from '@/lib/performance'
import ProfileForm from '@/components/profile/ProfileForm'
import PerformanceCard from '@/components/dashboard/PerformanceCard'
import ReportIssueButton from '@/components/ReportIssueButton'
import { FiUser, FiShield, FiAward, FiCalendar, FiImage } from 'react-icons/fi'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      skills: {
        include: {
          skillCatalog: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!user) {
    redirect('/auth/signin')
  }

  if (user.role === 'STUDENT') {
    await recalculateCareerReadiness(user.id)
  }

  const stats = [
    { label: 'Role', value: user.role, icon: FiShield },
    { label: 'Skills', value: `${user.skills.length} added`, icon: FiAward },
    { label: 'Member Since', value: new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), icon: FiCalendar },
  ]

  return (
    <div className="min-h-screen gradient-subtle">
      {/* Header */}
      <section className="bg-white border-b border-gray-100">
        <div className="container-custom py-8 md:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 animate-fade-in-up">
            {user.role === 'COMPANY' ? (
              user.logo ? (
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                  <Image
                    src={user.logo}
                    alt={`${user.name} logo`}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="avatar avatar-xl shadow-lg bg-gradient-to-br from-primary-400 to-primary-600">
                  <FiImage className="w-12 h-12 text-white" />
                </div>
              )
            ) : (
              user.image ? (
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                  <Image
                    src={user.image}
                    alt={`${user.name} profile`}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="avatar avatar-xl shadow-lg">
                  {user.name?.charAt(0) || 'U'}
                </div>
              )
            )}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {user.name}
                  </h1>
                  <p className="text-gray-600 mb-4">{user.email}</p>
                </div>
                <ReportIssueButton variant="button" />
              </div>
              <div className="flex flex-wrap gap-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <Icon className="w-4 h-4 text-primary-600" />
                      <span className="text-gray-600">{stat.label}:</span>
                      <span className="font-medium text-gray-900">{stat.value}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Form + Performance Score (students only) */}
      <section className="section-sm">
        <div className="container-custom">
          <div className="max-w-4xl animate-fade-in-up animation-delay-100 space-y-6">
            {/* Performance Score - students only */}
            {user.role === 'STUDENT' && (
              <div className="card p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Performance Score</h2>
                <PerformanceCard userId={user.id} />
              </div>
            )}
            <div className="card p-6 md:p-8">
              <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-gray-100">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Profile Settings</h2>
                  <p className="text-sm text-gray-600">Update your personal information and preferences</p>
                </div>
              </div>
              
              <ProfileForm user={user} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
