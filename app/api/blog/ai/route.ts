import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity, getRequestMetadata } from '@/lib/activity-log'
import { generateSlugFromTitle } from '@/lib/slug'
import { z } from 'zod'

const aiQuestionSchema = z.object({
  question: z.string().min(10),
  media: z.array(z.string()).optional().default([]),
})

// Mock AI response - in production, integrate with OpenAI API
function generateAIResponse(question: string): string {
  const lowerQuestion = question.toLowerCase()
  
  if (lowerQuestion.includes('interview') || lowerQuestion.includes('prepare')) {
    return `Here are some tips for preparing for interviews:

1. Research the company thoroughly - understand their mission, values, and recent news
2. Practice common interview questions - prepare STAR method answers for behavioral questions
3. Review your resume - be ready to discuss every point in detail
4. Prepare questions to ask - show your interest and engagement
5. Practice technical skills if applicable - coding challenges, case studies, etc.
6. Dress appropriately and arrive early
7. Follow up with a thank-you email after the interview

Remember, preparation is key to confidence!`
  }
  
  if (lowerQuestion.includes('resume') || lowerQuestion.includes('cv')) {
    return `Tips for creating an effective resume:

1. Keep it concise - ideally one page for entry-level positions
2. Use action verbs - "achieved", "developed", "managed" instead of passive language
3. Quantify achievements - use numbers to show impact
4. Tailor for each job - highlight relevant skills and experience
5. Include keywords from job descriptions
6. Proofread carefully - no typos or grammatical errors
7. Use a clean, professional format
8. Include relevant contact information and links to your portfolio/LinkedIn

A well-crafted resume is your first impression!`
  }
  
  if (lowerQuestion.includes('skill') || lowerQuestion.includes('learn')) {
    return `Here's how to effectively learn new skills:

1. Set clear goals - know what you want to achieve
2. Practice regularly - consistency is more important than intensity
3. Build projects - apply what you learn in real-world scenarios
4. Join communities - connect with others learning the same skills
5. Find a mentor - learn from experienced professionals
6. Take online courses - structured learning paths can be very effective
7. Read documentation and practice coding challenges
8. Don't be afraid to make mistakes - they're learning opportunities

Remember, learning is a journey, not a destination!`
  }
  
  // Default response
  return `Thank you for your question about "${question}". 

Here's some general career advice:

1. Network actively - attend events, join professional communities
2. Keep learning - stay updated with industry trends
3. Build a strong online presence - LinkedIn, portfolio, GitHub
4. Seek feedback - from mentors, peers, and professionals
5. Set clear career goals - know where you want to be
6. Be persistent - career growth takes time and effort
7. Stay positive - maintain a growth mindset

For more specific advice, feel free to ask more detailed questions!`
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { question, media } = aiQuestionSchema.parse(body)

    // Generate AI response (mock - replace with actual OpenAI API call)
    const answer = generateAIResponse(question)

    const title = question.length > 100 ? question.substring(0, 100) + '...' : question

    // Generate unique slug from title
    const slug = await generateSlugFromTitle(
      title,
      async (slug) => {
        const existing = await prisma.blogPost.findUnique({
          where: { slug },
        })
        return !!existing
      }
    )

    // Save as blog post
    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content: answer,
        excerpt: answer.substring(0, 200) + '...',
        authorId: session.user.id,
        isAIGenerated: true,
        tags: ['AI', 'Career Advice'],
        media: Array.isArray(media) && media.length > 0 ? media : [],
      },
    })

    // Log blog post creation
    const { ipAddress, userAgent } = getRequestMetadata(request)
    await logActivity({
      action: 'blog_post_created',
      actionType: 'CREATE',
      entityType: 'BlogPost',
      entityId: post.id,
      userId: session.user.id,
      description: `${session.user.name} created AI-generated blog post: "${post.title}"`,
      metadata: { title: post.title, isAIGenerated: true },
      ipAddress,
      userAgent,
    })

    return NextResponse.json({
      answer,
      id: post.id,
      slug: post.slug,
      postId: post.id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
