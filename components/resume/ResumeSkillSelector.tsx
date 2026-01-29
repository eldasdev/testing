'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { FiX, FiSearch, FiStar, FiLoader } from 'react-icons/fi'

interface CatalogSkill {
  id: string
  name: string
  category: string
  industry: string
  isPopular: boolean
}

interface ResumeSkill {
  name: string
}

interface ResumeSkillSelectorProps {
  selectedSkills: ResumeSkill[]
  onSkillsChange: (skills: ResumeSkill[]) => void
  maxSkills?: number
}

export default function ResumeSkillSelector({
  selectedSkills,
  onSkillsChange,
  maxSkills = 25,
}: ResumeSkillSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [catalogSkills, setCatalogSkills] = useState<CatalogSkill[]>([])
  const [filteredSkills, setFilteredSkills] = useState<CatalogSkill[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const getNameString = (name: unknown): string => {
    if (typeof name === 'string') return name
    if (name && typeof name === 'object' && 'name' in name) return String((name as { name: string }).name)
    return String(name ?? '')
  }

  useEffect(() => {
    const fetchSkills = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/skills/catalog?limit=500')
        const data = await res.json()
        const skills = Array.isArray(data.skills) ? data.skills : []
        setCatalogSkills(skills)
        const cats = data.filters?.categories || []
        const stringCategories = cats.map((c: unknown) =>
          typeof c === 'string' ? c : (c as { category?: string; name?: string })?.category ?? (c as { category?: string; name?: string })?.name ?? String(c)
        )
        setCategories(stringCategories.filter(Boolean))
      } catch (err) {
        console.error('Failed to fetch skills catalog:', err)
        setCatalogSkills([])
        setCategories([])
      } finally {
        setLoading(false)
      }
    }
    fetchSkills()
  }, [])

  useEffect(() => {
    let filtered = catalogSkills
    if (selectedCategory) {
      filtered = filtered.filter(
        (s) => (typeof s.category === 'string' ? s.category : '') === selectedCategory
      )
    }
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter((s) => getNameString(s.name).toLowerCase().includes(q))
    }
    const selectedNames = new Set(
      selectedSkills.map((s) => getNameString(s.name).toLowerCase())
    )
    filtered = filtered.filter(
      (s) => !selectedNames.has(getNameString(s.name).toLowerCase())
    )
    filtered.sort((a, b) => {
      if (a.isPopular && !b.isPopular) return -1
      if (!a.isPopular && b.isPopular) return 1
      return getNameString(a.name).localeCompare(getNameString(b.name))
    })
    setFilteredSkills(filtered.slice(0, 50))
  }, [search, selectedCategory, catalogSkills, selectedSkills])

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setDropdownRect({
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
      })
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      updatePosition()
      const onScrollOrResize = () => updatePosition()
      window.addEventListener('scroll', onScrollOrResize, true)
      window.addEventListener('resize', onScrollOrResize)
      return () => {
        window.removeEventListener('scroll', onScrollOrResize, true)
        window.removeEventListener('resize', onScrollOrResize)
      }
    } else {
      setDropdownRect(null)
    }
  }, [isOpen, updatePosition])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) return
      setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const addSkill = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    if (selectedSkills.length >= maxSkills) {
      alert(`Maximum ${maxSkills} skills allowed`)
      return
    }
    const exists = selectedSkills.some(
      (s) => getNameString(s.name).toLowerCase() === trimmed.toLowerCase()
    )
    if (exists) return
    onSkillsChange([...selectedSkills, { name: trimmed }])
    setSearch('')
    setIsOpen(false)
  }

  const removeSkill = (index: number) => {
    onSkillsChange(selectedSkills.filter((_, i) => i !== index))
  }

  const handleAddFromCatalog = (skill: CatalogSkill) => {
    addSkill(getNameString(skill.name))
  }

  const handleAddCustom = () => {
    if (search.trim()) addSkill(search.trim())
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        Choose from the skills catalog or add your own. Same catalog as your profile.
      </p>
      <div className="flex flex-wrap gap-2">
        {selectedSkills.map((skill, index) => (
          <span
            key={`${getNameString(skill.name)}-${index}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-primary-700 rounded-lg text-sm border border-blue-100"
          >
            {getNameString(skill.name)}
            <button
              type="button"
              onClick={() => removeSkill(index)}
              className="p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              aria-label="Remove skill"
            >
              <FiX className="w-4 h-4" />
            </button>
          </span>
        ))}
      </div>

      <div className="relative" ref={triggerRef}>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => {
              setIsOpen(true)
              if (triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect()
                setDropdownRect({ top: rect.bottom, left: rect.left, width: rect.width })
              }
            }}
            placeholder="Search catalog or type to add custom skill..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {loading && (
            <FiLoader className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
          )}
        </div>

        {isOpen &&
          typeof document !== 'undefined' &&
          dropdownRect &&
          createPortal(
            <div
              ref={dropdownRef}
              className="fixed bg-white rounded-lg border border-gray-200 shadow-xl z-[9999] flex flex-col"
              style={{
                top: dropdownRect.top + 4,
                left: dropdownRect.left,
                width: dropdownRect.width,
                maxHeight: 'min(20rem, 70vh)',
                position: 'fixed',
              }}
            >
              <div className="p-2 border-b border-gray-100 overflow-x-auto flex-shrink-0">
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
                      !selectedCategory ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  {categories.slice(0, 8).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
                        selectedCategory === cat ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-y-auto flex-1 min-h-0">
                {search.trim() &&
                  !filteredSkills.some(
                    (s) => getNameString(s.name).toLowerCase() === search.trim().toLowerCase()
                  ) && (
                    <div className="p-3 border-b border-gray-100 bg-blue-50">
                      <p className="text-sm text-gray-700 mb-2">Add &quot;{search.trim()}&quot; as custom skill:</p>
                      <button
                        type="button"
                        onClick={handleAddCustom}
                        className="px-3 py-1.5 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        Add skill
                      </button>
                    </div>
                  )}
                {filteredSkills.length > 0 ? (
                  <ul className="py-1">
                    {filteredSkills.map((skill) => (
                      <li key={skill.id}>
                        <button
                          type="button"
                          onClick={() => handleAddFromCatalog(skill)}
                          className="w-full flex items-center justify-between gap-2 px-4 py-2 text-left hover:bg-gray-50 text-sm"
                        >
                          <span className="font-medium text-gray-900">{getNameString(skill.name)}</span>
                          <span className="flex items-center gap-1 text-gray-500">
                            {skill.isPopular && <FiStar className="w-4 h-4 text-yellow-500 fill-current" />}
                            <span className="text-xs">{skill.category}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    {search ? 'No matches. Use the button above to add a custom skill.' : 'Type to search the catalog.'}
                  </div>
                )}
              </div>
            </div>,
            document.body
          )}
      </div>
      <p className="text-xs text-gray-500">
        {selectedSkills.length} of {maxSkills} skills
      </p>
    </div>
  )
}
