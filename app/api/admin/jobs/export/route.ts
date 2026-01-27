import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity, getRequestMetadata } from '@/lib/activity-log'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999) // Include the entire end date

    // Fetch jobs within the date range
    const jobs = await prisma.jobPost.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        postedBy: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Convert to CSV format
    const headers = [
      'ID',
      'Title',
      'Company',
      'Location',
      'Type',
      'Experience Level',
      'Salary Min',
      'Salary Max',
      'Currency',
      'Status',
      'Applications Count',
      'Posted By',
      'Posted By Email',
      'Created At',
    ]

    const rows = jobs.map((job) => [
      job.id,
      `"${job.title.replace(/"/g, '""')}"`,
      `"${job.company.replace(/"/g, '""')}"`,
      `"${job.location.replace(/"/g, '""')}"`,
      job.type,
      job.experienceLevel,
      job.salaryMin?.toString() || '',
      job.salaryMax?.toString() || '',
      job.currency || '',
      job.isActive ? 'Active' : 'Inactive',
      job._count.applications.toString(),
      `"${job.postedBy.name.replace(/"/g, '""')}"`,
      job.postedBy.email,
      job.createdAt.toISOString(),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n')

    // Log export action
    const { ipAddress, userAgent } = getRequestMetadata(request)
    await logActivity({
      action: 'jobs_exported',
      actionType: 'EXPORT',
      entityType: 'JobPost',
      userId: session.user.id,
      description: `${session.user.name} exported ${jobs.length} job posts (${startDate} to ${endDate})`,
      metadata: { 
        startDate, 
        endDate, 
        count: jobs.length,
        format: 'CSV',
      },
      ipAddress,
      userAgent,
    })

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="jobs_export_${startDate}_to_${endDate}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
