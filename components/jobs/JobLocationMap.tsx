'use client'

import { useEffect, useRef } from 'react'
import { FiMapPin } from 'react-icons/fi'
import { loadYandexMaps } from '@/lib/yandex-maps'

interface JobLocationMapProps {
  latitude?: number | null
  longitude?: number | null
  address?: string | null
  location: string
}

declare global {
  interface Window {
    ymaps: any
  }
}

export default function JobLocationMap({ latitude, longitude, address, location }: JobLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  useEffect(() => {
    if (!latitude || !longitude || !mapRef.current) return

    // Load Yandex Maps API (will only load once)
    loadYandexMaps()
      .then(() => {
        initializeMap()
      })
      .catch((error) => {
        console.error('Failed to load Yandex Maps:', error)
      })

    function initializeMap() {
      if (!mapRef.current || !window.ymaps || !latitude || !longitude) return

      const map = new window.ymaps.Map(mapRef.current, {
        center: [latitude, longitude],
        zoom: 15,
        controls: ['zoomControl', 'fullscreenControl', 'typeSelector'],
      })

      mapInstanceRef.current = map

      // Add marker with balloon
      const balloonContent = `<div style="padding: 8px;"><strong>${location}</strong>${address && address !== location ? `<br/>${address}` : ''}</div>`
      
      markerRef.current = new window.ymaps.Placemark(
        [latitude, longitude],
        {
          balloonContent: balloonContent,
          hintContent: location,
        },
        {
          preset: 'islands#blueIcon',
        }
      )

      mapInstanceRef.current.geoObjects.add(markerRef.current)

      // Open balloon on marker click
      markerRef.current.events.add('click', () => {
        markerRef.current.balloon.open()
      })
    }

    return () => {
      if (markerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.geoObjects.remove(markerRef.current)
      }
    }
  }, [latitude, longitude, address, location])

  if (!latitude || !longitude) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 text-center">
        <FiMapPin className="w-6 h-6 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">{location}</p>
        {address && address !== location && (
          <p className="text-xs text-gray-500 mt-1">{address}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 text-sm text-gray-700">
        <FiMapPin className="w-4 h-4 text-primary-600" />
        <span className="font-medium">{location}</span>
      </div>
      {address && address !== location && (
        <p className="text-xs text-gray-500">{address}</p>
      )}
      <div
        ref={mapRef}
        className="w-full h-64 md:h-80 rounded-lg border border-gray-200 overflow-hidden"
        style={{ minHeight: '256px' }}
      />
    </div>
  )
}
