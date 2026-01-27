'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { FiUpload, FiX, FiUser, FiImage } from 'react-icons/fi'
import { useAlertModal } from '@/components/ui/AlertModal'

interface AvatarUploadProps {
  currentImage: string | null
  onImageChange: (imageUrl: string | null) => void
  isCompany?: boolean
  label?: string
}

export default function AvatarUpload({ 
  currentImage, 
  onImageChange, 
  isCompany = false,
  label 
}: AvatarUploadProps) {
  const { update: updateSession } = useSession()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showAlert } = useAlertModal()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showAlert({
        type: 'error',
        title: 'Invalid File',
        message: 'Please select an image file (PNG, JPG, GIF, or WebP)',
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showAlert({
        type: 'error',
        title: 'File Too Large',
        message: 'Image must be less than 5MB',
      })
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setPreview(data.url)
      onImageChange(data.url)
      
      // Save image/logo to database immediately
      try {
        // Fetch current user data to get name for validation
        const userResponse = await fetch('/api/profile')
        const userData = userResponse.ok ? await userResponse.json() : null
        const userName = userData?.user?.name || 'User'
        
        const saveResponse = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: userName, // Required by validation
            image: isCompany ? null : data.url,
            logo: isCompany ? data.url : null,
          }),
        })

        if (!saveResponse.ok) {
          throw new Error('Failed to save image to profile')
        }

        // Update session to refresh navbar avatar
        await updateSession()
        
        // Small delay to ensure session is updated, then refresh
        setTimeout(() => {
          window.location.reload()
        }, 500)
      } catch (saveError) {
        console.error('Failed to save image to profile:', saveError)
        // Still show success for upload, but warn about save
        showAlert({
          type: 'warning',
          title: 'Uploaded but not saved',
          message: 'Image uploaded but failed to save to profile. Please click "Save Profile" to save it.',
        })
        return
      }
      
      showAlert({
        type: 'success',
        title: 'Success',
        message: `${isCompany ? 'Logo' : 'Profile image'} uploaded and saved successfully!`,
      })
    } catch (error) {
      console.error('Upload error:', error)
      showAlert({
        type: 'error',
        title: 'Upload Failed',
        message: 'Failed to upload image. Please try again.',
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onImageChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayLabel = label || (isCompany ? 'Company Logo' : 'Profile Image')

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {displayLabel}
      </label>
      
      <div className="flex items-start space-x-6">
        {/* Preview */}
        <div className="relative">
          {preview ? (
            <div className="relative group">
              <div className={`${isCompany ? 'w-32 h-32' : 'w-32 h-32'} rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100`}>
                <Image
                  src={preview}
                  alt={isCompany ? 'Company logo' : 'Profile image'}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Remove image"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className={`${isCompany ? 'w-32 h-32' : 'w-32 h-32'} rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center border-4 border-gray-200`}>
              {isCompany ? (
                <FiImage className="w-16 h-16 text-white" />
              ) : (
                <FiUser className="w-16 h-16 text-white" />
              )}
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-3">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="avatar-upload"
              disabled={uploading}
            />
            <label
              htmlFor="avatar-upload"
              className={`inline-flex items-center space-x-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                uploading
                  ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                  : 'border-primary-300 bg-primary-50 hover:bg-primary-100 hover:border-primary-400'
              }`}
            >
              <FiUpload className={`w-5 h-5 ${uploading ? 'text-gray-400' : 'text-primary-600'}`} />
              <span className={`text-sm font-medium ${uploading ? 'text-gray-400' : 'text-primary-700'}`}>
                {uploading ? 'Uploading...' : `Upload ${displayLabel}`}
              </span>
            </label>
          </div>
          
          <p className="text-xs text-gray-500">
            Recommended: Square image, at least 400x400px. Max size: 5MB. 
            Formats: PNG, JPG, GIF, WebP
          </p>
          
          {preview && (
            <button
              type="button"
              onClick={handleRemove}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Remove {displayLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
