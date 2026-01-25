import { format } from 'date-fns'
import { FiUser, FiBriefcase, FiCircle, FiActivity } from 'react-icons/fi'

interface RecentUser {
  id: string
  name: string
  email: string
  role: string
  createdAt: Date
}

interface RecentJob {
  id: string
  title: string
  company: string
  createdAt: Date
  isActive: boolean
}

interface RecentActivityFeedProps {
  recentUsers: RecentUser[]
  recentJobs: RecentJob[]
}

export default function RecentActivityFeed({ recentUsers, recentJobs }: RecentActivityFeedProps) {
  const hasActivity = recentUsers.length > 0 || recentJobs.length > 0

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
      
      {!hasActivity ? (
        <div className="text-center py-12 text-gray-400">
          <FiActivity className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No recent activity</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4 flex items-center">
            <FiUser className="w-4 h-4 mr-2" />
            New Users
          </h3>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    user.role === 'STUDENT' ? 'bg-blue-100 text-blue-700' :
                    user.role === 'COMPANY' ? 'bg-green-100 text-green-700' :
                    user.role === 'MENTOR' ? 'bg-purple-100 text-purple-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {user.role}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {format(new Date(user.createdAt), 'MMM d')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Jobs */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4 flex items-center">
            <FiBriefcase className="w-4 h-4 mr-2" />
            New Jobs
          </h3>
          <div className="space-y-3">
            {recentJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-white">
                    <FiBriefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{job.title}</p>
                    <p className="text-xs text-gray-500">{job.company}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <FiCircle className={`w-2 h-2 ${job.isActive ? 'text-green-500 fill-green-500' : 'text-gray-400 fill-gray-400'}`} />
                    <span className="text-xs text-gray-500">
                      {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {format(new Date(job.createdAt), 'MMM d')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      )}
    </div>
  )
}
