import Link from 'next/link'
import { FiUserPlus, FiPlus, FiMail, FiDownload, FiRefreshCw, FiTrash2 } from 'react-icons/fi'

interface QuickActionsPanelProps {
  isSuperAdmin: boolean
}

export default function QuickActionsPanel({ isSuperAdmin }: QuickActionsPanelProps) {
  const actions = [
    { label: 'Add User', icon: FiUserPlus, href: '/admin/users/new', color: 'text-blue-600 bg-blue-50' },
    { label: 'Create Job', icon: FiPlus, href: '/admin/jobs/new', color: 'text-green-600 bg-green-50' },
    { label: 'Send Announcement', icon: FiMail, href: '/admin/announcements', color: 'text-purple-600 bg-purple-50' },
    { label: 'Export Data', icon: FiDownload, href: '/admin/export', color: 'text-orange-600 bg-orange-50' },
    ...(isSuperAdmin ? [
      { label: 'Sync Database', icon: FiRefreshCw, href: '/admin/database/sync', color: 'text-cyan-600 bg-cyan-50' },
      { label: 'Clear Cache', icon: FiTrash2, href: '/admin/cache/clear', color: 'text-red-600 bg-red-50' },
    ] : []),
  ]

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <Link
              key={index}
              href={action.href}
              className={`flex flex-col items-center justify-center p-4 rounded-xl ${action.color} hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md`}
            >
              <Icon className="w-6 h-6 mb-2" />
              <span className="text-xs font-semibold text-center leading-tight">{action.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
