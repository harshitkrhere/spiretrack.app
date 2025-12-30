import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChatBubbleLeftRightIcon, UserGroupIcon, ChartBarIcon,
  DocumentTextIcon, ShieldCheckIcon, ArrowRightIcon,
  CheckIcon, SparklesIcon
} from '@heroicons/react/24/outline';

// ============================================
// FOR TEAMS PAGE — ONBOARDING-INSPIRED DESIGN
// Clean, minimalist, premium aesthetic
// ============================================

export const ForTeams: React.FC = () => {
  useEffect(() => {
    document.title = 'For Teams - SpireTrack';
    window.scrollTo(0, 0);
  }, []);

  const features = [
    { icon: ChatBubbleLeftRightIcon, title: 'Team Chat', desc: 'Purpose-built messaging with threads, reactions, and file sharing. Keep conversations organized.' },
    { icon: UserGroupIcon, title: 'Async Standups', desc: 'Daily and weekly check-ins that respect timezone differences. No more scheduling conflicts.' },
    { icon: ChartBarIcon, title: 'Team Analytics', desc: 'Visibility into engagement, morale, and productivity trends. Make data-driven decisions.' },
    { icon: DocumentTextIcon, title: 'Custom Forms', desc: 'Build your own check-in templates. Create retrospectives, standups, or any structured workflow.' },
    { icon: ShieldCheckIcon, title: 'Enterprise Security', desc: 'SOC 2 certified, GDPR compliant, SSO support. Your data is protected.' },
    { icon: SparklesIcon, title: 'AI Insights', desc: 'Get actionable recommendations based on team patterns and sentiment analysis.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium mb-8"
          >
            <UserGroupIcon className="w-4 h-4" />
            For Teams & Enterprises
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 tracking-tight mb-4"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}
          >
            Build better teams.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl font-light text-gray-400 mb-8"
          >
            Together.
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Replace scattered tools with one unified workspace. Weekly reviews, async chat, 
            and AI-powered analytics help your team stay aligned and deliver results.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link 
              to="/register" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-all"
            >
              Start Team Trial <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link 
              to="/pricing" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              View Pricing
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-500"
          >
            <span className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-emerald-500" /> Free 14-day trial</span>
            <span className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-emerald-500" /> No credit card required</span>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'Teams Worldwide' },
              { value: '50,000+', label: 'Team Members' },
              { value: '4+ hours', label: 'Saved Per Week' },
              { value: '95%', label: 'Satisfaction Rate' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-3xl md:text-4xl font-light text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-light text-gray-900 mb-4"
            >
              Everything your team needs.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-400"
            >
              Purpose-built for collaboration and alignment.
            </motion.p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-gray-50 rounded-2xl"
              >
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-6 shadow-sm">
                  <feature.icon className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-light text-white mb-6"
          >
            Ready to transform your team?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 mb-10"
          >
            Join 500+ teams already achieving more with SpireTrack.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link 
              to="/register" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-all"
            >
              Start Team Trial <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link 
              to="/pricing" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gray-600 rounded-full font-semibold text-white hover:bg-gray-800 transition-all"
            >
              View Pricing
            </Link>
          </motion.div>
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

export default ForTeams;
