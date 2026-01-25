import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ProfileForm from '@/components/profile/ProfileForm'
import ReportIssueButton from '@/components/ReportIssueButton'
import { FiUser, FiShield, FiAward, FiCalendar } from 'react-icons/fi'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      skills: true,
    },
  })

  if (!user) {
    redirect('/auth/signin')
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
            <div className="avatar avatar-xl shadow-lg">
              {user.name?.charAt(0) || 'U'}
            </div>
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

      {/* Profile Form */}
      <section className="section-sm">
        <div className="container-custom">
          <div className="max-w-4xl animate-fade-in-up animation-delay-100">
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
