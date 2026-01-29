'use client'

import { useState } from 'react'
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import ResumeSkillSelector from '@/components/resume/ResumeSkillSelector'

interface ResumeFormProps {
  resumeData: any
  setResumeData: (data: any) => void
}

export default function ResumeForm({ resumeData, setResumeData }: ResumeFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const updatePersonalInfo = (field: string, value: string) => {
    setResumeData({
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [field]: value,
      },
    })
  }

  const addItem = (section: string) => {
    const emptyItem = getEmptyItem(section)
    setResumeData({
      ...resumeData,
      [section]: [...resumeData[section], emptyItem],
    })
  }

  const updateItem = (section: string, index: number, field: string, value: any) => {
    const updated = [...resumeData[section]]
    updated[index] = { ...updated[index], [field]: value }
    setResumeData({ ...resumeData, [section]: updated })
  }

  const removeItem = (section: string, index: number) => {
    setResumeData({
      ...resumeData,
      [section]: resumeData[section].filter((_: any, i: number) => i !== index),
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resumeData),
      })

      if (response.ok) {
        router.refresh()
        // Note: Success message will be handled by router refresh or page state
      }
    } catch (error) {
      console.error('Failed to save resume:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Resume Details</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          <FiSave className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Resume'}</span>
        </button>
      </div>

      {/* Personal Information */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            value={resumeData.personalInfo.fullName}
            onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            value={resumeData.personalInfo.email}
            onChange={(e) => updatePersonalInfo('email', e.target.value)}
          />
          <input
            type="tel"
            placeholder="Phone"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            value={resumeData.personalInfo.phone}
            onChange={(e) => updatePersonalInfo('phone', e.target.value)}
          />
          <input
            type="text"
            placeholder="Address"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            value={resumeData.personalInfo.address}
            onChange={(e) => updatePersonalInfo('address', e.target.value)}
          />
          <input
            type="url"
            placeholder="LinkedIn URL"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            value={resumeData.personalInfo.linkedin}
            onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
          />
          <input
            type="url"
            placeholder="GitHub URL"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            value={resumeData.personalInfo.github}
            onChange={(e) => updatePersonalInfo('github', e.target.value)}
          />
        </div>
      </section>

      {/* Summary */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Professional Summary</h3>
        <textarea
          placeholder="Write a brief summary of your professional background..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md h-24"
          value={resumeData.summary}
          onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
        />
      </section>

      {/* Experience */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Experience</h3>
          <button
            onClick={() => addItem('experience')}
            className="flex items-center space-x-1 text-primary-600 hover:text-primary-700"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
        {resumeData.experience.map((exp: any, index: number) => (
          <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => removeItem('experience', index)}
                className="text-red-600 hover:text-red-700"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Job Title"
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-2"
              value={exp.title || ''}
              onChange={(e) => updateItem('experience', index, 'title', e.target.value)}
            />
            <input
              type="text"
              placeholder="Company"
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-2"
              value={exp.company || ''}
              onChange={(e) => updateItem('experience', index, 'company', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="text"
                placeholder="Start Date"
                className="px-4 py-2 border border-gray-300 rounded-md"
                value={exp.startDate || ''}
                onChange={(e) => updateItem('experience', index, 'startDate', e.target.value)}
              />
              <input
                type="text"
                placeholder="End Date"
                className="px-4 py-2 border border-gray-300 rounded-md"
                value={exp.endDate || ''}
                onChange={(e) => updateItem('experience', index, 'endDate', e.target.value)}
              />
            </div>
            <textarea
              placeholder="Description"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              value={exp.description || ''}
              onChange={(e) => updateItem('experience', index, 'description', e.target.value)}
            />
          </div>
        ))}
      </section>

      {/* Education */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Education</h3>
          <button
            onClick={() => addItem('education')}
            className="flex items-center space-x-1 text-primary-600 hover:text-primary-700"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
        {resumeData.education.map((edu: any, index: number) => (
          <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => removeItem('education', index)}
                className="text-red-600 hover:text-red-700"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Degree"
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-2"
              value={edu.degree || ''}
              onChange={(e) => updateItem('education', index, 'degree', e.target.value)}
            />
            <input
              type="text"
              placeholder="Institution"
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-2"
              value={edu.institution || ''}
              onChange={(e) => updateItem('education', index, 'institution', e.target.value)}
            />
            <input
              type="text"
              placeholder="Graduation Year"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              value={edu.year || ''}
              onChange={(e) => updateItem('education', index, 'year', e.target.value)}
            />
          </div>
        ))}
      </section>

      {/* Skills – integrated with skills catalog (same as profile) */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Skills</h3>
        <ResumeSkillSelector
          selectedSkills={resumeData.skills}
          onSkillsChange={(skills) => setResumeData({ ...resumeData, skills })}
          maxSkills={25}
        />
      </section>
    </div>
  )
}

function getEmptyItem(section: string) {
  switch (section) {
    case 'experience':
      return { title: '', company: '', startDate: '', endDate: '', description: '' }
    case 'education':
      return { degree: '', institution: '', year: '' }
    case 'skills':
      return { name: '' }
    case 'languages':
      return { name: '', level: '' }
    case 'projects':
      return { name: '', description: '', url: '' }
    case 'certifications':
      return { name: '', issuer: '', date: '' }
    default:
      return {}
  }
}
