'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FiHome,
  FiUsers,
  FiBriefcase,
  FiMessageSquare,
  FiFileText,
  FiBarChart2,
  FiSettings,
  FiShield,
  FiActivity,
  FiDatabase,
  FiTarget,
  FiUserCheck,
  FiAward,
  FiTrash2
} from 'react-icons/fi'
import ReportIssueButton from '@/components/ReportIssueButton'

interface AdminSidebarProps {
  userRole: string
}

export default function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname()
  const isSuperAdmin = userRole === 'SUPER_ADMIN'

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: FiHome },
    { href: '/admin/users', label: 'Users', icon: FiUsers },
    { href: '/admin/mentors', label: 'Mentors', icon: FiUserCheck },
    { href: '/admin/jobs', label: 'Jobs', icon: FiBriefcase },
    { href: '/admin/skills', label: 'Skills Catalog', icon: FiAward },
    { href: '/admin/community', label: 'Community', icon: FiMessageSquare },
    { href: '/admin/blog', label: 'Blog Posts', icon: FiFileText },
    { href: '/admin/challenges', label: 'Challenges', icon: FiTarget },
    { href: '/admin/analytics', label: 'Analytics', icon: FiBarChart2 },
    ...(isSuperAdmin ? [
      { href: '/admin/admins', label: 'Admin Management', icon: FiShield },
      { href: '/admin/activity', label: 'Activity Logs', icon: FiActivity },
      { href: '/admin/database', label: 'Database', icon: FiDatabase },
      { href: '/admin/trash', label: 'Trash Bin', icon: FiTrash2 },
    ] : []),
    { href: '/admin/settings', label: 'Settings', icon: FiSettings },
  ]

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white z-40 hidden md:block">
      <div className="p-6">
        <Link href="/admin" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
            <FiShield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-xs text-slate-400">
              {isSuperAdmin ? 'Super Admin' : 'Administrator'}
            </p>
          </div>
        </Link>
      </div>

      <nav className="px-4 pb-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50 space-y-2">
        <div className="px-4">
          <ReportIssueButton variant="link" className="text-slate-300 hover:text-white w-full justify-center" />
        </div>
        <Link
          href="/"
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-slate-800 rounded-xl text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
        >
          <span>Back to Site</span>
        </Link>
      </div>
    </aside>
  )
}
