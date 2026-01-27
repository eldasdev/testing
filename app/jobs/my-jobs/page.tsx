import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FiPlus, FiBriefcase, FiUsers, FiClock, FiCheckCircle, FiXCircle, FiEye } from 'react-icons/fi'
import ApplicationsList from '@/components/jobs/ApplicationsList'

export default async function MyJobsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'COMPANY') {
    redirect('/dashboard')
  }

  // Get all jobs posted by this company
  const jobs = await prisma.jobPost.findMany({
    where: { postedById: session.user.id },
    include: {
      _count: {
        select: { applications: true },
      },
      applications: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Get total applications count
  const totalApplications = await prisma.application.count({
    where: {
      jobPost: {
        postedById: session.user.id,
      },
    },
  })

  // Get applications by status
  const applicationsByStatus = await prisma.application.groupBy({
    by: ['status'],
    where: {
      jobPost: {
        postedById: session.user.id,
      },
    },
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in-up">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Job Posts</h1>
              <p className="text-gray-600 mt-1">
                Manage your job postings and review applications
              </p>
            </div>
            <Link
              href="/jobs/new"
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <FiPlus className="w-5 h-5" />
              <span>Post New Job</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-sm">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <FiBriefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <FiUsers className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{totalApplications}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                  <FiClock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{statusCounts.PENDING}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <FiCheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Accepted</p>
                  <p className="text-2xl font-bold text-gray-900">{statusCounts.ACCEPTED}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                  <FiXCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">{statusCounts.REJECTED}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Jobs List */}
          {jobs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiBriefcase className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Job Posts Yet</h3>
              <p className="text-gray-600 mb-6">
                Start posting jobs to receive applications from qualified candidates.
              </p>
              <Link
                href="/jobs/new"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all"
              >
                <FiPlus className="w-5 h-5" />
                <span>Post Your First Job</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
                          <p className="text-gray-600">{job.company} • {job.location}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          job.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {job.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                        <span>{job.type.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>{job.experienceLevel}</span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <FiUsers className="w-4 h-4" />
                          <span>{job._count.applications} application{job._count.applications !== 1 ? 's' : ''}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Link
                        href={`/jobs/my-jobs/${job.id}`}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <FiEye className="w-4 h-4" />
                        <span>View Applications</span>
                      </Link>
                      <Link
                        href={`/jobs/${job.id}`}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        View Job
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
