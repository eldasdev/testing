import { prisma } from '@/lib/prisma'
import JobList from '@/components/jobs/JobList'
import JobFilters from '@/components/jobs/JobFilters'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { FiPlus, FiBriefcase, FiSearch, FiMapPin, FiLock } from 'react-icons/fi'

interface SearchParams {
  location?: string
  type?: string
  experience?: string
  search?: string
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await getServerSession(authOptions)
  
  // Redirect COMPANY users to my-jobs page (they can't browse other companies' jobs)
  if (session?.user?.role === 'COMPANY') {
    redirect('/jobs/my-jobs')
  }
  
  // This code below will never execute, but kept for reference
  const params = await searchParams
  const where: any = {
    isActive: true,
  }

  if (params.location) {
    where.location = { contains: params.location, mode: 'insensitive' }
  }

  if (params.type) {
    where.type = params.type
  }

  if (params.experience) {
    where.experienceLevel = params.experience
  }

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
      { company: { contains: params.search, mode: 'insensitive' } },
    ]
  }

  const jobs = await prisma.jobPost.findMany({
    where,
    include: {
      postedBy: {
        select: {
          name: true,
          image: true,
        },
      },
      tags: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const totalJobs = await prisma.jobPost.count({ where: { isActive: true } })
  const totalCompanies = await prisma.user.count({ where: { role: 'COMPANY' } })

  // Convert BigInt values to strings for component
  const jobsWithStringSalaries = jobs.map(job => ({
    ...job,
    salaryMin: job.salaryMin ? job.salaryMin.toString() : null,
    salaryMax: job.salaryMax ? job.salaryMax.toString() : null,
  }))

  return (
    <div className="min-h-screen gradient-subtle">
      {/* Hero Section */}
      <section className="relative gradient-primary text-white overflow-hidden">
        <div className="absolute inset-0 pattern-grid" />
        
        <div className="relative container-custom py-12 md:py-20">
          <div className="max-w-3xl animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Find Your Dream Job
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8">
              Discover {totalJobs}+ opportunities from {totalCompanies}+ companies in Uzbekistan
            </p>
            
            {/* Quick stats */}
            <div className="flex flex-wrap gap-4 sm:gap-8 mb-8">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <FiBriefcase className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalJobs}</div>
                  <div className="text-sm text-primary-200">Active Jobs</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <FiMapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalCompanies}</div>
                  <div className="text-sm text-primary-200">Companies</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-sm">
        <div className="container-custom">
          {/* Header with Post Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fade-in-up">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'} Found
              </h2>
              {params.search && (
                <p className="text-gray-600">
                  Results for "{params.search}"
                </p>
              )}
            </div>
            {session && (session.user.role === 'COMPANY' || session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') && (
              <Link
                href="/jobs/new"
                className="btn btn-primary"
              >
                <FiPlus className="w-5 h-5 mr-2" />
                Post a Job
              </Link>
            )}
          </div>

          {/* Filters and List */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Sidebar Filters */}
            <aside className="lg:col-span-1">
              <div className="card p-6 sticky top-24 animate-fade-in-up">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                  <FiSearch className="w-5 h-5 mr-2 text-primary-600" />
                  Filters
                </h3>
                <JobFilters />
              </div>
            </aside>

            {/* Job List */}
            <main className="lg:col-span-3 animate-fade-in-up animation-delay-100">
              {jobsWithStringSalaries.length > 0 ? (
                <JobList jobs={jobsWithStringSalaries} />
              ) : (
                <div className="card p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiBriefcase className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters or search criteria
                  </p>
                  <Link href="/jobs" className="btn btn-primary">
                    Clear Filters
                  </Link>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  )
}
