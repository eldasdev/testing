import { FiCheck, FiX, FiZap, FiStar, FiArrowRight } from 'react-icons/fi'
import Link from 'next/link'

const plans = [
  {
    name: 'Free',
    price: '0',
    currency: 'UZS',
    period: 'forever',
    description: 'Perfect for students getting started',
    features: [
      { text: 'Browse job vacancies', included: true },
      { text: 'Create profile', included: true },
      { text: 'Apply to jobs', included: true },
      { text: 'Access community forum', included: true },
      { text: 'Basic resume builder', included: true },
      { text: 'Limited AI blog queries (5/month)', included: true },
      { text: 'Priority job applications', included: false },
      { text: 'Advanced resume templates', included: false },
      { text: 'Unlimited AI queries', included: false },
      { text: 'Mentor matching', included: false },
    ],
    cta: 'Get Started',
    ctaLink: '/auth/signup',
    popular: false,
    gradient: 'from-gray-100 to-gray-50',
    borderColor: 'border-gray-200',
  },
  {
    name: 'Student Pro',
    price: '99,000',
    currency: 'UZS',
    period: 'month',
    description: 'For serious job seekers',
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'Priority job applications', included: true },
      { text: 'Advanced resume templates', included: true },
      { text: 'Unlimited AI blog queries', included: true },
      { text: 'Mentor matching', included: true },
      { text: 'Career roadmap tools', included: true },
      { text: 'Performance analytics', included: true },
      { text: 'Email support', included: true },
      { text: 'Early access to new features', included: true },
      { text: 'Profile badge', included: true },
    ],
    cta: 'Subscribe Now',
    ctaLink: '/auth/signup',
    popular: true,
    gradient: 'from-primary-600 to-primary-700',
    borderColor: 'border-primary-500',
  },
  {
    name: 'Company',
    price: 'Custom',
    currency: '',
    period: '',
    description: 'For companies posting jobs',
    features: [
      { text: 'Post unlimited job vacancies', included: true },
      { text: 'Access candidate database', included: true },
      { text: 'Application management', included: true },
      { text: 'Company profile page', included: true },
      { text: 'Analytics dashboard', included: true },
      { text: 'Featured job listings', included: true },
      { text: 'Priority support', included: true },
      { text: 'API access', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Custom branding', included: true },
    ],
    cta: 'Contact Sales',
    ctaLink: '/about/contact',
    popular: false,
    gradient: 'from-gray-100 to-gray-50',
    borderColor: 'border-gray-200',
  },
]

const faqs = [
  {
    question: 'Can I switch plans later?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.',
  },
  {
    question: 'Is there a free trial for Pro?',
    answer: 'We offer a 7-day free trial for Student Pro so you can experience all premium features risk-free.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, Payme, Click, and bank transfers for company accounts.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Absolutely! You can cancel your subscription at any time with no hidden fees or penalties.',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative gradient-primary text-white overflow-hidden">
        <div className="absolute inset-0 pattern-grid" />
        
        <div className="relative container-custom py-16 md:py-24 text-center">
          <div className="max-w-3xl mx-auto animate-fade-in-up">
            <span className="badge bg-white/20 text-white mb-6">Pricing</span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-primary-100">
              Choose the plan that's right for you. All plans include access to our core features.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="section gradient-subtle">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative card overflow-hidden animate-fade-in-up ${
                  plan.popular ? 'ring-2 ring-primary-500 shadow-glow-lg' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary-600 to-primary-700 py-2 text-center">
                    <span className="text-sm font-semibold text-white flex items-center justify-center">
                      <FiStar className="w-4 h-4 mr-1 fill-current" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={`p-6 md:p-8 ${plan.popular ? 'pt-12' : ''}`}>
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
                    
                    <div className="mb-4">
                      {plan.price === 'Custom' ? (
                        <span className="text-4xl font-extrabold text-gray-900">Custom</span>
                      ) : (
                        <div className="flex items-baseline justify-center">
                          <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                          {plan.currency && (
                            <span className="text-gray-600 ml-2">{plan.currency}</span>
                          )}
                          {plan.period && (
                            <span className="text-gray-500 ml-1">/{plan.period}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        {feature.included ? (
                          <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <FiX className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    href={plan.ctaLink}
                    className={`btn w-full justify-center py-4 ${
                      plan.popular
                        ? 'btn-primary'
                        : 'btn-secondary'
                    }`}
                  >
                    {plan.cta}
                    <FiArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up">
              <span className="badge badge-primary mb-4">FAQ</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Frequently Asked Questions
              </h2>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className="card p-6 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <h3 className="font-bold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm gradient-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 pattern-grid" />
        
        <div className="relative container-custom text-center">
          <div className="max-w-2xl mx-auto animate-fade-in-up">
            <FiZap className="w-12 h-12 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Have Questions?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Our team is here to help you choose the right plan for your needs.
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
