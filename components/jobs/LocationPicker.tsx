'use client'

import { useState, useRef, useEffect } from 'react'
import { FiMapPin, FiX, FiLoader, FiSearch } from 'react-icons/fi'
import { loadYandexMaps } from '@/lib/yandex-maps'
import { useAlertModal } from '@/components/ui/AlertModal'

interface LocationPickerProps {
  value: {
    location: string
    address?: string
    latitude?: number
    longitude?: number
    placeId?: string
  }
  onChange: (location: {
    location: string
    address?: string
    latitude?: number
    longitude?: number
    placeId?: string
  }) => void
  required?: boolean
}

declare global {
  interface Window {
    ymaps: any
  }
}

export default function LocationPicker({ value, onChange, required = false }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState(value.location || '')
  const [showMap, setShowMap] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const suggestViewRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const { showAlert, AlertComponent } = useAlertModal()

  useEffect(() => {
    // Load Yandex Maps API (will only load once)
    loadYandexMaps()
      .then(() => {
        setMapLoaded(true)
        initializeAutocomplete()
      })
      .catch((error) => {
        console.error('Failed to load Yandex Maps:', error)
      })

    return () => {
      // Cleanup
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      if (suggestViewRef.current) {
        try {
          suggestViewRef.current.destroy()
        } catch (e) {
          // Ignore destroy errors
        }
      }
      if (markerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.geoObjects.remove(markerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (mapLoaded && showMap && mapRef.current && !mapInstanceRef.current) {
      initializeMap()
    }
  }, [mapLoaded, showMap])

  // Sync searchQuery with value prop when it changes externally
  // Use a ref to track the last synced value to avoid unnecessary updates
  const lastSyncedValueRef = useRef<string>('')
  useEffect(() => {
    // Only sync if value changed externally (not from our own onChange calls)
    // Check if coordinates changed, which indicates external update
    if (value.location && value.location !== lastSyncedValueRef.current) {
      // Only update if user is not actively typing
      if (document.activeElement !== inputRef.current) {
        setSearchQuery(value.location)
        lastSyncedValueRef.current = value.location
      }
    }
  }, [value.location, value.latitude, value.longitude])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.ymaps) return

    try {
      // Create suggest view for autocomplete
      suggestViewRef.current = new window.ymaps.SuggestView(inputRef.current, {
        boundedBy: [[41.0, 69.0], [41.5, 69.5]], // Tashkent area bounds
        results: 10,
        provider: {
          suggest: (request: string) => {
            return window.ymaps.suggest(request)
          }
        }
      })

      // Show loading when user starts typing
      suggestViewRef.current.events.add('requeststart', () => {
        setIsSearching(true)
        setShowSuggestions(true)
      })

      // Hide loading when suggestions are ready
      suggestViewRef.current.events.add('requestend', () => {
        setIsSearching(false)
      })

      // Handle suggestion selection
      suggestViewRef.current.events.add('select', (e: any) => {
        const selectedItem = e.get('item')
        const address = selectedItem.value
        setIsSearching(true)
        setShowSuggestions(false)

        // Geocode the selected address
        if (typeof window.ymaps.geocode !== 'function') {
          setIsSearching(false)
          showAlert({
            type: 'error',
            title: 'Geocoding Failed',
            message: 'Maps service is not available. Please refresh the page and try again.',
          })
          return
        }

        window.ymaps.geocode(address, { results: 1 })
          .then((res: any) => {
            setIsSearching(false)
            if (!res || !res.geoObjects) {
              throw new Error('Invalid geocoding response')
            }
            const firstGeoObject = res.geoObjects.get(0)
            if (firstGeoObject) {
              try {
                const coords = firstGeoObject.geometry.getCoordinates()
                // Extract address information
                const metaData = firstGeoObject.properties.get('metaDataProperty')?.GeocoderMetaData
                const addressData = metaData?.Address
                const formattedAddress = addressData?.formatted || addressData?.text || firstGeoObject.properties.get('text') || address
                const name = firstGeoObject.properties.get('name') || formattedAddress
                
                const locationData = {
                  location: name,
                  address: formattedAddress,
                  latitude: coords[0],
                  longitude: coords[1],
                  placeId: addressData?.formatted || addressData?.postal_code || undefined,
                }

                onChange(locationData)
                setSearchQuery(locationData.location)

                // Update map if it's shown
                if (showMap && mapInstanceRef.current) {
                  updateMapMarker(locationData.latitude, locationData.longitude)
                }
              } catch (err: any) {
                console.error('Error processing geocoding result:', err)
                showAlert({
                  type: 'error',
                  title: 'Invalid Location Data',
                  message: 'Failed to process location data. Please try selecting another location.',
                })
              }
            } else {
              showAlert({
                type: 'warning',
                title: 'Location Not Found',
                message: 'Could not find coordinates for the selected location. Please try another option.',
              })
            }
          })
          .catch((error: any) => {
            console.error('Geocoding error:', error)
            setIsSearching(false)
            const errorMessage = error?.message || 'Unknown error occurred'
            showAlert({
              type: 'error',
              title: 'Geocoding Failed',
              message: `Failed to get location coordinates: ${errorMessage}. Please try again.`,
            })
          })
      })

      // Handle suggestion list updates
      suggestViewRef.current.events.add('suggestions', (e: any) => {
        const items = e.get('items')
        if (items && items.length > 0) {
          setSuggestions(items)
          setShowSuggestions(true)
        } else {
          setSuggestions([])
        }
      })
    } catch (error) {
      console.error('Failed to initialize SuggestView:', error)
    }
  }

  const handleManualSearch = async () => {
    if (!searchQuery.trim()) {
      showAlert({
        type: 'warning',
        title: 'Empty Search',
        message: 'Please enter a location to search.',
      })
      return
    }

    if (!window.ymaps) {
      showAlert({
        type: 'error',
        title: 'Maps Not Loaded',
        message: 'Maps service is not available. Please refresh the page and try again.',
      })
      return
    }

    setIsSearching(true)
    setShowSuggestions(false)

    try {
      // Validate that geocode is available
      if (typeof window.ymaps.geocode !== 'function') {
        throw new Error('Geocode function is not available')
      }

      // Search for the location with timeout
      const geocodePromise = window.ymaps.geocode(searchQuery, { results: 5 })
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Search timeout')), 10000)
      )

      const res = await Promise.race([geocodePromise, timeoutPromise]) as any
      
      if (!res || !res.geoObjects) {
        throw new Error('Invalid response from geocoding service')
      }

      const geoObjects = res.geoObjects

      if (geoObjects.getLength() > 0) {
        // Show suggestions from search results
        const items: any[] = []
        geoObjects.each((geoObject: any) => {
          try {
            const name = geoObject.properties.get('name')
            const text = geoObject.properties.get('text')
            if (name || text) {
              items.push({
                value: text || name,
                displayName: name || text,
                geoObject: geoObject
              })
            }
          } catch (e) {
            // Skip invalid geo objects
            console.warn('Invalid geo object:', e)
          }
        })
        
        if (items.length > 0) {
          setSuggestions(items)
          setShowSuggestions(true)
          setIsSearching(false)
        } else {
          // No valid results found
          setIsSearching(false)
          showAlert({
            type: 'warning',
            title: 'No Locations Found',
            message: 'No locations found. Please try a different search term or click on the map to select a location.',
          })
        }
      } else {
        // No results found
        setIsSearching(false)
        showAlert({
          type: 'warning',
          title: 'No Locations Found',
          message: 'No locations found. Please try a different search term or click on the map to select a location.',
        })
      }
    } catch (error: any) {
      console.error('Search error:', error)
      setIsSearching(false)
      
      // Extract error message
      let errorMessage = 'Failed to search for location. Please try again or click on the map to select a location.'
      
      if (error?.message) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Search request timed out. Please check your internet connection and try again.'
        } else if (error.message.includes('not available')) {
          errorMessage = 'Maps service is not available. Please refresh the page and try again.'
        } else {
          errorMessage = `Search failed: ${error.message}. Please try again or click on the map to select a location.`
        }
      }
      
      showAlert({
        type: 'error',
        title: 'Search Failed',
        message: errorMessage,
      })
    }
  }

  const handleSelectSuggestion = async (item: any) => {
    setShowSuggestions(false)
    setIsSearching(true)

    try {
      if (!window.ymaps || typeof window.ymaps.geocode !== 'function') {
        throw new Error('Maps service is not available')
      }

      let geoObject = item.geoObject
      let address = item.value

      // If no geoObject, geocode the address
      if (!geoObject) {
        const res = await window.ymaps.geocode(address, { results: 1 })
        if (!res || !res.geoObjects) {
          throw new Error('Invalid geocoding response')
        }
        geoObject = res.geoObjects.get(0)
      }

      if (geoObject) {
        try {
          const coords = geoObject.geometry.getCoordinates()
          const metaData = geoObject.properties.get('metaDataProperty')?.GeocoderMetaData
          const addressData = metaData?.Address
          const formattedAddress = addressData?.formatted || addressData?.text || geoObject.properties.get('text') || address
          const name = geoObject.properties.get('name') || formattedAddress
          
          const locationData = {
            location: name,
            address: formattedAddress,
            latitude: coords[0],
            longitude: coords[1],
            placeId: addressData?.formatted || addressData?.postal_code || undefined,
          }

          onChange(locationData)
          setSearchQuery(locationData.location)

          // Update map if it's shown
          if (showMap && mapInstanceRef.current) {
            updateMapMarker(locationData.latitude, locationData.longitude)
          }
        } catch (err: any) {
          console.error('Error processing geo object:', err)
          showAlert({
            type: 'error',
            title: 'Invalid Location Data',
            message: 'Failed to process location data. Please try selecting another location.',
          })
        }
      } else {
        showAlert({
          type: 'warning',
          title: 'Location Not Found',
          message: 'Could not find coordinates for the selected location. Please try another option.',
        })
      }
    } catch (error: any) {
      console.error('Error selecting suggestion:', error)
      const errorMessage = error?.message || 'Unknown error occurred'
      showAlert({
        type: 'error',
        title: 'Selection Failed',
        message: `Failed to select location: ${errorMessage}. Please try again.`,
      })
    } finally {
      setIsSearching(false)
    }
  }

  const initializeMap = () => {
    if (!mapRef.current || !window.ymaps) return

    const defaultLat = value.latitude || 41.3111 // Tashkent default
    const defaultLng = value.longitude || 69.2797

    const map = new window.ymaps.Map(mapRef.current, {
      center: [defaultLat, defaultLng],
      zoom: value.latitude && value.longitude ? 15 : 12,
      controls: ['zoomControl', 'fullscreenControl'],
    })

    mapInstanceRef.current = map

    // Add marker
    if (value.latitude && value.longitude) {
      updateMapMarker(value.latitude, value.longitude)
    }

    // Add click listener to map
    map.events.add('click', (e: any) => {
      const coords = e.get('coords')
      const lat = coords[0]
      const lng = coords[1]

      setIsSearching(true)
      setShowSuggestions(false)

      // Validate geocode function
      if (!window.ymaps || typeof window.ymaps.geocode !== 'function') {
        console.error('Yandex Maps geocode function is not available')
        setIsSearching(false)
        // Still save coordinates even if geocoding is unavailable
        const locationData = {
          location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          latitude: lat,
          longitude: lng,
          placeId: undefined,
        }
        onChange(locationData)
        setSearchQuery(locationData.location)
        updateMapMarker(lat, lng)
        return
      }

      // Reverse geocode to get address with timeout
      const geocodePromise = window.ymaps.geocode([lat, lng], { results: 1, kind: 'house' })
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Geocoding timeout')), 8000)
      )

      Promise.race([geocodePromise, timeoutPromise])
        .then((res: any) => {
          setIsSearching(false)
          
          if (!res || !res.geoObjects) {
            throw new Error('Invalid geocoding response')
          }

          const firstGeoObject = res.geoObjects.get(0)
          if (firstGeoObject) {
            try {
              // Extract address information - try multiple sources
              const metaData = firstGeoObject.properties.get('metaDataProperty')?.GeocoderMetaData
              const address = metaData?.Address
              
              // Try to get formatted address from various sources
              let formattedAddress = ''
              if (address?.formatted) {
                formattedAddress = address.formatted
              } else if (address?.Components && Array.isArray(address.Components)) {
                // Build address from components
                const components = address.Components
                const parts = []
                const locality = components.find((c: any) => c.kind === 'locality')
                const street = components.find((c: any) => c.kind === 'street')
                const house = components.find((c: any) => c.kind === 'house')
                
                if (locality?.name) parts.push(locality.name)
                if (street?.name) parts.push(street.name)
                if (house?.name) parts.push(house.name)
                
                formattedAddress = parts.length > 0 
                  ? parts.filter(Boolean).join(', ') 
                  : firstGeoObject.properties.get('text') || ''
              } else {
                formattedAddress = firstGeoObject.properties.get('text') || 
                                  firstGeoObject.properties.get('name') || 
                                  `${lat.toFixed(6)}, ${lng.toFixed(6)}`
              }
              
              const name = firstGeoObject.properties.get('name') || formattedAddress || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
              
              const locationData = {
                location: name,
                address: formattedAddress || name,
                latitude: lat,
                longitude: lng,
                placeId: address?.formatted || metaData?.kind || undefined,
              }

              console.log('Location selected from map:', locationData)
              // Update search query first to show in input immediately
              setSearchQuery(locationData.location)
              // Then notify parent component
              onChange(locationData)
              updateMapMarker(lat, lng)
            } catch (err: any) {
              console.error('Error processing geocoding result:', err)
              // Fallback to coordinates
              const locationData = {
                location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                latitude: lat,
                longitude: lng,
                placeId: undefined,
              }
              setSearchQuery(locationData.location)
              onChange(locationData)
              updateMapMarker(lat, lng)
            }
          } else {
            // No results from geocoding, but still save coordinates
            console.warn('No geocoding results, using coordinates')
            const locationData = {
              location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
              address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
              latitude: lat,
              longitude: lng,
              placeId: undefined,
            }
            setSearchQuery(locationData.location)
            onChange(locationData)
            updateMapMarker(lat, lng)
          }
        })
        .catch((error: any) => {
          console.error('Geocoding error:', error)
          setIsSearching(false)
          
          // Always save coordinates even if geocoding fails
          const locationData = {
            location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            latitude: lat,
            longitude: lng,
            placeId: undefined,
          }
          
          console.log('Using fallback coordinates:', locationData)
          setSearchQuery(locationData.location)
          onChange(locationData)
          updateMapMarker(lat, lng)
          
          // Show warning if geocoding failed but don't block the user
          if (error?.message && !error.message.includes('timeout')) {
            showAlert({
              type: 'warning',
              title: 'Address Lookup Failed',
              message: 'Location coordinates saved, but could not retrieve full address. You can manually edit the location field.',
            })
          }
        })
    })
  }

  const updateMapMarker = (lat: number, lng: number) => {
    if (!mapInstanceRef.current || !window.ymaps) return

    // Remove existing marker
    if (markerRef.current) {
      mapInstanceRef.current.geoObjects.remove(markerRef.current)
    }

    // Add new marker
    markerRef.current = new window.ymaps.Placemark([lat, lng], {}, {
      draggable: true,
      preset: 'islands#blueIcon',
    })

    mapInstanceRef.current.geoObjects.add(markerRef.current)

    // Center map on marker
    mapInstanceRef.current.setCenter([lat, lng])
    mapInstanceRef.current.setZoom(15)

    // Update location when marker is dragged
    markerRef.current.events.add('dragend', () => {
      const coords = markerRef.current.geometry.getCoordinates()
      const lat = coords[0]
      const lng = coords[1]

      setIsSearching(true)

      // Validate geocode function
      if (!window.ymaps || typeof window.ymaps.geocode !== 'function') {
        setIsSearching(false)
        const locationData = {
          location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          latitude: lat,
          longitude: lng,
          placeId: undefined,
        }
        onChange(locationData)
        setSearchQuery(locationData.location)
        return
      }

      // Reverse geocode with timeout
      const geocodePromise = window.ymaps.geocode([lat, lng], { results: 1, kind: 'house' })
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Geocoding timeout')), 8000)
      )

      Promise.race([geocodePromise, timeoutPromise])
        .then((res: any) => {
          setIsSearching(false)
          
          if (!res || !res.geoObjects) {
            throw new Error('Invalid geocoding response')
          }

          const firstGeoObject = res.geoObjects.get(0)
          if (firstGeoObject) {
            try {
              const metaData = firstGeoObject.properties.get('metaDataProperty')?.GeocoderMetaData
              const address = metaData?.Address
              
              let formattedAddress = ''
              if (address?.formatted) {
                formattedAddress = address.formatted
              } else if (address?.Components && Array.isArray(address.Components)) {
                const components = address.Components
                const parts = []
                const locality = components.find((c: any) => c.kind === 'locality')
                const street = components.find((c: any) => c.kind === 'street')
                const house = components.find((c: any) => c.kind === 'house')
                
                if (locality?.name) parts.push(locality.name)
                if (street?.name) parts.push(street.name)
                if (house?.name) parts.push(house.name)
                
                formattedAddress = parts.length > 0 
                  ? parts.filter(Boolean).join(', ') 
                  : firstGeoObject.properties.get('text') || ''
              } else {
                formattedAddress = firstGeoObject.properties.get('text') || 
                                  firstGeoObject.properties.get('name') || 
                                  `${lat.toFixed(6)}, ${lng.toFixed(6)}`
              }
              
              const name = firstGeoObject.properties.get('name') || formattedAddress || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
              
              const locationData = {
                location: name,
                address: formattedAddress || name,
                latitude: lat,
                longitude: lng,
                placeId: address?.formatted || metaData?.kind || undefined,
              }

              onChange(locationData)
              setSearchQuery(locationData.location)
            } catch (err: any) {
              console.error('Error processing geocoding result:', err)
              const locationData = {
                location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                latitude: lat,
                longitude: lng,
                placeId: undefined,
              }
              onChange(locationData)
              setSearchQuery(locationData.location)
            }
          } else {
            const locationData = {
              location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
              address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
              latitude: lat,
              longitude: lng,
              placeId: undefined,
            }
            onChange(locationData)
            setSearchQuery(locationData.location)
          }
        })
        .catch((error: any) => {
          console.error('Geocoding error:', error)
          setIsSearching(false)
          const locationData = {
            location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            latitude: lat,
            longitude: lng,
            placeId: undefined,
          }
          onChange(locationData)
          setSearchQuery(locationData.location)
        })
    })
  }

  const handleClear = () => {
    setSearchQuery('')
    setIsSearching(false)
    setShowSuggestions(false)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    onChange({
      location: '',
      address: undefined,
      latitude: undefined,
      longitude: undefined,
      placeId: undefined,
    })
    if (markerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.geoObjects.remove(markerRef.current)
      markerRef.current = null
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleManualSearch()
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  return (
    <>
      <AlertComponent />
      <div className="space-y-3">
        <div className="relative">
        <input
          ref={inputRef}
          type="text"
          required={required}
          className="input pr-20"
          placeholder="Search for a location or click on map..."
          value={searchQuery}
          onChange={(e) => {
            const newValue = e.target.value
            setSearchQuery(newValue)
            onChange({ ...value, location: newValue })
            
            // Clear previous timeout
            if (searchTimeoutRef.current) {
              clearTimeout(searchTimeoutRef.current)
            }
            
            // Show loading indicator when user is typing (after a short delay)
            if (newValue.length > 0 && mapLoaded) {
              setIsSearching(true)
              // Auto-hide loading after 2 seconds if no response
              searchTimeoutRef.current = setTimeout(() => {
                setIsSearching(false)
              }, 2000)
            } else {
              setIsSearching(false)
              setShowSuggestions(false)
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          {isSearching && (
            <FiLoader className="w-4 h-4 text-primary-600 animate-spin" />
          )}
          {!isSearching && searchQuery && (
            <>
              <button
                type="button"
                onClick={handleManualSearch}
                className="p-1 text-primary-600 hover:text-primary-700 transition-colors"
                title="Search location"
              >
                <FiSearch className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center space-x-2">
                  <FiMapPin className="w-4 h-4 text-primary-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.displayName || item.value}
                    </p>
                    {item.value !== item.displayName && (
                      <p className="text-xs text-gray-500 truncate">{item.value}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowMap(!showMap)}
        className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
      >
        <FiMapPin className="w-4 h-4" />
        <span>{showMap ? 'Hide Map' : 'Show Map to Pick Location'}</span>
      </button>

      {showMap && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div
            ref={mapRef}
            className="w-full h-64 md:h-96 bg-gray-100"
            style={{ minHeight: '256px' }}
          />
        </div>
      )}

      {value.address && value.address !== value.location && (
        <p className="text-xs text-gray-500">
          <FiMapPin className="w-3 h-3 inline mr-1" />
          {value.address}
        </p>
      )}

      {value.latitude && value.longitude && (
        <p className="text-xs text-gray-400">
          Coordinates: {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
        </p>
      )}
      </div>
    </>
  )
}
