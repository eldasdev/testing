import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity, getRequestMetadata } from '@/lib/activity-log'
import { generateSlugFromTitle } from '@/lib/slug'
import { z } from 'zod'

const challengeSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  type: z.enum(['coding', 'interview', 'quiz', 'system_design', 'algorithm', 'data_structure']),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
  category: z.string().min(1),
  instructions: z.string().optional(),
  problem: z.string().optional(),
  testCases: z.any().optional(),
  expectedOutput: z.string().optional(),
  solution: z.string().optional(),
  hints: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  timeLimit: z.number().int().positive().optional(),
  points: z.number().int().positive().default(100),
  isActive: z.boolean().default(true),
  isPublic: z.boolean().default(true),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = 20
    const skip = (page - 1) * pageSize

    const where: any = {}

    if (status === 'active') {
      where.isActive = true
      where.isPublic = true
      const now = new Date()
      where.OR = [
        { startDate: null },
        { startDate: { lte: now } },
      ]
      where.OR.push(
        { endDate: null },
        { endDate: { gte: now } },
      )
    } else if (status === 'upcoming') {
      where.isActive = true
      where.startDate = { gt: new Date() }
    } else if (status === 'completed') {
      where.endDate = { lt: new Date() }
    }

    const [challenges, totalCount] = await Promise.all([
      prisma.challenge.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.challenge.count({ where }),
    ])

    return NextResponse.json({
      challenges,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    })
  } catch (error) {
    console.error('Error fetching challenges:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = challengeSchema.parse(body)

    // Generate unique slug from title
    const slug = await generateSlugFromTitle(
      validatedData.title,
      async (slug) => {
        const existing = await prisma.challenge.findUnique({
          where: { slug },
        })
        return !!existing
      }
    )

    const challenge = await prisma.challenge.create({
      data: {
        title: validatedData.title,
        slug,
        description: validatedData.description,
        type: validatedData.type,
        difficulty: validatedData.difficulty,
        category: validatedData.category,
        instructions: validatedData.instructions || null,
        problem: validatedData.problem || null,
        testCases: validatedData.testCases || null,
        expectedOutput: validatedData.expectedOutput || null,
        solution: validatedData.solution || null,
        hints: validatedData.hints || [],
        tags: validatedData.tags || [],
        timeLimit: validatedData.timeLimit || null,
        points: validatedData.points,
        isActive: validatedData.isActive,
        isPublic: validatedData.isPublic,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Log challenge creation
    const { ipAddress, userAgent } = getRequestMetadata(request)
    await logActivity({
      action: 'challenge_created',
      actionType: 'CREATE',
      entityType: 'Challenge',
      entityId: challenge.id,
      userId: session.user.id,
      description: `${session.user.name} created challenge: ${challenge.title} (${challenge.type}, ${challenge.difficulty})`,
      metadata: { title: challenge.title, type: challenge.type, difficulty: challenge.difficulty },
      ipAddress,
      userAgent,
    })

    return NextResponse.json(challenge, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating challenge:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
