import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Public route to fetch skills catalog with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const industry = searchParams.get('industry') || ''
    const popular = searchParams.get('popular') === 'true'
    const limit = parseInt(searchParams.get('limit') || '100')

    const where: any = {
      isActive: true,
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      }
    }

    if (category) {
      where.category = category
    }

    if (industry) {
      where.industry = industry
    }

    if (popular) {
      where.isPopular = true
    }

    const skills = await prisma.skillCatalog.findMany({
      where,
      orderBy: [
        { isPopular: 'desc' },
        { usageCount: 'desc' },
        { name: 'asc' },
      ],
      take: limit,
    })

    // Get unique categories and industries for filters
    const categories = await prisma.skillCatalog.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    })

    const industries = await prisma.skillCatalog.findMany({
      where: { isActive: true },
      select: { industry: true },
      distinct: ['industry'],
      orderBy: { industry: 'asc' },
    })

    return NextResponse.json({
      skills,
      filters: {
        categories: categories.map(c => c.category),
        industries: industries.map(i => i.industry),
      },
    })
  } catch (error) {
    console.error('Error fetching skills catalog:', error)
    return NextResponse.json(
      { error: 'Failed to fetch skills catalog' },
      { status: 500 }
    )
  }
}

// POST - Admin route to add skills to catalog
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, category, industry, description, icon, isPopular } = body

    if (!name || !category || !industry) {
      return NextResponse.json(
        { error: 'Name, category, and industry are required' },
        { status: 400 }
      )
    }

    // Check if skill already exists
    const existingSkill = await prisma.skillCatalog.findUnique({
      where: { name },
    })

    if (existingSkill) {
      return NextResponse.json(
        { error: 'Skill already exists in catalog' },
        { status: 400 }
      )
    }

    const skill = await prisma.skillCatalog.create({
      data: {
        name,
        category,
        industry,
        description: description || null,
        icon: icon || null,
        isPopular: isPopular || false,
      },
    })

    return NextResponse.json(skill, { status: 201 })
  } catch (error) {
    console.error('Error creating skill:', error)
    return NextResponse.json(
      { error: 'Failed to create skill' },
      { status: 500 }
    )
  }
}
