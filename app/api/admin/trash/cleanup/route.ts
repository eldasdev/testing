import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cleanupExpiredTrash } from '@/lib/trash'

/**
 * Cleanup endpoint for expired trash items
 * Can be called manually by Super Admin or scheduled via cron
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Allow both Super Admin manual calls and cron jobs (with secret key)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (!session && (!authHeader || authHeader !== `Bearer ${cronSecret}`)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await cleanupExpiredTrash()

    return NextResponse.json({
      message: 'Cleanup completed',
      deletedCount: result.count,
    })
  } catch (error) {
    console.error('Error cleaning up trash:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
