import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { moveToTrash } from '@/lib/trash'
import { logActivity, getRequestMetadata } from '@/lib/activity-log'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const mentorUpdateSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  email: z.string().email().optional(),
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

    const mentor = await prisma.user.findUnique({
      where: { id, role: 'MENTOR' },
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
    })

    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 })
    }

    return NextResponse.json(mentor)
  } catch (error) {
    console.error('Error fetching mentor:', error)
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
    const validatedData = mentorUpdateSchema.parse(body)

    // Check if mentor exists
    const existingMentor = await prisma.user.findUnique({
      where: { id, role: 'MENTOR' },
      include: { profile: true },
    })

    if (!existingMentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 })
    }

    // Check email uniqueness if email is being updated
    if (validatedData.email && validatedData.email !== existingMentor.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email },
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.email !== undefined) updateData.email = validatedData.email
    if (validatedData.bio !== undefined) updateData.bio = validatedData.bio
    if (validatedData.location !== undefined) updateData.location = validatedData.location
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone
    if (validatedData.image !== undefined) updateData.image = validatedData.image

    // Hash password if provided
    if (validatedData.password) {
      updateData.password = await bcrypt.hash(validatedData.password, 10)
    }

    // Update user
    const mentor = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { profile: true },
    })

    // Update profile if it exists or create if it doesn't
    const profileData: any = {}
    if (validatedData.education !== undefined) profileData.education = validatedData.education
    if (validatedData.university !== undefined) profileData.university = validatedData.university
    if (validatedData.graduationYear !== undefined) profileData.graduationYear = validatedData.graduationYear
    if (validatedData.linkedinUrl !== undefined) profileData.linkedinUrl = validatedData.linkedinUrl
    if (validatedData.githubUrl !== undefined) profileData.githubUrl = validatedData.githubUrl
    if (validatedData.portfolioUrl !== undefined) profileData.portfolioUrl = validatedData.portfolioUrl
    if (validatedData.interests !== undefined) profileData.interests = validatedData.interests
    if (validatedData.languages !== undefined) profileData.languages = validatedData.languages

    if (Object.keys(profileData).length > 0) {
      if (existingMentor.profile) {
        await prisma.userProfile.update({
          where: { userId: id },
          data: profileData,
        })
      } else {
        await prisma.userProfile.create({
          data: {
            userId: id,
            ...profileData,
          },
        })
      }
    }

    // Fetch updated mentor with profile
    const updatedMentor = await prisma.user.findUnique({
      where: { id },
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
    })

    if (!updatedMentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 })
    }

    // Log mentor update
    const { ipAddress, userAgent } = getRequestMetadata(request)
    await logActivity({
      action: 'mentor_updated',
      actionType: 'UPDATE',
      entityType: 'User',
      entityId: updatedMentor.id,
      userId: session.user.id,
      description: `${session.user.name} updated mentor: ${updatedMentor.name} (${updatedMentor.email})`,
      metadata: { mentorEmail: updatedMentor.email },
      ipAddress,
      userAgent,
    })

    return NextResponse.json(updatedMentor)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating mentor:', error)
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

    // Check if mentor exists and fetch full data
    const mentor = await prisma.user.findUnique({
      where: { id, role: 'MENTOR' },
      include: {
        profile: true,
      },
    })

    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 })
    }

    // Move to trash instead of permanent delete
    await moveToTrash(
      'User',
      mentor.id,
      mentor,
      session.user.id
    )

    // Now delete from database (cascade will handle profile deletion)
    await prisma.user.delete({
      where: { id },
    })

    // Log mentor deletion
    const { ipAddress, userAgent } = getRequestMetadata(request)
    await logActivity({
      action: 'mentor_deleted',
      actionType: 'DELETE',
      entityType: 'User',
      entityId: mentor.id,
      userId: session.user.id,
      description: `${session.user.name} deleted mentor: ${mentor.name} (${mentor.email})`,
      metadata: { deletedMentorEmail: mentor.email },
      ipAddress,
      userAgent,
    })

    return NextResponse.json({ message: 'Mentor moved to trash successfully' })
  } catch (error) {
    console.error('Error deleting mentor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
