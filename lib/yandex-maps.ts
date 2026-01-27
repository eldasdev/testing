declare global {
  interface Window {
    ymaps: any
    yandexMapsLoading: Promise<void> | null
  }
}

let yandexMapsLoadingPromise: Promise<void> | null = null

/**
 * Load Yandex Maps API script only once
 * Returns a promise that resolves when the API is ready
 */
export function loadYandexMaps(): Promise<void> {
  // If already loaded, return resolved promise
  if (window.ymaps) {
    return Promise.resolve()
  }

  // If already loading, return the existing promise
  if (yandexMapsLoadingPromise) {
    return yandexMapsLoadingPromise
  }

  // Check if script is already in the document
  const existingScript = document.querySelector('script[src*="api-maps.yandex.ru"]')
  if (existingScript) {
    // Script exists but not loaded yet, wait for it
    yandexMapsLoadingPromise = new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (window.ymaps) {
          clearInterval(checkInterval)
          window.ymaps.ready(() => resolve())
        }
      }, 100)

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval)
        if (!window.ymaps) {
          reject(new Error('Yandex Maps failed to load'))
        }
      }, 10000)

      existingScript.addEventListener('load', () => {
        if (window.ymaps) {
          clearInterval(checkInterval)
          window.ymaps.ready(() => resolve())
        }
      })
    })
    return yandexMapsLoadingPromise
  }

  // Check if API key is available
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY
  if (!apiKey) {
    const error = new Error('Yandex Maps API key is not set. Please add NEXT_PUBLIC_YANDEX_MAPS_API_KEY to your .env file.')
    console.warn(error.message)
    return Promise.reject(error)
  }

  // Create loading promise
  yandexMapsLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=en_US`
    script.async = true
    script.id = 'yandex-maps-script'
    
    script.onload = () => {
      if (window.ymaps) {
        window.ymaps.ready(() => {
          resolve()
        })
      } else {
        reject(new Error('Yandex Maps API failed to initialize'))
      }
    }
    
    script.onerror = () => {
      yandexMapsLoadingPromise = null
      const error = new Error('Failed to load Yandex Maps script. Please check your API key.')
      console.error(error.message)
      reject(error)
    }
    
    document.head.appendChild(script)
  })

  return yandexMapsLoadingPromise
}
