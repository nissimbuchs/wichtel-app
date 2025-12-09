import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key to bypass RLS
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

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Verify token exists and get participant
    const { data: participant, error: fetchError } = await supabaseAdmin
      .from('participants')
      .select('id, reveal_viewed_at')
      .eq('participant_token', token)
      .single()

    if (fetchError || !participant) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    }

    // Only update if not already set (first view only)
    if (!participant.reveal_viewed_at) {
      const { error: updateError } = await supabaseAdmin
        .from('participants')
        .update({ reveal_viewed_at: new Date().toISOString() })
        .eq('id', participant.id)

      if (updateError) {
        console.error('Error updating reveal_viewed_at:', updateError)
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Track view error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
