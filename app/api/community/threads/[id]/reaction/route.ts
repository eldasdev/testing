import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const reactionSchema = z.object({
  type: z.enum(['UPVOTE', 'DOWNVOTE']),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { type } = reactionSchema.parse(body)

    // Find thread by slug or id (for backward compatibility)
    const thread = await prisma.communityThread.findFirst({
      where: {
        OR: [
          { slug: id },
          { id },
        ],
      },
    })

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    // Check if user already reacted
    const existingReaction = await prisma.threadReaction.findUnique({
      where: {
        threadId_userId: {
          threadId: thread.id,
          userId: session.user.id,
        },
      },
    })

    let reaction
    let upvoteChange = 0
    let downvoteChange = 0

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Remove reaction if clicking the same type
        await prisma.threadReaction.delete({
          where: {
            id: existingReaction.id,
          },
        })
        upvoteChange = type === 'UPVOTE' ? -1 : 0
        downvoteChange = type === 'DOWNVOTE' ? -1 : 0
        reaction = null
      } else {
        // Change reaction type
        reaction = await prisma.threadReaction.update({
          where: {
            id: existingReaction.id,
          },
          data: { type },
        })
        upvoteChange = type === 'UPVOTE' ? 1 : -1
        downvoteChange = type === 'DOWNVOTE' ? 1 : -1
      }
    } else {
        // Create new reaction
        reaction = await prisma.threadReaction.create({
          data: {
            threadId: thread.id,
            userId: session.user.id,
            type,
          },
        })
      upvoteChange = type === 'UPVOTE' ? 1 : 0
      downvoteChange = type === 'DOWNVOTE' ? 1 : 0
    }

    // Update thread vote counts
    await prisma.communityThread.update({
      where: { id: thread.id },
      data: {
        upvotes: { increment: upvoteChange },
        downvotes: { increment: downvoteChange },
      },
    })

    // Get updated counts
    const updatedThread = await prisma.communityThread.findUnique({
      where: { id: thread.id },
      select: {
        upvotes: true,
        downvotes: true,
      },
    })

    return NextResponse.json({
      success: true,
      reaction: reaction ? { type: reaction.type } : null,
      upvotes: updatedThread?.upvotes || 0,
      downvotes: updatedThread?.downvotes || 0,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error reacting to thread:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // If no session, return null reaction (not an error)
    if (!session?.user) {
      return NextResponse.json({
        reaction: null,
      })
    }

    const { id } = await params

    // Find thread by slug or id
    const thread = await prisma.communityThread.findFirst({
      where: {
        OR: [
          { slug: id },
          { id },
        ],
      },
    })

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    // Get user's reaction if any
    const reaction = await prisma.threadReaction.findUnique({
      where: {
        threadId_userId: {
          threadId: thread.id,
          userId: session.user.id,
        },
      },
    })

    return NextResponse.json({
      reaction: reaction ? { type: reaction.type } : null,
    })
  } catch (error) {
    console.error('Error fetching reaction:', error)
    // Return null reaction on error instead of 500
    return NextResponse.json({
      reaction: null,
    })
  }
}
