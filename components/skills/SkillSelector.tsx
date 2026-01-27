'use client'

import { useState, useEffect, useRef } from 'react'
import { FiPlus, FiX, FiSearch, FiStar, FiLoader, FiCheck } from 'react-icons/fi'

interface Skill {
  id: string
  name: string
  category: string
  industry: string
  isPopular: boolean
}

interface UserSkill {
  id: string
  name: string
  proficiency: string
  yearsExperience?: number
  category?: string
  skillCatalogId?: string | null
  skillCatalog?: Skill
}

interface SkillSelectorProps {
  selectedSkills: UserSkill[]
  onSkillsChange: (skills: UserSkill[]) => void
  maxSkills?: number
}

const proficiencyLevels = [
  { value: 'BEGINNER', label: 'Beginner', description: 'Learning the basics', color: 'bg-gray-100 text-gray-700' },
  { value: 'JUNIOR', label: 'Junior', description: '0-2 years experience', color: 'bg-blue-100 text-blue-700' },
  { value: 'MIDDLE', label: 'Middle', description: '2-5 years experience', color: 'bg-green-100 text-green-700' },
  { value: 'SENIOR', label: 'Senior', description: '5+ years experience', color: 'bg-purple-100 text-purple-700' },
  { value: 'EXPERT', label: 'Expert', description: 'Industry expert', color: 'bg-orange-100 text-orange-700' },
]

