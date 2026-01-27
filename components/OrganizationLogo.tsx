'use client'

import { useState } from 'react'
import Image from 'next/image'

interface OrganizationLogoProps {
  name: string
  logo: string
  alt: string
  index: number
}

export default function OrganizationLogo({ name, logo, alt, index }: OrganizationLogoProps) {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    // Fallback to text if image fails to load
    return (
      <div
        className="text-gray-700 text-lg md:text-xl font-semibold hover:text-primary-600 transition-colors duration-200"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {name}
      </div>
    )
  }

  return (
    <div
      className="flex items-center justify-center h-16 md:h-20 opacity-70 hover:opacity-100 transition-opacity duration-200"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative w-32 md:w-40 h-16 md:h-20 flex items-center justify-center">
        <Image
          src={logo}
          alt={alt}
          width={160}
          height={80}
          className="object-contain max-h-16 md:max-h-20 w-auto filter grayscale hover:grayscale-0 transition-all duration-200"
          onError={() => setImageError(true)}
          unoptimized
        />
      </div>
    </div>
  )
}
