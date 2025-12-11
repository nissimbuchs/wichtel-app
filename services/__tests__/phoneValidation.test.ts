import { describe, it, expect } from 'vitest'
import {
  isValidPhoneNumber,
  normalizePhoneNumber,
  detectCountryCode,
} from '../phoneValidation'

describe('Phone Validation', () => {
  describe('isValidPhoneNumber', () => {
    it('accepts Swiss numbers with 0 prefix', () => {
      expect(isValidPhoneNumber('079 123 45 67')).toBe(true)
      expect(isValidPhoneNumber('0791234567')).toBe(true)
    })

    it('accepts international numbers with + prefix', () => {
      expect(isValidPhoneNumber('+41 79 123 45 67')).toBe(true)
      expect(isValidPhoneNumber('+49 170 1234567')).toBe(true)
      expect(isValidPhoneNumber('+1 555 123 4567')).toBe(true)
      expect(isValidPhoneNumber('+44 20 1234 5678')).toBe(true)
    })

    it('accepts international numbers with 00 prefix', () => {
      expect(isValidPhoneNumber('0041 79 123 45 67')).toBe(true)
      expect(isValidPhoneNumber('0049 170 1234567')).toBe(true)
    })

    it('rejects invalid formats', () => {
      expect(isValidPhoneNumber('abc')).toBe(false)
      expect(isValidPhoneNumber('123')).toBe(false) // too short
      expect(isValidPhoneNumber('+1234567890123456')).toBe(false) // too long
      expect(isValidPhoneNumber('')).toBe(false)
    })

    it('handles various separators', () => {
      expect(isValidPhoneNumber('+41 79 123 45 67')).toBe(true)
      expect(isValidPhoneNumber('+41-79-123-45-67')).toBe(true)
      expect(isValidPhoneNumber('+41(79)1234567')).toBe(true)
    })
  })

  describe('normalizePhoneNumber', () => {
    it('defaults to Swiss country code (41) for national numbers', () => {
      expect(normalizePhoneNumber('079 123 45 67')).toBe('41791234567')
      expect(normalizePhoneNumber('0791234567')).toBe('41791234567')
    })

    it('preserves international country codes', () => {
      expect(normalizePhoneNumber('+49 170 1234567')).toBe('491701234567')
      expect(normalizePhoneNumber('+1 555 123 4567')).toBe('15551234567')
      expect(normalizePhoneNumber('+44 20 1234 5678')).toBe('442012345678')
    })

    it('handles 00 prefix', () => {
      expect(normalizePhoneNumber('0049 170 1234567')).toBe('491701234567')
      expect(normalizePhoneNumber('0041 79 123 45 67')).toBe('41791234567')
    })

    it('removes all formatting', () => {
      expect(normalizePhoneNumber('+41 (79) 123-45-67')).toBe('41791234567')
      expect(normalizePhoneNumber('+49-170-1234567')).toBe('491701234567')
    })

    it('allows custom default country code', () => {
      expect(normalizePhoneNumber('0170 1234567', '49')).toBe('491701234567')
      expect(normalizePhoneNumber('0555 123 4567', '1')).toBe('15551234567')
    })
  })

  describe('detectCountryCode', () => {
    it('detects country code from + prefix', () => {
      expect(detectCountryCode('+41 79 123 45 67')).toBe('41')
      expect(detectCountryCode('+49 170 1234567')).toBe('49')
      expect(detectCountryCode('+1 555 123 4567')).toBe('1')
    })

    it('detects country code from 00 prefix', () => {
      expect(detectCountryCode('0041 79 123 45 67')).toBe('41')
      expect(detectCountryCode('0049 170 1234567')).toBe('49')
    })

    it('returns null for national numbers', () => {
      expect(detectCountryCode('079 123 45 67')).toBeNull()
      expect(detectCountryCode('0791234567')).toBeNull()
    })
  })
})
