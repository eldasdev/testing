'use client'

import { useState } from 'react'
import { FiGlobe, FiMail, FiBell, FiLock, FiDatabase } from 'react-icons/fi'

interface Setting {
  name: string
  value: string | boolean
  type: 'text' | 'email' | 'tel' | 'number' | 'toggle' | 'select'
  options?: string[]
}

interface Section {
  title: string
  description: string
  iconName: string
  color: string
  settings: Setting[]
}

interface SettingsFormProps {
  section: Section
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FiGlobe,
  FiMail,
  FiBell,
  FiLock,
  FiDatabase,
}

export default function SettingsForm({ section }: SettingsFormProps) {
  const [settings, setSettings] = useState(section.settings)
  const [isSaving, setIsSaving] = useState(false)

  const updateSetting = (index: number, value: string | boolean) => {
    const updated = [...settings]
    updated[index] = { ...updated[index], value }
    setSettings(updated)
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const Icon = iconMap[section.iconName] || FiGlobe

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${section.color} rounded-xl flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
            <p className="text-sm text-gray-500">{section.description}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {settings.map((setting, index) => (
          <div key={index} className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">{setting.name}</label>
            
            {setting.type === 'toggle' ? (
              <button
                onClick={() => updateSetting(index, !setting.value)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  setting.value ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    setting.value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            ) : setting.type === 'select' ? (
              <select
                value={setting.value as string}
                onChange={(e) => updateSetting(index, e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {setting.options?.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={setting.type}
                value={setting.value as string}
                onChange={(e) => updateSetting(index, e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent w-48"
              />
            )}
          </div>
        ))}
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
