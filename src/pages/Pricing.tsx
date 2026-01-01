import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { SEOHead } from '../components/SEOHead';

/**
 * Pricing Page - Simplified Free Plan Only
 */
export const Pricing: React.FC = () => {
  const features = [
    'Up to 15 team members',
    'Weekly reviews',
    'Team dashboard',
    'Smart reminders',
    'Unlimited history',
    'Custom forms',
    'Analytics & trends',
    'Team chat',
    'Spire AI — 1,000 tokens',
    'AI Insights — 1,000 tokens',
    'Weekly Report AI — 1,000 tokens',
  ];

  return (
    <>
      <SEOHead
        title="SpireTrack Pricing — Free Team Tracking Software"
        description="SpireTrack is completely free for teams up to 15 members. Get weekly check-ins, team dashboard, analytics, and more at no cost. No credit card required."
        keywords="spiretrack pricing, free team tracking, free team software, free team management, free weekly check-ins, free team dashboard, free standup software, free async standup, no cost team tools"
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
              Completely{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Free.
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto"
            >
              Everything you need to keep your team aligned. No credit card required.
            </motion.p>
          </div>
        </section>

        {/* ========== PRICING CARD ========== */}
        <section className="px-6 pb-24">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative rounded-2xl p-8 bg-gradient-to-b from-emerald-500/20 to-teal-500/10 border border-emerald-500/30"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium">
                Forever Free
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-2 mt-4">Free</h3>
              <p className="text-slate-400 mb-6">Everything your team needs to stay aligned.</p>
              
              <div className="mb-8">
                <span className="text-5xl font-semibold text-white">$0</span>
                <span className="text-slate-400">/month</span>
              </div>
              
              <Link
                to="/register"
                className="block w-full py-4 text-center rounded-full font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg transition-all"
              >
                Start Free
              </Link>
              
              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="font-medium text-white mb-4">Everything included:</p>
                <ul className="space-y-3">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckIcon className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ========== FAQ SECTION ========== */}
        <section className="px-6 py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent pointer-events-none" />
          
          <div className="max-w-3xl mx-auto relative z-10">
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
                  q: 'Is SpireTrack really free?', 
                  a: 'Yes! SpireTrack is completely free for teams up to 15 members. No hidden fees, no credit card required, no time limits.' 
                },
                { 
                  q: 'What\'s the catch?', 
                  a: 'There isn\'t one. We believe every team deserves great tools. We may introduce premium features in the future, but the core experience will always be free.' 
                },
                { 
                  q: 'How many team members can I add?', 
                  a: 'You can have up to 15 team members on the free plan. That\'s enough for most small to medium teams.' 
                },
                { 
                  q: 'Do I need a credit card to sign up?', 
                  a: 'No! Just create an account and start using SpireTrack immediately. No payment information required.' 
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
                Ready to get started?
              </h2>
              <p className="text-lg text-slate-300 mb-8">
                Set up your team in under 2 minutes.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:from-emerald-600 hover:to-teal-600 shadow-lg transition-all"
              >
                Start Free <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Pricing;
