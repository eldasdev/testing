import { FiTrendingUp } from 'react-icons/fi'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { prisma } from '@/lib/prisma'

interface UserGrowthChartProps {
  totalUsers: number
}

export default async function UserGrowthChart({ totalUsers }: UserGrowthChartProps) {
  // Get user registrations for the last 6 months
  const months = []
  const data = []
  
  for (let i = 5; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(new Date(), i))
    const monthEnd = endOfMonth(subMonths(new Date(), i))
    
    const count = await prisma.user.count({
      where: {
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    })
    
    months.push(format(monthStart, 'MMM'))
    data.push(count)
  }

  const maxValue = Math.max(...data, 1) // Avoid division by zero
  const thisMonth = data[data.length - 1]
  const lastMonth = data[data.length - 2] || 0
  const growthPercent = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0

  // Calculate active rate (users who logged in within last 30 days)
  const thirtyDaysAgo = subMonths(new Date(), 1)
  const activeUsers = await prisma.user.count({
    where: {
      updatedAt: {
        gte: thirtyDaysAgo,
      },
    },
  })
  const activeRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">User Growth</h2>
          <p className="text-sm text-gray-500">New registrations over time</p>
        </div>
        {growthPercent !== 0 && (
          <div className={`flex items-center space-x-2 ${growthPercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <FiTrendingUp className={`w-5 h-5 ${growthPercent < 0 ? 'rotate-180' : ''}`} />
            <span className="font-semibold">{growthPercent > 0 ? '+' : ''}{growthPercent}%</span>
          </div>
        )}
      </div>

      {/* Simple Bar Chart */}
      {maxValue > 0 ? (
        <div className="flex items-end justify-between h-48 gap-2 md:gap-4">
          {data.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center group">
              <div className="w-full relative">
                <div
                  className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg transition-all duration-500 hover:from-primary-600 hover:to-primary-500 group-hover:shadow-lg"
                  style={{ height: `${(value / maxValue) * 100}%`, minHeight: value > 0 ? '4px' : '0' }}
                />
                {value > 0 && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-semibold text-gray-700 bg-white px-2 py-1 rounded shadow-sm">
                      {value}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-500 mt-2">{months[index]}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center text-gray-400">
          <p className="text-sm">No data available yet</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
        <div>
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">{totalUsers.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">This Month</p>
          <p className={`text-2xl font-bold ${thisMonth > 0 ? 'text-green-600' : 'text-gray-400'}`}>
            {thisMonth > 0 ? '+' : ''}{thisMonth}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Active Rate</p>
          <p className="text-2xl font-bold text-primary-600">{activeRate}%</p>
        </div>
      </div>
    </div>
  )
}
