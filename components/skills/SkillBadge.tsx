'use client'

import { FiStar } from 'react-icons/fi'

interface SkillBadgeProps {
  name: string
  proficiency?: string
  showProficiency?: boolean
  size?: 'sm' | 'md' | 'lg'
  isPopular?: boolean
}

const proficiencyConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  BEGINNER: { label: 'Beginner', color: 'text-gray-700', bgColor: 'bg-gray-100 border-gray-200' },
  JUNIOR: { label: 'Junior', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200' },
  MIDDLE: { label: 'Middle', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200' },
  SENIOR: { label: 'Senior', color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200' },
  EXPERT: { label: 'Expert', color: 'text-orange-700', bgColor: 'bg-orange-50 border-orange-200' },
}

export default function SkillBadge({ 
  name, 
  proficiency = 'JUNIOR', 
  showProficiency = true,
  size = 'md',
  isPopular = false,
}: SkillBadgeProps) {
  const config = proficiencyConfig[proficiency] || proficiencyConfig.JUNIOR
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  }

  return (
    <div className={`inline-flex items-center space-x-1.5 ${config.bgColor} ${config.color} rounded-lg border ${sizeClasses[size]}`}>
      <span className="font-medium">{name}</span>
      {isPopular && (
        <FiStar className="w-3 h-3 text-yellow-500 fill-current" />
      )}
      {showProficiency && (
        <span className={`text-xs px-1.5 py-0.5 rounded ${
          proficiency === 'BEGINNER' ? 'bg-gray-200' :
          proficiency === 'JUNIOR' ? 'bg-blue-200' :
          proficiency === 'MIDDLE' ? 'bg-green-200' :
          proficiency === 'SENIOR' ? 'bg-purple-200' :
          'bg-orange-200'
        }`}>
          {config.label}
        </span>
      )}
    </div>
  )
}

// Display component for showing multiple skills grouped by proficiency
export function SkillsList({ 
  skills,
  showProficiency = true,
}: { 
  skills: Array<{ name: string; proficiency: string }>
  showProficiency?: boolean
}) {
  // Group skills by proficiency
  const groupedSkills = skills.reduce((acc, skill) => {
    const level = skill.proficiency || 'JUNIOR'
    if (!acc[level]) acc[level] = []
    acc[level].push(skill)
    return acc
  }, {} as Record<string, typeof skills>)

  const proficiencyOrder = ['EXPERT', 'SENIOR', 'MIDDLE', 'JUNIOR', 'BEGINNER']

  return (
    <div className="space-y-4">
      {proficiencyOrder.map((level) => {
        const levelSkills = groupedSkills[level]
        if (!levelSkills || levelSkills.length === 0) return null
        
        const config = proficiencyConfig[level]
        
        return (
          <div key={level}>
            {showProficiency && (
              <h4 className={`text-sm font-semibold ${config.color} mb-2`}>
                {config.label} Level ({levelSkills.length})
              </h4>
            )}
            <div className="flex flex-wrap gap-2">
              {levelSkills.map((skill, index) => (
                <SkillBadge
                  key={index}
                  name={skill.name}
                  proficiency={skill.proficiency}
                  showProficiency={false}
                  size="sm"
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
