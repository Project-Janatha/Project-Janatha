/**
 * middleware.test.ts — Unit tests for middleware utilities
 *
 * Tests input validation helpers and field-specific validators.
 * Rate limiting, cacheControl, and securityHeaders are tested
 * via integration in app.test.ts.
 */
import { describe, it, expect } from 'vitest'
import { validateString, validateOptionalString, validate } from '../middleware'

// ═══════════════════════════════════════════════════════════════════════
// validateString
// ═══════════════════════════════════════════════════════════════════════

describe('validateString', () => {
  it('returns trimmed string for valid input', () => {
    expect(validateString('  hello  ', 100)).toBe('hello')
  })

  it('returns null for empty string', () => {
    expect(validateString('', 100)).toBeNull()
  })

  it('returns null for whitespace-only string', () => {
    expect(validateString('   ', 100)).toBeNull()
  })

  it('returns null for string exceeding max length', () => {
    expect(validateString('a'.repeat(101), 100)).toBeNull()
  })

  it('returns string at exactly max length', () => {
    const str = 'a'.repeat(100)
    expect(validateString(str, 100)).toBe(str)
  })

  it('returns null for non-string values', () => {
    expect(validateString(123, 100)).toBeNull()
    expect(validateString(null, 100)).toBeNull()
    expect(validateString(undefined, 100)).toBeNull()
    expect(validateString(true, 100)).toBeNull()
    expect(validateString({}, 100)).toBeNull()
    expect(validateString([], 100)).toBeNull()
  })
})

// ═══════════════════════════════════════════════════════════════════════
// validateOptionalString
// ═══════════════════════════════════════════════════════════════════════

