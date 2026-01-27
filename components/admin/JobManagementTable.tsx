'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import { FiEdit2, FiTrash2, FiMoreVertical, FiEye, FiToggleLeft, FiToggleRight, FiCircle, FiExternalLink, FiDollarSign, FiClock, FiMapPin, FiUser } from 'react-icons/fi'

interface Job {
  id: string
  title: string
  slug: string | null
  company: string
  location: string
  address: string | null
  type: string
  experienceLevel: string
  salaryMin: bigint | null
  salaryMax: bigint | null
  currency: string | null
  applicationDeadline: Date | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count: {
    applications: number
  }
  postedBy: {
    id: string
    name: string
    email: string
  }
}

interface JobManagementTableProps {
  jobs: Job[]
  isSuperAdmin: boolean
}

export default function JobManagementTable({ jobs, isSuperAdmin }: JobManagementTableProps) {
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)

  const handleToggleActive = async (jobId: string, currentStatus: boolean) => {
    await fetch(`/api/admin/jobs/${jobId}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !currentStatus }),
    })
    window.location.reload()
  }

  const handleDelete = async (jobId: string) => {
    if (confirm('Are you sure you want to delete this job posting?')) {
      await fetch(`/api/admin/jobs/${jobId}`, { method: 'DELETE' })
      window.location.reload()
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'FULL_TIME':
        return 'bg-green-100 text-green-700'
      case 'PART_TIME':
        return 'bg-blue-100 text-blue-700'
      case 'INTERNSHIP':
        return 'bg-purple-100 text-purple-700'
      case 'CONTRACT':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Job Details
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Type / Level
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Salary
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Applications
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Deadline
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Posted
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {jobs.map((job) => (
            <tr key={job.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Link 
                      href={`/jobs/${job.slug || job.id}`}
                      className="font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                      target="_blank"
                    >
                      {job.title}
                    </Link>
                    <FiExternalLink className="w-3 h-3 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 flex items-center space-x-1">
                    <span>{job.company}</span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <FiMapPin className="w-3 h-3" />
                      <span>{job.location}</span>
                    </span>
                  </p>
                  {job.address && (
                    <p className="text-xs text-gray-400 mt-1">{job.address}</p>
                  )}
                  <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <FiUser className="w-3 h-3" />
                      <span>{job.postedBy.name}</span>
                    </span>
                    {job.slug && (
                      <span className="font-mono text-gray-400">/{job.slug}</span>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-1">
                  <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-lg ${getTypeBadgeColor(job.type)}`}>
                    {job.type.replace('_', ' ')}
                  </span>
                  <p className="text-xs text-gray-600 capitalize">{job.experienceLevel.replace('_', ' ')}</p>
                </div>
              </td>
              <td className="px-6 py-4">
                {job.salaryMin || job.salaryMax ? (
                  <div className="text-sm">
                    <div className="flex items-center space-x-1 text-gray-900 font-semibold">
                      <FiDollarSign className="w-3 h-3" />
                      <span>
                        {job.salaryMin ? Number(job.salaryMin).toLocaleString() : 'N/A'}
                        {job.salaryMin && job.salaryMax && ' - '}
                        {job.salaryMax ? Number(job.salaryMax).toLocaleString() : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{job.currency || 'UZS'}</p>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">Not specified</span>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-gray-900">{job._count.applications}</span>
                  <span className="text-sm text-gray-500">applicants</span>
                </div>
              </td>
              <td className="px-6 py-4">
                {job.applicationDeadline ? (
                  <div className="flex items-center space-x-1 text-sm">
                    <FiClock className="w-3 h-3 text-gray-400" />
                    <span className={new Date(job.applicationDeadline) < new Date() ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                      {format(new Date(job.applicationDeadline), 'MMM d, yyyy')}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">No deadline</span>
                )}
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => handleToggleActive(job.id, job.isActive)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all ${
                    job.isActive
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {job.isActive ? (
                    <>
                      <FiToggleRight className="w-4 h-4" />
                      <span className="text-sm font-medium">Active</span>
                    </>
                  ) : (
                    <>
                      <FiToggleLeft className="w-4 h-4" />
                      <span className="text-sm font-medium">Inactive</span>
                    </>
                  )}
                </button>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {format(new Date(job.createdAt), 'MMM d, yyyy')}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="relative">
                  <button
                    onClick={() => setActionMenuOpen(actionMenuOpen === job.id ? null : job.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiMoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                  {actionMenuOpen === job.id && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-[9999]">
                      <Link
                        href={`/jobs/${job.slug || job.id}`}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        target="_blank"
                      >
                        <FiEye className="w-4 h-4" />
                        <span>View Job</span>
                      </Link>
                      <Link
                        href={`/admin/jobs/${job.id}/edit`}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <FiEdit2 className="w-4 h-4" />
                        <span>Edit Job</span>
                      </Link>
                      {isSuperAdmin && (
                        <button
                          onClick={() => {
                            setActionMenuOpen(null)
                            handleDelete(job.id)
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          <span>Delete Job</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
