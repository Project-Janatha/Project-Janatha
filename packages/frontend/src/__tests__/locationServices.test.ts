/**
 * Tests for utils/locationServices.ts
 */
import { describe, it, expect, vi } from 'vitest'

// Mock geolocation before importing
const geolocationMock = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
}

vi.stubGlobal('navigator', {
  geolocation: geolocationMock,
})

describe('getLocationAccess', () => {
  it('should return true for web platform', async () => {
    const { getLocationAccess } = await import('../../utils/locationServices')
    const result = await getLocationAccess()
    expect(result).toBe(true)
  })
})

describe('getCurrentPosition', () => {
  it('should return coordinates from browser geolocation API', async () => {
    const mockPosition = {
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
      },
    }

    geolocationMock.getCurrentPosition.mockImplementation((callback: any) => {
      callback(mockPosition)
    })

    const { getCurrentPosition } = await import('../../utils/locationServices')
    const result = await getCurrentPosition()

    expect(result).toEqual([-122.4194, 37.7749])
    expect(geolocationMock.getCurrentPosition).toHaveBeenCalled()
  })

  it('should return default location on error', async () => {
    geolocationMock.getCurrentPosition.mockImplementation((_: any, errorCallback: any) => {
      errorCallback(new Error('Permission denied'))
    })

    const { getCurrentPosition } = await import('../../utils/locationServices')
    const result = await getCurrentPosition()

    // Returns empty array so callers can apply their own fallback
    expect(result).toEqual([])
  })

  it('should return empty array when geolocation is not available', async () => {
    vi.stubGlobal('navigator', {
      geolocation: undefined,
    })

    const { getCurrentPosition } = await import('../../utils/locationServices')
    const result = await getCurrentPosition()

    // Returns empty array so callers can apply their own fallback
    expect(result).toEqual([])
  })
})
