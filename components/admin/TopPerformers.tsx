import { FiAward, FiStar, FiBriefcase } from 'react-icons/fi'
import { prisma } from '@/lib/prisma'

export default async function TopPerformers() {
  // Get top companies by job count
  const topCompanies = await prisma.user.findMany({
    where: { role: 'COMPANY' },
    include: {
      jobPosts: {
        include: {
          applications: true,
        },
      },
    },
    take: 3,
    orderBy: {
      jobPosts: {
        _count: 'desc',
      },
    },
  })

  const performers = topCompanies.map((company) => {
    const jobCount = company.jobPosts.length
    const applicantCount = company.jobPosts.reduce((acc, job) => acc + job.applications.length, 0)
    return {
      id: company.id,
      name: company.name,
      type: 'Company',
      jobs: jobCount,
      applicants: applicantCount,
    }
  })

  if (performers.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FiAward className="w-5 h-5 text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-900">Top Performers</h2>
        </div>
        <div className="text-center py-8 text-gray-400">
          <FiBriefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No companies yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <FiAward className="w-5 h-5 text-yellow-500" />
        <h2 className="text-xl font-bold text-gray-900">Top Performers</h2>
      </div>

      <div className="space-y-4">
        {performers.map((performer, index) => (
          <div key={performer.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                {index + 1}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{performer.name}</p>
                <p className="text-xs text-gray-500">{performer.type}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{performer.jobs} {performer.jobs === 1 ? 'job' : 'jobs'}</p>
              <p className="text-xs text-gray-500">
                {performer.applicants} {performer.applicants === 1 ? 'applicant' : 'applicants'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
