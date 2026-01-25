import Link from 'next/link'
import { FiFileText, FiTarget, FiBook, FiUsers, FiArrowRight } from 'react-icons/fi'

export default function QuickActions() {
  const actions = [
    {
      icon: FiFileText,
      label: 'Build Resume',
      description: 'Create a professional resume',
      href: '/resume-builder',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: FiTarget,
      label: 'Career Roadmap',
      description: 'Plan your career path',
      href: '/roadmap',
      gradient: 'from-green-500 to-green-600',
    },
    {
      icon: FiBook,
      label: 'Practice Skills',
      description: 'Improve your abilities',
      href: '/practice',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      icon: FiUsers,
      label: 'Join Community',
      description: 'Connect with others',
      href: '/community',
      gradient: 'from-orange-500 to-orange-600',
    },
  ]

  return (
    <div className="space-y-3">
      {actions.map((action, index) => {
        const Icon = action.icon
        return (
          <Link
            key={index}
            href={action.href}
            className="group flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200"
          >
            <div className={`w-10 h-10 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-gray-700 group-hover:text-primary-600 transition-colors block text-sm">
                {action.label}
              </span>
              <span className="text-xs text-gray-500 hidden sm:block">{action.description}</span>
            </div>
            <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>
        )
      })}
    </div>
  )
}
