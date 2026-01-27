import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { FiAward, FiPlus, FiTrendingUp, FiGrid, FiLayers, FiUsers, FiStar, FiDatabase } from 'react-icons/fi'
import SkillsManagementTable from '@/components/admin/SkillsManagementTable'
import SkillsSeedButton from '@/components/admin/SkillsSeedButton'

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; industry?: string; search?: string; page?: string }>
}) {
  const session = await getServerSession(authOptions)
  const isSuperAdmin = session?.user.role === 'SUPER_ADMIN'
  
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const pageSize = 30
  const skip = (page - 1) * pageSize

  const where: any = {}
  
  if (params.category) {
    where.category = params.category
  }
  
  if (params.industry) {
    where.industry = params.industry
  }
  
  if (params.search) {
    where.name = {
      contains: params.search,
      mode: 'insensitive',
    }
  }

  const [skills, totalCount, categories, industries, popularCount, usedSkillsCount] = await Promise.all([
    prisma.skillCatalog.findMany({
      where,
      include: {
        _count: {
          select: { userSkills: true },
        },
      },
      orderBy: [
        { isPopular: 'desc' },
        { usageCount: 'desc' },
        { name: 'asc' },
      ],
      skip,
      take: pageSize,
    }),
    prisma.skillCatalog.count({ where }),
    prisma.skillCatalog.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    }),
    prisma.skillCatalog.findMany({
      select: { industry: true },
      distinct: ['industry'],
      orderBy: { industry: 'asc' },
    }),
    prisma.skillCatalog.count({ where: { isPopular: true } }),
    prisma.userSkill.count(),
  ])

  const totalPages = Math.ceil(totalCount / pageSize)
  const uniqueCategories = categories.map(c => c.category)
  const uniqueIndustries = industries.map(i => i.industry)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Skills Catalog</h1>
          <p className="text-gray-600 mt-1">
            Manage the skills catalog for users ({totalCount} skills)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {isSuperAdmin && <SkillsSeedButton />}
          <Link
            href="/admin/skills/new"
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Skill</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <FiAward className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Skills</p>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <FiStar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Popular Skills</p>
              <p className="text-2xl font-bold text-gray-900">{popularCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
              <FiGrid className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{uniqueCategories.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
              <FiLayers className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Industries</p>
              <p className="text-2xl font-bold text-gray-900">{uniqueIndustries.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center">
              <FiUsers className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">User Skills</p>
              <p className="text-2xl font-bold text-gray-900">{usedSkillsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-4">
        <form method="get" className="flex flex-wrap gap-3">
          <input
            type="text"
            name="search"
            placeholder="Search skills..."
            defaultValue={params.search || ''}
            className="flex-1 min-w-[200px] px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <select
            name="category"
            defaultValue={params.category || ''}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            name="industry"
            defaultValue={params.industry || ''}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Industries</option>
            {uniqueIndustries.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all"
          >
            Filter
          </button>
          {(params.search || params.category || params.industry) && (
            <Link
              href="/admin/skills"
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Skills Table */}
      {skills.length > 0 ? (
        <SkillsManagementTable skills={skills} isSuperAdmin={isSuperAdmin} />
      ) : (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAward className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Skills Found</h3>
          <p className="text-gray-600 mb-6">
            {params.search || params.category || params.industry
              ? 'Try adjusting your filters.'
              : 'Get started by seeding the skills catalog or adding skills manually.'}
          </p>
          {!params.search && !params.category && !params.industry && (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {isSuperAdmin && <SkillsSeedButton />}
              <Link
                href="/admin/skills/new"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all"
              >
                <FiPlus className="w-5 h-5" />
                <span>Add Skill Manually</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/skills?page=${p}${params.category ? `&category=${params.category}` : ''}${params.industry ? `&industry=${params.industry}` : ''}${params.search ? `&search=${params.search}` : ''}`}
              className={`px-4 py-2 rounded-lg ${
                p === page
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
