import Link from 'next/link'
import { FiTarget, FiEye, FiHeart, FiUsers, FiAward, FiBriefcase, FiArrowRight, FiCheckCircle } from 'react-icons/fi'

export default function AboutPage() {
  const values = [
    {
      icon: FiTarget,
      title: 'Student-Centric',
      description: 'Every feature is designed with students\' career success in mind.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: FiHeart,
      title: 'Accessibility',
      description: 'Free core features ensure everyone has access to career opportunities.',
      color: 'from-pink-500 to-pink-600',
    },
    {
      icon: FiUsers,
      title: 'Community',
      description: 'Building connections between students, mentors, and employers.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: FiAward,
      title: 'Excellence',
      description: 'Constantly improving our platform to deliver the best experience.',
      color: 'from-orange-500 to-orange-600',
    },
  ]

  const milestones = [
    { year: '2024', title: 'Platform Launch', description: 'StudentHire was born with a mission to help students' },
    { year: '2024', title: 'First 1000 Users', description: 'Reached our first milestone of active students' },
    { year: '2025', title: '50+ Companies', description: 'Partnered with leading companies in Uzbekistan' },
    { year: '2025', title: 'AI Integration', description: 'Launched AI-powered career guidance features' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative gradient-primary text-white overflow-hidden">
        <div className="absolute inset-0 pattern-grid" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        
        <div className="relative container-custom py-20 md:py-28">
          <div className="max-w-3xl animate-fade-in-up">
            <span className="badge bg-white/20 text-white mb-6">About Us</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Empowering Students to Build Their Futures
            </h1>
            <p className="text-xl text-primary-100 leading-relaxed mb-8">
              StudentHire is Uzbekistan's premier career platform, connecting talented students 
              with opportunities that match their skills and aspirations.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/auth/signup" className="btn px-6 py-3 bg-white text-primary-600 hover:bg-primary-50">
                Join StudentHire
                <FiArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/about/team" className="btn px-6 py-3 bg-transparent border-2 border-white/30 text-white hover:bg-white/10">
                Meet Our Team
              </Link>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16 md:h-24" viewBox="0 0 1440 74" fill="none">
            <path d="M0 74V25.5C240 -8.5 480 -8.5 720 25.5C960 59.5 1200 59.5 1440 25.5V74H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section gradient-subtle">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="card p-8 md:p-10 card-hover animate-fade-in-up">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <FiTarget className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                To bridge the gap between talented students and career opportunities in Uzbekistan, 
                providing the tools, resources, and connections needed for professional success.
              </p>
            </div>
            
            <div className="card p-8 md:p-10 card-hover animate-fade-in-up animation-delay-100">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <FiEye className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                To become the leading career platform in Central Asia, empowering every student 
                to achieve their professional dreams through innovation and community support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="text-center mb-16 animate-fade-in-up">
            <span className="badge badge-primary mb-4">Our Values</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Drives Us
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do at StudentHire
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div 
                  key={index} 
                  className="group text-center animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16 animate-fade-in-up">
            <span className="badge badge-primary mb-4">Our Journey</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Milestones
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary-200 transform md:-translate-x-1/2" />
              
              {milestones.map((milestone, index) => (
                <div 
                  key={index} 
                  className={`relative flex items-start gap-6 md:gap-0 mb-12 last:mb-0 animate-fade-in-up ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Dot */}
                  <div className="absolute left-4 md:left-1/2 w-8 h-8 bg-primary-600 rounded-full border-4 border-white shadow-lg transform -translate-x-1/2 flex items-center justify-center z-10">
                    <FiCheckCircle className="w-4 h-4 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <div className="card p-6 inline-block">
                      <span className="text-sm font-bold text-primary-600">{milestone.year}</span>
                      <h3 className="text-lg font-bold text-gray-900 mt-1">{milestone.title}</h3>
                      <p className="text-gray-600 mt-2">{milestone.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section gradient-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 pattern-grid" />
        
        <div className="relative container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '1000+', label: 'Active Students' },
              { value: '500+', label: 'Job Listings' },
              { value: '50+', label: 'Partner Companies' },
              { value: '200+', label: 'Success Stories' },
            ].map((stat, index) => (
              <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-2">{stat.value}</div>
                <div className="text-primary-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of students who are building their careers with StudentHire.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup" className="btn btn-primary px-8 py-4">
                Get Started Free
                <FiArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/about/contact" className="btn btn-outline px-8 py-4">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
