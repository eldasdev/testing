'use client'

import Image from 'next/image'
import { FiUser, FiImage } from 'react-icons/fi'

interface UserAvatarProps {
  user: {
    name: string
    image?: string | null
    logo?: string | null
    role?: string
  }
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
}

export default function UserAvatar({ user, size = 'md', className = '' }: UserAvatarProps) {
  const isCompany = user.role === 'COMPANY'
  const imageUrl = isCompany ? user.logo : user.image
  const sizeClass = sizeClasses[size]
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : size === 'lg' ? 'w-8 h-8' : 'w-12 h-12'

  if (imageUrl) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 ${className}`}>
        <Image
          src={imageUrl}
          alt={isCompany ? `${user.name} logo` : `${user.name} profile`}
          width={size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 96}
          height={size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 96}
          className="w-full h-full object-cover"
          unoptimized
        />
      </div>
    )
  }

  // Fallback to initial or icon
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold border-2 border-gray-200 ${className}`}>
      {isCompany ? (
        <FiImage className={iconSize} />
      ) : (
        <span>{user.name?.charAt(0) || 'U'}</span>
      )}
    </div>
  )
}
