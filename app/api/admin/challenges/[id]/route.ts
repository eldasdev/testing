import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { moveToTrash } from '@/lib/trash'
import { logActivity, getRequestMetadata } from '@/lib/activity-log'
import { generateSlugFromTitle } from '@/lib/slug'
import { z } from 'zod'

const challengeUpdateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  type: z.enum(['coding', 'interview', 'quiz', 'system_design', 'algorithm', 'data_structure']).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']).optional(),
  category: z.string().min(1).optional(),
  instructions: z.string().optional().nullable(),
  problem: z.string().optional().nullable(),
  testCases: z.any().optional().nullable(),
  expectedOutput: z.string().optional().nullable(),
  solution: z.string().optional().nullable(),
  hints: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  timeLimit: z.number().int().positive().optional().nullable(),
  points: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    })

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
    }

    return NextResponse.json(challenge)
  } catch (error) {
    console.error('Error fetching challenge:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = challengeUpdateSchema.parse(body)

    const updateData: any = {}
    if (validatedData.title !== undefined) {
      updateData.title = validatedData.title
      // Regenerate slug if title changes
      const slug = await generateSlugFromTitle(
        validatedData.title,
        async (slug) => {
          const existing = await prisma.challenge.findFirst({
            where: { 
              slug,
              NOT: { id },
            },
          })
          return !!existing
        }
      )
      updateData.slug = slug
    }
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.type !== undefined) updateData.type = validatedData.type
    if (validatedData.difficulty !== undefined) updateData.difficulty = validatedData.difficulty
    if (validatedData.category !== undefined) updateData.category = validatedData.category
    if (validatedData.instructions !== undefined) updateData.instructions = validatedData.instructions
    if (validatedData.problem !== undefined) updateData.problem = validatedData.problem
    if (validatedData.testCases !== undefined) updateData.testCases = validatedData.testCases
    if (validatedData.expectedOutput !== undefined) updateData.expectedOutput = validatedData.expectedOutput
    if (validatedData.solution !== undefined) updateData.solution = validatedData.solution
    if (validatedData.hints !== undefined) updateData.hints = validatedData.hints
    if (validatedData.tags !== undefined) updateData.tags = validatedData.tags
    if (validatedData.timeLimit !== undefined) updateData.timeLimit = validatedData.timeLimit
    if (validatedData.points !== undefined) updateData.points = validatedData.points
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive
    if (validatedData.isPublic !== undefined) updateData.isPublic = validatedData.isPublic
    if (validatedData.startDate !== undefined) {
      updateData.startDate = validatedData.startDate ? new Date(validatedData.startDate) : null
    }
    if (validatedData.endDate !== undefined) {
      updateData.endDate = validatedData.endDate ? new Date(validatedData.endDate) : null
    }

    const challenge = await prisma.challenge.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Log challenge update
    const { ipAddress, userAgent } = getRequestMetadata(request)
    await logActivity({
      action: 'challenge_updated',
      actionType: 'UPDATE',
      entityType: 'Challenge',
      entityId: challenge.id,
      userId: session.user.id,
      description: `${session.user.name} updated challenge: ${challenge.title}`,
      metadata: { title: challenge.title, type: challenge.type },
      ipAddress,
      userAgent,
    })

    return NextResponse.json(challenge)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating challenge:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Fetch the challenge before deleting
    const challenge = await prisma.challenge.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
    }

    // Move to trash instead of permanent delete
    await moveToTrash(
      'Challenge',
      challenge.id,
      challenge,
      session.user.id
    )

    // Now delete from database
    await prisma.challenge.delete({
      where: { id },
    })

    // Log challenge deletion
    const { ipAddress, userAgent } = getRequestMetadata(request)
    await logActivity({
      action: 'challenge_deleted',
      actionType: 'DELETE',
      entityType: 'Challenge',
      entityId: challenge.id,
      userId: session.user.id,
      description: `${session.user.name} deleted challenge: ${challenge.title}`,
      metadata: { title: challenge.title, type: challenge.type },
      ipAddress,
      userAgent,
    })

    return NextResponse.json({ message: 'Challenge moved to trash successfully' })
  } catch (error) {
    console.error('Error deleting challenge:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