describe('validateOptionalString', () => {
  it('returns null for undefined', () => {
    expect(validateOptionalString(undefined, 100)).toBeNull()
  })

  it('returns null for null', () => {
    expect(validateOptionalString(null, 100)).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(validateOptionalString('', 100)).toBeNull()
  })

  it('returns trimmed string for valid input', () => {
    expect(validateOptionalString('  hello  ', 100)).toBe('hello')
  })

  it('returns null for whitespace-only string (trims to empty)', () => {
    expect(validateOptionalString('   ', 100)).toBeNull()
  })

  it('returns false for string exceeding max length', () => {
    expect(validateOptionalString('a'.repeat(101), 100)).toBe(false)
  })

  it('returns false for non-string values (number, boolean, object)', () => {
    expect(validateOptionalString(123, 100)).toBe(false)
    expect(validateOptionalString(true, 100)).toBe(false)
    expect(validateOptionalString({}, 100)).toBe(false)
    expect(validateOptionalString([], 100)).toBe(false)
  })

  it('returns string at exactly max length', () => {
    const str = 'a'.repeat(100)
    expect(validateOptionalString(str, 100)).toBe(str)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// Field-specific validators
// ═══════════════════════════════════════════════════════════════════════

describe('validate.username', () => {
  it('accepts valid username', () => {
    expect(validate.username('johndoe')).toBe('johndoe')
  })

  it('trims whitespace', () => {
    expect(validate.username('  johndoe  ')).toBe('johndoe')
  })

  it('rejects empty string', () => {
    expect(validate.username('')).toBeNull()
  })

  it('rejects username exceeding 64 characters', () => {
    expect(validate.username('a'.repeat(65))).toBeNull()
  })

  it('accepts username at exactly 64 characters', () => {
    const name = 'a'.repeat(64)
    expect(validate.username(name)).toBe(name)
  })

  it('rejects non-string values', () => {
    expect(validate.username(null)).toBeNull()
    expect(validate.username(undefined)).toBeNull()
    expect(validate.username(123)).toBeNull()
  })
})

describe('validate.password', () => {
  it('accepts valid password', () => {
    expect(validate.password('securepass123')).toBe('securepass123')
  })

  it('rejects empty string', () => {
    expect(validate.password('')).toBeNull()
  })

  it('rejects password exceeding 128 characters', () => {
    expect(validate.password('a'.repeat(129))).toBeNull()
  })

  it('accepts password at exactly 128 characters', () => {
    const pass = 'a'.repeat(128)
    expect(validate.password(pass)).toBe(pass)
  })
})

describe('validate.firstName / validate.lastName', () => {
  it('accepts valid names', () => {
    expect(validate.firstName('Rama')).toBe('Rama')
    expect(validate.lastName('Krishna')).toBe('Krishna')
  })

  it('returns null for empty/undefined/null (optional fields)', () => {
    expect(validate.firstName(undefined)).toBeNull()
    expect(validate.firstName(null)).toBeNull()
    expect(validate.firstName('')).toBeNull()
    expect(validate.lastName(undefined)).toBeNull()
  })

  it('returns false for name exceeding 100 characters', () => {
    expect(validate.firstName('a'.repeat(101))).toBe(false)
    expect(validate.lastName('a'.repeat(101))).toBe(false)
  })
})

describe('validate.email', () => {
  it('accepts valid email', () => {
    expect(validate.email('test@example.com')).toBe('test@example.com')
  })

  it('returns null for empty/undefined', () => {
    expect(validate.email('')).toBeNull()
    expect(validate.email(undefined)).toBeNull()
  })

  it('returns false for email exceeding 254 characters', () => {
    expect(validate.email('a'.repeat(255))).toBe(false)
  })
})

describe('validate.phone', () => {
  it('accepts valid phone number', () => {
    expect(validate.phone('+1234567890')).toBe('+1234567890')
  })

  it('returns null for empty/undefined', () => {
    expect(validate.phone('')).toBeNull()
    expect(validate.phone(undefined)).toBeNull()
  })

  it('returns false for phone exceeding 20 characters', () => {
    expect(validate.phone('1'.repeat(21))).toBe(false)
  })
})

describe('validate.title', () => {
  it('accepts valid title', () => {
    expect(validate.title('Bhagavad Gita Study')).toBe('Bhagavad Gita Study')
  })

  it('returns false for title exceeding 200 characters', () => {
    expect(validate.title('a'.repeat(201))).toBe(false)
  })
})

describe('validate.description', () => {
  it('accepts valid description', () => {
    expect(validate.description('A study circle')).toBe('A study circle')
  })

  it('returns false for description exceeding 5000 characters', () => {
    expect(validate.description('a'.repeat(5001))).toBe(false)
  })
})

describe('validate.address', () => {
  it('accepts valid address', () => {
    expect(validate.address('123 Main St')).toBe('123 Main St')
  })

  it('returns false for address exceeding 500 characters', () => {
    expect(validate.address('a'.repeat(501))).toBe(false)
  })
})

describe('validate.url', () => {
  it('accepts valid URL', () => {
    expect(validate.url('https://example.com/image.jpg')).toBe('https://example.com/image.jpg')
  })

  it('returns false for URL exceeding 2048 characters', () => {
    expect(validate.url('https://example.com/' + 'a'.repeat(2040))).toBe(false)
  })
})

describe('validate.centerName', () => {
  it('accepts valid center name', () => {
    expect(validate.centerName('Chinmaya Mission San Jose')).toBe('Chinmaya Mission San Jose')
  })

  it('rejects empty center name', () => {
    expect(validate.centerName('')).toBeNull()
  })

  it('rejects center name exceeding 100 characters', () => {
    expect(validate.centerName('a'.repeat(101))).toBeNull()
  })
})

describe('validate.id', () => {
  it('accepts valid UUID-style id', () => {
    const id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    expect(validate.id(id)).toBe(id)
  })

  it('rejects empty id', () => {
    expect(validate.id('')).toBeNull()
  })

  it('rejects id exceeding 64 characters', () => {
    expect(validate.id('a'.repeat(65))).toBeNull()
  })
})
