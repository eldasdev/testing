'use client'

import { useState } from 'react'
import { FiChevronDown, FiChevronUp, FiAward, FiBriefcase, FiCheckCircle, FiCode, FiUsers, FiTarget } from 'react-icons/fi'

interface PerformanceScoreClientProps {
  score: number
  label: string
  skillsCount: number
  applicationsCount: number
  acceptedCount: number
  practiceScore: number
  communityEngagement: number
  lastCalculated: Date
}

export default function PerformanceScoreClient({
  score,
  label,
  skillsCount,
  applicationsCount,
  acceptedCount,
  practiceScore,
  communityEngagement,
  lastCalculated,
}: PerformanceScoreClientProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600'
    if (score >= 60) return 'from-blue-500 to-blue-600'
    if (score >= 40) return 'from-yellow-500 to-orange-500'
    return 'from-gray-400 to-gray-500'
  }

  const breakdown = [
    {
      label: 'Skills & Expertise',
      value: skillsCount,
      icon: FiAward,
      description: `${skillsCount} skills added`,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Applications',
      value: applicationsCount,
      icon: FiBriefcase,
      description: `${applicationsCount} applications submitted`,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Accepted Offers',
      value: acceptedCount,
      icon: FiCheckCircle,
      description: `${acceptedCount} accepted applications`,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Practice Score',
      value: practiceScore,
      icon: FiCode,
      description: `${practiceScore} practice submissions`,
      color: 'text-orange-600 bg-orange-50',
    },
    {
      label: 'Community Engagement',
      value: communityEngagement,
      icon: FiUsers,
      description: `${communityEngagement} community contributions`,
      color: 'text-indigo-600 bg-indigo-50',
    },
  ]

  return (
    <div className="card p-6 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${getScoreColor(score)} rounded-xl flex items-center justify-center shadow-lg`}>
            <FiTarget className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Performance Score</h2>
            <p className="text-sm text-gray-600">Career readiness indicator</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          <span>{isExpanded ? 'Hide Details' : 'Show Details'}</span>
          {isExpanded ? (
            <FiChevronUp className="w-4 h-4" />
          ) : (
            <FiChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Compact Score Display */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${getScoreColor(score)} shadow-lg`}>
            <div className="text-center">
              <div className="text-2xl font-extrabold text-white">{score}</div>
              <div className="text-xs font-semibold text-white/90">/ 100</div>
            </div>
          </div>
          <div>
            <h3 className={`text-lg font-bold mb-1 ${
              score >= 80 ? 'text-green-600' :
              score >= 60 ? 'text-blue-600' :
              score >= 40 ? 'text-yellow-600' :
              'text-gray-600'
            }`}>
              {label}
            </h3>
            <p className="text-xs text-gray-500">
              Based on skills, experience, and engagement
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Score</span>
          <span className="text-sm font-bold text-gray-900">{score}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full bg-gradient-to-r ${getScoreColor(score)} transition-all duration-1000 shadow-md`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Collapsible Breakdown */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 animate-fade-in">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Score Breakdown</h3>
          <div className="space-y-2">
            {breakdown.map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-7 h-7 ${item.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-gray-900">{item.value}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Last calculated: {new Date(lastCalculated).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
