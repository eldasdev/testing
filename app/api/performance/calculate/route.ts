import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Calculate metrics
    const [skills, applications, accepted, practiceSubmissions, roadmaps, threads, posts] = await Promise.all([
      prisma.userSkill.count({ where: { userId } }),
      prisma.application.count({ where: { userId } }),
      prisma.application.count({ where: { userId, status: 'ACCEPTED' } }),
      prisma.practiceSubmission.count({ where: { userId } }),
      prisma.careerRoadmap.count({ where: { userId } }),
      prisma.communityThread.count({ where: { authorId: userId } }),
      prisma.communityPost.count({ where: { authorId: userId } }),
    ])

    // Calculate career readiness score (0-100)
    let score = 0
    
    // Skills (max 25 points)
    score += Math.min(skills * 2, 25)
    
    // Applications (max 20 points)
    score += Math.min(applications * 2, 20)
    
    // Accepted applications (max 25 points)
    score += Math.min(accepted * 5, 25)
    
    // Practice submissions (max 15 points)
    score += Math.min(practiceSubmissions * 3, 15)
    
    // Roadmaps (max 10 points)
    score += Math.min(roadmaps * 5, 10)
    
    // Community engagement (max 5 points)
    score += Math.min((threads + posts) * 1, 5)

    // Update or create performance metrics
    const metrics = await prisma.performanceMetrics.upsert({
      where: { userId },
      update: {
        careerReadinessScore: score,
        skillsCount: skills,
        applicationsCount: applications,
        acceptedCount: accepted,
        practiceScore: practiceSubmissions,
        communityEngagement: threads + posts,
        lastCalculated: new Date(),
      },
      create: {
        userId,
        careerReadinessScore: score,
        skillsCount: skills,
        applicationsCount: applications,
        acceptedCount: accepted,
        practiceScore: practiceSubmissions,
        communityEngagement: threads + posts,
      },
    })

    return NextResponse.json(metrics)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
