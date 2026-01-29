'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import ResumeForm from '@/components/resume/ResumeForm'
import ResumePreview from '@/components/resume/ResumePreview'
import Link from 'next/link'
import { FiFileText, FiEye, FiEdit, FiDownload, FiLayout, FiCheckCircle, FiArrowRight } from 'react-icons/fi'

export default function ResumeBuilderPage() {
  const { data: session } = useSession()
  const [previewMode, setPreviewMode] = useState(false)
  const [resumeData, setResumeData] = useState({
    title: 'My Resume',
    template: 'modern',
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      linkedin: '',
      github: '',
      portfolio: '',
      profileImage: null as string | null,
    },
    summary: '',
    experience: [] as any[],
    education: [] as any[],
    skills: [] as any[],
    languages: [] as any[],
    projects: [] as any[],
    certifications: [] as any[],
  })

  // Fetch user profile and skills (for pre-fill from profile / catalog)
  useEffect(() => {
    if (!session?.user?.id) return
    Promise.all([
      fetch('/api/profile').then((r) => r.json()),
      fetch('/api/skills/user').then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([profileRes, userSkills]) => {
        const profile = profileRes.user
        const skillsList = Array.isArray(userSkills) ? userSkills : []
        setResumeData((prev) => {
          const next = { ...prev }
          if (profile) {
            next.personalInfo = {
              ...prev.personalInfo,
              fullName: profile.name || prev.personalInfo.fullName,
              email: profile.email || prev.personalInfo.email,
              phone: profile.phone || prev.personalInfo.phone,
              address: profile.location || prev.personalInfo.address,
              linkedin: profile.profile?.linkedinUrl || prev.personalInfo.linkedin,
              github: profile.profile?.githubUrl || prev.personalInfo.github,
              portfolio: profile.profile?.portfolioUrl || prev.personalInfo.portfolio,
              profileImage: profile.image || null,
            }
          }
          // Pre-fill skills from profile only when resume has no skills yet
          if (prev.skills.length === 0 && skillsList.length > 0) {
            next.skills = skillsList.map((s: { name?: string }) => ({
              name: typeof s.name === 'string' ? s.name : String(s.name ?? ''),
            }))
          }
          return next
        })
      })
      .catch((err) => console.error('Failed to fetch profile/skills:', err))
  }, [session])

  const features = [
    { icon: FiLayout, title: 'Professional Templates', description: 'Choose from modern designs' },
    { icon: FiEdit, title: 'Easy Editing', description: 'Simple drag-and-drop interface' },
    { icon: FiDownload, title: 'PDF Export', description: 'Download as PDF instantly' },
    { icon: FiCheckCircle, title: 'ATS Friendly', description: 'Optimized for job systems' },
  ]

  if (!session) {
    return (
      <div className="min-h-screen gradient-subtle">
        <div className="container-custom section flex items-center justify-center">
          <div className="max-w-lg text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiFileText className="w-10 h-10 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Resume Builder</h1>
            <p className="text-gray-600 mb-8">
              Create professional resumes that stand out. Sign in to get started with our easy-to-use builder.
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
    <div className="min-h-screen gradient-subtle">
      {/* Header */}
      <section className="bg-white border-b border-gray-100">
        <div className="container-custom py-6 md:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in-up">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Resume Builder</h1>
              <p className="text-gray-600 mt-1">Create a professional resume in minutes</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`btn ${previewMode ? 'btn-primary' : 'btn-secondary'}`}
              >
                {previewMode ? (
                  <>
                    <FiEdit className="w-5 h-5 mr-2" />
                    <span className="hidden sm:inline">Edit Mode</span>
                  </>
                ) : (
                  <>
                    <FiEye className="w-5 h-5 mr-2" />
                    <span className="hidden sm:inline">Preview</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="bg-gradient-to-r from-primary-50 to-blue-50 border-b border-primary-100">
        <div className="container-custom py-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="flex items-center space-x-3 text-sm">
                  <Icon className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-gray-900">{feature.title}</span>
                    <span className="text-gray-600 hidden md:inline"> - {feature.description}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-sm">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 animate-fade-in-up animation-delay-100">
            {/* Form Side */}
            <div className={previewMode ? 'hidden lg:block' : ''}>
              <div className="card p-6 md:p-8 sticky top-24">
                <ResumeForm resumeData={resumeData} setResumeData={setResumeData} />
              </div>
            </div>

            {/* Preview Side */}
            <div className={!previewMode ? 'hidden lg:block' : ''}>
              <div className="card p-6 md:p-8 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Resume Preview</h2>
                <ResumePreview resumeData={resumeData} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Toggle */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className="btn btn-primary shadow-2xl w-14 h-14 rounded-full p-0"
        >
          {previewMode ? <FiEdit className="w-6 h-6" /> : <FiEye className="w-6 h-6" />}
        </button>
      </div>
    </div>
  )
}
