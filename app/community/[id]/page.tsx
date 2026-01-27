import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ThreadDetails from '@/components/community/ThreadDetails'
import PostForm from '@/components/community/PostForm'

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const { id } = await params
  
  // Try to find by slug first, then by id (for backward compatibility)
  const thread = await prisma.communityThread.findFirst({
    where: {
      OR: [
        { slug: id },
        { id },
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      category: true,
      media: true,
      views: true,
      likes: true,
      upvotes: true,
      downvotes: true,
      isPinned: true,
      isLocked: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      posts: {
        select: {
          id: true,
          content: true,
          media: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!thread) {
    notFound()
  }

  // Redirect to slug URL if accessed via ID
  if (thread.slug && id !== thread.slug) {
    redirect(`/community/${thread.slug}`)
  }

  // Increment view count
  await prisma.communityThread.update({
    where: { id: thread.id },
    data: { views: { increment: 1 } },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ThreadDetails thread={thread} />
      {session && !thread.isLocked && (
        <div className="mt-6">
          <PostForm threadId={thread.id} />
        </div>
      )}
    </div>
  )
}
