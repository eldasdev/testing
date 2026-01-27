import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity, getRequestMetadata } from '@/lib/activity-log'
import { generateSlugFromTitle } from '@/lib/slug'
import { z } from 'zod'

const jobPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  company: z.string().min(1, 'Company name is required'),
  location: z.string().min(1, 'Location is required'),
  address: z.string().nullable().optional(),
  latitude: z.union([z.number(), z.string()]).nullable().optional().transform(val => val === null || val === '' ? null : Number(val)),
  longitude: z.union([z.number(), z.string()]).nullable().optional().transform(val => val === null || val === '' ? null : Number(val)),
  placeId: z.string().nullable().optional(),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT']),
  experienceLevel: z.enum(['ENTRY', 'JUNIOR', 'MID', 'SENIOR']),
  salaryMin: z.union([z.number(), z.string()]).nullable().optional().transform(val => val === null || val === '' ? null : String(val)),
  salaryMax: z.union([z.number(), z.string()]).nullable().optional().transform(val => val === null || val === '' ? null : String(val)),
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
      applicationDeadline: body.applicationDeadline || null,
    })

    // Generate unique slug from title (optional, can be null)
    let slug: string | null = null
    try {
      slug = await generateSlugFromTitle(
        `${validatedData.title}-${validatedData.company}`,
        async (slug) => {
          const existing = await prisma.jobPost.findUnique({
            where: { slug },
          })
          return !!existing
        }
      )
    } catch (error) {
      // If slug generation fails, continue without slug
      console.error('Error generating slug for job post:', error)
    }

    // Create the job post
    const jobPost = await prisma.jobPost.create({
      data: {
        title: validatedData.title,
        slug,
        description: validatedData.description,
        company: validatedData.company,
        location: validatedData.location,
        address: validatedData.address || null,
        latitude: validatedData.latitude || null,
        longitude: validatedData.longitude || null,
        placeId: validatedData.placeId || null,
        type: validatedData.type,
        experienceLevel: validatedData.experienceLevel,
        salaryMin: validatedData.salaryMin ? BigInt(validatedData.salaryMin) : null,
        salaryMax: validatedData.salaryMax ? BigInt(validatedData.salaryMax) : null,
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

    // Log job post creation
    const { ipAddress, userAgent } = getRequestMetadata(request)
    await logActivity({
      action: 'job_posted',
      actionType: 'CREATE',
      entityType: 'JobPost',
      entityId: jobPost.id,
      userId: session.user.id,
      description: `${session.user.name} posted job: ${jobPost.title} at ${jobPost.company}`,
      metadata: { title: jobPost.title, company: jobPost.company, type: jobPost.type },
      ipAddress,
      userAgent,
    })

    // Convert BigInt values to strings for JSON serialization
    const response = {
      ...jobPost,
      salaryMin: jobPost.salaryMin ? jobPost.salaryMin.toString() : null,
      salaryMax: jobPost.salaryMax ? jobPost.salaryMax.toString() : null,
    }

    return NextResponse.json(response, { status: 201 })
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

    // Convert BigInt values to strings for JSON serialization
    const jobsWithStringSalaries = jobs.map(job => ({
      ...job,
      salaryMin: job.salaryMin ? job.salaryMin.toString() : null,
      salaryMax: job.salaryMax ? job.salaryMax.toString() : null,
    }))

    return NextResponse.json(jobsWithStringSalaries)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
