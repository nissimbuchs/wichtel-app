import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with SERVICE ROLE KEY (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

interface DrawRequest {
  sessionId: string
  assignments: Array<{
    giverId: string
    receiverId: string
  }>
}

export async function POST(request: NextRequest) {
  try {
    const body: DrawRequest = await request.json()
    const { sessionId, assignments } = body

    if (!sessionId || !assignments || assignments.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Update all participants with their assignments using SERVICE ROLE (bypasses RLS)
    const updates = assignments.map(({ giverId, receiverId }) =>
      supabaseAdmin
        .from('participants')
        .update({ assigned_to_id: receiverId })
        .eq('id', giverId)
    )

    const results = await Promise.all(updates)

    // Check for errors
    const errors = results.filter((r) => r.error)
    if (errors.length > 0) {
      console.error('Draw errors:', errors)
      return NextResponse.json(
        { error: 'Failed to save some assignments', details: errors },
        { status: 500 }
      )
    }

    // Update session status to 'drawn'
    const { error: sessionError } = await supabaseAdmin
      .from('sessions')
      .update({ status: 'drawn' })
      .eq('id', sessionId)

    if (sessionError) {
      console.error('Session update error:', sessionError)
      return NextResponse.json(
        { error: 'Failed to update session status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Draw API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
