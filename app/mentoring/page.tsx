import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FiUser, FiStar, FiMessageSquare, FiBookOpen, FiCalendar, FiUsers, FiAward, FiArrowRight } from 'react-icons/fi'

export default async function MentoringPage() {
  const mentors = await prisma.user.findMany({
    where: { role: 'MENTOR' },
    take: 12,
    select: {
      id: true,
      name: true,
      bio: true,
      image: true,
    },
  })

  const totalMentors = await prisma.user.count({ where: { role: 'MENTOR' } })

  const features = [
    {
      icon: FiUser,
      title: 'Expert Guidance',
      description: 'Get advice from industry professionals with years of experience in their fields.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: FiMessageSquare,
      title: 'One-on-One Sessions',
      description: 'Schedule personalized mentoring sessions tailored to your specific needs.',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: FiBookOpen,
      title: 'Career Development',
      description: 'Build skills and knowledge to advance in your chosen career path.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: FiCalendar,
      title: 'Flexible Scheduling',
      description: 'Book sessions at times that work for you, with virtual meeting options.',
      color: 'from-orange-500 to-orange-600',
    },
  ]

  const stats = [
    { value: totalMentors, label: 'Active Mentors', icon: FiUsers },
    { value: '100+', label: 'Sessions Completed', icon: FiCalendar },
    { value: '4.9', label: 'Avg. Rating', icon: FiStar },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative gradient-primary text-white overflow-hidden">
        <div className="absolute inset-0 pattern-grid" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float" />
        
        <div className="relative container-custom py-16 md:py-24">
          <div className="max-w-3xl animate-fade-in-up">
            <span className="badge bg-white/20 text-white mb-6">Mentoring</span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Learn from the Best
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Connect with experienced mentors who can guide your career journey and help you achieve your goals.
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-primary-200">{stat.label}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section gradient-subtle">
        <div className="container-custom">
          <div className="text-center mb-12 animate-fade-in-up">
            <span className="badge badge-primary mb-4">Why Choose Mentoring</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Accelerate Your Career Growth
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div 
                  key={index}
                  className="card p-6 text-center card-hover animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-14 h-14 mx-auto bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mentors List */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fade-in-up">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Available Mentors</h2>
              <p className="text-gray-600 mt-1">Connect with experts in your field</p>
            </div>
          </div>
          
          {mentors.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mentors.map((mentor, index) => (
                <div
                  key={mentor.id}
                  className="card p-6 card-hover animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="avatar avatar-lg">
                      {mentor.name?.charAt(0) || 'M'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{mentor.name}</h3>
                      <div className="flex items-center space-x-1 text-yellow-500">
                        <FiStar className="w-4 h-4 fill-current" />
                        <span className="text-sm font-semibold">4.8</span>
                        <span className="text-gray-400 text-sm">(12 reviews)</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {mentor.bio || 'Experienced mentor ready to help you succeed in your career journey.'}
                  </p>
                  <Link
                    href={`/profile/${mentor.id}`}
                    className="btn btn-secondary w-full justify-center text-sm"
                  >
                    View Profile
                    <FiArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center animate-fade-in-up">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No mentors available yet</h3>
              <p className="text-gray-600 mb-6">Check back soon for experienced mentors!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section gradient-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 pattern-grid" />
        
        <div className="relative container-custom text-center">
          <div className="max-w-2xl mx-auto animate-fade-in-up">
            <FiAward className="w-12 h-12 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Become a Mentor
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Share your experience and help the next generation of professionals succeed.
            </p>
            <Link
              href="/about/contact"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-primary-600 rounded-xl font-bold hover:bg-primary-50 transition-all shadow-2xl"
            >
              <span>Apply to be a Mentor</span>
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
