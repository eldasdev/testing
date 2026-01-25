import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CacheClearPanel from '@/components/admin/CacheClearPanel'

export default async function CacheClearPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect('/admin')
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Clear Cache</h1>
        <p className="text-gray-600 mt-2 text-sm md:text-base">
          Clear various caches to refresh data and improve performance
        </p>
      </div>

      {/* Cache Clear Panel */}
      <CacheClearPanel />
    </div>
  )
}
