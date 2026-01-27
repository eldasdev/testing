import { prisma } from '@/lib/prisma'
import BlogList from '@/components/blog/BlogList'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { FiPlus, FiBookOpen, FiCpu, FiTrendingUp, FiZap } from 'react-icons/fi'

export default async function BlogPage() {
  const session = await getServerSession(authOptions)
  
  const posts = await prisma.blogPost.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      isAIGenerated: true,
      views: true,
      likes: true,
      createdAt: true,
      author: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  const totalPosts = await prisma.blogPost.count()

  const topics = [
    { name: 'Interview Tips', icon: FiTrendingUp, color: 'from-blue-500 to-blue-600' },
    { name: 'Career Growth', icon: FiZap, color: 'from-purple-500 to-purple-600' },
    { name: 'Tech Skills', icon: FiCpu, color: 'from-green-500 to-green-600' },
    { name: 'Industry Insights', icon: FiBookOpen, color: 'from-orange-500 to-orange-600' },
  ]

  return (
    <div className="min-h-screen gradient-subtle">
      {/* Hero Section */}
      <section className="relative gradient-primary text-white overflow-hidden">
        <div className="absolute inset-0 pattern-grid" />
        
        <div className="relative container-custom py-12 md:py-20">
          <div className="max-w-3xl animate-fade-in-up">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <FiCpu className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium">AI-Powered Insights</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              AI Career Blog
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8">
              Get AI-powered career advice, interview tips, and answers to your questions
            </p>
            
            {session && (
              <Link
                href="/blog/new"
                className="btn px-6 py-3 bg-white text-primary-600 hover:bg-primary-50 shadow-lg"
              >
                <FiCpu className="w-5 h-5 mr-2" />
                Ask AI a Question
              </Link>
            )}
          </div>
        </div>
        
      </section>

      {/* Main Content */}
      <section className="section-sm">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-6 animate-fade-in-up">
              {/* Ask AI Button */}
              {session && (
                <Link
                  href="/blog/new"
                  className="btn btn-primary w-full justify-center"
                >
                  <FiPlus className="w-5 h-5 mr-2" />
                  Ask AI a Question
                </Link>
              )}

              {/* Topics */}
              <div className="card p-6">
                <h3 className="font-bold text-gray-900 mb-4">Popular Topics</h3>
                <div className="space-y-3">
                  {topics.map((topic, index) => {
                    const Icon = topic.icon
                    return (
                      <div 
                        key={index}
                        className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className={`w-8 h-8 bg-gradient-to-br ${topic.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium text-gray-700">{topic.name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* How it works */}
              <div className="card p-6 bg-gradient-to-br from-primary-50 to-blue-50 border-primary-100">
                <h3 className="font-bold text-gray-900 mb-3">How It Works</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      1
                    </div>
                    <p className="text-gray-600">Ask any career-related question</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      2
                    </div>
                    <p className="text-gray-600">Our AI analyzes and responds</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      3
                    </div>
                    <p className="text-gray-600">Get personalized advice instantly</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="card p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text mb-1">{totalPosts}</div>
                  <div className="text-gray-600">AI-Generated Posts</div>
                </div>
              </div>
            </aside>

            {/* Blog List */}
            <main className="lg:col-span-3 animate-fade-in-up animation-delay-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Posts</h2>
                <select className="input py-2 px-4 text-sm w-auto">
                  <option>Latest</option>
                  <option>Most Viewed</option>
                  <option>Most Helpful</option>
                </select>
              </div>

              {posts.length > 0 ? (
                <BlogList posts={posts} />
              ) : (
                <div className="card p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiBookOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No blog posts yet</h3>
                  <p className="text-gray-600 mb-6">
                    Be the first to ask our AI a question!
                  </p>
                  {session && (
                    <Link href="/blog/new" className="btn btn-primary">
                      <FiCpu className="w-5 h-5 mr-2" />
                      Ask AI
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
