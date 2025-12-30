import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckIcon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

// ============================================
// PRICING PAGE
// ============================================

export const Pricing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'team' | 'individual'>('team');

  useEffect(() => {
    document.title = 'Pricing - SpireTrack';
    window.scrollTo(0, 0);
  }, []);

  const teamPlans = [
    {
      name: 'Team Basic',
      price: '$0',
      period: '/user/month',
      description: 'Essential collaboration features.',
      features: [
        { name: 'Up to 10 team members', included: true },
        { name: 'Team chat with threads', included: true },
        { name: 'Basic review forms', included: true },
        { name: 'Weekly team reviews', included: true },
        { name: '30-day analytics history', included: true },
        { name: 'Email support', included: true },
        { name: 'AI-powered insights', included: false },
        { name: 'Custom form builder', included: false },
        { name: 'Advanced analytics', included: false },
      ],
      cta: 'Start Basic',
      popular: false,
    },
  ];

  const individualPlans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Get started with personal productivity.',
      features: [
        { name: 'Weekly reviews', included: true },
        { name: 'Basic habit tracking', included: true },
        { name: 'Join 1 team', included: true },
        { name: '7-day analytics history', included: true },
        { name: 'Basic templates', included: true },
        { name: 'Community support', included: true },
        { name: 'AI-powered insights', included: false },
        { name: 'Unlimited history', included: false },
        { name: 'Calendar integration', included: false },
      ],
      cta: 'Get Started',
      popular: false,
    },
  ];

  const plans = activeTab === 'team' ? teamPlans : individualPlans;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 tracking-tight mb-4"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}
          >
            Simple pricing.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-3xl font-light text-gray-400 mb-12"
          >
            Start free. Upgrade when you're ready.
          </motion.p>
          
          {/* Tab Switcher */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex p-1 rounded-full bg-gray-100"
          >
            <button
              onClick={() => setActiveTab('team')}
              className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                activeTab === 'team' 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              For Teams
            </button>
            <button
              onClick={() => setActiveTab('individual')}
              className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                activeTab === 'individual' 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              For Individuals
            </button>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-8 rounded-3xl w-full max-w-md ${
                  plan.popular 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-white text-sm font-medium">
                    Recommended
                  </div>
                )}
                
                <h3 className={`text-xl font-semibold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`mb-6 ${plan.popular ? 'text-gray-400' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
                
                <div className="mb-8">
                  <span className={`text-5xl font-light ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  <span className={plan.popular ? 'text-gray-400' : 'text-gray-500'}>
                    {plan.period}
                  </span>
                </div>
                
                <Link
                  to="/register"
                  className={`block w-full py-4 text-center rounded-full font-semibold transition-all ${
                    plan.popular 
                      ? 'bg-white text-gray-900 hover:bg-gray-100' 
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {plan.cta}
                </Link>
                
                <div className={`mt-8 pt-8 border-t ${plan.popular ? 'border-gray-700' : 'border-gray-200'}`}>
                  <p className={`font-medium mb-4 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    What's included:
                  </p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-3">
                        {feature.included ? (
                          <CheckIcon className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-emerald-400' : 'text-emerald-500'}`} />
                        ) : (
                          <XMarkIcon className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-gray-600' : 'text-gray-300'}`} />
                        )}
                        <span className={
                          feature.included 
                            ? (plan.popular ? 'text-gray-200' : 'text-gray-700')
                            : (plan.popular ? 'text-gray-600' : 'text-gray-400')
                        }>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-light text-gray-900 text-center mb-12"
          >
            Common questions.
          </motion.h2>
          <div className="space-y-4">
            {[
              { q: 'Can I switch between plans?', a: 'Yes. Upgrade or downgrade at any time. Changes take effect immediately.' },
              { q: 'Is there a free trial?', a: 'Yes. All paid plans include a 14-day free trial. No credit card required.' },
              { q: 'What payment methods do you accept?', a: 'We accept all major credit cards and PayPal.' },
              { q: 'Can I get a refund?', a: 'Yes. We offer a 30-day money-back guarantee on all paid plans.' },
            ].map((faq, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-white rounded-2xl"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-500">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-light text-gray-900 mb-4">Still have questions?</h2>
          <p className="text-gray-500 mb-8">
            Our team is here to help you find the right plan.
          </p>
          <Link 
            to="/contact" 
            className="inline-flex items-center gap-2 text-gray-900 font-semibold hover:text-gray-600 transition-colors"
          >
            Contact Sales <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-400">
          © 2025 SpireTrack. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
