'use client'

import { useState } from 'react'
import { FiMail, FiPhone, FiMapPin, FiSend, FiMessageCircle, FiClock, FiCheck } from 'react-icons/fi'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    setSubmitted(true)
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  const contactMethods = [
    {
      icon: FiMail,
      title: 'Email Us',
      description: 'Get a response within 24 hours',
      value: 'info@studenthire.uz',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: FiPhone,
      title: 'Call Us',
      description: 'Mon-Fri, 9am - 6pm',
      value: '+998 99 123 4567',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: FiMapPin,
      title: 'Visit Us',
      description: 'Come say hello',
      value: 'Tashkent, Uzbekistan',
      color: 'from-purple-500 to-purple-600',
    },
  ]

  const faqs = [
    {
      question: 'How do I create an account?',
      answer: 'Click "Get Started" and choose your role (Student, Company, or Mentor). Fill in your details and you\'re ready to go!'
    },
    {
      question: 'Is StudentHire free?',
      answer: 'Yes! Core features are completely free for students. We offer premium plans for enhanced features.'
    },
    {
      question: 'How do companies post jobs?',
      answer: 'Companies can post jobs after creating a Company account. Simply go to Jobs and click "Post Job".'
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative gradient-primary text-white overflow-hidden">
        <div className="absolute inset-0 pattern-grid" />
        
        <div className="relative container-custom py-16 md:py-24">
          <div className="max-w-3xl animate-fade-in-up">
            <span className="badge bg-white/20 text-white mb-6">Contact Us</span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Get in Touch</h1>
            <p className="text-xl text-primary-100">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16 md:h-24" viewBox="0 0 1440 74" fill="none">
            <path d="M0 74V25.5C240 -8.5 480 -8.5 720 25.5C960 59.5 1200 59.5 1440 25.5V74H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="section-sm gradient-subtle">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => {
              const Icon = method.icon
              return (
                <div 
                  key={index}
                  className="card p-6 text-center card-hover animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-14 h-14 mx-auto bg-gradient-to-br ${method.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{method.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{method.description}</p>
                  <p className="font-semibold text-primary-600">{method.value}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & FAQ */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Form */}
            <div className="animate-fade-in-up">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                Send Us a Message
              </h2>
              
              <div className="card p-6 md:p-8">
                {submitted ? (
                  <div className="text-center py-12 animate-fade-in">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiCheck className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                    <p className="text-gray-600 mb-6">We'll get back to you as soon as possible.</p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="btn btn-primary"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          className="input"
                          placeholder="Your name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          className="input"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="input"
                        placeholder="How can we help?"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={5}
                        className="input resize-none"
                        placeholder="Tell us more..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full btn btn-primary py-4"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <FiSend className="mr-2 w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* FAQ */}
            <div className="animate-fade-in-up animation-delay-200">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="card p-6">
                    <h3 className="font-bold text-gray-900 mb-2 flex items-start">
                      <FiMessageCircle className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" />
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 ml-8">{faq.answer}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 card p-6 bg-primary-50 border-primary-100">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiClock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Response Time</h3>
                    <p className="text-gray-600 text-sm">
                      We typically respond to all inquiries within 24 hours during business days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
