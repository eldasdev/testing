import { FiMapPin, FiBriefcase, FiClock, FiDollarSign, FiUser, FiCheck, FiGift, FiCalendar, FiMail } from 'react-icons/fi'
import { format } from 'date-fns'
import JobLocationMap from './JobLocationMap'

interface Job {
  id: string
  title: string
  company: string
  location: string
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  placeId?: string | null
  type: string
  experienceLevel: string
  description: string
  requirements: string[]
  benefits: string[]
  salaryMin?: number | string | bigint | null
  salaryMax?: number | string | bigint | null
  currency?: string | null
  applicationDeadline?: Date | null
  createdAt: Date
  tags: { name: string }[]
  postedBy: {
    name: string
    email: string
  }
}

interface JobDetailsProps {
  job: Job
}

export default function JobDetails({ job }: JobDetailsProps) {
  return (
    <div>
      {/* Header */}
      <div className="pb-6 border-b border-gray-100">
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <FiBriefcase className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
            <p className="text-lg font-semibold text-primary-600">{job.company}</p>
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-xl">
            <FiMapPin className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-medium text-gray-700">{job.location}</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-xl">
            <FiBriefcase className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-medium text-gray-700">{job.type.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-xl">
            <FiClock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Posted {format(new Date(job.createdAt), 'MMM d, yyyy')}</span>
          </div>
          <span className="px-3 py-2 bg-primary-50 text-primary-700 text-sm font-semibold rounded-xl">
            {job.experienceLevel}
          </span>
        </div>

        {/* Salary */}
        {(job.salaryMin || job.salaryMax) && (
          <div className="inline-flex items-center space-x-2 px-4 py-2.5 bg-green-50 rounded-xl border border-green-100">
            <FiDollarSign className="w-5 h-5 text-green-600" />
            <span className="text-lg font-bold text-green-700">
              {(() => {
                const min = job.salaryMin ? (typeof job.salaryMin === 'bigint' ? job.salaryMin.toString() : String(job.salaryMin)) : null
                const max = job.salaryMax ? (typeof job.salaryMax === 'bigint' ? job.salaryMax.toString() : String(job.salaryMax)) : null
                const minNum = min ? Number(min) : null
                const maxNum = max ? Number(max) : null
                
                if (minNum && maxNum) {
                  return `${minNum.toLocaleString()} - ${maxNum.toLocaleString()} ${job.currency || 'UZS'}`
                } else if (minNum) {
                  return `From ${minNum.toLocaleString()} ${job.currency || 'UZS'}`
                } else if (maxNum) {
                  return `Up to ${maxNum.toLocaleString()} ${job.currency || 'UZS'}`
                }
                return ''
              })()}
            </span>
          </div>
        )}

        {/* Tags */}
        {job.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {job.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 text-sm font-medium rounded-lg border border-primary-200"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="py-6 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">About this role</h2>
        <div className="text-gray-600 leading-relaxed whitespace-pre-line">
          {job.description}
        </div>
      </div>

      {/* Requirements */}
      {job.requirements.length > 0 && (
        <div className="py-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Requirements</h2>
          <ul className="space-y-3">
            {job.requirements.map((req, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FiCheck className="w-3 h-3 text-primary-600" />
                </div>
                <span className="text-gray-700">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Benefits */}
      {job.benefits.length > 0 && (
        <div className="py-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">What we offer</h2>
          <ul className="space-y-3">
            {job.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FiGift className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Location Map */}
      <div className="py-6 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Location</h2>
        <JobLocationMap
          latitude={job.latitude}
          longitude={job.longitude}
          address={job.address}
          location={job.location}
        />
      </div>

      {/* Posted By */}
      <div className="pt-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Contact</h2>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold">
            {job.postedBy.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{job.postedBy.name}</p>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <FiMail className="w-3.5 h-3.5" />
              <span>{job.postedBy.email}</span>
            </div>
          </div>
        </div>
        
        {job.applicationDeadline && (
          <div className="mt-4 flex items-center space-x-2 px-4 py-3 bg-amber-50 rounded-xl border border-amber-100">
            <FiCalendar className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              Application deadline: {format(new Date(job.applicationDeadline), 'MMMM d, yyyy')}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
