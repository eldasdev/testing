import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { moveToTrash } from '@/lib/trash'
import { logActivity, getRequestMetadata } from '@/lib/activity-log'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        skills: true,
        applications: { take: 10 },
        jobPosts: { take: 10 },
        threads: { take: 10 },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Prevent deleting self or other super admins
    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (targetUser.role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Cannot delete Super Admin' }, { status: 403 })
    }

    if (targetUser.id === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 403 })
    }

    // Move to trash instead of permanent delete
    await moveToTrash(
      'User',
      targetUser.id,
      targetUser,
      session.user.id
    )

    // Now delete from database
    await prisma.user.delete({
      where: { id },
    })

    // Log user deletion
    const { ipAddress, userAgent } = getRequestMetadata(request)
    await logActivity({
      action: 'user_deleted',
      actionType: 'DELETE',
      entityType: 'User',
      entityId: targetUser.id,
      userId: session.user.id,
      description: `${session.user.name} deleted user: ${targetUser.name} (${targetUser.email})`,
      metadata: { deletedUserEmail: targetUser.email, deletedUserRole: targetUser.role },
      ipAddress,
      userAgent,
    })

    return NextResponse.json({ success: true, message: 'User moved to trash successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const user = await prisma.user.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
