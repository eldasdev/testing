import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import Link from 'next/link'
import { FiShield, FiPlus, FiUser, FiMail, FiTrash2 } from 'react-icons/fi'
import AdminRoleManager from '@/components/admin/AdminRoleManager'

export default async function AdminManagementPage() {
  const session = await getServerSession(authOptions)
  
  // Only Super Admin can access this page
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect('/admin')
  }

  const admins = await prisma.user.findMany({
    where: {
      role: { in: ['ADMIN', 'SUPER_ADMIN'] },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: [
      { role: 'asc' },
      { createdAt: 'desc' },
    ],
  })

  const superAdmins = admins.filter(a => a.role === 'SUPER_ADMIN')
  const regularAdmins = admins.filter(a => a.role === 'ADMIN')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
          <p className="text-gray-600 mt-1">
            Manage administrators and super admins
          </p>
        </div>
        <Link
          href="/admin/admins/new"
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add Admin</span>
        </Link>
      </div>

      {/* Super Admins */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
            <FiShield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Super Administrators</h2>
            <p className="text-sm text-gray-600">Full platform access and control</p>
          </div>
        </div>

        <div className="space-y-3">
          {superAdmins.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-100"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {admin.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{admin.name}</p>
                  <p className="text-sm text-gray-500">{admin.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
                  Super Admin
                </span>
                <span className="text-sm text-gray-500">
                  Since {format(new Date(admin.createdAt), 'MMM yyyy')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regular Admins */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <FiUser className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Administrators</h2>
            <p className="text-sm text-gray-600">Limited admin access</p>
          </div>
        </div>

        {regularAdmins.length > 0 ? (
          <div className="space-y-3">
            {regularAdmins.map((admin) => (
              <AdminRoleManager key={admin.id} admin={admin} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No regular administrators yet. Add one to get started.
          </div>
        )}
      </div>

      {/* Add Admin Form Placeholder */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Promote Existing User</h3>
        <p className="text-gray-600 mb-4">
          Search for an existing user to promote them to admin status.
        </p>
        <div className="flex space-x-4">
          <input
            type="email"
            placeholder="Enter user email..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all">
            Promote to Admin
          </button>
        </div>
      </div>
    </div>
  )
}
