'use client'

interface LineChartProps {
  data: Array<{ label: string; value: number }>
  title: string
  color?: string
}

export default function LineChart({ data, title, color = '#3b82f6' }: LineChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1)
  const minValue = Math.min(...data.map(d => d.value), 0)
  const range = maxValue - minValue || 1

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">{title}</h3>
      <div className="h-64 relative">
        <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((percent) => (
            <line
              key={percent}
              x1="0"
              y1={percent * 2}
              x2="400"
              y2={percent * 2}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}

          {/* Data line */}
          {data.length > 0 && (
            <polyline
              points={data
                .map(
                  (d, i) =>
                    `${(i / (data.length - 1 || 1)) * 400},${200 - ((d.value - minValue) / range) * 200}`
                )
                .join(' ')}
              fill="none"
              stroke={color}
              strokeWidth="3"
            />
          )}

          {/* Data points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1 || 1)) * 400
            const y = 200 - ((d.value - minValue) / range) * 200
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill={color}
                stroke="white"
                strokeWidth="2"
              />
            )
          })}
        </svg>

        {/* Labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-2">
          {data.map((d, i) => (
            <span key={i} className="transform -rotate-45 origin-left">
              {d.label}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 flex justify-between text-sm">
        <div>
          <span className="text-gray-500">Max: </span>
          <span className="font-semibold text-gray-900">{maxValue}</span>
        </div>
        <div>
          <span className="text-gray-500">Min: </span>
          <span className="font-semibold text-gray-900">{minValue}</span>
        </div>
        <div>
          <span className="text-gray-500">Avg: </span>
          <span className="font-semibold text-gray-900">
            {Math.round(data.reduce((acc, d) => acc + d.value, 0) / data.length || 0)}
          </span>
        </div>
      </div>
    </div>
  )
}
