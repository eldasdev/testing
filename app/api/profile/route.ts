import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        logo: true,
        bio: true,
        location: true,
        phone: true,
        role: true,
        profile: {
          select: {
            id: true,
            education: true,
            university: true,
            graduationYear: true,
            interests: true,
            languages: true,
            linkedinUrl: true,
            githubUrl: true,
            portfolioUrl: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

const profileSchema = z.object({
  name: z.string().min(2).optional(), // Make optional to allow image-only updates
  bio: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  education: z.string().optional(),
  university: z.string().optional(),
  graduationYear: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  // Allow image/logo to be null, empty string, or any string (relative paths like /uploads/...)
  image: z.union([z.string(), z.null()]).optional().nullable(),
  logo: z.union([z.string(), z.null()]).optional().nullable(),
})

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = profileSchema.parse(body)

    // Get user role to determine if we should update image or logo
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    // Get current user data to preserve fields not being updated
    const currentUserData = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, bio: true, location: true, phone: true },
    })

    if (!currentUserData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const updateData: any = {
      // Only update name if provided and valid, otherwise keep current
      name: (data.name && data.name.length >= 2) ? data.name : currentUserData.name,
      bio: data.bio !== undefined ? (data.bio || null) : currentUserData.bio,
      location: data.location !== undefined ? (data.location || null) : currentUserData.location,
      phone: data.phone !== undefined ? (data.phone || null) : currentUserData.phone,
    }

    // Update image for non-COMPANY users, logo for COMPANY users
    if (currentUser?.role === 'COMPANY') {
      updateData.logo = data.logo || null
    } else {
      updateData.image = data.image || null
    }

    // Update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...updateData,
        profile: {
          upsert: {
            create: {
              education: data.education || null,
              university: data.university || null,
              graduationYear: data.graduationYear ? parseInt(data.graduationYear) : null,
              linkedinUrl: data.linkedinUrl || null,
              githubUrl: data.githubUrl || null,
              portfolioUrl: data.portfolioUrl || null,
            },
            update: {
              education: data.education || null,
              university: data.university || null,
              graduationYear: data.graduationYear ? parseInt(data.graduationYear) : null,
              linkedinUrl: data.linkedinUrl || null,
              githubUrl: data.githubUrl || null,
              portfolioUrl: data.portfolioUrl || null,
            },
          },
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Profile validation error:', error.errors)
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
