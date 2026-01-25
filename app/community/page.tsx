import { prisma } from '@/lib/prisma'
import CommunityThreadList from '@/components/community/CommunityThreadList'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { FiPlus, FiMessageSquare, FiUsers, FiTrendingUp, FiBookOpen } from 'react-icons/fi'

export default async function CommunityPage() {
  const session = await getServerSession(authOptions)
  
  const threads = await prisma.communityThread.findMany({
    include: {
      author: {
        select: {
          name: true,
          image: true,
        },
      },
      posts: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          posts: true,
        },
      },
    },
    orderBy: [
      { isPinned: 'desc' },
      { createdAt: 'desc' },
    ],
    take: 50,
  })

  const totalThreads = await prisma.communityThread.count()
  const totalPosts = await prisma.communityPost.count()
  const totalMembers = await prisma.user.count()

  const categories = [
    { name: 'Career Advice', icon: FiTrendingUp, color: 'from-blue-500 to-blue-600', count: 24 },
    { name: 'Tech & Coding', icon: FiBookOpen, color: 'from-purple-500 to-purple-600', count: 18 },
    { name: 'Job Search', icon: FiUsers, color: 'from-green-500 to-green-600', count: 32 },
    { name: 'General', icon: FiMessageSquare, color: 'from-orange-500 to-orange-600', count: 45 },
  ]

  return (
    <div className="min-h-screen gradient-subtle">
      {/* Hero Section */}
      <section className="relative gradient-primary text-white overflow-hidden">
        <div className="absolute inset-0 pattern-grid" />
        
        <div className="relative container-custom py-12 md:py-20">
          <div className="max-w-3xl animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Community Forum
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8">
              Connect, share, and learn from peers and mentors
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-4 sm:gap-8">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <FiMessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalThreads}</div>
                  <div className="text-sm text-primary-200">Threads</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <FiBookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalPosts}</div>
                  <div className="text-sm text-primary-200">Posts</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <FiUsers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalMembers}</div>
                  <div className="text-sm text-primary-200">Members</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 md:h-16" viewBox="0 0 1440 74" fill="none">
            <path d="M0 74V25.5C240 -8.5 480 -8.5 720 25.5C960 59.5 1200 59.5 1440 25.5V74H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-sm">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-6 animate-fade-in-up">
              {/* New Thread Button */}
              {session && (
                <Link
                  href="/community/new"
                  className="btn btn-primary w-full justify-center"
                >
                  <FiPlus className="w-5 h-5 mr-2" />
                  Start a Discussion
                </Link>
              )}

              {/* Categories */}
              <div className="card p-6">
                <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-3">
                  {categories.map((category, index) => {
                    const Icon = category.icon
                    return (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 bg-gradient-to-br ${category.color} rounded-lg flex items-center justify-center`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-gray-700">{category.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">{category.count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Community Guidelines */}
              <div className="card p-6 bg-primary-50 border-primary-100">
                <h3 className="font-bold text-gray-900 mb-3">Community Guidelines</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Be respectful and supportive</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Share knowledge generously</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Ask questions without fear</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Help others when you can</span>
                  </li>
                </ul>
              </div>
            </aside>

            {/* Thread List */}
            <main className="lg:col-span-3 animate-fade-in-up animation-delay-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Discussions</h2>
                <select className="input py-2 px-4 text-sm w-auto">
                  <option>Latest</option>
                  <option>Most Popular</option>
                  <option>Unanswered</option>
                </select>
              </div>
              
              {threads.length > 0 ? (
                <CommunityThreadList threads={threads} />
              ) : (
                <div className="card p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiMessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No discussions yet</h3>
                  <p className="text-gray-600 mb-6">
                    Be the first to start a conversation!
                  </p>
                  {session && (
                    <Link href="/community/new" className="btn btn-primary">
                      Start a Discussion
                    </Link>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  )
}
