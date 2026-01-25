import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userIds } = body

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid user IDs provided' },
        { status: 400 }
      )
    }

    // Get current user to prevent self-deletion
    const currentUserId = session.user.id

    // Check if trying to delete self
    if (userIds.includes(currentUserId)) {
      return NextResponse.json(
        { error: 'Cannot delete yourself' },
        { status: 403 }
      )
    }

    // Check if trying to delete super admins
    const targetUsers = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, role: true },
    })

    const superAdminIds = targetUsers
      .filter(u => u.role === 'SUPER_ADMIN')
      .map(u => u.id)

    if (superAdminIds.length > 0) {
      return NextResponse.json(
        { error: `Cannot delete Super Admin users: ${superAdminIds.join(', ')}` },
        { status: 403 }
      )
    }

    // Filter out any invalid user IDs, super admins, and current user
    const validUserIds = targetUsers
      .filter(u => u.role !== 'SUPER_ADMIN' && u.id !== currentUserId)
      .map(u => u.id)
    
    const invalidIds = userIds.filter(id => !validUserIds.includes(id))

    if (validUserIds.length === 0) {
      return NextResponse.json(
        { error: 'No valid users found to delete. Cannot delete Super Admins or yourself.' },
        { status: 400 }
      )
    }

    // Delete related records first (JobPosts and Internships don't have cascade delete)
    // Applications will cascade from JobPost/Internship deletion
    // Other relations (BlogPost, CommunityThread, etc.) have cascade delete
    
    // Delete job posts created by these users
    await prisma.jobPost.deleteMany({
      where: {
        postedById: { in: validUserIds },
      },
    })

    // Delete internships created by these users
    await prisma.internship.deleteMany({
      where: {
        postedById: { in: validUserIds },
      },
    })

    // Delete applications by these users (in case there are orphaned ones)
    await prisma.application.deleteMany({
      where: {
        userId: { in: validUserIds },
      },
    })

    // Delete users (other relations will cascade)
    const result = await prisma.user.deleteMany({
      where: {
        id: { in: validUserIds },
      },
    })

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      invalidIds: invalidIds.length > 0 ? invalidIds : undefined,
    })
  } catch (error) {
    console.error('Error deleting users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
