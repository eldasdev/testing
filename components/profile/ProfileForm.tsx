'use client'

import { useState } from 'react'
import { FiSave, FiPlus, FiTrash2 } from 'react-icons/fi'

interface User {
  id: string
  name: string
  email: string
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
    level: number
    category: string | null
  }[]
}

interface ProfileFormProps {
  user: User
}

export default function ProfileForm({ user }: ProfileFormProps) {
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
  })
  const [skills, setSkills] = useState(user.skills)
  const [loading, setLoading] = useState(false)

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
        alert('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const addSkill = () => {
    setSkills([...skills, { id: '', name: '', level: 1, category: 'Technical' }])
  }

  const updateSkill = (index: number, field: string, value: any) => {
    const updated = [...skills]
    updated[index] = { ...updated[index], [field]: value }
    setSkills(updated)
  }

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
      <div className="space-y-6">
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

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Skills
            </label>
            <button
              type="button"
              onClick={addSkill}
              className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Skill</span>
            </button>
          </div>
          <div className="space-y-2">
            {skills.map((skill, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Skill name"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
                  value={skill.name}
                  onChange={(e) => updateSkill(index, 'name', e.target.value)}
                />
                <select
                  className="px-4 py-2 border border-gray-300 rounded-md"
                  value={skill.level}
                  onChange={(e) => updateSkill(index, 'level', parseInt(e.target.value))}
                >
                  {[1, 2, 3, 4, 5].map(level => (
                    <option key={level} value={level}>Level {level}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
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
  )
}
