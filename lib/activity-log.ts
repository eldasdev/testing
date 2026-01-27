import { prisma } from './prisma'

export type ActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'LOGIN' | 'LOGOUT' | 'RESTORE' | 'EXPORT' | 'IMPORT' | 'OTHER'

export interface ActivityLogData {
  action: string
  actionType: ActionType
  entityType: string
  entityId?: string
  userId?: string
  description: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

/**
 * Log an activity to the database
 */
export async function logActivity(data: ActivityLogData) {
  try {
    await prisma.activityLog.create({
      data: {
        action: data.action,
        actionType: data.actionType,
        entityType: data.entityType,
        entityId: data.entityId || null,
        userId: data.userId || null,
        description: data.description,
        metadata: data.metadata ? (data.metadata as any) : undefined,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      },
    })
  } catch (error) {
    // Don't throw errors for logging failures - just log to console
    console.error('Failed to log activity:', error)
  }
}

/**
 * Extract IP address and user agent from request headers
 */
export function getRequestMetadata(request: Request): { ipAddress?: string; userAgent?: string } {
  const headers = request.headers
  const ipAddress = 
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    undefined
  const userAgent = headers.get('user-agent') || undefined

  return { ipAddress, userAgent }
}
