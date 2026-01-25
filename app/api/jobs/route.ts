import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const jobPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  company: z.string().min(1, 'Company name is required'),
  location: z.string().min(1, 'Location is required'),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT']),
  experienceLevel: z.enum(['ENTRY', 'JUNIOR', 'MID', 'SENIOR']),
  salaryMin: z.number().nullable().optional(),
  salaryMax: z.number().nullable().optional(),
  currency: z.string().optional().default('UZS'),
  applicationDeadline: z.string().nullable().optional(),
  requirements: z.array(z.string().min(1)).min(1, 'At least one requirement is required'),
  benefits: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only companies, admins, and super admins can post jobs
    if (
      session.user.role !== 'COMPANY' &&
      session.user.role !== 'ADMIN' &&
      session.user.role !== 'SUPER_ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Only companies can post job vacancies' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate the request body
    const validatedData = jobPostSchema.parse({
      ...body,
      salaryMin: body.salaryMin ? Number(body.salaryMin) : null,
      salaryMax: body.salaryMax ? Number(body.salaryMax) : null,
      applicationDeadline: body.applicationDeadline || null,
    })

    // Create the job post
    const jobPost = await prisma.jobPost.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        company: validatedData.company,
        location: validatedData.location,
        type: validatedData.type,
        experienceLevel: validatedData.experienceLevel,
        salaryMin: validatedData.salaryMin,
        salaryMax: validatedData.salaryMax,
        currency: validatedData.currency,
        applicationDeadline: validatedData.applicationDeadline
          ? new Date(validatedData.applicationDeadline)
          : null,
        requirements: validatedData.requirements,
        benefits: validatedData.benefits || [],
        postedById: session.user.id,
        isActive: true,
        tags: {
          create: validatedData.tags?.map((tag) => ({ name: tag })) || [],
        },
      },
      include: {
        tags: true,
        postedBy: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(jobPost, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating job post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')
    const type = searchParams.get('type')
    const experience = searchParams.get('experience')
    const search = searchParams.get('search')

    const where: any = {
      isActive: true,
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' }
    }

    if (type) {
      where.type = type
    }

    if (experience) {
      where.experienceLevel = experience
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ]
    }

    const jobs = await prisma.jobPost.findMany({
      where,
      include: {
        postedBy: {
          select: {
            name: true,
            image: true,
          },
        },
        tags: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
