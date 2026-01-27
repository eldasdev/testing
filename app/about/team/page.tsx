import Link from 'next/link'
import { FiUsers, FiCode, FiLayout, FiHeart, FiArrowRight, FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi'

export default function TeamPage() {
  const teams = [
    {
      name: 'Development Team',
      role: 'Engineering',
      description: 'Building robust, scalable solutions with cutting-edge technology to power our platform.',
      icon: FiCode,
      color: 'from-blue-500 to-blue-600',
      members: 4,
    },
    {
      name: 'Product Team',
      role: 'Product Management',
      description: 'Designing features that solve real problems for students and employers.',
      icon: FiLayout,
      color: 'from-purple-500 to-purple-600',
      members: 2,
    },
    {
      name: 'Community Team',
      role: 'Community Management',
      description: 'Fostering a supportive and engaging community for all our users.',
      icon: FiHeart,
      color: 'from-pink-500 to-pink-600',
      members: 3,
    },
  ]

  const values = [
    'We believe in the power of education',
    'We support each other and our users',
    'We iterate fast and learn from mistakes',
    'We celebrate diversity and inclusion',
  ]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative gradient-primary text-white overflow-hidden">
        <div className="absolute inset-0 pattern-grid" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float" />
        
        <div className="relative container-custom py-16 md:py-24">
          <div className="max-w-3xl animate-fade-in-up">
            <span className="badge bg-white/20 text-white mb-6">Our Team</span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Meet the People Behind StudentHire
            </h1>
            <p className="text-xl text-primary-100">
              A passionate team dedicated to empowering students in their career journeys.
            </p>
          </div>
        </div>
      </section>

      {/* Teams */}
      <section className="section gradient-subtle">
        <div className="container-custom">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Teams</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Working together to build the best career platform for students
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {teams.map((team, index) => {
              const Icon = team.icon
              return (
                <div 
                  key={index}
                  className="card p-8 text-center card-hover animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${team.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{team.name}</h3>
                  <span className="badge badge-primary mb-4">{team.role}</span>
                  <p className="text-gray-600 mb-6">{team.description}</p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <FiUsers className="w-4 h-4" />
                    <span>{team.members} members</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Culture */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="animate-fade-in-up">
              <span className="badge badge-primary mb-4">Our Culture</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Built on Strong Values
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our culture is defined by our commitment to students and to each other. 
                We work hard, support each other, and never lose sight of our mission.
              </p>
              <ul className="space-y-4">
                {values.map((value, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative animate-fade-in-up animation-delay-200">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl transform rotate-3 opacity-10" />
              <div className="relative card p-8 md:p-10">
                <h3 className="text-xl font-bold text-gray-900 mb-6">We're Growing!</h3>
                <p className="text-gray-600 mb-6">
                  We're always looking for passionate individuals who want to make a difference 
                  in students' lives. Check out our open positions or reach out to say hi!
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/about/contact" className="btn btn-primary">
                    Get in Touch
                    <FiArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="section gradient-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 pattern-grid" />
        
        <div className="relative container-custom text-center">
          <div className="max-w-2xl mx-auto animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Join Our Team</h2>
            <p className="text-xl text-primary-100 mb-8">
              We're always looking for talented individuals who share our passion for 
              helping students succeed.
            </p>
            <Link
              href="/about/contact"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-primary-600 rounded-xl font-bold hover:bg-primary-50 transition-all shadow-2xl"
            >
              <span>Contact Us</span>
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
