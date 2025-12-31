import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckIcon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { SEOHead } from '../components/SEOHead';

/**
 * Pricing Page - Unified Dark Theme
 */
export const Pricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'For small teams getting started with weekly check-ins.',
      features: [
        { name: 'Up to 5 team members', included: true },
        { name: 'Weekly reviews', included: true },
        { name: 'Team dashboard', included: true },
        { name: 'Basic reminders', included: true },
        { name: '30-day history', included: true },
        { name: 'Email support', included: true },
        { name: 'Custom forms', included: false },
        { name: 'Analytics & trends', included: false },
        { name: 'Team chat', included: false },
      ],
      cta: 'Start Free',
      popular: false,
      color: 'slate',
    },
    {
      name: 'Team',
      price: isAnnual ? '$8' : '$10',
      period: '/user/month',
      description: 'For growing teams that need full visibility and analytics.',
      features: [
        { name: 'Unlimited team members', included: true },
        { name: 'Weekly reviews', included: true },
        { name: 'Team dashboard', included: true },
        { name: 'Smart reminders', included: true },
        { name: 'Unlimited history', included: true },
        { name: 'Priority support', included: true },
        { name: 'Custom forms', included: true },
        { name: 'Analytics & trends', included: true },
        { name: 'Team chat', included: true },
      ],
      cta: 'Start 14-Day Trial',
      popular: true,
      color: 'emerald',
    },
  ];

  return (
    <>
      <SEOHead
        title="SpireTrack Pricing — Free Team Tracking | Affordable Team Software"
        description="Start free with up to 5 team members. Upgrade to Team plan at $8/user/month for unlimited members, custom forms, and analytics. No credit card required."
        keywords="spiretrack pricing, team productivity pricing, weekly check-in software cost, team alignment tool pricing, free team tracking, free team software, affordable team management, cheap team tools, best value team software, team software pricing comparison, slack alternative pricing, asana alternative pricing, monday alternative pricing, basecamp alternative pricing, notion alternative pricing, free standup software, free async standup, free team dashboard, free team analytics, team plan pricing, enterprise team pricing, startup team pricing, small business team pricing, per user pricing, monthly team subscription, annual team discount"
        canonicalUrl="https://spiretrack.app/pricing"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
        {/* ========== HERO SECTION ========== */}
        <section className="relative px-6 py-24 sm:py-32 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
          </div>
          
          <div className="max-w-4xl mx-auto text-center relative">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-6"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}
            >
              Simple pricing.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                No surprises.
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10"
            >
              Start free with your small team. Upgrade when you need more.
            </motion.p>
            
            {/* Billing Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-4 p-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
            >
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                  !isAnnual 
                    ? 'bg-white text-slate-900' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-2.5 rounded-full font-medium transition-all flex items-center gap-2 ${
                  isAnnual 
                    ? 'bg-white text-slate-900' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Annual
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500 text-white">Save 20%</span>
              </button>
            </motion.div>
          </div>
        </section>

        {/* ========== PRICING CARDS ========== */}
        <section className="px-6 pb-24">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative rounded-2xl p-8 ${
                    plan.popular 
                      ? 'bg-gradient-to-b from-emerald-500/20 to-teal-500/10 border border-emerald-500/30' 
                      : 'bg-white/5 backdrop-blur-sm border border-white/10'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  
                  <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-400 mb-6">{plan.description}</p>
                  
                  <div className="mb-8">
                    <span className="text-5xl font-semibold text-white">{plan.price}</span>
                    <span className="text-slate-400">{plan.period}</span>
                    {isAnnual && plan.name === 'Team' && (
                      <span className="ml-2 text-sm text-emerald-400">billed annually</span>
                    )}
                  </div>
                  
                  <Link
                    to="/register"
                    className={`block w-full py-4 text-center rounded-full font-semibold transition-all ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg' 
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                  
                  <div className="mt-8 pt-8 border-t border-white/10">
                    <p className="font-medium text-white mb-4">What's included:</p>
                    <ul className="space-y-3">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-center gap-3">
                          {feature.included ? (
                            <CheckIcon className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                          ) : (
                            <XMarkIcon className="w-5 h-5 flex-shrink-0 text-slate-600" />
                          )}
                          <span className={feature.included ? 'text-slate-300' : 'text-slate-600'}>
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

        {/* ========== FAQ SECTION ========== */}
        <section className="px-6 py-24">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent" />
          
          <div className="max-w-3xl mx-auto relative">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-semibold text-white text-center mb-12"
            >
              Common questions
            </motion.h2>
            
            <div className="space-y-4">
              {[
                { 
                  q: 'Can I try SpireTrack before paying?', 
                  a: 'Yes! Start with the Free plan (up to 5 team members) to try everything out. When you\'re ready for more, the Team plan includes a 14-day free trial. No credit card required.' 
                },
                { 
                  q: 'What happens when I add more team members?', 
                  a: 'On the Free plan, you can have up to 5 members. Need more? Upgrade to Team at $8/user/month (annual) and add unlimited members.' 
                },
                { 
                  q: 'Can I switch plans anytime?', 
                  a: 'Absolutely. Upgrade or downgrade whenever you need. Changes take effect immediately, and we\'ll prorate any differences.' 
                },
                { 
                  q: 'Is there a discount for annual billing?', 
                  a: 'Yes! Pay annually and save 20%. That\'s $8/user/month instead of $10/user/month.' 
                },
                { 
                  q: 'What if I\'m not satisfied?', 
                  a: 'We offer a 30-day money-back guarantee on all paid plans. If SpireTrack isn\'t working for your team, we\'ll refund you. No questions asked.' 
                },
              ].map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                >
                  <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                  <p className="text-slate-400 leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== CTA SECTION ========== */}
        <section className="relative px-6 py-24">
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 to-transparent" />
          
          <div className="max-w-4xl mx-auto text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-semibold text-white mb-6">
                Still have questions?
              </h2>
              <p className="text-lg text-slate-300 mb-8">
                We're here to help you find the right plan for your team.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-white font-semibold hover:text-emerald-400 transition-colors"
              >
                Contact us <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Pricing;
