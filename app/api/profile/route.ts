import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const profileSchema = z.object({
  name: z.string().min(2),
  bio: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  education: z.string().optional(),
  university: z.string().optional(),
  graduationYear: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
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

    // Update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        bio: data.bio || null,
        location: data.location || null,
        phone: data.phone || null,
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
