import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity, getRequestMetadata } from '@/lib/activity-log'
import { z } from 'zod'

const applicationSchema = z.object({
  jobPostId: z.string().optional(),
  internshipId: z.string().optional(),
  resumeId: z.string().optional(),
  coverLetter: z.string().optional(),
})

// GET - For companies to fetch applications for their jobs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'COMPANY') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const jobPostId = searchParams.get('jobPostId')
    const status = searchParams.get('status')

    // Get all job posts by this company
    const companyJobs = await prisma.jobPost.findMany({
      where: { postedById: session.user.id },
      select: { id: true },
    })

    const jobIds = companyJobs.map(job => job.id)

    if (jobIds.length === 0) {
      return NextResponse.json([])
    }

    const where: any = {
      jobPostId: { in: jobIds },
    }

    if (jobPostId) {
      where.jobPostId = jobPostId
    }

    if (status) {
      where.status = status
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
            location: true,
            profile: {
              select: {
                education: true,
                university: true,
                graduationYear: true,
                linkedinUrl: true,
                githubUrl: true,
                portfolioUrl: true,
              },
            },
            skills: {
              include: {
                skillCatalog: true,
              },
            },
          },
        },
        jobPost: {
          select: {
            id: true,
            title: true,
            company: true,
          },
        },
        resume: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(applications)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { jobPostId, internshipId, resumeId, coverLetter } = applicationSchema.parse(body)

    if (!jobPostId && !internshipId) {
      return NextResponse.json(
        { error: 'Either jobPostId or internshipId is required' },
        { status: 400 }
      )
    }

    // Check if already applied
    const existing = await prisma.application.findFirst({
      where: {
        userId: session.user.id,
        ...(jobPostId ? { jobPostId } : { internshipId }),
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'You have already applied for this position' },
        { status: 400 }
      )
    }

    const application = await prisma.application.create({
      data: {
        userId: session.user.id,
        jobPostId: jobPostId || undefined,
        internshipId: internshipId || undefined,
        resumeId: resumeId || undefined,
        coverLetter: coverLetter || undefined,
      },
      include: {
        jobPost: { select: { title: true, company: true } },
        internship: { select: { title: true, company: true } },
      },
    })

    // Log application submission
    const { ipAddress, userAgent } = getRequestMetadata(request)
    const positionTitle = application.jobPost?.title || application.internship?.title || 'Unknown Position'
    await logActivity({
      action: 'application_submitted',
      actionType: 'CREATE',
      entityType: 'Application',
      entityId: application.id,
      userId: session.user.id,
      description: `${session.user.name} applied for ${positionTitle}`,
      metadata: { 
        jobPostId: application.jobPostId,
        internshipId: application.internshipId,
        positionTitle,
      },
      ipAddress,
      userAgent,
    })

    return NextResponse.json(application, { status: 201 })
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
