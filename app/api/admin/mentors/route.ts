import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity, getRequestMetadata } from '@/lib/activity-log'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const mentorSchema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  bio: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  // Profile fields
  education: z.string().optional().nullable(),
  university: z.string().optional().nullable(),
  graduationYear: z.number().int().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  githubUrl: z.string().url().optional().nullable(),
  portfolioUrl: z.string().url().optional().nullable(),
  interests: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = 20
    const skip = (page - 1) * pageSize

    const where: any = {
      role: 'MENTOR',
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [mentors, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          profile: true,
          _count: {
            select: {
              threads: true,
              posts: true,
              roadmaps: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      mentors,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    })
  } catch (error) {
    console.error('Error fetching mentors:', error)
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
    const validatedData = mentorSchema.parse(body)

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password if provided
    const hashedPassword = validatedData.password
      ? await bcrypt.hash(validatedData.password, 10)
      : null

    // Create mentor user
    const mentor = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: 'MENTOR',
        bio: validatedData.bio || null,
        location: validatedData.location || null,
        phone: validatedData.phone || null,
        image: validatedData.image || null,
        profile: {
          create: {
            education: validatedData.education || null,
            university: validatedData.university || null,
            graduationYear: validatedData.graduationYear || null,
            linkedinUrl: validatedData.linkedinUrl || null,
            githubUrl: validatedData.githubUrl || null,
            portfolioUrl: validatedData.portfolioUrl || null,
            interests: validatedData.interests || [],
            languages: validatedData.languages || [],
          },
        },
      },
      include: {
        profile: true,
      },
    })

    // Log mentor creation
    const { ipAddress, userAgent } = getRequestMetadata(request)
    await logActivity({
      action: 'mentor_created',
      actionType: 'CREATE',
      entityType: 'User',
      entityId: mentor.id,
      userId: session.user.id,
      description: `${session.user.name} created mentor: ${mentor.name} (${mentor.email})`,
      metadata: { mentorEmail: mentor.email },
      ipAddress,
      userAgent,
    })

    return NextResponse.json(mentor, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating mentor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
