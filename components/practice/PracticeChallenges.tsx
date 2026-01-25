'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiCode, FiMessageSquare, FiFileText, FiTrendingUp, FiArrowRight, FiPlay } from 'react-icons/fi'

interface Challenge {
  id: string
  title: string
  type: string
  difficulty: string
  description: string
  category: string
}

interface PracticeChallengesProps {
  challenges: Challenge[]
}

export default function PracticeChallenges({ challenges }: PracticeChallengesProps) {
  const [selectedType, setSelectedType] = useState<string>('all')

  const filteredChallenges = selectedType === 'all'
    ? challenges
    : challenges.filter(c => c.type === selectedType)

  const types = [
    { value: 'all', label: 'All', icon: FiTrendingUp },
    { value: 'coding', label: 'Coding', icon: FiCode },
    { value: 'interview', label: 'Interview', icon: FiMessageSquare },
    { value: 'quiz', label: 'Quiz', icon: FiFileText },
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case 'coding':
        return FiCode
      case 'interview':
        return FiMessageSquare
      case 'quiz':
        return FiFileText
      default:
        return FiTrendingUp
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case 'coding':
        return 'from-blue-500 to-blue-600'
      case 'interview':
        return 'from-purple-500 to-purple-600'
      case 'quiz':
        return 'from-green-500 to-green-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'Medium':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'Hard':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div>
      {/* Type Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {types.map((type) => {
          const Icon = type.icon
          const isSelected = selectedType === type.value
          return (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                isSelected
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{type.label}</span>
            </button>
          )
        })}
      </div>

      {/* Challenges Grid */}
      {filteredChallenges.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge, index) => {
            const Icon = getIcon(challenge.type)
            return (
              <Link
                key={challenge.id}
                href={`/practice/${challenge.id}`}
                className="group card p-6 card-hover animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${getIconColor(challenge.type)} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getDifficultyStyles(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {challenge.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{challenge.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                    {challenge.category}
                  </span>
                  <div className="flex items-center space-x-1 text-primary-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiPlay className="w-4 h-4" />
                    <span>Start</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <p className="text-gray-500">No challenges found for this category.</p>
        </div>
      )}
    </div>
  )
}
