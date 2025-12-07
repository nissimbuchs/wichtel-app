'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/services/supabase/client'
import { SlotMachineReveal } from '@/components/reveal/SlotMachineReveal'

interface RevealData {
  participantName: string
  assignedToName: string
  allNames: string[]
  sessionName: string
}

export default function RevealPage() {
  const params = useParams()
  const token = params.token as string
  const [data, setData] = useState<RevealData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadRevealData()
  }, [token])

  async function loadRevealData() {
    try {
      // Get participant by token
      const { data: participant, error: participantError } = await supabase
        .from('participants')
        .select('id, name, assigned_to_id, session_id')
        .eq('participant_token', token)
        .single()

      if (participantError || !participant) {
        throw new Error('Ungültiger oder abgelaufener Link')
      }

      if (!participant.assigned_to_id) {
        throw new Error('Auslosung wurde noch nicht durchgeführt')
      }

      // Get assigned person's name
      const { data: assignedPerson, error: assignedError } = await supabase
        .from('participants')
        .select('name')
        .eq('id', participant.assigned_to_id)
        .single()

      if (assignedError || !assignedPerson) {
        throw new Error('Zugeteilte Person nicht gefunden')
      }

      // Get session name
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('name')
        .eq('id', participant.session_id)
        .single()

      if (sessionError || !session) {
        throw new Error('Session nicht gefunden')
      }

      // Get all participant names for animation
      const { data: allParticipants, error: allError } = await supabase
        .from('participants')
        .select('name')
        .eq('session_id', participant.session_id)

      if (allError) {
        throw new Error('Fehler beim Laden der Teilnehmer')
      }

      const allNames = allParticipants?.map((p) => p.name) || []

      setData({
        participantName: participant.name,
        assignedToName: assignedPerson.name,
        allNames,
        sessionName: session.name,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-christmas-red">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-xl">Lädt deine Zuteilung...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-christmas-red p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Fehler</h1>
          <p className="text-gray-700">{error}</p>
          <p className="text-sm text-gray-500 mt-4">
            Bitte kontaktiere deinen Organisator für einen neuen Link.
          </p>
        </div>
      </div>
    )
  }

  return (
    <SlotMachineReveal
      participantName={data.participantName}
      assignedToName={data.assignedToName}
      allNames={data.allNames}
      sessionName={data.sessionName}
      token={token}
    />
  )
}
