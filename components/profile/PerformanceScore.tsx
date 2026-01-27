import { prisma } from '@/lib/prisma'
import PerformanceScoreClient from './PerformanceScoreClient'

interface PerformanceScoreProps {
  userId: string
}

export default async function PerformanceScore({ userId }: PerformanceScoreProps) {
  // Get or calculate performance metrics
  let metrics = await prisma.performanceMetrics.findUnique({
    where: { userId },
  })

  // If no metrics exist, calculate them
  if (!metrics) {
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
    
    // Skills (max 25 points) - weighted by proficiency
    const skillsWithProficiency = await prisma.userSkill.findMany({
      where: { userId },
      select: { proficiency: true },
    })
    
    const skillPoints = skillsWithProficiency.reduce((acc, skill) => {
      const weights: Record<string, number> = {
        BEGINNER: 0.5,
        JUNIOR: 1,
        MIDDLE: 2,
        SENIOR: 3,
        EXPERT: 4,
      }
      return acc + (weights[skill.proficiency] || 1)
    }, 0)
    score += Math.min(skillPoints * 1.5, 25)
    
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

    // Create or update metrics
    metrics = await prisma.performanceMetrics.upsert({
      where: { userId },
      update: {
        careerReadinessScore: Math.round(score),
        skillsCount: skills,
        applicationsCount: applications,
        acceptedCount: accepted,
        practiceScore: practiceSubmissions,
        communityEngagement: threads + posts,
        lastCalculated: new Date(),
      },
      create: {
        userId,
        careerReadinessScore: Math.round(score),
        skillsCount: skills,
        applicationsCount: applications,
        acceptedCount: accepted,
        practiceScore: practiceSubmissions,
        communityEngagement: threads + posts,
      },
    })
  }

  const score = metrics.careerReadinessScore
  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Developing'
  }

  return (
    <PerformanceScoreClient
      score={score}
      label={getScoreLabel(score)}
      skillsCount={metrics.skillsCount}
      applicationsCount={metrics.applicationsCount}
      acceptedCount={metrics.acceptedCount}
      practiceScore={metrics.practiceScore}
      communityEngagement={metrics.communityEngagement}
      lastCalculated={metrics.lastCalculated}
    />
  )
}
