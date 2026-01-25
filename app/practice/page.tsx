import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import PracticeChallenges from '@/components/practice/PracticeChallenges'
import { FiCode, FiPlay, FiAward, FiTarget, FiTrendingUp, FiZap } from 'react-icons/fi'

export default async function PracticePage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const challenges = [
    {
      id: '1',
      title: 'JavaScript Basics',
      type: 'coding',
      difficulty: 'Easy',
      description: 'Practice fundamental JavaScript concepts including variables, functions, and control flow.',
      category: 'Programming',
    },
    {
      id: '2',
      title: 'Technical Interview Prep',
      type: 'interview',
      difficulty: 'Medium',
      description: 'Prepare for technical interviews with common questions asked by top companies.',
      category: 'Interview',
    },
    {
      id: '3',
      title: 'Data Structures Quiz',
      type: 'quiz',
      difficulty: 'Medium',
      description: 'Test your knowledge of data structures: arrays, linked lists, trees, and graphs.',
      category: 'Computer Science',
    },
    {
      id: '4',
      title: 'System Design Basics',
      type: 'coding',
      difficulty: 'Hard',
      description: 'Learn system design fundamentals: scalability, load balancing, and database design.',
      category: 'System Design',
    },
    {
      id: '5',
      title: 'SQL Fundamentals',
      type: 'quiz',
      difficulty: 'Easy',
      description: 'Master SQL queries, joins, and database operations with practical exercises.',
      category: 'Database',
    },
    {
      id: '6',
      title: 'React Components',
      type: 'coding',
      difficulty: 'Medium',
      description: 'Build interactive React components and learn state management patterns.',
      category: 'Programming',
    },
  ]

  const stats = [
    { value: '50+', label: 'Challenges', icon: FiCode },
    { value: '1000+', label: 'Completions', icon: FiAward },
    { value: '5', label: 'Categories', icon: FiTarget },
  ]

  const features = [
    {
      icon: FiCode,
      title: 'Coding Challenges',
      description: 'Practice real-world programming problems in multiple languages.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: FiPlay,
      title: 'Mock Interviews',
      description: 'Simulate technical interviews with timed questions.',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: FiTarget,
      title: 'Skill Quizzes',
      description: 'Test your knowledge across various technology domains.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: FiTrendingUp,
      title: 'Track Progress',
      description: 'Monitor your improvement over time with analytics.',
      color: 'from-orange-500 to-orange-600',
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative gradient-primary text-white overflow-hidden">
        <div className="absolute inset-0 pattern-grid" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float" />
        
        <div className="relative container-custom py-12 md:py-20">
          <div className="max-w-3xl animate-fade-in-up">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <FiZap className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium">Level Up Your Skills</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Practice Playground
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8">
              Hone your skills with coding challenges, mock interviews, and skill-building exercises.
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
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 md:h-16" viewBox="0 0 1440 74" fill="none">
            <path d="M0 74V25.5C240 -8.5 480 -8.5 720 25.5C960 59.5 1200 59.5 1440 25.5V74H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="section-sm gradient-subtle">
        <div className="container-custom">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div 
                  key={index}
                  className="card p-6 text-center card-hover animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-12 h-12 mx-auto bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Challenges List */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fade-in-up">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Available Challenges</h2>
              <p className="text-gray-600 mt-1">Choose a challenge to start practicing</p>
            </div>
            <select className="input py-2 px-4 w-auto">
              <option>All Categories</option>
              <option>Programming</option>
              <option>Interview</option>
              <option>Computer Science</option>
              <option>System Design</option>
            </select>
          </div>
          
          <div className="animate-fade-in-up animation-delay-100">
            <PracticeChallenges challenges={challenges} />
          </div>
        </div>
      </section>
    </div>
  )
}
