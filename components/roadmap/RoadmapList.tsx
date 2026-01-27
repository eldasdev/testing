'use client'

import { FiTarget, FiCheck, FiCircle, FiTrash2 } from 'react-icons/fi'
import { format } from 'date-fns'

interface Roadmap {
  id: string
  title: string
  description: string | null
  milestones: any[]
  isCompleted: boolean
  createdAt: Date
}

interface RoadmapListProps {
  roadmaps: Roadmap[]
  onUpdate: () => void
}

export default function RoadmapList({ roadmaps, onUpdate }: RoadmapListProps) {
  const handleDelete = async (id: string) => {
    // Note: Confirm modal would require importing useConfirmModal hook
    // For now, keeping confirm but this should be updated if modal is needed
    if (!confirm('Are you sure you want to delete this roadmap?')) return

    try {
      await fetch(`/api/roadmaps/${id}`, {
        method: 'DELETE',
      })
      onUpdate()
    } catch (error) {
      console.error('Failed to delete roadmap:', error)
    }
  }

  if (roadmaps.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-500 text-lg">No roadmaps yet. Create one to get started!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {roadmaps.map((roadmap) => {
        const completedCount = roadmap.milestones.filter((m: any) => m.completed).length
        const totalCount = roadmap.milestones.length
        const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

        return (
          <div key={roadmap.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                  <FiTarget className="w-5 h-5 mr-2 text-primary-600" />
                  {roadmap.title}
                </h3>
                {roadmap.description && (
                  <p className="text-gray-600 mb-4">{roadmap.description}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(roadmap.id)}
                className="text-red-600 hover:text-red-700"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{completedCount} / {totalCount} completed</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              {roadmap.milestones.map((milestone: any, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  {milestone.completed ? (
                    <FiCheck className="w-5 h-5 text-green-600" />
                  ) : (
                    <FiCircle className="w-5 h-5 text-gray-400" />
                  )}
                  <span className={milestone.completed ? 'line-through text-gray-500' : 'text-gray-700'}>
                    {milestone.title}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 text-sm text-gray-500">
              Created {format(new Date(roadmap.createdAt), 'MMM d, yyyy')}
            </div>
          </div>
        )
      })}
    </div>
  )
}
