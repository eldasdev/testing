'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { FiSearch, FiMapPin, FiBriefcase, FiTrendingUp, FiX } from 'react-icons/fi'

export default function JobFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    type: searchParams.get('type') || '',
    experience: searchParams.get('experience') || '',
  })

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    
    router.push(`/jobs?${params.toString()}`)
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== '')

  return (
    <div className="space-y-5">
      {/* Search */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Search
        </label>
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Job title, company..."
            className="input input-icon"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <FiMapPin className="w-4 h-4 mr-2 text-primary-600" />
          Location
        </label>
        <select
          className="input"
          value={filters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
        >
          <option value="">All Locations</option>
          <option value="Tashkent">Tashkent</option>
          <option value="Samarkand">Samarkand</option>
          <option value="Bukhara">Bukhara</option>
          <option value="Andijan">Andijan</option>
          <option value="Fergana">Fergana</option>
          <option value="Namangan">Namangan</option>
          <option value="Remote">Remote</option>
        </select>
      </div>

      {/* Job Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <FiBriefcase className="w-4 h-4 mr-2 text-primary-600" />
          Job Type
        </label>
        <select
          className="input"
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
        >
          <option value="">All Types</option>
          <option value="FULL_TIME">Full Time</option>
          <option value="PART_TIME">Part Time</option>
          <option value="INTERNSHIP">Internship</option>
          <option value="CONTRACT">Contract</option>
        </select>
      </div>

      {/* Experience Level */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <FiTrendingUp className="w-4 h-4 mr-2 text-primary-600" />
          Experience Level
        </label>
        <select
          className="input"
          value={filters.experience}
          onChange={(e) => handleFilterChange('experience', e.target.value)}
        >
          <option value="">All Levels</option>
          <option value="ENTRY">Entry Level</option>
          <option value="JUNIOR">Junior</option>
          <option value="MID">Mid Level</option>
          <option value="SENIOR">Senior</option>
        </select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={() => {
            setFilters({ search: '', location: '', type: '', experience: '' })
            router.push('/jobs')
          }}
          className="w-full btn btn-secondary text-sm"
        >
          <FiX className="w-4 h-4 mr-2" />
          Clear All Filters
        </button>
      )}
    </div>
  )
}
