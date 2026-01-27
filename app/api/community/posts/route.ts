import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity, getRequestMetadata } from '@/lib/activity-log'
import { z } from 'zod'

const postSchema = z.object({
  threadId: z.string(),
  content: z.string().min(5),
  media: z.array(z.string()).optional().default([]),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { threadId, content, media } = postSchema.parse(body)

    const post = await prisma.communityPost.create({
      data: {
        content,
        media: Array.isArray(media) && media.length > 0 ? media : [],
        threadId,
        authorId: session.user.id,
      },
      include: {
        thread: { select: { title: true } },
      },
    })

    // Log post creation
    const { ipAddress, userAgent } = getRequestMetadata(request)
    await logActivity({
      action: 'community_post_created',
      actionType: 'CREATE',
      entityType: 'CommunityPost',
      entityId: post.id,
      userId: session.user.id,
      description: `${session.user.name} replied to thread: "${post.thread.title}"`,
      metadata: { threadId, threadTitle: post.thread.title },
      ipAddress,
      userAgent,
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
