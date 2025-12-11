import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateWhatsAppUrl, openWhatsApp } from '../whatsappService'
import type { ParticipantAdmin } from '@/types/database.types'

describe('WhatsApp Service', () => {
  describe('generateWhatsAppUrl', () => {
    it('generates WhatsApp URL with correct format', () => {
      const participant: ParticipantAdmin = {
        id: '1',
        name: 'Alice Schmidt',
        phone_number: '+41791234567',
        participant_token: 'token123',
        is_organizer: false,
        whatsapp_sent_at: null,
        reveal_viewed_at: null,
        partner_id: null,
        session_id: 'session1',
        created_at: new Date().toISOString(),
      }

      const assignmentUrl = 'https://example.com/reveal/token123'
      const sessionName = 'Weihnachtsfeier 2025'

      const url = generateWhatsAppUrl(participant, assignmentUrl, sessionName)

      // Verify basic structure
      expect(url).toContain('https://api.whatsapp.com/send')
      expect(url).toContain('phone=41791234567') // Normalized phone
      expect(url).toContain('text=')

      // Decode and verify message content
      const urlObj = new URL(url)
      const message = decodeURIComponent(urlObj.searchParams.get('text') || '')

      expect(message).toContain('Hallo Alice Schmidt!')
      expect(message).toContain('Weihnachtsfeier 2025')
      expect(message).toContain(assignmentUrl)
      expect(message).toContain('🎄')
      expect(message).toContain('🎁')
    })

    it('normalizes Swiss phone numbers correctly', () => {
      const participant: ParticipantAdmin = {
        id: '1',
        name: 'Bob',
        phone_number: '079 123 45 67', // Swiss format with spaces
        participant_token: 'token123',
        is_organizer: false,
        whatsapp_sent_at: null,
        reveal_viewed_at: null,
        partner_id: null,
        session_id: 'session1',
        created_at: new Date().toISOString(),
      }

      const url = generateWhatsAppUrl(participant, 'https://example.com/reveal/token')

      expect(url).toContain('phone=41791234567')
    })

    it('normalizes German phone numbers correctly', () => {
      const participant: ParticipantAdmin = {
        id: '1',
        name: 'Charlie',
        phone_number: '+49 170 1234567', // German format
        participant_token: 'token123',
        is_organizer: false,
        whatsapp_sent_at: null,
        reveal_viewed_at: null,
        partner_id: null,
        session_id: 'session1',
        created_at: new Date().toISOString(),
      }

      const url = generateWhatsAppUrl(participant, 'https://example.com/reveal/token')

      expect(url).toContain('phone=491701234567')
    })

    it('uses default session name when not provided', () => {
      const participant: ParticipantAdmin = {
        id: '1',
        name: 'David',
        phone_number: '+41791234567',
        participant_token: 'token123',
        is_organizer: false,
        whatsapp_sent_at: null,
        reveal_viewed_at: null,
        partner_id: null,
        session_id: 'session1',
        created_at: new Date().toISOString(),
      }

      const url = generateWhatsAppUrl(participant, 'https://example.com/reveal/token')

      const urlObj = new URL(url)
      const message = decodeURIComponent(urlObj.searchParams.get('text') || '')

      expect(message).toContain('unser Wichteln')
    })

    it('handles special characters in participant name', () => {
      const participant: ParticipantAdmin = {
        id: '1',
        name: 'Müller & Söhne',
        phone_number: '+41791234567',
        participant_token: 'token123',
        is_organizer: false,
        whatsapp_sent_at: null,
        reveal_viewed_at: null,
        partner_id: null,
        session_id: 'session1',
        created_at: new Date().toISOString(),
      }

      const url = generateWhatsAppUrl(participant, 'https://example.com/reveal/token', 'Test')

      const urlObj = new URL(url)
      const message = decodeURIComponent(urlObj.searchParams.get('text') || '')

      expect(message).toContain('Müller & Söhne')
    })

    it('handles special characters in session name', () => {
      const participant: ParticipantAdmin = {
        id: '1',
        name: 'Eve',
        phone_number: '+41791234567',
        participant_token: 'token123',
        is_organizer: false,
        whatsapp_sent_at: null,
        reveal_viewed_at: null,
        partner_id: null,
        session_id: 'session1',
        created_at: new Date().toISOString(),
      }

      const sessionName = 'Weihnachtsfeier 2025 (Zürich & Bern)'
      const url = generateWhatsAppUrl(participant, 'https://example.com/reveal/token', sessionName)

      const urlObj = new URL(url)
      const message = decodeURIComponent(urlObj.searchParams.get('text') || '')

      expect(message).toContain(sessionName)
    })

    it('URL encodes message correctly', () => {
      const participant: ParticipantAdmin = {
        id: '1',
        name: 'Frank',
        phone_number: '+41791234567',
        participant_token: 'token123',
        is_organizer: false,
        whatsapp_sent_at: null,
        reveal_viewed_at: null,
        partner_id: null,
        session_id: 'session1',
        created_at: new Date().toISOString(),
      }

      const url = generateWhatsAppUrl(participant, 'https://example.com/reveal/token', 'Test')

      // Verify URL is properly encoded (no raw emojis or special chars in URL)
      expect(url).not.toContain('🎄')
      expect(url).not.toContain('🎁')
      expect(url).toContain('%F0%9F%8E%84') // Encoded Christmas tree emoji
    })

    it('includes all required message components', () => {
      const participant: ParticipantAdmin = {
        id: '1',
        name: 'Grace',
        phone_number: '+41791234567',
        participant_token: 'token123',
        is_organizer: false,
        whatsapp_sent_at: null,
        reveal_viewed_at: null,
        partner_id: null,
        session_id: 'session1',
        created_at: new Date().toISOString(),
      }

      const assignmentUrl = 'https://example.com/reveal/token123'
      const url = generateWhatsAppUrl(participant, assignmentUrl, 'Test Session')

      const urlObj = new URL(url)
      const message = decodeURIComponent(urlObj.searchParams.get('text') || '')

      // Check all required components
      expect(message).toMatch(/Hallo Grace!/)
      expect(message).toMatch(/Test Session/)
      expect(message).toMatch(new RegExp(assignmentUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
      expect(message).toContain('beschenkst')
    })
  })

  describe('openWhatsApp', () => {
    let windowOpenSpy: any

    beforeEach(() => {
      // Mock window.open
      windowOpenSpy = vi.fn()
      Object.defineProperty(global, 'window', {
        value: { open: windowOpenSpy },
        writable: true,
      })
    })

    it('calls window.open with correct URL and target', () => {
      const url = 'https://api.whatsapp.com/send?phone=41791234567&text=test'

      openWhatsApp(url)

      expect(windowOpenSpy).toHaveBeenCalledWith(url, '_blank')
      expect(windowOpenSpy).toHaveBeenCalledTimes(1)
    })

    it('handles URL with encoded special characters', () => {
      const url = 'https://api.whatsapp.com/send?phone=41791234567&text=Hallo%20Welt%21'

      openWhatsApp(url)

      expect(windowOpenSpy).toHaveBeenCalledWith(url, '_blank')
    })
  })
})
