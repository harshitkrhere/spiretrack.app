import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChartBarIcon, DocumentTextIcon, BoltIcon, ArrowTrendingUpIcon,
  CheckIcon, ArrowRightIcon, SparklesIcon,
  CalendarIcon, HeartIcon, UserIcon
} from '@heroicons/react/24/outline';

// ============================================
// FOR INDIVIDUALS PAGE — ONBOARDING-INSPIRED DESIGN
// Clean, minimalist, premium aesthetic
// ============================================

export const ForIndividuals: React.FC = () => {
  useEffect(() => {
    document.title = 'For Individuals - SpireTrack';
    window.scrollTo(0, 0);
  }, []);

  const features = [
    { icon: DocumentTextIcon, title: 'Weekly Reviews', desc: 'Structured reflections that help you identify patterns, celebrate wins, and get personalized recommendations.' },
    { icon: BoltIcon, title: 'Habit Tracking', desc: 'Build lasting habits with visual streaks, milestone celebrations, and smart reminders.' },
    { icon: ChartBarIcon, title: 'Focus Analytics', desc: 'Monitor your productivity patterns and identify your peak performance times.' },
    { icon: CalendarIcon, title: 'Time Blocking', desc: 'Integrated calendar view to plan your deep work sessions with drag-and-drop scheduling.' },
    { icon: ArrowTrendingUpIcon, title: 'Progress Visualization', desc: 'Beautiful dashboards showing your growth trajectory and improvement over time.' },
    { icon: HeartIcon, title: 'Wellbeing Check-ins', desc: 'Track your energy, mood, and work-life balance alongside productivity metrics.' },
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
            <UserIcon className="w-4 h-4" />
            For Individuals
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 tracking-tight mb-4"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}
          >
            Your productivity.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl font-light text-gray-400 mb-8"
          >
            Simplified.
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Stop using scattered tools. SpireTrack helps you build consistent habits, 
            reflect on your progress, and get AI-powered recommendations to optimize your workflow.
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
              Start Free <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link 
              to="/pricing" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              View Individual Plans
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-500"
          >
            <span className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-emerald-500" /> Free forever plan</span>
            <span className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-emerald-500" /> No credit card needed</span>
          </motion.div>
        </div>
      </section>

      {/* Preview Card */}
      <section className="py-12 px-6">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gray-50 rounded-3xl p-8"
          >
            <h4 className="font-semibold text-gray-900 mb-6">Your Weekly Review</h4>
            <div className="space-y-3">
              {[
                { label: 'Focus Score', value: '92%', color: 'text-emerald-600' },
                { label: 'Deep Work Hours', value: '28h', color: 'text-gray-900' },
                { label: 'Habits Completed', value: '12/14', color: 'text-emerald-600' },
                { label: 'Current Streak', value: '14 days 🔥', color: 'text-orange-500' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-white rounded-xl">
                  <span className="text-gray-600">{item.label}</span>
                  <span className={`font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-white rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <SparklesIcon className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-900 text-sm">AI Insight</span>
              </div>
              <p className="text-sm text-gray-500">Your productivity peaks between 9-11 AM. Consider scheduling deep work during this window.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-light text-gray-900 mb-4"
            >
              Tools for personal excellence.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-400"
            >
              Everything you need to achieve your goals.
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
                className="p-8 bg-white rounded-2xl"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-5xl text-gray-200 mb-6">"</div>
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8">
              SpireTrack helped me finally build a consistent weekly review habit. 
              The AI insights are like having a personal productivity coach.
            </p>
            <div>
              <div className="font-semibold text-gray-900">Michael R.</div>
              <div className="text-gray-500">Freelance Developer</div>
            </div>
          </motion.div>
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
            Start your journey.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 mb-10"
          >
            Join thousands already achieving more with SpireTrack.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link 
              to="/register" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-all"
            >
              Get Started Free <ArrowRightIcon className="w-5 h-5" />
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

export default ForIndividuals;
