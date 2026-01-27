import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import JobDetails from '@/components/jobs/JobDetails'
import ApplyButton from '@/components/jobs/ApplyButton'
import Link from 'next/link'
import { FiArrowLeft, FiBriefcase } from 'react-icons/fi'

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  const { id } = await params
  
  // Redirect guest users to sign in page
  if (!session) {
    redirect(`/auth/signin?callbackUrl=/jobs/${id}`)
  }
  const job = await prisma.jobPost.findUnique({
    where: { id },
    include: {
      postedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      tags: true,
    },
  })

  if (!job || !job.isActive) {
    notFound()
  }

  let hasApplied = false
  if (session) {
    const application = await prisma.application.findFirst({
      where: {
        userId: session.user.id,
        jobPostId: job.id,
      },
    })
    hasApplied = !!application
  }

  // Convert BigInt values to strings for component
  const jobWithStringSalaries = {
    ...job,
    salaryMin: job.salaryMin ? job.salaryMin.toString() : null,
    salaryMax: job.salaryMax ? job.salaryMax.toString() : null,
  }

  return (
    <div className="min-h-screen gradient-subtle">
      {/* Header */}
      <section className="bg-white border-b border-gray-100">
        <div className="container-custom py-6">
          <div className="flex items-center space-x-4 animate-fade-in-up">
            <Link
              href="/jobs"
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <FiBriefcase className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Job Details</h1>
                <p className="text-sm text-gray-600">View full job description</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-sm">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <div className="card p-6 md:p-8">
              <JobDetails job={jobWithStringSalaries} />
              
              {session.user.role === 'STUDENT' && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <ApplyButton jobId={job.id} hasApplied={hasApplied} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
