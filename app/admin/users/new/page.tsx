import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AddUserForm from '@/components/admin/AddUserForm'

export default async function AddUserPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
    redirect('/admin')
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Add New User</h1>
        <p className="text-gray-600 mt-2 text-sm md:text-base">
          Create a new user account with role-based access
        </p>
      </div>

      {/* Add User Form */}
      <AddUserForm />
    </div>
  )
}
