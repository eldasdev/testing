import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSkillSchema = z.object({
  proficiency: z.enum(['BEGINNER', 'JUNIOR', 'MIDDLE', 'SENIOR', 'EXPERT']).optional(),
  yearsExperience: z.number().optional(),
})

// PATCH - Update a user's skill
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const existingSkill = await prisma.userSkill.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingSkill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    }

    const body = await request.json()
    const data = updateSkillSchema.parse(body)

    const skill = await prisma.userSkill.update({
      where: { id },
      data: {
        ...(data.proficiency !== undefined && { proficiency: data.proficiency }),
        ...(data.yearsExperience !== undefined && { yearsExperience: data.yearsExperience }),
      },
      include: {
        skillCatalog: true,
      },
    })

    return NextResponse.json(skill)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error updating skill:', error)
    return NextResponse.json(
      { error: 'Failed to update skill' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a specific skill
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const skill = await prisma.userSkill.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    }

    // Decrement usage count if from catalog
    if (skill.skillCatalogId) {
      await prisma.skillCatalog.update({
        where: { id: skill.skillCatalogId },
        data: { usageCount: { decrement: 1 } },
      })
    }

    await prisma.userSkill.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Skill removed' })
  } catch (error) {
    console.error('Error removing skill:', error)
    return NextResponse.json(
      { error: 'Failed to remove skill' },
      { status: 500 }
    )
  }
}
