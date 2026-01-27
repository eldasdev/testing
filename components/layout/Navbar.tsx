'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import { 
  FiBriefcase,
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiSettings,
  FiBarChart2,
  FiChevronDown,
  FiShield,
  FiGlobe,
  FiInfo,
  FiUsers,
  FiDollarSign,
  FiMail,
  FiImage
} from 'react-icons/fi'

export default function Navbar() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [aboutMenuOpen, setAboutMenuOpen] = useState(false)
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const aboutMenuRef = useRef<HTMLDivElement>(null)
  const languageMenuRef = useRef<HTMLDivElement>(null)

  // Only COMPANY users see "My Jobs" - everyone else (guests, students, admins, super admins) see "Jobs"
  const navLinks = [
    ...(session?.user?.role === 'COMPANY' 
      ? [{ href: '/jobs/my-jobs', label: 'My Jobs' }]
      : [{ href: '/jobs', label: 'Jobs' }]
    ),
    { href: '/community', label: 'Community' },
    { href: '/blog', label: 'Blog' },
    { href: '/mentoring', label: 'Mentoring' },
    { href: '/pricing', label: 'Pricing' },
  ]

  const aboutMenuItems = [
    { href: '/about/statistics', label: 'Open Statistics Data', icon: FiBarChart2 },
    { href: '/about', label: 'About StudentHire', icon: FiInfo },
    { href: '/about/team', label: 'Our Team', icon: FiUsers },
    { href: '/about/contact', label: 'Contact with Us', icon: FiMail },
  ]

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false)
      }
      if (aboutMenuRef.current && !aboutMenuRef.current.contains(target)) {
        setAboutMenuOpen(false)
      }
      if (languageMenuRef.current && !languageMenuRef.current.contains(target)) {
        setLanguageMenuOpen(false)
      }
    }

    if (userMenuOpen || aboutMenuOpen || languageMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen, aboutMenuOpen, languageMenuOpen])

  return (
    <nav className="glass sticky top-0 z-50 border-b border-gray-200/50 backdrop-blur-xl bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <FiBriefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">StudentHire</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {/* About Us Dropdown */}
            <div className="relative" ref={aboutMenuRef}>
              <button
                onClick={() => setAboutMenuOpen(!aboutMenuOpen)}
                className="flex items-center space-x-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-200"
              >
                <span>About Us</span>
                <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${aboutMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {aboutMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-slide-up">
                  {aboutMenuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setAboutMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50/50 hover:text-primary-600 transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Other Nav Links */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side: Language Switcher & Auth */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Language Switcher */}
            <div className="relative" ref={languageMenuRef}>
              <button
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-200"
              >
                <FiGlobe className="w-4 h-4" />
                <span>EN</span>
                <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${languageMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {languageMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-slide-up">
                  <button
                    onClick={() => {
                      setLanguageMenuOpen(false)
                      // TODO: Implement language switching
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50/50 hover:text-primary-600 transition-colors"
                  >
                    <span>English</span>
                  </button>
                  <button
                    onClick={() => {
                      setLanguageMenuOpen(false)
                      // TODO: Implement language switching
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50/50 hover:text-primary-600 transition-colors"
                  >
                    <span>O'zbek</span>
                  </button>
                  <button
                    onClick={() => {
                      setLanguageMenuOpen(false)
                      // TODO: Implement language switching
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50/50 hover:text-primary-600 transition-colors"
                  >
                    <span>Русский</span>
                  </button>
                </div>
              )}
            </div>

            {/* Auth Section */}
            {session ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-200"
                >
                  {session.user?.role === 'COMPANY' ? (
                    session.user?.logo ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm bg-white">
                        <Image
                          src={session.user.logo}
                          alt={`${session.user.name} logo`}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                        <FiImage className="w-4 h-4 text-white" />
                      </div>
                    )
                  ) : (
                    session.user?.image ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm bg-white">
                        <Image
                          src={session.user.image}
                          alt={`${session.user.name} profile`}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {session.user?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )
                  )}
                  <span>{session.user?.name}</span>
                  <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-slide-up">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3 mb-2">
                        {session.user?.role === 'COMPANY' ? (
                          session.user?.logo ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 bg-white flex-shrink-0">
                              <Image
                                src={session.user.logo}
                                alt={`${session.user.name} logo`}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <FiImage className="w-5 h-5 text-white" />
                            </div>
                          )
                        ) : (
                          session.user?.image ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 bg-white flex-shrink-0">
                              <Image
                                src={session.user.image}
                                alt={`${session.user.name} profile`}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-sm font-bold">
                                {session.user?.name?.charAt(0) || 'U'}
                              </span>
                            </div>
                          )
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{session.user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50/50 hover:text-primary-600 transition-colors"
                      >
                        <FiUser className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50/50 hover:text-primary-600 transition-colors"
                      >
                        <FiBarChart2 className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                      {(session.user?.role === 'ADMIN' || session.user?.role === 'SUPER_ADMIN') && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <FiShield className="w-4 h-4" />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50/50 hover:text-primary-600 transition-colors"
                      >
                        <FiSettings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={() => {
                          signOut()
                          setUserMenuOpen(false)
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/signin"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-primary-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* About Us in Mobile */}
            <div className="px-3 py-2">
              <p className="text-base font-semibold text-gray-900 mb-2">About Us</p>
              <div className="pl-4 space-y-1">
                {aboutMenuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Other Nav Links */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Language Switcher in Mobile */}
            <div className="px-3 py-2 border-t border-gray-200 mt-2">
              <p className="text-sm font-semibold text-gray-700 mb-2">Language</p>
              <div className="flex space-x-2">
                <button className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg">EN</button>
                <button className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">UZ</button>
                <button className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">RU</button>
              </div>
            </div>

            <div className="border-t pt-2 mt-2">
              {session ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiUser className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                  {(session.user?.role === 'ADMIN' || session.user?.role === 'SUPER_ADMIN') && (
                    <Link
                      href="/admin"
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FiShield className="w-5 h-5" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
