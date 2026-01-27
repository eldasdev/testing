'use client'

import { useState } from 'react'
import { FiRefreshCw, FiCheckCircle, FiAlertCircle, FiLoader, FiDatabase, FiActivity } from 'react-icons/fi'

interface SyncTask {
  id: string
  name: string
  description: string
  status: 'idle' | 'running' | 'success' | 'error'
}

export default function DatabaseSyncPanel() {
  const [syncing, setSyncing] = useState(false)
  const [tasks, setTasks] = useState<SyncTask[]>([
    {
      id: '1',
      name: 'Test Database Connection',
      description: 'Verify PostgreSQL connection is active and responsive',
      status: 'idle',
    },
    {
      id: '2',
      name: 'Refresh Database Statistics',
      description: 'Update table statistics for query optimization',
      status: 'idle',
    },
    {
      id: '3',
      name: 'Re-index Database',
      description: 'Rebuild indexes to improve query performance',
      status: 'idle',
    },
    {
      id: '4',
      name: 'Clear Query Cache',
      description: 'Clear cached query results and refresh cache',
      status: 'idle',
    },
    {
      id: '5',
      name: 'Validate Data Integrity',
      description: 'Check for orphaned records and data inconsistencies',
      status: 'idle',
    },
  ])

  const handleSync = async () => {
    setSyncing(true)
    
    // Simulate sync process for each task
    for (let i = 0; i < tasks.length; i++) {
      setTasks(prev => prev.map((task, idx) => 
        idx === i ? { ...task, status: 'running' as const } : task
      ))
      
      // Simulate task execution (2-3 seconds per task)
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000))
      
      // Randomly succeed or fail (90% success rate for demo)
      const success = Math.random() > 0.1
      setTasks(prev => prev.map((task, idx) => 
        idx === i ? { ...task, status: success ? 'success' as const : 'error' as const } : task
      ))
    }
    
    setSyncing(false)
  }

  const getStatusIcon = (status: SyncTask['status']) => {
    switch (status) {
      case 'running':
        return <FiLoader className="w-5 h-5 text-blue-500 animate-spin" />
      case 'success':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <FiAlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
    }
  }

  const getStatusColor = (status: SyncTask['status']) => {
    switch (status) {
      case 'running':
        return 'bg-blue-50 border-blue-200'
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const allCompleted = tasks.every(t => t.status === 'success' || t.status === 'error')
  const hasErrors = tasks.some(t => t.status === 'error')

  return (
    <div className="space-y-6">
      {/* Sync Actions */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Synchronization Tasks</h2>
            <p className="text-sm text-gray-600">
              Run all synchronization tasks to ensure database health
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              syncing
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {syncing ? (
              <>
                <FiLoader className="w-5 h-5 animate-spin" />
                <span>Synchronizing...</span>
              </>
            ) : (
              <>
                <FiRefreshCw className="w-5 h-5" />
                <span>Start Synchronization</span>
              </>
            )}
          </button>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${getStatusColor(task.status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="mt-0.5">
                    {getStatusIcon(task.status)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{task.name}</h3>
                    <p className="text-sm text-gray-600">{task.description}</p>
                  </div>
                </div>
                {task.status === 'running' && (
                  <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    Running...
                  </span>
                )}
                {task.status === 'success' && (
                  <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                    Completed
                  </span>
                )}
                {task.status === 'error' && (
                  <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
                    Failed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Results Summary */}
        {allCompleted && (
          <div className={`mt-6 p-4 rounded-xl border-2 ${
            hasErrors 
              ? 'bg-yellow-50 border-yellow-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center space-x-3">
              {hasErrors ? (
                <>
                  <FiAlertCircle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-yellow-900">Synchronization completed with errors</p>
                    <p className="text-sm text-yellow-700">
                      Some tasks failed. Please review the errors above and try again.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <FiCheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">Synchronization completed successfully!</p>
                    <p className="text-sm text-green-700">
                      All database synchronization tasks have been completed successfully.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start space-x-3">
          <FiDatabase className="w-5 h-5 text-gray-500 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Important Notes</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span>Synchronization may take a few minutes depending on database size</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span>Database operations are performed safely and won't affect existing data</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span>If any task fails, you can run synchronization again</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span>For production databases, consider running sync during low-traffic periods</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
