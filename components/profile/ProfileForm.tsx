'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { FiSave, FiAward } from 'react-icons/fi'
import SkillSelector from '@/components/skills/SkillSelector'
import AvatarUpload from '@/components/profile/AvatarUpload'
import { useAlertModal } from '@/components/ui/AlertModal'

interface UserSkill {
  id: string
  name: string
  proficiency: string
  yearsExperience?: number
  category?: string
  skillCatalogId?: string | null
}

interface User {
  id: string
  name: string
  email: string
  role: string
  image: string | null
  logo: string | null
  bio: string | null
  location: string | null
  phone: string | null
  profile: {
    education: string | null
    university: string | null
    graduationYear: number | null
    interests: string[]
    languages: string[]
    linkedinUrl: string | null
    githubUrl: string | null
    portfolioUrl: string | null
  } | null
  skills: {
    id: string
    name: string
    proficiency?: string
    level?: number
    category: string | null
    skillCatalogId?: string | null
  }[]
}

interface ProfileFormProps {
  user: User
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const { update: updateSession } = useSession()
  const isCompany = user.role === 'COMPANY'
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio || '',
    location: user.location || '',
    phone: user.phone || '',
    education: user.profile?.education || '',
    university: user.profile?.university || '',
    graduationYear: user.profile?.graduationYear?.toString() || '',
    linkedinUrl: user.profile?.linkedinUrl || '',
    githubUrl: user.profile?.githubUrl || '',
    portfolioUrl: user.profile?.portfolioUrl || '',
    image: user.image || null,
    logo: user.logo || null,
  })
  
  // Helper to safely get string from name field
  const getNameString = (name: any): string => {
    if (typeof name === 'string') return name
    if (name && typeof name === 'object' && 'name' in name) return String(name.name)
    return String(name || '')
  }

  // Convert old level-based skills to new proficiency system
  const convertedSkills: UserSkill[] = (user.skills || []).map(skill => ({
    id: skill.id || `temp-${Date.now()}-${Math.random()}`,
    name: getNameString(skill.name),
    proficiency: skill.proficiency || levelToProficiency(skill.level || 1),
    category: typeof skill.category === 'string' ? skill.category : undefined,
    skillCatalogId: skill.skillCatalogId,
  })).filter(skill => skill.name) // Filter out any skills without names
  
  const [skills, setSkills] = useState<UserSkill[]>(convertedSkills)
  const [loading, setLoading] = useState(false)
  const [savingSkills, setSavingSkills] = useState(false)
  const { showAlert, AlertComponent } = useAlertModal()
  
  // Helper to convert old level (1-5) to new proficiency
  function levelToProficiency(level: number): string {
    if (level <= 1) return 'BEGINNER'
    if (level <= 2) return 'JUNIOR'
    if (level <= 3) return 'MIDDLE'
    if (level <= 4) return 'SENIOR'
    return 'EXPERT'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // Refresh session to update avatar in navbar
        await updateSession()
        showAlert({
          type: 'success',
          title: 'Success',
          message: 'Profile updated successfully!',
        })
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSkillsChange = (newSkills: UserSkill[]) => {
    setSkills(newSkills)
  }
  
  const handleSaveSkills = async () => {
    setSavingSkills(true)
    try {
      // Delete existing skills
      const existingSkillIds = user.skills.map(s => s.id).filter(id => id)
      for (const skillId of existingSkillIds) {
        if (skillId) {
          await fetch(`/api/skills/user/${skillId}`, { method: 'DELETE' })
        }
      }
      
      // Add new skills
      for (const skill of skills) {
        if (!skill.id.startsWith('temp-')) continue // Skip if already saved
        
        await fetch('/api/skills/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: skill.name,
            proficiency: skill.proficiency,
            skillCatalogId: skill.skillCatalogId,
            category: skill.category,
          }),
        })
      }
      
      showAlert({
        type: 'success',
        title: 'Success',
        message: 'Skills saved successfully!',
        onConfirm: () => {
          window.location.reload()
        },
      })
    } catch (error) {
      console.error('Failed to save skills:', error)
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to save skills',
      })
    } finally {
      setSavingSkills(false)
    }
  }

  return (
    <>
      <AlertComponent />
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
      <div className="space-y-6">
        {/* Avatar/Logo Upload */}
        <AvatarUpload
          currentImage={isCompany ? formData.logo : formData.image}
          onImageChange={(url) => {
            if (isCompany) {
              setFormData({ ...formData, logo: url })
            } else {
              setFormData({ ...formData, image: url })
            }
          }}
          isCompany={isCompany}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
            value={user.email}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Education
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={formData.education}
            onChange={(e) => setFormData({ ...formData, education: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              University
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Graduation Year
            </label>
            <input
              type="number"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.graduationYear}
              onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <FiAward className="w-5 h-5 text-primary-600" />
              <label className="text-lg font-semibold text-gray-900">
                Skills & Proficiency
              </label>
            </div>
            <button
              type="button"
              onClick={handleSaveSkills}
              disabled={savingSkills}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
            >
              <FiSave className="w-4 h-4" />
              <span>{savingSkills ? 'Saving...' : 'Save Skills'}</span>
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Select skills from our catalog or add custom skills. Choose your proficiency level (Beginner, Junior, Middle, Senior, Expert) for each skill.
          </p>
          <SkillSelector
            selectedSkills={skills}
            onSkillsChange={handleSkillsChange}
            maxSkills={25}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            LinkedIn URL
          </label>
          <input
            type="url"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={formData.linkedinUrl}
            onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GitHub URL
          </label>
          <input
            type="url"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={formData.githubUrl}
            onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Portfolio URL
          </label>
          <input
            type="url"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={formData.portfolioUrl}
            onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
        >
          <FiSave className="w-5 h-5" />
          <span>{loading ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </div>
    </form>
    </>
  )
}
