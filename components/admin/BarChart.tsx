'use client'

interface BarChartProps {
  data: Array<{ label: string; value: number; color?: string }>
  title: string
}

export default function BarChart({ data, title }: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1)

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">{title}</h3>
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100
          const color = item.color || '#3b82f6'
          
          return (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <span className="text-sm font-bold text-gray-900">{item.value}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
