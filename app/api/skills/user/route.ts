import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { recalculateCareerReadiness } from '@/lib/performance'
import { z } from 'zod'

const userSkillSchema = z.object({
  skillCatalogId: z.string().optional(),
  name: z.string().min(1),
  proficiency: z.enum(['BEGINNER', 'JUNIOR', 'MIDDLE', 'SENIOR', 'EXPERT']),
  yearsExperience: z.number().optional(),
  category: z.string().optional(),
})

// GET - Get current user's skills
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const skills = await prisma.userSkill.findMany({
      where: { userId: session.user.id },
      include: {
        skillCatalog: {
          select: {
            id: true,
            name: true,
            category: true,
            industry: true,
            isPopular: true,
          },
        },
      },
      orderBy: [
        { proficiency: 'desc' },
        { name: 'asc' },
      ],
    })

    return NextResponse.json(skills)
  } catch (error) {
    console.error('Error fetching user skills:', error)
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    )
  }
}

// POST - Add a skill to user's profile
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = userSkillSchema.parse(body)

    // Check if user already has this skill
    const existingSkill = await prisma.userSkill.findFirst({
      where: {
        userId: session.user.id,
        name: data.name,
      },
    })

    if (existingSkill) {
      return NextResponse.json(
        { error: 'You already have this skill in your profile' },
        { status: 400 }
      )
    }

    // If skillCatalogId provided, verify it exists and get category
    let category = data.category
    if (data.skillCatalogId) {
      const catalogSkill = await prisma.skillCatalog.findUnique({
        where: { id: data.skillCatalogId },
      })
      if (catalogSkill) {
        category = catalogSkill.category
        // Increment usage count
        await prisma.skillCatalog.update({
          where: { id: data.skillCatalogId },
          data: { usageCount: { increment: 1 } },
        })
      }
    }

    const skill = await prisma.userSkill.create({
      data: {
        userId: session.user.id,
        skillCatalogId: data.skillCatalogId || null,
        name: data.name,
        proficiency: data.proficiency,
        yearsExperience: data.yearsExperience || null,
        category: category || null,
      },
      include: {
        skillCatalog: true,
      },
    })

    await recalculateCareerReadiness(session.user.id)
    return NextResponse.json(skill, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error adding user skill:', error)
    return NextResponse.json(
      { error: 'Failed to add skill' },
      { status: 500 }
    )
  }
}

// DELETE - Remove all skills (for bulk operations)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const skillId = searchParams.get('id')

    if (skillId) {
      // Delete specific skill
      const skill = await prisma.userSkill.findFirst({
        where: {
          id: skillId,
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
        where: { id: skillId },
      })

      await recalculateCareerReadiness(session.user.id)
      return NextResponse.json({ message: 'Skill removed' })
    }

    return NextResponse.json(
      { error: 'Skill ID required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error removing skill:', error)
    return NextResponse.json(
      { error: 'Failed to remove skill' },
      { status: 500 }
    )
  }
}
