import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity, getRequestMetadata } from '@/lib/activity-log'
import { generateSlugFromTitle } from '@/lib/slug'
import { z } from 'zod'

const threadSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(10),
  category: z.string(),
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
    const validatedData = threadSchema.parse(body)
    const { title, content, category, media } = validatedData

    // Generate unique slug from title
    const slug = await generateSlugFromTitle(
      title,
      async (slug) => {
        const existing = await prisma.communityThread.findUnique({
          where: { slug },
        })
        return !!existing
      }
    )

    const thread = await prisma.communityThread.create({
      data: {
        title,
        slug,
        content,
        category,
        media: Array.isArray(media) && media.length > 0 ? media : [],
        authorId: session.user.id,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        createdAt: true,
      },
    })

    // Log thread creation
    const { ipAddress, userAgent } = getRequestMetadata(request)
    await logActivity({
      action: 'thread_created',
      actionType: 'CREATE',
      entityType: 'CommunityThread',
      entityId: thread.id,
      userId: session.user.id,
      description: `${session.user.name} created thread: "${title}" in ${category}`,
      metadata: { title, category },
      ipAddress,
      userAgent,
    })

    return NextResponse.json(thread, { status: 201 })
  } catch (error) {
    console.error('Error creating community thread:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
