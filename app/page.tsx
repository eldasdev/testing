import Link from 'next/link'
import { FiBriefcase, FiUsers, FiBook, FiTarget, FiTrendingUp, FiAward, FiArrowRight, FiCheck, FiStar, FiZap } from 'react-icons/fi'
import OrganizationLogo from '@/components/OrganizationLogo'

export default function Home() {
  const features = [
    {
      icon: FiBriefcase,
      title: 'Job Vacancies',
      description: 'Discover personalized job opportunities tailored to your skills and interests.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: FiUsers,
      title: 'Community',
      description: 'Connect with peers, mentors, and professionals in your field.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: FiBook,
      title: 'AI Blog',
      description: 'Get AI-powered career advice and answers to your questions.',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: FiTarget,
      title: 'Career Roadmap',
      description: 'Plan your career path with personalized milestones and goals.',
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: FiTrendingUp,
      title: 'Practice Playground',
      description: 'Hone your skills with coding challenges and mock interviews.',
      color: 'from-pink-500 to-pink-600',
    },
    {
      icon: FiAward,
      title: 'Resume Builder',
      description: 'Create professional resumes with our easy-to-use builder.',
      color: 'from-teal-500 to-teal-600',
    },
  ]

  const stats = [
    { value: '500+', label: 'Job Opportunities', icon: FiBriefcase },
    { value: '1000+', label: 'Active Students', icon: FiUsers },
    { value: '50+', label: 'Partner Companies', icon: FiAward },
    { value: '200+', label: 'Success Stories', icon: FiStar },
  ]

  const testimonials = [
    {
      name: 'Aziza Karimova',
      role: 'Software Developer at TechCorp',
      content: 'StudentHire helped me find my dream job right after graduation. The AI-powered recommendations were spot on!',
      avatar: 'A',
    },
    {
      name: 'Sardor Umarov',
      role: 'Marketing Intern at StartupUz',
      content: 'The community feature connected me with amazing mentors who guided my career journey.',
      avatar: 'S',
    },
    {
      name: 'Nilufar Rahimova',
      role: 'Data Analyst at FinanceHub',
      content: 'Resume builder and practice playground prepared me perfectly for interviews. Highly recommend!',
      avatar: 'N',
    },
  ]

  const benefits = [
    'Personalized job recommendations based on your profile',
    'Direct connections with top employers in Uzbekistan',
    'Free AI-powered career guidance and advice',
    'Skills development through practice challenges',
    'Professional resume templates and builder',
    'Active community of students and mentors',
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative gradient-primary text-white overflow-hidden">
        <div className="absolute inset-0 pattern-grid" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary-900/30" />
        
        {/* Floating shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-float animation-delay-200" />
        
        <div className="relative container-custom py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8">
              <FiZap className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium">The #1 Career Platform for Students in Uzbekistan</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              Launch Your Career in{' '}
              <span className="gradient-text-light">Uzbekistan</span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl mb-10 text-primary-100 max-w-3xl mx-auto leading-relaxed">
              Job Vacancies, Internships, Mentoring, and Community — All in One Place!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-white text-primary-600 rounded-xl shadow-lg hover:bg-primary-50 hover:shadow-xl transition-all duration-200"
              >
                Get Started Free
                <FiArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-transparent border-2 border-white/30 backdrop-blur-sm text-white rounded-xl hover:bg-white/10 hover:border-white transition-all duration-200"
              >
                Browse Jobs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section gradient-subtle">
        <div className="container-custom">
          <div className="text-center mb-16 animate-fade-in-up">
            <span className="badge badge-primary mb-4">Features</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Succeed</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools and resources for your career journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="group card p-6 md:p-8 card-hover animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-900 group-hover:text-primary-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center group animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-600 group-hover:text-white transition-all">
                    <Icon className="w-6 h-6 text-primary-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold gradient-text mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium text-sm md:text-base">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center animate-fade-in-up">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">
              Trusted by students from
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
              {[
                { name: 'TUIT', logo: '/logos/tuit.png', alt: 'Tashkent University of Information Technologies' },
                { name: 'Westminster', logo: '/logos/westminster.png', alt: 'Westminster International University in Tashkent' },
                { name: 'TSUE', logo: '/logos/tsue.png', alt: 'Tashkent State University of Economics' },
                { name: 'Webster', logo: '/logos/webster.png', alt: 'Webster University in Tashkent' },
                { name: 'AUT', logo: '/logos/aut.png', alt: 'American University of Technology  ' },
              ].map((university, index) => (
                <OrganizationLogo
                  key={index}
                  name={university.name}
                  logo={university.logo}
                  alt={university.alt}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="animate-fade-in-up">
              <span className="badge badge-primary mb-4">Why StudentHire?</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Your Success is Our Priority
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                We've built StudentHire with one goal in mind: to help students in Uzbekistan 
                launch successful careers. Here's what sets us apart.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FiCheck className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/about" className="btn btn-primary">
                  Learn More About Us
                  <FiArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
            
            <div className="relative animate-fade-in-up animation-delay-200">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl transform rotate-3 opacity-10" />
              <div className="relative bg-white rounded-3xl shadow-soft-lg p-8 md:p-10">
                <div className="space-y-6">
                  {[
                    { label: 'Job Match Rate', value: 85, color: 'bg-blue-500' },
                    { label: 'User Satisfaction', value: 92, color: 'bg-green-500' },
                    { label: 'Career Growth', value: 78, color: 'bg-purple-500' },
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-gray-700">{item.label}</span>
                        <span className="font-bold text-gray-900">{item.value}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="text-center mb-16 animate-fade-in-up">
            <span className="badge badge-primary mb-4">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Loved by Students
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Hear from students who found success through StudentHire
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="card p-6 md:p-8 card-hover animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center space-x-4">
                  <div className="avatar avatar-md">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative gradient-primary text-white overflow-hidden">
        <div className="absolute inset-0 pattern-grid" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        
        <div className="relative container-custom py-20 md:py-28 text-center">
          <div className="max-w-3xl mx-auto animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Your Career Journey?
            </h2>
            <p className="text-lg md:text-xl mb-10 text-primary-100 max-w-2xl mx-auto">
              Join thousands of students building their future in Uzbekistan. 
              It's free to get started!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="group inline-flex items-center justify-center px-10 py-5 text-lg font-semibold bg-white text-primary-600 rounded-xl shadow-2xl hover:bg-primary-50 transition-all duration-200"
              >
                Create Your Account
                <FiArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/about/contact"
                className="inline-flex items-center justify-center px-10 py-5 text-lg font-semibold bg-transparent border-2 border-white/30 text-white rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
