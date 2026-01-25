import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SettingsForm from '@/components/admin/SettingsForm'
import { FiShield, FiGlobe, FiMail, FiBell, FiDatabase, FiLock } from 'react-icons/fi'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  const isSuperAdmin = session?.user.role === 'SUPER_ADMIN'

  const settingsSections = [
    {
      title: 'General Settings',
      description: 'Basic platform configuration',
      iconName: 'FiGlobe',
      color: 'bg-blue-500',
      settings: [
        { name: 'Platform Name', value: 'StudentHire', type: 'text' },
        { name: 'Contact Email', value: 'admin@studenthire.uz', type: 'email' },
        { name: 'Support Phone', value: '+998 99 123 4567', type: 'tel' },
      ],
    },
    {
      title: 'Email Settings',
      description: 'Configure email notifications',
      iconName: 'FiMail',
      color: 'bg-purple-500',
      settings: [
        { name: 'Welcome Email', value: true, type: 'toggle' },
        { name: 'Application Notifications', value: true, type: 'toggle' },
        { name: 'Weekly Digest', value: false, type: 'toggle' },
      ],
    },
    {
      title: 'Notification Settings',
      description: 'Manage notification preferences',
      iconName: 'FiBell',
      color: 'bg-orange-500',
      settings: [
        { name: 'New User Alerts', value: true, type: 'toggle' },
        { name: 'Job Post Alerts', value: true, type: 'toggle' },
        { name: 'Report Alerts', value: true, type: 'toggle' },
      ],
    },
  ]

  const superAdminSections = [
    {
      title: 'Security Settings',
      description: 'Advanced security configuration',
      iconName: 'FiLock',
      color: 'bg-red-500',
      settings: [
        { name: 'Two-Factor Authentication', value: false, type: 'toggle' },
        { name: 'Session Timeout (minutes)', value: '60', type: 'number' },
        { name: 'Max Login Attempts', value: '5', type: 'number' },
      ],
    },
    {
      title: 'Database Settings',
      description: 'Database management options',
      iconName: 'FiDatabase',
      color: 'bg-cyan-500',
      settings: [
        { name: 'Auto Backup', value: true, type: 'toggle' },
        { name: 'Backup Frequency', value: 'daily', type: 'select', options: ['hourly', 'daily', 'weekly'] },
        { name: 'Data Retention (days)', value: '365', type: 'number' },
      ],
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Configure platform settings and preferences
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingsSections.map((section, index) => (
          <SettingsForm key={index} section={section} />
        ))}

        {isSuperAdmin && (
          <>
            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center space-x-2 mb-6">
                <FiShield className="w-5 h-5 text-red-500" />
                <h2 className="text-xl font-bold text-gray-900">Super Admin Settings</h2>
              </div>
            </div>
            {superAdminSections.map((section, index) => (
              <SettingsForm key={index} section={section} />
            ))}
          </>
        )}
      </div>

      {/* Danger Zone */}
      {isSuperAdmin && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-red-700 mb-4">Danger Zone</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-200">
              <div>
                <p className="font-semibold text-gray-900">Reset Platform Data</p>
                <p className="text-sm text-gray-500">This will delete all user data except admin accounts</p>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all">
                Reset Data
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-200">
              <div>
                <p className="font-semibold text-gray-900">Export All Data</p>
                <p className="text-sm text-gray-500">Download a complete backup of all platform data</p>
              </div>
              <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all">
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
