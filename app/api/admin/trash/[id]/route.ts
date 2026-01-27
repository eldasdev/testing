import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity, getRequestMetadata } from '@/lib/activity-log'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { action } = await request.json()

    const trashItem = await prisma.trashBin.findUnique({
      where: { id },
    })

    if (!trashItem) {
      return NextResponse.json({ error: 'Item not found in trash' }, { status: 404 })
    }

    if (action === 'restore') {
      // Restore the item based on its type
      const itemData = trashItem.itemData as any
      
      try {
        // Remove relations and metadata before restoring
        const { id: _, createdAt, updatedAt, _count, author, postedBy, createdBy, profile, tags, posts, ...cleanData } = itemData

        switch (trashItem.itemType) {
          case 'User':
            // Restore user first
            const userData = { ...cleanData, id: trashItem.itemId }
            delete userData.profile
            delete userData._count
            
            await prisma.user.create({
              data: userData,
            })
            
            // Restore profile if it existed
            if (itemData.profile) {
              await prisma.userProfile.create({
                data: {
                  ...itemData.profile,
                  userId: trashItem.itemId,
                },
              })
            }
            break
          case 'JobPost':
            const jobData = { ...cleanData, id: trashItem.itemId }
            delete jobData.tags
            delete jobData.postedBy
            delete jobData._count
            
            await prisma.jobPost.create({
              data: jobData,
            })
            
            // Restore tags if they existed
            if (itemData.tags && Array.isArray(itemData.tags)) {
              await prisma.jobTag.createMany({
                data: itemData.tags.map((tag: any) => ({
                  jobPostId: trashItem.itemId,
                  name: tag.name || tag,
                })),
                skipDuplicates: true,
              })
            }
            break
          case 'Challenge':
            const challengeData = { ...cleanData, id: trashItem.itemId }
            delete challengeData.createdBy
            delete challengeData._count
            
            await prisma.challenge.create({
              data: challengeData,
            })
            break
          case 'BlogPost':
            const blogData = { ...cleanData, id: trashItem.itemId }
            delete blogData.author
            delete blogData._count
            
            await prisma.blogPost.create({
              data: blogData,
            })
            break
          case 'CommunityThread':
            const threadData = { ...cleanData, id: trashItem.itemId }
            delete threadData.author
            delete threadData.posts
            delete threadData._count
            
            await prisma.communityThread.create({
              data: threadData,
            })
            
            // Restore posts if they existed
            if (itemData.posts && Array.isArray(itemData.posts)) {
              await prisma.communityPost.createMany({
                data: itemData.posts.map((post: any) => ({
                  ...post,
                  threadId: trashItem.itemId,
                })),
                skipDuplicates: true,
              })
            }
            break
          default:
            return NextResponse.json(
              { error: 'Unsupported item type for restoration' },
              { status: 400 }
            )
        }

        // Mark as restored
        await prisma.trashBin.update({
          where: { id },
          data: {
            restored: true,
            restoredAt: new Date(),
          },
        })

        // Log restore action
        const { ipAddress, userAgent } = getRequestMetadata(request)
        await logActivity({
          action: 'item_restored',
          actionType: 'RESTORE',
          entityType: trashItem.itemType,
          entityId: trashItem.itemId,
          userId: session.user.id,
          description: `${session.user.name} restored ${trashItem.itemType}: ${trashItem.itemId}`,
          metadata: { itemType: trashItem.itemType, itemId: trashItem.itemId },
          ipAddress,
          userAgent,
        })

        return NextResponse.json({ message: 'Item restored successfully' })
      } catch (restoreError: any) {
        // If restore fails (e.g., item already exists), mark as permanently deleted
        await prisma.trashBin.update({
          where: { id },
          data: {
            permanentlyDeleted: true,
          },
        })
        return NextResponse.json(
          { error: 'Failed to restore item. It may already exist.' },
          { status: 400 }
        )
      }
    } else if (action === 'delete') {
      // Permanently delete
      await prisma.trashBin.update({
        where: { id },
        data: {
          permanentlyDeleted: true,
        },
      })

      // Log permanent deletion
      const { ipAddress, userAgent } = getRequestMetadata(request)
      await logActivity({
        action: 'item_permanently_deleted',
        actionType: 'DELETE',
        entityType: trashItem.itemType,
        entityId: trashItem.itemId,
        userId: session.user.id,
        description: `${session.user.name} permanently deleted ${trashItem.itemType}: ${trashItem.itemId}`,
        metadata: { itemType: trashItem.itemType, itemId: trashItem.itemId },
        ipAddress,
        userAgent,
      })

      return NextResponse.json({ message: 'Item permanently deleted' })
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error processing trash item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
