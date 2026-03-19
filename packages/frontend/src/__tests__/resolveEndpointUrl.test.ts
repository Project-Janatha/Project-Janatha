/**
 * Tests for resolveEndpointUrl logic from UserContext.tsx
 *
 * Since the function is not exported, we reproduce its exact logic here for testing.
 */
import { describe, it, expect } from 'vitest'

const API_BASE_URL = 'http://localhost:8787/api'

/**
 * Exact copy of the resolveEndpointUrl function from UserContext.tsx lines 61-78.
 */
const resolveEndpointUrl = (endpoint: string): string => {
  if (/^https?:\/\//i.test(endpoint)) return endpoint
  const normalizedBase = API_BASE_URL.replace(/\/+$/, '')
  const normalizedEndpoint = endpoint.replace(/^\/api(?=\/|$)/, '')
  if (normalizedEndpoint.startsWith('/')) {
    return `${normalizedBase}${normalizedEndpoint}`
  }
  if (normalizedEndpoint === '') {
    return normalizedBase
  }
  return `${normalizedBase}/${normalizedEndpoint}`
}

describe('resolveEndpointUrl', () => {
  it('passes through full URLs unchanged', () => {
    expect(resolveEndpointUrl('https://example.com/api/test')).toBe('https://example.com/api/test')
  })

  it('passes through http URLs unchanged', () => {
    expect(resolveEndpointUrl('http://other.com/path')).toBe('http://other.com/path')
  })

  it('is case-insensitive for protocol detection', () => {
    expect(resolveEndpointUrl('HTTPS://example.com/test')).toBe('HTTPS://example.com/test')
  })

  it('strips /api prefix from /api/auth/me', () => {
    expect(resolveEndpointUrl('/api/auth/me')).toBe('http://localhost:8787/api/auth/me')
  })

  it('strips /api/ to produce trailing slash', () => {
    expect(resolveEndpointUrl('/api/')).toBe('http://localhost:8787/api/')
  })

  it('strips /api exactly (no trailing slash)', () => {
    expect(resolveEndpointUrl('/api')).toBe('http://localhost:8787/api')
  })

  it('handles /auth/me (no /api prefix)', () => {
    expect(resolveEndpointUrl('/auth/me')).toBe('http://localhost:8787/api/auth/me')
  })

  it('handles relative path without leading slash', () => {
    expect(resolveEndpointUrl('auth/me')).toBe('http://localhost:8787/api/auth/me')
  })

  it('handles empty string', () => {
    expect(resolveEndpointUrl('')).toBe('http://localhost:8787/api')
  })
})

describe('resolveEndpointUrl with trailing slash on BASE', () => {
  const BASE_WITH_SLASH = 'http://localhost:8787/api/'

  const resolveWithSlash = (endpoint: string): string => {
    if (/^https?:\/\//i.test(endpoint)) return endpoint
    const normalizedBase = BASE_WITH_SLASH.replace(/\/+$/, '')
    const normalizedEndpoint = endpoint.replace(/^\/api(?=\/|$)/, '')
    if (normalizedEndpoint.startsWith('/')) {
      return `${normalizedBase}${normalizedEndpoint}`
    }
    if (normalizedEndpoint === '') {
      return normalizedBase
    }
    return `${normalizedBase}/${normalizedEndpoint}`
  }

  it('strips trailing slash from base and resolves correctly', () => {
    expect(resolveWithSlash('/auth/me')).toBe('http://localhost:8787/api/auth/me')
  })

  it('handles /api/auth/me with trailing slash base', () => {
    expect(resolveWithSlash('/api/auth/me')).toBe('http://localhost:8787/api/auth/me')
  })

  it('handles empty string with trailing slash base', () => {
    expect(resolveWithSlash('')).toBe('http://localhost:8787/api')
  })

  it('handles relative path with trailing slash base', () => {
    expect(resolveWithSlash('auth/me')).toBe('http://localhost:8787/api/auth/me')
  })
})
