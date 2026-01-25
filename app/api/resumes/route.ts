import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const resumeSchema = z.object({
  title: z.string(),
  template: z.string(),
  personalInfo: z.any(),
  summary: z.string().optional(),
  experience: z.array(z.any()),
  education: z.array(z.any()),
  skills: z.array(z.any()),
  languages: z.array(z.any()).optional(),
  projects: z.array(z.any()).optional(),
  certifications: z.array(z.any()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = resumeSchema.parse(body)

    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        title: data.title,
        template: data.template,
        personalInfo: data.personalInfo,
        summary: data.summary,
        experience: data.experience,
        education: data.education,
        skills: data.skills,
        languages: data.languages || [],
        projects: data.projects || [],
        certifications: data.certifications || [],
      },
    })

    return NextResponse.json(resume, { status: 201 })
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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(resumes)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
