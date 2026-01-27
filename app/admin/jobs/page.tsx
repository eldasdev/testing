import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import JobManagementTable from '@/components/admin/JobManagementTable'
import JobsExportButton from '@/components/admin/JobsExportButton'
import Link from 'next/link'
import { FiPlus } from 'react-icons/fi'

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; page?: string }>
}) {
  const session = await getServerSession(authOptions)
  const isSuperAdmin = session?.user.role === 'SUPER_ADMIN'
  
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const where: any = {}
  
  if (params.status === 'active') {
    where.isActive = true
  } else if (params.status === 'inactive') {
    where.isActive = false
  }
  
  if (params.type) {
    where.type = params.type
  }

  const [jobs, totalCount] = await Promise.all([
    prisma.jobPost.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        company: true,
        location: true,
        address: true,
        type: true,
        experienceLevel: true,
        salaryMin: true,
        salaryMax: true,
        currency: true,
        applicationDeadline: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            applications: true,
          },
        },
        postedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.jobPost.count({ where }),
  ])

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-600 mt-1">
            Manage all job postings ({totalCount} total)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <JobsExportButton />
          <Link
            href="/admin/jobs/new"
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Job</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <div className="flex space-x-2">
              {['all', 'active', 'inactive'].map((status) => (
                <Link
                  key={status}
                  href={`/admin/jobs${status === 'all' ? '' : `?status=${status}`}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    (status === 'all' && !params.status) || params.status === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Type:</span>
            <div className="flex space-x-2">
              {['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'].map((type) => (
                <Link
                  key={type}
                  href={`/admin/jobs?type=${type}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    params.type === type
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.replace('_', ' ')}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <JobManagementTable jobs={jobs} isSuperAdmin={isSuperAdmin} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/jobs?page=${p}`}
              className={`px-4 py-2 rounded-lg ${
                p === page
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
