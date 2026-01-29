import { prisma } from '@/lib/prisma'

/**
 * Recalculates career readiness score for a user based on skills, applications,
 * practice, roadmaps, and community engagement. Updates or creates PerformanceMetrics.
 * Call this whenever skills, applications, or other contributing data changes.
 */
export async function recalculateCareerReadiness(userId: string) {
  const [skills, applications, accepted, practiceSubmissions, roadmaps, threads, posts] =
    await Promise.all([
      prisma.userSkill.count({ where: { userId } }),
      prisma.application.count({ where: { userId } }),
      prisma.application.count({ where: { userId, status: 'ACCEPTED' } }),
      prisma.practiceSubmission.count({ where: { userId } }),
      prisma.careerRoadmap.count({ where: { userId } }),
      prisma.communityThread.count({ where: { authorId: userId } }),
      prisma.communityPost.count({ where: { authorId: userId } }),
    ])

  let score = 0
  score += Math.min(skills * 2, 25) // Skills: max 25
  score += Math.min(applications * 2, 20) // Applications: max 20
  score += Math.min(accepted * 5, 25) // Accepted: max 25
  score += Math.min(practiceSubmissions * 3, 15) // Practice: max 15
  score += Math.min(roadmaps * 5, 10) // Roadmaps: max 10
  score += Math.min((threads + posts) * 1, 5) // Community: max 5

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

  return metrics
}
