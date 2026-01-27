'use client'

import { useState, useEffect, useRef } from 'react'
import { FiMoreVertical, FiEdit2, FiTrash2, FiStar, FiEye, FiEyeOff, FiUsers } from 'react-icons/fi'

interface Skill {
  id: string
  name: string
  category: string
  industry: string
  isPopular: boolean
  isActive: boolean
  usageCount: number
  _count: {
    userSkills: number
  }
}

interface SkillsManagementTableProps {
  skills: Skill[]
  isSuperAdmin: boolean
}

export default function SkillsManagementTable({ skills, isSuperAdmin }: SkillsManagementTableProps) {
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActionMenuOpen(null)
      }
    }

    if (actionMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [actionMenuOpen])

  const handleTogglePopular = async (skillId: string, currentValue: boolean) => {
    setLoading(skillId)
    try {
      await fetch(`/api/skills/catalog/${skillId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPopular: !currentValue }),
      })
      window.location.reload()
    } catch (error) {
      console.error('Failed to update skill:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleToggleActive = async (skillId: string, currentValue: boolean) => {
    setLoading(skillId)
    try {
      await fetch(`/api/skills/catalog/${skillId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentValue }),
      })
      window.location.reload()
    } catch (error) {
      console.error('Failed to update skill:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (skillId: string) => {
    // Note: Confirm modal would require importing useConfirmModal hook
    // For now, keeping confirm but this should be updated if modal is needed
    if (!confirm('Are you sure you want to delete this skill?')) return
    
    setLoading(skillId)
    try {
      await fetch(`/api/skills/catalog/${skillId}`, {
        method: 'DELETE',
      })
      window.location.reload()
    } catch (error) {
      console.error('Failed to delete skill:', error)
    } finally {
      setLoading(null)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Programming Languages': 'bg-blue-100 text-blue-700',
      'Frontend Frameworks': 'bg-purple-100 text-purple-700',
      'Backend Frameworks': 'bg-green-100 text-green-700',
      'Databases': 'bg-yellow-100 text-yellow-700',
      'Cloud & DevOps': 'bg-orange-100 text-orange-700',
      'AI & ML': 'bg-pink-100 text-pink-700',
      'Mobile Development': 'bg-indigo-100 text-indigo-700',
      'Design': 'bg-rose-100 text-rose-700',
      'Design Tools': 'bg-rose-100 text-rose-700',
      'Marketing': 'bg-cyan-100 text-cyan-700',
      'Finance': 'bg-emerald-100 text-emerald-700',
      'Business': 'bg-slate-100 text-slate-700',
      'Soft Skills': 'bg-amber-100 text-amber-700',
      'Languages': 'bg-teal-100 text-teal-700',
    }
    return colors[category] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Skill
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Category
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Industry
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Usage
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Status
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {skills.map((skill) => (
            <tr 
              key={skill.id} 
              className={`hover:bg-gray-50 transition-colors ${!skill.isActive ? 'opacity-50' : ''}`}
            >
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-gray-900">{skill.name}</span>
                  {skill.isPopular && (
                    <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${getCategoryColor(skill.category)}`}>
                  {skill.category}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {skill.industry}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <FiUsers className="w-4 h-4" />
                  <span>{skill._count.userSkills} users</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                  skill.isActive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {skill.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="relative flex justify-end" ref={actionMenuOpen === skill.id ? menuRef : null}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setActionMenuOpen(actionMenuOpen === skill.id ? null : skill.id)
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={loading === skill.id}
                  >
                    <FiMoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                  
                  {actionMenuOpen === skill.id && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-[9999]">
                      <button
                        onClick={() => {
                          setActionMenuOpen(null)
                          handleTogglePopular(skill.id, skill.isPopular)
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FiStar className={`w-4 h-4 ${skill.isPopular ? 'text-yellow-500 fill-current' : ''}`} />
                        <span>{skill.isPopular ? 'Remove from Popular' : 'Mark as Popular'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setActionMenuOpen(null)
                          handleToggleActive(skill.id, skill.isActive)
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {skill.isActive ? (
                          <>
                            <FiEyeOff className="w-4 h-4" />
                            <span>Deactivate</span>
                          </>
                        ) : (
                          <>
                            <FiEye className="w-4 h-4" />
                            <span>Activate</span>
                          </>
                        )}
                      </button>
                      {isSuperAdmin && (
                        <button
                          onClick={() => {
                            setActionMenuOpen(null)
                            handleDelete(skill.id)
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
