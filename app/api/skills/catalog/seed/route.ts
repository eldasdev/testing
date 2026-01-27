import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { skillsData } from '@/prisma/skills-data'

// POST - Seed skills catalog (Super Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check current count
    const currentCount = await prisma.skillCatalog.count()
    
    if (currentCount > 0) {
      return NextResponse.json({
        message: 'Skills catalog already has data',
        currentCount,
        skipSeeding: true,
      })
    }

    // Seed skills
    const result = await prisma.skillCatalog.createMany({
      data: skillsData.map(skill => ({
        name: skill.name,
        category: skill.category,
        industry: skill.industry,
        isPopular: skill.isPopular,
        isActive: true,
      })),
      skipDuplicates: true,
    })

    return NextResponse.json({
      message: 'Skills catalog seeded successfully',
      count: result.count,
    })
  } catch (error) {
    console.error('Error seeding skills:', error)
    return NextResponse.json(
      { error: 'Failed to seed skills catalog' },
      { status: 500 }
    )
  }
}

// DELETE - Clear skills catalog (Super Admin only, for testing)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Cannot clear skills in production' },
        { status: 403 }
      )
    }

    await prisma.skillCatalog.deleteMany({})

    return NextResponse.json({ message: 'Skills catalog cleared' })
  } catch (error) {
    console.error('Error clearing skills:', error)
    return NextResponse.json(
      { error: 'Failed to clear skills catalog' },
      { status: 500 }
    )
  }
}
