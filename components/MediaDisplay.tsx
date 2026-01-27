'use client'

interface MediaDisplayProps {
  url: string
  alt?: string
  index?: number
}

export default function MediaDisplay({ url, alt, index }: MediaDisplayProps) {
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
  const isVideo = /\.(mp4|webm|ogg)$/i.test(url)

  if (isImage) {
    return (
      <img
        src={url}
        alt={alt || `Media ${index ? index + 1 : ''}`}
        className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => window.open(url, '_blank')}
      />
    )
  }

  if (isVideo) {
    return (
      <video
        src={url}
        controls
        className="w-full h-auto"
      />
    )
  }

  return null
}
