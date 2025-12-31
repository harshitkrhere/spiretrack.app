import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon, 
  DocumentTextIcon,
  ChartBarIcon,
  UserGroupIcon,
  BellAlertIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { SEOHead } from '../components/SEOHead';

/**
 * Features/Product Page - Unified Dark Theme with Blue Accents
 */
export const Product: React.FC = () => {
  const features = [
    {
      icon: DocumentTextIcon,
      title: 'Weekly Reviews',
      description: 'Structured check-ins that capture what your team accomplished, what\'s next, and what\'s blocking them. Takes 5 minutes, saves hours of meetings every week.',
      highlights: ['Three simple questions', 'Async submissions', 'Customizable templates'],
      color: 'emerald',
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Team Chat',
      description: 'Context-rich messaging that keeps conversations connected to the work. Threads, reactions, and file sharing built right in.',
      highlights: ['Threaded replies', 'Emoji reactions', 'File attachments'],
      color: 'blue',
    },
    {
      icon: ChartBarIcon,
      title: 'Team Analytics',
      description: 'Understand your team at a glance. See submission rates, engagement patterns, and team health trends over time.',
      highlights: ['Submission tracking', 'Engagement trends', 'Historical data'],
      color: 'violet',
    },
    {
      icon: UserGroupIcon,
      title: 'Team Dashboard',
      description: 'One place to see everything. Who submitted, who\'s blocked, what\'s happening across your team—all at a glance.',
      highlights: ['Real-time status', 'Blocker visibility', 'Member overview'],
      color: 'cyan',
    },
    {
      icon: BellAlertIcon,
      title: 'Smart Reminders',
      description: 'Automated nudges that go out at the right time. No more chasing people for updates. Set it once, forget it forever.',
      highlights: ['Customizable timing', 'Email & push', 'Gentle nudges'],
      color: 'amber',
    },
    {
      icon: SparklesIcon,
      title: 'Custom Forms',
      description: 'Build review templates that match your team\'s workflow. Create standups, retrospectives, or any structured check-in you need.',
      highlights: ['Drag-and-drop builder', 'Multiple field types', 'Reusable templates'],
      color: 'pink',
    },
  ];

  const colorMap: Record<string, string> = {
    emerald: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400',
    violet: 'from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-400',
    cyan: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/30 text-cyan-400',
    amber: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
    pink: 'from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-400',
  };

  return (
    <>
      <SEOHead
        title="SpireTrack Features — Weekly Reviews, Team Dashboard, Chat & Analytics"
        description="Weekly reviews, team chat, smart reminders, and analytics. Simple tools that work. No feature bloat. Just what you need to keep your team on the same page. Free to try."
        keywords="spiretrack features, team check-in features, weekly review tool, team dashboard, async team updates, team tracking features, weekly check-in software features, team visibility features, team alignment features, smart reminders, automated reminders, team notifications, push notifications, email reminders, team analytics, team insights, team metrics, team reports, team chat, team messaging, team communication, custom forms, form builder, review templates, question builder, team health tracking, blocker tracking, wins tracking, progress tracking, submission tracking, engagement tracking"
        canonicalUrl="https://spiretrack.app/features"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
        {/* ========== HERO SECTION ========== */}
        <section className="relative px-6 py-24 sm:py-32 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px]" />
          </div>
          
          <div className="max-w-4xl mx-auto text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium text-white/80 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Features
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-6"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}
            >
              Everything you need.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
                Nothing you don't.
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
            >
              SpireTrack is intentionally focused. We built what matters for team alignment 
              and left out the bloat. Simple by design, powerful by default.
            </motion.p>
          </div>
        </section>

        {/* ========== FEATURES GRID ========== */}
        <section className="px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[feature.color]} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-400 mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {feature.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-center gap-2 text-sm text-slate-500">
                        <CheckIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== DETAILED FEATURE SECTIONS ========== */}
        <section className="px-6 py-24">
          <div className="max-w-4xl mx-auto space-y-24">
            {/* Weekly Reviews Deep Dive */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full text-sm font-medium mb-4">
                  Core Feature
                </div>
                <h2 className="text-3xl font-semibold text-white mb-6">
                  Weekly reviews that actually work
                </h2>
                <div className="prose prose-invert">
                  <p className="text-slate-300 leading-relaxed mb-6">
                    The heart of SpireTrack is the weekly review—a simple, structured check-in 
                    that captures what matters without the overhead of meetings.
                  </p>
                  <p className="text-slate-400 leading-relaxed mb-6">
                    Every team member answers three questions: what they accomplished, what they're 
                    working on next, and whether anything is blocking them. It takes five minutes 
                    to complete and gives managers complete visibility.
                  </p>
                </div>
                <ul className="space-y-3">
                  {['Async submissions—no meetings needed', 'Customizable questions', 'Automatic deadline reminders', 'Historical tracking'].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <CheckIcon className="w-5 h-5 text-emerald-400" />
                      <span className="text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="text-sm text-slate-500 mb-4">Weekly Review Preview</div>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-sm font-medium text-slate-300 mb-2">This week's wins</div>
                    <div className="text-slate-500 text-sm">Launched the new dashboard...</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-sm font-medium text-slate-300 mb-2">Next week's focus</div>
                    <div className="text-slate-500 text-sm">Mobile app updates...</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-emerald-500/30">
                    <div className="text-sm font-medium text-slate-300 mb-2">Blockers</div>
                    <div className="text-emerald-400 text-sm">None—all clear!</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Dashboard Deep Dive */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <div className="order-2 lg:order-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="text-sm text-slate-500 mb-4">Team Dashboard</div>
                <div className="space-y-3">
                  {['Sarah Chen', 'Alex Kumar', 'Maya Rivera', 'Jordan Lee'].map((name, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-violet-500/30 flex items-center justify-center text-blue-400 text-sm font-medium">
                          {name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-medium text-slate-300">{name}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded border ${idx === 2 ? 'text-amber-400 bg-amber-500/20 border-amber-500/30' : 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'}`}>
                        {idx === 2 ? 'Pending' : 'Submitted'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-full text-sm font-medium mb-4">
                  Visibility
                </div>
                <h2 className="text-3xl font-semibold text-white mb-6">
                  See your whole team at a glance
                </h2>
                <div className="prose prose-invert">
                  <p className="text-slate-300 leading-relaxed mb-6">
                    The team dashboard gives you complete visibility without chasing updates. 
                    See who submitted their review, who's blocked, and what's happening—all in one place.
                  </p>
                  <p className="text-slate-400 leading-relaxed mb-6">
                    No more wondering what everyone is working on. No more waiting for the next 
                    status meeting. The information you need is always current and always accessible.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ========== CTA SECTION ========== */}
        <section className="relative px-6 py-24">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent" />
          
          <div className="max-w-4xl mx-auto text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-6">
                Ready to simplify team alignment?
              </h2>
              <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
                Start free. No credit card required. Set up your team in under 2 minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-semibold hover:bg-slate-100 transition-colors shadow-lg"
                >
                  Start Free Trial
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <Link
                  to="/how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white rounded-full font-medium hover:bg-white/10 transition-colors"
                >
                  See How It Works
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Product;
