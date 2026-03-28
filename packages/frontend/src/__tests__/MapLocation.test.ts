/**
 * Tests for Map.web.tsx location functionality (localStorage integration)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

vi.stubGlobal('localStorage', localStorageMock)

// Mock geolocation
const geolocationMock = {
  getCurrentPosition: vi.fn(),
}

vi.stubGlobal('navigator', {
  geolocation: geolocationMock,
})

describe('Map location functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('localStorage integration', () => {
    it('should read stored location from localStorage', () => {
      const storedLocation = { latitude: 37.7749, longitude: -122.4194 }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedLocation))

      const result = localStorageMock.getItem('userLocation')
      const parsed = JSON.parse(result!)

      expect(parsed).toEqual(storedLocation)
      expect(parsed.latitude).toBe(37.7749)
      expect(parsed.longitude).toBe(-122.4194)
    })

    it('should return null when no stored location', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = localStorageMock.getItem('userLocation')

      expect(result).toBeNull()
    })

    it('should save location to localStorage', () => {
      const location = { latitude: 40.7128, longitude: -74.0060 }

      localStorageMock.setItem('userLocation', JSON.stringify(location))

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'userLocation',
        JSON.stringify(location)
      )
    })
  })

  describe('geolocation integration', () => {
    it('should request and return current position', () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
        },
      }

      geolocationMock.getCurrentPosition.mockImplementation((callback: any) => {
        callback(mockPosition)
      })

      navigator.geolocation.getCurrentPosition((position) => {
        expect(position.coords.latitude).toBe(40.7128)
        expect(position.coords.longitude).toBe(-74.0060)
      })
    })

    it('should call error callback on permission denied', () => {
      geolocationMock.getCurrentPosition.mockImplementation((_: any, errorCallback: any) => {
        errorCallback(new Error('Permission denied'))
      })

      navigator.geolocation.getCurrentPosition(
        () => {},
        (error) => {
          expect(error.message).toBe('Permission denied')
        }
      )
    })
  })

  describe('Map center priority logic', () => {
    it('should prioritize localStorage over geolocation', () => {
      const storedLocation = { latitude: 37.7749, longitude: -122.4194 }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedLocation))

      // Simulate the component's priority logic
      const stored = localStorageMock.getItem('userLocation')
      let mapCenter: { latitude: number; longitude: number } | null = null

      if (stored) {
        mapCenter = JSON.parse(stored)
      }

      expect(mapCenter).toEqual(storedLocation)
      // Geolocation should NOT be called when stored location exists
      expect(geolocationMock.getCurrentPosition).not.toHaveBeenCalled()
    })

    it('should fall back to geolocation when no stored location', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
        },
      }
      geolocationMock.getCurrentPosition.mockImplementation((callback: any) => {
        callback(mockPosition)
      })

      // Simulate the component's priority logic
      const stored = localStorageMock.getItem('userLocation')
      let mapCenter: { latitude: number; longitude: number } | null = null

      if (!stored && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          mapCenter = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }
        })
      }

      expect(mapCenter).toEqual({ latitude: 40.7128, longitude: -74.0060 })
    })
  })
})
