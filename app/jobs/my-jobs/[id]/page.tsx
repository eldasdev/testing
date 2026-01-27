import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FiArrowLeft, FiBriefcase, FiUsers, FiMail, FiMapPin, FiCalendar } from 'react-icons/fi'
import ApplicationsList from '@/components/jobs/ApplicationsList'

export default async function JobApplicationsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  const { id } = await params
  
  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'COMPANY') {
    redirect('/dashboard')
  }

  // Get the job post and verify ownership
  const job = await prisma.jobPost.findUnique({
    where: { id },
    include: {
      _count: {
        select: { applications: true },
      },
    },
  })

  if (!job) {
    notFound()
  }

  if (job.postedById !== session.user.id) {
    redirect('/jobs/my-jobs')
  }

  // Get all applications for this job
  const applications = await prisma.application.findMany({
    where: { jobPostId: id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          location: true,
          phone: true,
          profile: {
            select: {
              education: true,
              university: true,
              graduationYear: true,
              linkedinUrl: true,
              githubUrl: true,
              portfolioUrl: true,
            },
          },
          skills: {
            include: {
              skillCatalog: true,
            },
            take: 10,
          },
        },
      },
      jobPost: {
        select: {
          id: true,
          title: true,
          company: true,
        },
      },
      resume: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Get application counts by status
  const applicationsByStatus = await prisma.application.groupBy({
    by: ['status'],
    where: { jobPostId: id },
    _count: true,
  })

  const statusCounts = {
    PENDING: 0,
    REVIEWED: 0,
    ACCEPTED: 0,
    REJECTED: 0,
  }

  applicationsByStatus.forEach((item) => {
    statusCounts[item.status as keyof typeof statusCounts] = item._count
  })

  return (
    <div className="min-h-screen gradient-subtle">
      {/* Header */}
      <section className="bg-white border-b border-gray-100">
        <div className="container-custom py-8 md:py-12">
          <div className="flex flex-col gap-4 animate-fade-in-up">
            <Link
              href="/jobs/my-jobs"
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 w-fit"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Back to My Jobs</span>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <p className="text-gray-600">{job.company} • {job.location}</p>
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center space-x-2 text-sm">
                <FiUsers className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">
                  <span className="font-semibold text-gray-900">{applications.length}</span> application{applications.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <FiCalendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">
                  Posted {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Status Filters */}
      <section className="section-sm">
        <div className="container-custom">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-4 mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span className="text-sm font-medium text-yellow-800">
                  Pending: {statusCounts.PENDING}
                </span>
              </div>
              <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm font-medium text-blue-800">
                  Reviewed: {statusCounts.REVIEWED}
                </span>
              </div>
              <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm font-medium text-green-800">
                  Accepted: {statusCounts.ACCEPTED}
                </span>
              </div>
              <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-sm font-medium text-red-800">
                  Rejected: {statusCounts.REJECTED}
                </span>
              </div>
            </div>
          </div>

          {/* Applications List */}
          {applications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Applications Yet</h3>
              <p className="text-gray-600">
                Applications will appear here when candidates apply to this job.
              </p>
            </div>
          ) : (
            <ApplicationsList 
              applications={applications.map(app => ({
                ...app,
                createdAt: app.createdAt.toISOString(),
                updatedAt: app.updatedAt.toISOString(),
              }))} 
              jobId={id} 
            />
          )}
        </div>
      </section>
    </div>
  )
}
