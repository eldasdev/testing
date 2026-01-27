import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { moveToTrash } from '@/lib/trash'

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

    // Fetch the thread with posts before deleting
    const thread = await prisma.communityThread.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        posts: true,
      },
    })

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    // Move to trash instead of permanent delete
    await moveToTrash(
      'CommunityThread',
      thread.id,
      thread,
      session.user.id
    )

    // Delete all posts first
    await prisma.communityPost.deleteMany({
      where: { threadId: id },
    })

    // Then delete the thread
    await prisma.communityThread.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Thread moved to trash successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
