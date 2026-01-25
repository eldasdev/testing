'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiHome, FiArrowLeft, FiSearch, FiBriefcase } from 'react-icons/fi'

export default function NotFound() {
  const router = useRouter()
  
  const quickLinks = [
    { href: '/', label: 'Home', icon: FiHome },
    { href: '/jobs', label: 'Browse Jobs', icon: FiBriefcase },
    { href: '/community', label: 'Community', icon: FiSearch },
  ]

  return (
    <div className="min-h-screen gradient-subtle flex items-center justify-center px-4">
      <div className="text-center max-w-lg mx-auto animate-fade-in-up">
        {/* 404 Illustration */}
        <div className="relative mb-8">
          <div className="text-[150px] sm:text-[200px] font-extrabold gradient-text leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-primary-100 rounded-full animate-pulse-soft opacity-50" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Oops! The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="btn btn-primary px-6 py-3"
          >
            <FiHome className="w-5 h-5 mr-2" />
            Go to Home
          </Link>
          <button
            onClick={() => router.back()}
            className="btn btn-secondary px-6 py-3"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Or try one of these pages:
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {quickLinks.map((link, index) => {
              const Icon = link.icon
              return (
                <Link
                  key={index}
                  href={link.href}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
                >
                  <Icon className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
