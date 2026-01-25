'use client'

interface AnalyticsChartProps {
  title: string
  data: Record<string, number>
  type: 'users' | 'applications'
}

export default function AnalyticsChart({ title, data, type }: AnalyticsChartProps) {
  const total = Object.values(data).reduce((acc, val) => acc + val, 0)
  
  const colors = type === 'users' 
    ? {
        STUDENT: 'bg-blue-500',
        COMPANY: 'bg-green-500',
        MENTOR: 'bg-purple-500',
        ADMIN: 'bg-orange-500',
        SUPER_ADMIN: 'bg-red-500',
      }
    : {
        PENDING: 'bg-yellow-500',
        REVIEWED: 'bg-blue-500',
        ACCEPTED: 'bg-green-500',
        REJECTED: 'bg-red-500',
      }

  const labels = type === 'users'
    ? {
        STUDENT: 'Students',
        COMPANY: 'Companies',
        MENTOR: 'Mentors',
        ADMIN: 'Admins',
        SUPER_ADMIN: 'Super Admins',
      }
    : {
        PENDING: 'Pending',
        REVIEWED: 'Reviewed',
        ACCEPTED: 'Accepted',
        REJECTED: 'Rejected',
      }

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">{title}</h2>
      
      {/* Donut Chart Visualization */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {Object.entries(data).length > 0 ? (
              (() => {
                let cumulativePercent = 0
                return Object.entries(data).map(([key, value]) => {
                  const percent = total > 0 ? (value / total) * 100 : 0
                  const strokeDasharray = `${percent} ${100 - percent}`
                  const strokeDashoffset = -cumulativePercent
                  cumulativePercent += percent
                  
                  const colorClass = (colors as any)[key] || 'bg-gray-500'
                  const colorMap: Record<string, string> = {
                    'bg-blue-500': '#3b82f6',
                    'bg-green-500': '#22c55e',
                    'bg-purple-500': '#a855f7',
                    'bg-orange-500': '#f97316',
                    'bg-red-500': '#ef4444',
                    'bg-yellow-500': '#eab308',
                    'bg-gray-500': '#6b7280',
                  }
                  
                  return (
                    <circle
                      key={key}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={colorMap[colorClass] || '#6b7280'}
                      strokeWidth="20"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      pathLength="100"
                    />
                  )
                })
              })()
            ) : (
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="20"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">{total}</span>
            <span className="text-sm text-gray-500">Total</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${(colors as any)[key] || 'bg-gray-500'}`} />
            <span className="text-sm text-gray-600">{(labels as any)[key] || key}</span>
            <span className="text-sm font-semibold text-gray-900 ml-auto">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
