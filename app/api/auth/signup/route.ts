import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logActivity, getRequestMetadata } from '@/lib/activity-log'
import { generateSlugFromTitle } from '@/lib/slug'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['STUDENT', 'COMPANY', 'MENTOR']).default('STUDENT'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role } = signupSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate unique slug from name (optional)
    let slug: string | null = null
    try {
      slug = await generateSlugFromTitle(
        name,
        async (slug) => {
          const existing = await prisma.user.findUnique({
            where: { slug },
          })
          return !!existing
        }
      )
    } catch (error) {
      // If slug generation fails, continue without slug
      console.error('Error generating slug for user:', error)
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        slug,
        role,
        profile: {
          create: {},
        },
      },
    })

    // Log user registration
    const { ipAddress, userAgent } = getRequestMetadata(request)
    await logActivity({
      action: 'user_registered',
      actionType: 'CREATE',
      entityType: 'User',
      entityId: user.id,
      userId: user.id,
      description: `${name} (${email}) registered as ${role}`,
      metadata: { email, role },
      ipAddress,
      userAgent,
    })

    return NextResponse.json(
      { message: 'User created successfully', userId: user.id },
      { status: 201 }
    )
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
