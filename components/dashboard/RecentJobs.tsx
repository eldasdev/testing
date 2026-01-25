import Link from 'next/link'
import { FiBriefcase, FiClock } from 'react-icons/fi'
import { format } from 'date-fns'

interface Application {
  id: string
  status: string
  createdAt: Date
  jobPost?: {
    id: string
    title: string
    company: string
  } | null
  internship?: {
    id: string
    title: string
    company: string
  } | null
}

interface RecentJobsProps {
  applications: Application[]
}

export default function RecentJobs({ applications }: RecentJobsProps) {
  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Applications</h2>
        <p className="text-gray-500 text-center py-8">
          No applications yet. <Link href="/jobs" className="text-primary-600 hover:underline">Browse jobs</Link> to get started!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Recent Applications</h2>
      <div className="space-y-4">
        {applications.map((app) => {
          const job = app.jobPost || app.internship
          if (!job) return null

          return (
            <div key={app.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <FiBriefcase className="w-5 h-5 text-primary-600" />
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{job.company}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      app.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                      app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      app.status === 'REVIEWED' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {app.status}
                    </span>
                    <div className="flex items-center text-xs text-gray-500">
                      <FiClock className="w-4 h-4 mr-1" />
                      {format(new Date(app.createdAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-4">
        <Link
          href="/jobs"
          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
        >
          View all jobs →
        </Link>
      </div>
    </div>
  )
}