export default function SkillSelector({ selectedSkills, onSkillsChange, maxSkills = 20 }: SkillSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [catalogSkills, setCatalogSkills] = useState<Skill[]>([])
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [addingSkill, setAddingSkill] = useState<string | null>(null)
  const [editingSkill, setEditingSkill] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch skills catalog
  useEffect(() => {
    const fetchSkills = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/skills/catalog?limit=500')
        const data = await response.json()
        
        // Ensure skills is an array of proper skill objects
        const skills = Array.isArray(data.skills) ? data.skills : []
        setCatalogSkills(skills)
        
        // Ensure categories are strings, not objects
        const cats = data.filters?.categories || []
        const stringCategories = cats.map((c: any) => typeof c === 'string' ? c : c?.category || c?.name || String(c))
        setCategories(stringCategories.filter(Boolean))
      } catch (error) {
        console.error('Failed to fetch skills:', error)
        setCatalogSkills([])
        setCategories([])
      } finally {
        setLoading(false)
      }
    }
    fetchSkills()
  }, [])

  // Helper to safely get string from name field
  const getNameString = (name: any): string => {
    if (typeof name === 'string') return name
    if (name && typeof name === 'object' && 'name' in name) return String(name.name)
    return String(name || '')
  }

  // Filter skills based on search and category
  useEffect(() => {
    let filtered = catalogSkills

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(s => {
        const cat = typeof s.category === 'string' ? s.category : ''
        return cat === selectedCategory
      })
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(s => {
        const name = getNameString(s.name)
        return name.toLowerCase().includes(searchLower)
      })
    }

    // Exclude already selected skills
    const selectedNames = new Set(selectedSkills.map(s => getNameString(s.name).toLowerCase()))
    filtered = filtered.filter(s => !selectedNames.has(getNameString(s.name).toLowerCase()))

    // Sort: popular first, then alphabetically
    filtered.sort((a, b) => {
      if (a.isPopular && !b.isPopular) return -1
      if (!a.isPopular && b.isPopular) return 1
      return getNameString(a.name).localeCompare(getNameString(b.name))
    })

    setFilteredSkills(filtered.slice(0, 50))
  }, [search, selectedCategory, catalogSkills, selectedSkills])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAddSkill = (skill: Skill, proficiency: string = 'JUNIOR') => {
    if (selectedSkills.length >= maxSkills) {
      // Note: Alert modal would require importing useAlertModal hook
      // For now, keeping alert but this should be updated if modal is needed
      alert(`Maximum ${maxSkills} skills allowed`)
      return
    }

    // Ensure name is always a string
    const skillName = getNameString(skill.name)
    const skillCategory = typeof skill.category === 'string' ? skill.category : ''

    const newSkill: UserSkill = {
      id: `temp-${Date.now()}`,
      name: skillName,
      proficiency,
      category: skillCategory,
      skillCatalogId: skill.id,
    }

    onSkillsChange([...selectedSkills, newSkill])
    setSearch('')
    setAddingSkill(null)
  }

  const handleAddCustomSkill = (proficiency: string = 'JUNIOR') => {
    if (!search.trim()) return
    if (selectedSkills.length >= maxSkills) {
      // Note: Alert modal would require importing useAlertModal hook
      // For now, keeping alert but this should be updated if modal is needed
      alert(`Maximum ${maxSkills} skills allowed`)
      return
    }

    const newSkill: UserSkill = {
      id: `temp-${Date.now()}`,
      name: search.trim(),
      proficiency,
    }

    onSkillsChange([...selectedSkills, newSkill])
    setSearch('')
    setIsOpen(false)
  }

  const handleRemoveSkill = (skillId: string) => {
    onSkillsChange(selectedSkills.filter(s => s.id !== skillId))
  }

  const handleUpdateProficiency = (skillId: string, proficiency: string) => {
    onSkillsChange(
      selectedSkills.map(s => 
        s.id === skillId ? { ...s, proficiency } : s
      )
    )
    setEditingSkill(null)
  }

  const getProficiencyColor = (proficiency: any) => {
    const prof = typeof proficiency === 'string' ? proficiency : String(proficiency || 'JUNIOR')
    return proficiencyLevels.find(p => p.value === prof)?.color || 'bg-gray-100 text-gray-700'
  }

  const getProficiencyLabel = (proficiency: any) => {
    const prof = typeof proficiency === 'string' ? proficiency : String(proficiency || 'JUNIOR')
    return proficiencyLevels.find(p => p.value === prof)?.label || prof
  }

  return (
    <div className="space-y-4">
      {/* Selected Skills */}
      <div className="flex flex-wrap gap-2">
        {selectedSkills.map((skill) => {
          // Ensure skill.name is a string
          const skillName = getNameString(skill.name)
          
          return (
          <div
            key={skill.id}
            className="group relative flex items-center space-x-1 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-sm"
          >
            <span className="font-medium text-gray-900">{skillName}</span>
            <button
              onClick={() => setEditingSkill(editingSkill === skill.id ? null : skill.id)}
              className={`px-2 py-0.5 text-xs font-medium rounded-md ${getProficiencyColor(skill.proficiency)} cursor-pointer hover:opacity-80`}
            >
              {getProficiencyLabel(skill.proficiency)}
            </button>
            <button
              onClick={() => handleRemoveSkill(skill.id)}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>

            {/* Proficiency Dropdown */}
            {editingSkill === skill.id && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                  Select Proficiency Level
                </div>
                {proficiencyLevels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => handleUpdateProficiency(skill.id, level.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 ${
                      skill.proficiency === level.value ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${level.color}`}>
                        {level.label}
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">{level.description}</p>
                    </div>
                    {skill.proficiency === level.value && (
                      <FiCheck className="w-4 h-4 text-primary-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )})}
      </div>

      {/* Add Skill Button/Search */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search skills or type to add custom..."
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {loading && (
            <FiLoader className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-hidden z-50">
            {/* Category Filter */}
            <div className="p-3 border-b border-gray-100 overflow-x-auto">
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    !selectedCategory
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {categories.slice(0, 8).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills List */}
            <div className="max-h-64 overflow-y-auto">
              {/* Custom skill option */}
              {search && !filteredSkills.some(s => s.name.toLowerCase() === search.toLowerCase()) && (
                <div className="p-3 border-b border-gray-100 bg-blue-50">
                  <p className="text-sm text-blue-700 mb-2">
                    Add "{search}" as a custom skill:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {proficiencyLevels.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => handleAddCustomSkill(level.value)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg ${level.color} hover:opacity-80`}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredSkills.length > 0 ? (
                filteredSkills.map((skill) => {
                  // Ensure name and category are strings using helper
                  const skillName = getNameString(skill.name)
                  const skillCategory = typeof skill.category === 'string' ? skill.category : String(skill.category || '')
                  
                  return (
                  <div
                    key={skill.id}
                    className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{skillName}</span>
                        {skill.isPopular && (
                          <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{skillCategory}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {proficiencyLevels.map((level) => (
                        <button
                          key={level.value}
                          onClick={() => handleAddSkill(skill, level.value)}
                          className={`px-3 py-1 text-xs font-medium rounded-lg ${level.color} hover:opacity-80 transition-opacity`}
                        >
                          + {level.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )})
              ) : !search ? (
                <div className="p-8 text-center text-gray-500">
                  <p>Start typing to search for skills</p>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>No matching skills found</p>
                  <p className="text-sm mt-1">You can add "{search}" as a custom skill above</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Skills Count */}
      <p className="text-sm text-gray-500">
        {selectedSkills.length} of {maxSkills} skills selected
      </p>
    </div>
  )
}
