import { PrismaClient } from '@prisma/client'
import { generateSlugFromTitle } from '../lib/slug'

const prisma = new PrismaClient()

async function populateSlugs() {
  console.log('Starting slug population...')

  // Populate CommunityThread slugs
  console.log('Populating CommunityThread slugs...')
  // Get all threads and check which ones need slugs
  const allThreads = await prisma.communityThread.findMany({
    select: { id: true, title: true, slug: true },
  })
  const threads = allThreads.filter(t => !t.slug || t.slug.trim() === '')

  for (const thread of threads) {
    const slug = await generateSlugFromTitle(
      thread.title,
      async (slug) => {
        const existing = await prisma.communityThread.findFirst({
          where: {
            slug,
            NOT: { id: thread.id },
          },
        })
        return !!existing
      }
    )

    await prisma.communityThread.update({
      where: { id: thread.id },
      data: { slug },
    })

    console.log(`  ✓ Updated thread: ${thread.title} -> ${slug}`)
  }

  // Populate BlogPost slugs
  console.log('Populating BlogPost slugs...')
  const allBlogPosts = await prisma.blogPost.findMany({
    select: { id: true, title: true, slug: true },
  })
  const blogPosts = allBlogPosts.filter(p => !p.slug || p.slug.trim() === '')

  for (const post of blogPosts) {
    const slug = await generateSlugFromTitle(
      post.title,
      async (slug) => {
        const existing = await prisma.blogPost.findFirst({
          where: {
            slug,
            NOT: { id: post.id },
          },
        })
        return !!existing
      }
    )

    await prisma.blogPost.update({
      where: { id: post.id },
      data: { slug },
    })

    console.log(`  ✓ Updated blog post: ${post.title} -> ${slug}`)
  }

  // Populate Challenge slugs
  console.log('Populating Challenge slugs...')
  const allChallenges = await prisma.challenge.findMany({
    select: { id: true, title: true, slug: true },
  })
  const challenges = allChallenges.filter(c => !c.slug || c.slug.trim() === '')

  for (const challenge of challenges) {
    const slug = await generateSlugFromTitle(
      challenge.title,
      async (slug) => {
        const existing = await prisma.challenge.findFirst({
          where: {
            slug,
            NOT: { id: challenge.id },
          },
        })
        return !!existing
      }
    )

    await prisma.challenge.update({
      where: { id: challenge.id },
      data: { slug },
    })

    console.log(`  ✓ Updated challenge: ${challenge.title} -> ${slug}`)
  }

  // Populate User slugs (optional, from name)
  console.log('Populating User slugs...')
  const allUsers = await prisma.user.findMany({
    select: { id: true, name: true, slug: true },
  })
  const users = allUsers.filter(u => !u.slug || u.slug.trim() === '')

  for (const user of users) {
    try {
      const slug = await generateSlugFromTitle(
        user.name,
        async (slug) => {
          const existing = await prisma.user.findFirst({
            where: {
              slug,
              NOT: { id: user.id },
            },
          })
          return !!existing
        }
      )

      await prisma.user.update({
        where: { id: user.id },
        data: { slug },
      })

      console.log(`  ✓ Updated user: ${user.name} -> ${slug}`)
    } catch (error) {
      console.log(`  ⚠ Skipped user: ${user.name} (error: ${error})`)
    }
  }

  // Populate JobPost slugs (optional)
  console.log('Populating JobPost slugs...')
  const allJobPosts = await prisma.jobPost.findMany({
    select: { id: true, title: true, company: true, slug: true },
  })
  const jobPosts = allJobPosts.filter(j => !j.slug || j.slug.trim() === '')

  for (const job of jobPosts) {
    try {
      const slug = await generateSlugFromTitle(
        `${job.title}-${job.company}`,
        async (slug) => {
          const existing = await prisma.jobPost.findFirst({
            where: {
              slug,
              NOT: { id: job.id },
            },
          })
          return !!existing
        }
      )

      await prisma.jobPost.update({
        where: { id: job.id },
        data: { slug },
      })

      console.log(`  ✓ Updated job post: ${job.title} -> ${slug}`)
    } catch (error) {
      console.log(`  ⚠ Skipped job post: ${job.title} (error: ${error})`)
    }
  }

  console.log('✓ Slug population completed!')
}

populateSlugs()
  .catch((error) => {
    console.error('Error populating slugs:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
