import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const itemType = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = 20
    const skip = (page - 1) * pageSize

    const where: any = {
      restored: false,
      permanentlyDeleted: false,
    }

    if (itemType) {
      where.itemType = itemType
    }

    const [items, totalCount] = await Promise.all([
      prisma.trashBin.findMany({
        where,
        include: {
          deletedByUser: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { deletedAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.trashBin.count({ where }),
    ])

    // Clean up expired items (older than 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    await prisma.trashBin.updateMany({
      where: {
        expiresAt: { lt: new Date() },
        permanentlyDeleted: false,
      },
      data: {
        permanentlyDeleted: true,
      },
    })

    return NextResponse.json({
      items,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    })
  } catch (error) {
    console.error('Error fetching trash bin:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
