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

    // Fetch the job post before deleting
    const jobPost = await prisma.jobPost.findUnique({
      where: { id },
      include: {
        postedBy: {
          select: {
            name: true,
            email: true,
          },
        },
        tags: true,
      },
    })

    if (!jobPost) {
      return NextResponse.json({ error: 'Job post not found' }, { status: 404 })
    }

    // Move to trash instead of permanent delete
    await moveToTrash(
      'JobPost',
      jobPost.id,
      jobPost,
      session.user.id
    )

    // Now delete from database
    await prisma.jobPost.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Job post moved to trash successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
