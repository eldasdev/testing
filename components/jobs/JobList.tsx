import Link from 'next/link'
import { FiMapPin, FiBriefcase, FiClock, FiDollarSign } from 'react-icons/fi'
import { format } from 'date-fns'

interface Job {
  id: string
  title: string
  company: string
  location: string
  type: string
  experienceLevel: string
  salaryMin?: number | null
  salaryMax?: number | null
  currency?: string | null
  createdAt: Date
  tags: { name: string }[]
}

interface JobListProps {
  jobs: Job[]
}

export default function JobList({ jobs }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-500 text-lg">No jobs found matching your criteria.</p>
        <p className="text-gray-400 text-sm mt-2">Try adjusting your filters.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Link
          key={job.id}
          href={`/jobs/${job.id}`}
          className="group block bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-gray-100 p-6 card-hover"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                  <FiBriefcase className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-lg font-semibold text-gray-700 mb-3">{job.company}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4 pl-18">
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <FiMapPin className="w-4 h-4 text-primary-600" />
                  <span className="font-medium">{job.location}</span>
                </div>
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <FiBriefcase className="w-4 h-4 text-primary-600" />
                  <span className="font-medium">{job.type.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <FiClock className="w-4 h-4 text-primary-600" />
                  <span className="font-medium">{format(new Date(job.createdAt), 'MMM d, yyyy')}</span>
                </div>
                {(job.salaryMin || job.salaryMax) && (
                  <div className="flex items-center space-x-2 bg-green-50 px-3 py-1.5 rounded-lg">
                    <FiDollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-700">
                      {job.salaryMin && job.salaryMax
                        ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ${job.currency || 'UZS'}`
                        : job.salaryMin
                        ? `From ${job.salaryMin.toLocaleString()} ${job.currency || 'UZS'}`
                        : `Up to ${job.salaryMax?.toLocaleString()} ${job.currency || 'UZS'}`}
                    </span>
                  </div>
                )}
              </div>

              {job.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 pl-18">
                  {job.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 text-xs font-semibold rounded-lg border border-primary-200"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="ml-4">
              <span className="px-4 py-2 bg-gradient-to-br from-gray-100 to-gray-50 text-gray-700 text-sm font-semibold rounded-xl border border-gray-200">
                {job.experienceLevel}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
