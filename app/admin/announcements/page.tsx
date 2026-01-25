import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AnnouncementPanel from '@/components/admin/AnnouncementPanel'

export default async function AnnouncementsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
    redirect('/admin')
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Announcements</h1>
        <p className="text-gray-600 mt-2 text-sm md:text-base">
          Send announcements and notifications to platform users
        </p>
      </div>

      {/* Announcement Panel */}
      <AnnouncementPanel />
    </div>
  )
}
