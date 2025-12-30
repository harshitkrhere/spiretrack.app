import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon, 
  DocumentTextIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

// ============================================
// PRODUCT PAGE — ONBOARDING-INSPIRED DESIGN
// Clean, minimalist, premium aesthetic
// ============================================

export const Product: React.FC = () => {
  useEffect(() => {
    document.title = 'Product - SpireTrack';
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      icon: DocumentTextIcon,
      title: 'Weekly Reviews',
      description: 'Structured reflections that help teams share wins, blockers, and priorities. Takes 5 minutes, saves hours of meetings.',
      highlights: ['Custom questions', 'AI-generated summaries', 'Trend tracking']
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Team Chat',
      description: 'Real-time messaging organized by topics. Threads, reactions, and file sharing keep conversations focused.',
      highlights: ['Threaded replies', 'Emoji reactions', 'File attachments']
    },
    {
      icon: ChartBarIcon,
      title: 'AI Analytics',
      description: 'Understand your team at a glance. Morale trends, productivity patterns, and actionable recommendations.',
      highlights: ['Team health scores', 'Pattern detection', 'Personalized insights']
    },
    {
      icon: UserGroupIcon,
      title: 'Team Management',
      description: 'Organize members with roles and permissions. Admins get dashboards to manage reviews and track engagement.',
      highlights: ['Role management', 'Admin dashboard', 'Member directory']
    },
    {
      icon: CalendarIcon,
      title: 'Calendar View',
      description: 'Visualize deadlines and review cycles. Never miss a submission or team milestone.',
      highlights: ['Week view', 'Event tracking', 'Review reminders']
    },
    {
      icon: SparklesIcon,
      title: 'Custom Forms',
      description: 'Build your own check-in templates. Create retrospectives, standups, or any structured workflow.',
      highlights: ['Drag-and-drop builder', 'Multiple field types', 'Reusable templates']
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 tracking-tight mb-4"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}
          >
            Everything you need.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-3xl font-light text-gray-400 mb-8"
          >
            Nothing you don't.
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed"
          >
            SpireTrack brings together reviews, chat, analytics, and team management 
            into one unified workspace. Simple by design, powerful by default.
          </motion.p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-gray-700" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-gray-500 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                
                <ul className="space-y-2">
                  {feature.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-light text-gray-900 mb-6"
          >
            How it works.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 mb-16"
          >
            Three simple steps to better team alignment.
          </motion.p>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { num: '1', title: 'Create your team', desc: 'Invite members and set up your workspace in under 2 minutes.' },
              { num: '2', title: 'Submit weekly reviews', desc: 'Team members share updates asynchronously. No meetings required.' },
              { num: '3', title: 'Get AI insights', desc: 'SpireTrack analyzes patterns and surfaces what matters most.' },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center text-lg font-medium mx-auto mb-6">
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500">{step.desc}</p>
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
            Ready to get started?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 mb-10"
          >
            Free to start. No credit card required.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link 
              to="/register" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all"
            >
              Start Free Trial
              <ArrowRightIcon className="w-5 h-5" />
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

export default Product;
