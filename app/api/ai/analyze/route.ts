import { NextResponse } from 'next/server'

/**
 * @deprecated This endpoint has been replaced by /api/ai/chat
 * which supports full conversational history and better error handling.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: 'This endpoint is deprecated. Use /api/ai/chat instead.',
      migrate_to: '/api/ai/chat',
    },
    { status: 410 }
  )
}
