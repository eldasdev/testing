'use client'

import { useState } from 'react'
import { FiPlus, FiX } from 'react-icons/fi'

interface NewRoadmapFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function NewRoadmapForm({ onSuccess, onCancel }: NewRoadmapFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    milestones: [{ title: '', completed: false }],
  })
  const [loading, setLoading] = useState(false)

  const addMilestone = () => {
    setFormData({
      ...formData,
      milestones: [...formData.milestones, { title: '', completed: false }],
    })
  }

  const updateMilestone = (index: number, title: string) => {
    const updated = [...formData.milestones]
    updated[index] = { ...updated[index], title }
    setFormData({ ...formData, milestones: updated })
  }

  const removeMilestone = (index: number) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/roadmaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          milestones: formData.milestones.filter(m => m.title.trim()),
        }),
      })

      if (response.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error('Failed to create roadmap:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Create New Roadmap</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          type="text"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Milestones
          </label>
          <button
            type="button"
            onClick={addMilestone}
            className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Milestone</span>
          </button>
        </div>
        <div className="space-y-2">
          {formData.milestones.map((milestone, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Milestone title"
                value={milestone.title}
                onChange={(e) => updateMilestone(index, e.target.value)}
              />
              {formData.milestones.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMilestone(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Roadmap'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
