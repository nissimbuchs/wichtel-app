/**
 * International Phone Number Validation and Formatting
 * Supports worldwide phone numbers in various formats
 */

/**
 * Validates international phone numbers
 * Accepts formats:
 * - +XX XXX XXX XXXX (international with country code)
 * - 00XX XXX XXX XXXX (international with 00 prefix)
 * - National formats (0XXX XXX XX XX)
 *
 * @param phoneNumber - Phone number to validate
 * @returns true if valid, false otherwise
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Remove all whitespace, parentheses, hyphens for validation
  const cleaned = phoneNumber.replace(/[\s()\-]/g, '')

  // Must contain only digits, optional leading +
  if (!/^\+?\d+$/.test(cleaned)) {
    return false
  }

  // Remove leading + for length check
  const digitsOnly = cleaned.replace(/^\+/, '')

  // International numbers: 7-15 digits (ITU-T E.164 standard)
  // Examples:
  // - Switzerland: +41 (2 digits) + 9 digits = 11 total
  // - Germany: +49 (2 digits) + 10-11 digits = 12-13 total
  // - USA: +1 (1 digit) + 10 digits = 11 total
  // - China: +86 (2 digits) + 11 digits = 13 total
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return false
  }

  return true
}

/**
 * Normalizes phone number to E.164 format for WhatsApp
 * Converts various formats to +XXXXXXXXXXX
 *
 * **Default: Switzerland (41)** - Numbers without international prefix are treated as Swiss
 *
 * Examples:
 * - `079 123 45 67` → `41791234567` (Swiss, adds country code)
 * - `0791234567` → `41791234567` (Swiss, adds country code)
 * - `+41 79 123 45 67` → `41791234567` (Swiss with prefix)
 * - `+49 170 1234567` → `491701234567` (German with prefix)
 * - `0049 170 1234567` → `491701234567` (German with 00 prefix)
 *
 * @param phoneNumber - Phone number to normalize
 * @param defaultCountryCode - Default country code if none provided (default: 41 for Switzerland)
 * @returns Normalized phone number in E.164 format (e.g., 41791234567)
 */
export function normalizePhoneNumber(
  phoneNumber: string,
  defaultCountryCode: string = '41'
): string {
  // Remove all whitespace, parentheses, hyphens
  let cleaned = phoneNumber.replace(/[\s()\-]/g, '')

  // Handle 00XX international format (convert to +)
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.substring(2)
  }

  // If starts with +, remove it for processing
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1)
  }
  // If starts with 0 (national format), add default country code
  else if (cleaned.startsWith('0')) {
    cleaned = defaultCountryCode + cleaned.substring(1)
  }
  // If no prefix at all, assume it needs country code
  else if (cleaned.length <= 10) {
    cleaned = defaultCountryCode + cleaned
  }

  return cleaned
}

/**
 * Formats phone number for display
 *
 * @param phoneNumber - Phone number to format
 * @returns Formatted phone number with spaces
 */
export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/[\s()\-]/g, '')

  // If starts with +, keep it
  if (cleaned.startsWith('+')) {
    return cleaned.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d+)/, '$1 $2 $3 $4')
  }

  // Default formatting with spaces every 3 digits
  return cleaned.replace(/(\d{3})(?=\d)/g, '$1 ')
}

/**
 * Detects country code from phone number
 *
 * @param phoneNumber - Phone number
 * @returns Detected country code or null
 */
export function detectCountryCode(phoneNumber: string): string | null {
  // Don't clean - we need spaces/formatting to detect country code boundaries
  const trimmed = phoneNumber.trim()

  if (trimmed.startsWith('+')) {
    // Extract country code before first space or after 1-3 digits
    // Examples: "+41 79..." or "+1555..."
    const match = trimmed.match(/^\+(\d{1,3})(?:\s|$)/)
    if (match) {
      return match[1]
    }
    // If no space, take first 2 digits as most country codes are 2 digits
    const matchNoSpace = trimmed.match(/^\+(\d{2})/)
    return matchNoSpace ? matchNoSpace[1] : null
  }

  if (trimmed.startsWith('00')) {
    // Extract country code before first space or after 1-3 digits
    // Examples: "0041 79..." or "00491..."
    const match = trimmed.match(/^00(\d{1,3})(?:\s|$)/)
    if (match) {
      return match[1]
    }
    // If no space, take first 2 digits
    const matchNoSpace = trimmed.match(/^00(\d{2})/)
    return matchNoSpace ? matchNoSpace[1] : null
  }

  return null
}

/**
 * Common country codes for reference
 */
export const COUNTRY_CODES = {
  CH: '41',   // Switzerland
  DE: '49',   // Germany
  AT: '43',   // Austria
  US: '1',    // USA/Canada
  UK: '44',   // United Kingdom
  FR: '33',   // France
  IT: '39',   // Italy
  ES: '34',   // Spain
  NL: '31',   // Netherlands
  BE: '32',   // Belgium
  CN: '86',   // China
  JP: '81',   // Japan
  AU: '61',   // Australia
  BR: '55',   // Brazil
  IN: '91',   // India
} as const
