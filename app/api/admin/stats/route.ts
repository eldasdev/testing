import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [
      totalUsers,
      totalStudents,
      totalCompanies,
      totalMentors,
      totalAdmins,
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
      acceptedApplications,
      totalThreads,
      totalPosts,
      totalBlogPosts,
      totalResumes,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'COMPANY' } }),
      prisma.user.count({ where: { role: 'MENTOR' } }),
      prisma.user.count({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } }),
      prisma.jobPost.count(),
      prisma.jobPost.count({ where: { isActive: true } }),
      prisma.application.count(),
      prisma.application.count({ where: { status: 'PENDING' } }),
      prisma.application.count({ where: { status: 'ACCEPTED' } }),
      prisma.communityThread.count(),
      prisma.communityPost.count(),
      prisma.blogPost.count(),
      prisma.resume.count(),
    ])

    return NextResponse.json({
      users: {
        total: totalUsers,
        students: totalStudents,
        companies: totalCompanies,
        mentors: totalMentors,
        admins: totalAdmins,
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
        inactive: totalJobs - activeJobs,
      },
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        accepted: acceptedApplications,
        rejected: totalApplications - pendingApplications - acceptedApplications,
      },
      community: {
        threads: totalThreads,
        posts: totalPosts,
      },
      content: {
        blogPosts: totalBlogPosts,
        resumes: totalResumes,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
