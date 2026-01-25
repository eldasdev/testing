'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import RoadmapList from '@/components/roadmap/RoadmapList'
import NewRoadmapForm from '@/components/roadmap/NewRoadmapForm'
import Link from 'next/link'
import { FiPlus, FiTarget, FiTrendingUp, FiCheckCircle, FiMap, FiArrowRight, FiCompass, FiFlag, FiAward } from 'react-icons/fi'

export default function RoadmapPage() {
  const { data: session } = useSession()
  const [roadmaps, setRoadmaps] = useState<any[]>([])
  const [showNewForm, setShowNewForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchRoadmaps()
    }
  }, [session])

  const fetchRoadmaps = async () => {
    try {
      const response = await fetch('/api/roadmaps')
      if (response.ok) {
        const data = await response.json()
        setRoadmaps(data)
      }
    } catch (error) {
      console.error('Failed to fetch roadmaps:', error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: FiCompass,
      title: 'Set Your Direction',
      description: 'Define clear career goals and milestones.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: FiFlag,
      title: 'Track Progress',
      description: 'Monitor your journey towards each goal.',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: FiTrendingUp,
      title: 'Stay Motivated',
      description: 'Celebrate achievements along the way.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: FiAward,
      title: 'Achieve Success',
      description: 'Reach your career destination.',
      color: 'from-orange-500 to-orange-600',
    },
  ]

  if (!session) {
    return (
      <div className="min-h-screen gradient-subtle">
        <div className="container-custom section flex items-center justify-center">
          <div className="max-w-lg text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiMap className="w-10 h-10 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Career Roadmap</h1>
            <p className="text-gray-600 mb-8">
              Plan your career path with personalized milestones and goals. Sign in to create your roadmap.
            </p>
            <Link href="/auth/signin" className="btn btn-primary">
              Sign In to Continue
              <FiArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative gradient-primary text-white overflow-hidden">
        <div className="absolute inset-0 pattern-grid" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float" />
        
        <div className="relative container-custom py-12 md:py-20">
          <div className="max-w-3xl animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Career Roadmap
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8">
              Plan your career path with personalized milestones and track your progress.
            </p>
            
            <button
              onClick={() => setShowNewForm(!showNewForm)}
              className="btn px-6 py-3 bg-white text-primary-600 hover:bg-primary-50 shadow-lg"
            >
              <FiPlus className="w-5 h-5 mr-2" />
              Create New Roadmap
            </button>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 md:h-16" viewBox="0 0 1440 74" fill="none">
            <path d="M0 74V25.5C240 -8.5 480 -8.5 720 25.5C960 59.5 1200 59.5 1440 25.5V74H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="section-sm gradient-subtle">
        <div className="container-custom">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div 
                  key={index}
                  className="card p-6 text-center card-hover animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-12 h-12 mx-auto bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section bg-white">
        <div className="container-custom">
          {/* New Roadmap Form */}
          {showNewForm && (
            <div className="mb-8 animate-fade-in-up">
              <div className="card p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Create New Roadmap</h2>
                  <button 
                    onClick={() => setShowNewForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <NewRoadmapForm
                  onSuccess={() => {
                    setShowNewForm(false)
                    fetchRoadmaps()
                  }}
                  onCancel={() => setShowNewForm(false)}
                />
              </div>
            </div>
          )}

          {/* Roadmaps List */}
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Your Roadmaps</h2>
              {!showNewForm && (
                <button
                  onClick={() => setShowNewForm(true)}
                  className="btn btn-primary text-sm"
                >
                  <FiPlus className="w-5 h-5 mr-2" />
                  New Roadmap
                </button>
              )}
            </div>

            {loading ? (
              <div className="card p-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
                <p className="text-gray-500 mt-4">Loading your roadmaps...</p>
              </div>
            ) : roadmaps.length > 0 ? (
              <RoadmapList roadmaps={roadmaps} onUpdate={fetchRoadmaps} />
            ) : (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiTarget className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No roadmaps yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first career roadmap to start tracking your goals.
                </p>
                <button
                  onClick={() => setShowNewForm(true)}
                  className="btn btn-primary"
                >
                  <FiPlus className="w-5 h-5 mr-2" />
                  Create Your First Roadmap
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
