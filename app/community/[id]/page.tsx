import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ThreadDetails from '@/components/community/ThreadDetails'
import PostForm from '@/components/community/PostForm'

export default async function ThreadPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  const thread = await prisma.communityThread.findUnique({
    where: { id: params.id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      posts: {
        include: {
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

  // Increment view count
  await prisma.communityThread.update({
    where: { id: params.id },
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
