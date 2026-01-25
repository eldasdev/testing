import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const submissionSchema = z.object({
  challengeId: z.string(),
  challengeType: z.string(),
  solution: z.string(),
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
    const { challengeId, challengeType, solution } = submissionSchema.parse(body)

    const submission = await prisma.practiceSubmission.create({
      data: {
        userId: session.user.id,
        challengeId,
        challengeType,
        solution,
      },
    })

    return NextResponse.json(submission, { status: 201 })
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
