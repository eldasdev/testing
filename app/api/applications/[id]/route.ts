import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity, getRequestMetadata } from '@/lib/activity-log'
import { z } from 'zod'

const updateApplicationSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED']),
})

// PATCH - For companies to update application status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session || session.user.role !== 'COMPANY') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status } = updateApplicationSchema.parse(body)

    // Verify the application belongs to a job posted by this company
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        jobPost: {
          select: {
            postedById: true,
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    if (!application.jobPost || application.jobPost.postedById !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only update applications for your own job posts' },
        { status: 403 }
      )
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        jobPost: {
          select: {
            id: true,
            title: true,
            company: true,
          },
        },
      },
    })

    // Log application status update
    const { ipAddress, userAgent } = getRequestMetadata(request)
    await logActivity({
      action: 'application_status_updated',
      actionType: 'UPDATE',
      entityType: 'Application',
      entityId: updatedApplication.id,
      userId: session.user.id,
      description: `${session.user.name} updated application status to ${status} for ${updatedApplication.user.name} - ${updatedApplication.jobPost?.title || 'Position'}`,
      metadata: { 
        applicantName: updatedApplication.user.name,
        jobTitle: updatedApplication.jobPost?.title,
        newStatus: status,
      },
      ipAddress,
      userAgent,
    })

    return NextResponse.json(updatedApplication)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
