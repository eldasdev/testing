import { prisma } from '@/lib/prisma'
import { FiTrendingUp, FiTarget } from 'react-icons/fi'

interface PerformanceCardProps {
  userId: string
}

export default async function PerformanceCard({ userId }: PerformanceCardProps) {
  const metrics = await prisma.performanceMetrics.findUnique({
    where: { userId },
  })

  const score = metrics?.careerReadinessScore || 0

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-gray-100 p-6 mb-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full -mr-16 -mt-16 opacity-50" />
      <div className="relative z-10">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
            <FiTrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="gradient-text">Career Readiness</span>
        </h2>
        <div className="text-center">
          <div className="text-6xl font-extrabold gradient-text mb-2">{score}</div>
          <div className="text-sm font-semibold text-gray-600 mb-6">out of 100</div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-1000 shadow-lg"
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-4 font-medium">
            Based on your skills, applications, and activity
          </p>
        </div>
      </div>
    </div>
  )
}
