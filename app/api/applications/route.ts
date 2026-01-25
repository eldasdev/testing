import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const applicationSchema = z.object({
  jobPostId: z.string().optional(),
  internshipId: z.string().optional(),
  resumeId: z.string().optional(),
  coverLetter: z.string().optional(),
})

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
