import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateSlugFromTitle } from '@/lib/slug'
import { z } from 'zod'

const manualPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500).optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  media: z.array(z.string()).optional().default([]),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = manualPostSchema.parse(body)

    const slug = await generateSlugFromTitle(data.title, async (slug) => {
      const existing = await prisma.blogPost.findUnique({ where: { slug } })
      return !!existing
    })

    const excerpt = data.excerpt?.trim() || data.content.substring(0, 200).trim() + '...'

    const post = await prisma.blogPost.create({
      data: {
        title: data.title.trim(),
        slug,
        content: data.content.trim(),
        excerpt,
        authorId: session.user.id,
        isAIGenerated: false,
        tags: Array.isArray(data.tags) ? data.tags : [],
        media: Array.isArray(data.media) ? data.media : [],
      },
    })

    return NextResponse.json({
      id: post.id,
      slug: post.slug,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating blog post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
