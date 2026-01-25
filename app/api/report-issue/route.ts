import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { category, subject, description, pageUrl } = body

    // Validate required fields
    if (!category || !subject || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // In a real application, you might want to:
    // 1. Store reports in a database table
    // 2. Send email notifications to admins
    // 3. Create tickets in a support system
    
    // For now, we'll log it and return success
    // You can extend this to store in a database or send emails
    
    console.log('Issue Report:', {
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name,
      category,
      subject,
      description,
      pageUrl: pageUrl || 'Not provided',
      timestamp: new Date().toISOString(),
    })

    // TODO: Store in database if you create an IssueReport model
    // await prisma.issueReport.create({
    //   data: {
    //     userId: session.user.id,
    //     category,
    //     subject,
    //     description,
    //     pageUrl: pageUrl || null,
    //   },
    // })

    return NextResponse.json({
      success: true,
      message: 'Issue report submitted successfully',
    })
  } catch (error) {
    console.error('Error submitting issue report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
