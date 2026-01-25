'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiMail, FiLock, FiUser, FiArrowRight, FiBriefcase, FiBookOpen, FiUsers } from 'react-icons/fi'

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT' as 'STUDENT' | 'COMPANY' | 'MENTOR',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create account')
        return
      }

      router.push('/auth/signin?registered=true')
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    { value: 'STUDENT', label: 'Student', icon: FiBookOpen, description: 'Looking for jobs & internships' },
    { value: 'COMPANY', label: 'Company', icon: FiBriefcase, description: 'Hiring talented students' },
    { value: 'MENTOR', label: 'Mentor', icon: FiUsers, description: 'Guiding career journeys' },
  ]

  return (
    <div className="min-h-screen flex gradient-subtle">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 pattern-grid" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-float animation-delay-200" />
        
        <div className="relative flex flex-col justify-center px-12 xl:px-16">
          <Link href="/" className="text-3xl font-bold text-white mb-8">
            StudentHire
          </Link>
          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
            Start Your Career Journey Today
          </h1>
          <p className="text-xl text-primary-100 mb-8 leading-relaxed">
            Join thousands of students and employers on Uzbekistan's premier career platform.
          </p>
          
          <div className="space-y-4">
            {[
              'Access exclusive job opportunities',
              'Build your professional network',
              'Get AI-powered career guidance',
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-3 text-white/90">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Mobile Logo */}
          <Link href="/" className="lg:hidden text-2xl font-bold gradient-text mb-8 block text-center">
            StudentHire
          </Link>
          
          <div className="card p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FiUser className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
                Create Account
              </h2>
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/signin" className="font-semibold text-primary-600 hover:text-primary-700">
                  Sign in
                </Link>
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2 animate-fade-in">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="input input-icon"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="input input-icon"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={6}
                      className="input input-icon"
                      placeholder="Min. 6 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    I am a...
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {roles.map((role) => {
                      const Icon = role.icon
                      const isSelected = formData.role === role.value
                      return (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, role: role.value as any })}
                          className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                            isSelected
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-primary-600' : 'text-gray-400'}`} />
                          <span className={`text-sm font-medium block ${isSelected ? 'text-primary-700' : 'text-gray-600'}`}>
                            {role.label}
                          </span>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
                              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-4 text-base"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <FiArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-primary-600 hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
