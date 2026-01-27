import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FiArrowLeft, FiUser, FiMail, FiMapPin, FiPhone, FiCalendar, FiAward, FiBriefcase, FiExternalLink, FiShield } from 'react-icons/fi'
import { SkillsList } from '@/components/skills/SkillBadge'
import PerformanceScore from '@/components/profile/PerformanceScore'

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  const { id } = await params
  
  if (!session) {
    redirect('/auth/signin')
  }

  // Fetch the user profile
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      skills: {
        include: {
          skillCatalog: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      applications: {
        take: 5,
        include: {
          jobPost: {
            select: {
              id: true,
              title: true,
              company: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!user) {
    notFound()
  }

  // Check if the viewer has permission to see this profile
  // Companies can view profiles of users who applied to their jobs
  // Users can view their own profile
  // Admins can view any profile
  const isOwnProfile = session.user.id === user.id
  const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN'
  const isCompany = session.user.role === 'COMPANY'

  let hasPermission = isOwnProfile || isAdmin

  if (isCompany && !hasPermission) {
    // Check if this user has applied to any of the company's jobs
    const companyJobs = await prisma.jobPost.findMany({
      where: { postedById: session.user.id },
      select: { id: true },
    })

    const jobIds = companyJobs.map(job => job.id)

    if (jobIds.length > 0) {
      const hasApplication = await prisma.application.findFirst({
        where: {
          userId: user.id,
          jobPostId: { in: jobIds },
        },
      })
      hasPermission = !!hasApplication
    }
  }

  if (!hasPermission) {
    redirect('/dashboard')
  }

  const stats = [
    { label: 'Role', value: user.role, icon: FiShield },
    { label: 'Skills', value: `${user.skills.length} added`, icon: FiAward },
    { label: 'Applications', value: `${user.applications.length} submitted`, icon: FiBriefcase },
    { label: 'Member Since', value: new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), icon: FiCalendar },
  ]

  return (
    <div className="min-h-screen gradient-subtle">
      {/* Header */}
      <section className="bg-white border-b border-gray-100">
        <div className="container-custom py-8 md:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 animate-fade-in-up">
            <Link
              href={isCompany ? '/jobs/my-jobs' : '/dashboard'}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>
            <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-6">
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
        </div>
      </section>

      {/* Content */}
      <section className="section-sm">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto animate-fade-in-up animation-delay-100">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Performance Score - Show to companies and admins viewing candidate profiles */}
                {(isCompany || isAdmin) && !isOwnProfile && (
                  <PerformanceScore userId={user.id} />
                )}

                {/* Bio */}
                {user.bio && (
                  <div className="card p-6 md:p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">About</h2>
                    <p className="text-gray-600 leading-relaxed">{user.bio}</p>
                  </div>
                )}

                {/* Skills */}
                {user.skills.length > 0 && (
                  <div className="card p-6 md:p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <FiAward className="w-5 h-5 text-primary-600" />
                      <h2 className="text-lg font-bold text-gray-900">Skills & Proficiency</h2>
                    </div>
                    <SkillsList skills={user.skills.map(skill => ({
                      name: skill.name,
                      proficiency: skill.proficiency,
                    }))} />
                  </div>
                )}

                {/* Education */}
                {user.profile && (
                  <div className="card p-6 md:p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Education</h2>
                    <div className="space-y-3">
                      {user.profile.university && (
                        <div>
                          <p className="font-semibold text-gray-900">{user.profile.university}</p>
                          {user.profile.education && (
                            <p className="text-sm text-gray-600">{user.profile.education}</p>
                          )}
                          {user.profile.graduationYear && (
                            <p className="text-sm text-gray-500">Graduated {user.profile.graduationYear}</p>
                          )}
                        </div>
                      )}
                      {!user.profile.university && (
                        <p className="text-gray-500 text-sm">No education information provided</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Recent Applications (only show to the user themselves or admins) */}
                {(isOwnProfile || isAdmin) && user.applications.length > 0 && (
                  <div className="card p-6 md:p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Applications</h2>
                    <div className="space-y-3">
                      {user.applications.map((application) => (
                        <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {application.jobPost?.title || 'Job Application'}
                              </h3>
                              <p className="text-sm text-gray-600">{application.jobPost?.company}</p>
                              <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                                application.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                application.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                application.status === 'REVIEWED' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {application.status}
                              </span>
                            </div>
                            {application.jobPost && (
                              <Link
                                href={`/jobs/${application.jobPost.id}`}
                                className="text-primary-600 hover:text-primary-700 text-sm"
                              >
                                View Job →
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="card p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <FiMail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{user.email}</span>
                    </div>
                    {user.location && (
                      <div className="flex items-center space-x-3">
                        <FiMapPin className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">{user.location}</span>
                      </div>
                    )}
                    {user.phone && (
                      <div className="flex items-center space-x-3">
                        <FiPhone className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">{user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Links */}
                {user.profile && (
                  <div className="card p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Links</h2>
                    <div className="space-y-3">
                      {user.profile.linkedinUrl && (
                        <a
                          href={user.profile.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                        >
                          <FiExternalLink className="w-4 h-4" />
                          <span>LinkedIn Profile</span>
                        </a>
                      )}
                      {user.profile.githubUrl && (
                        <a
                          href={user.profile.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                        >
                          <FiExternalLink className="w-4 h-4" />
                          <span>GitHub Profile</span>
                        </a>
                      )}
                      {user.profile.portfolioUrl && (
                        <a
                          href={user.profile.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                        >
                          <FiExternalLink className="w-4 h-4" />
                          <span>Portfolio</span>
                        </a>
                      )}
                      {!user.profile.linkedinUrl && !user.profile.githubUrl && !user.profile.portfolioUrl && (
                        <p className="text-gray-500 text-sm">No links provided</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Languages & Interests */}
                {user.profile && (user.profile.languages.length > 0 || user.profile.interests.length > 0) && (
                  <div className="card p-6">
                    {user.profile.languages.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Languages</h3>
                        <div className="flex flex-wrap gap-2">
                          {user.profile.languages.map((lang, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {user.profile.interests.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Interests</h3>
                        <div className="flex flex-wrap gap-2">
                          {user.profile.interests.map((interest, index) => (
                            <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
