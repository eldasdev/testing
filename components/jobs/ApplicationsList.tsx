'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import {
  FiUser,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiFileText,
  FiExternalLink,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiLoader,
} from 'react-icons/fi'
import Link from 'next/link'
import { useAlertModal } from '@/components/ui/AlertModal'

interface Application {
  id: string
  status: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED'
  coverLetter: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    image: string | null
    bio: string | null
    location: string | null
    phone: string | null
    profile: {
      education: string | null
      university: string | null
      graduationYear: number | null
      linkedinUrl: string | null
      githubUrl: string | null
      portfolioUrl: string | null
    } | null
    skills: Array<{
      id: string
      name: string
      proficiency: string
      skillCatalog: {
        name: string
        category: string
      } | null
    }>
  }
  resume: {
    id: string
    title: string
  } | null
  jobPost: {
    id: string
    title: string
    company: string
  } | null
}

interface ApplicationsListProps {
  applications: Application[]
  jobId: string
}

export default function ApplicationsList({ applications, jobId }: ApplicationsListProps) {
  const router = useRouter()
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const { showAlert, AlertComponent } = useAlertModal()

  const handleStatusUpdate = async (applicationId: string, newStatus: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED') => {
    setUpdatingId(applicationId)
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        const error = await response.json()
        showAlert({
          type: 'error',
          title: 'Update Failed',
          message: error.error || 'Failed to update application status',
        })
      }
    } catch (error) {
      console.error('Error updating application:', error)
      showAlert({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update application status',
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'REVIEWED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  return (
    <>
      <AlertComponent />
    <div className="space-y-4">
      {applications.map((application) => (
        <div
          key={application.id}
          className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left: Applicant Info */}
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {application.user.name?.charAt(0) || 'A'}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {application.user.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <FiMail className="w-4 h-4" />
                      <span>{application.user.email}</span>
                    </div>
                    {application.user.location && (
                      <div className="flex items-center space-x-1">
                        <FiMapPin className="w-4 h-4" />
                        <span>{application.user.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <FiCalendar className="w-4 h-4" />
                      <span>Applied {format(new Date(application.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(application.status)}`}>
                  {application.status}
                </span>
              </div>

              {/* Bio */}
              {application.user.bio && (
                <p className="text-gray-600 mb-4 line-clamp-2">{application.user.bio}</p>
              )}

              {/* Education */}
              {application.user.profile && (
                <div className="mb-4">
                  {application.user.profile.university && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{application.user.profile.university}</span>
                      {application.user.profile.graduationYear && (
                        <span> • {application.user.profile.graduationYear}</span>
                      )}
                    </p>
                  )}
                </div>
              )}

              {/* Skills */}
              {application.user.skills.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {application.user.skills.slice(0, 8).map((skill) => (
                      <span
                        key={skill.id}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {skill.name}
                        {skill.proficiency && (
                          <span className="ml-1 text-gray-500">({skill.proficiency})</span>
                        )}
                      </span>
                    ))}
                    {application.user.skills.length > 8 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                        +{application.user.skills.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Cover Letter */}
              {application.coverLetter && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Cover Letter:</p>
                  <p className="text-sm text-gray-600 line-clamp-3">{application.coverLetter}</p>
                </div>
              )}

              {/* Links */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/profile/${application.user.id}`}
                  className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700"
                >
                  <FiUser className="w-4 h-4" />
                  <span>View Profile</span>
                </Link>
                {application.user.profile?.linkedinUrl && (
                  <a
                    href={application.user.profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700"
                  >
                    <FiExternalLink className="w-4 h-4" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {application.user.profile?.githubUrl && (
                  <a
                    href={application.user.profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700"
                  >
                    <FiExternalLink className="w-4 h-4" />
                    <span>GitHub</span>
                  </a>
                )}
                {application.resume && (
                  <Link
                    href={`/resumes/${application.resume.id}`}
                    className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700"
                  >
                    <FiFileText className="w-4 h-4" />
                    <span>View Resume</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="lg:w-64 flex flex-col gap-2">
              {application.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate(application.id, 'REVIEWED')}
                    disabled={updatingId === application.id}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    {updatingId === application.id ? (
                      <FiLoader className="w-4 h-4 animate-spin" />
                    ) : (
                      <FiEye className="w-4 h-4" />
                    )}
                    <span>Mark as Reviewed</span>
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(application.id, 'ACCEPTED')}
                    disabled={updatingId === application.id}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    {updatingId === application.id ? (
                      <FiLoader className="w-4 h-4 animate-spin" />
                    ) : (
                      <FiCheckCircle className="w-4 h-4" />
                    )}
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(application.id, 'REJECTED')}
                    disabled={updatingId === application.id}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    {updatingId === application.id ? (
                      <FiLoader className="w-4 h-4 animate-spin" />
                    ) : (
                      <FiXCircle className="w-4 h-4" />
                    )}
                    <span>Reject</span>
                  </button>
                </>
              )}

              {application.status === 'REVIEWED' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate(application.id, 'ACCEPTED')}
                    disabled={updatingId === application.id}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    {updatingId === application.id ? (
                      <FiLoader className="w-4 h-4 animate-spin" />
                    ) : (
                      <FiCheckCircle className="w-4 h-4" />
                    )}
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(application.id, 'REJECTED')}
                    disabled={updatingId === application.id}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    {updatingId === application.id ? (
                      <FiLoader className="w-4 h-4 animate-spin" />
                    ) : (
                      <FiXCircle className="w-4 h-4" />
                    )}
                    <span>Reject</span>
                  </button>
                </>
              )}

              {(application.status === 'ACCEPTED' || application.status === 'REJECTED') && (
                <div className="text-sm text-gray-600 text-center py-2">
                  Status: <span className="font-medium">{application.status}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
    </>
  )
}
