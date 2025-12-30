import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowRightIcon, 
  PlayIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  LinkIcon,
  PauseCircleIcon,
  ArrowPathIcon,
  StarIcon
} from '@heroicons/react/24/outline';

// ============================================
// SPIRETRACK LANDING PAGE — REDESIGN V2
// Dark, immersive, trust-first design
// ============================================

// --- HERO SECTION ---
const HeroSection: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 py-16 sm:py-24 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Aurora Background Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px]" />
      </div>
      
      <div className="relative max-w-5xl mx-auto text-center z-10">
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 bg-emerald-500/10 border border-emerald-500/20"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-sm font-medium text-emerald-400 uppercase tracking-widest">The Operating System for High-Performance Teams</span>
        </motion.div>

        {/* Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-6"
        >
          Achieve Radical Alignment.
          <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
            Ship Faster, Together.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Stop scattered workflows. SpireTrack synchronizes your team's weekly cadence, 
          async communication, and strategic goals into a single, unstoppable rhythm.
        </motion.p>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link 
            to="/splash"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-emerald-500 text-white rounded-full font-semibold text-lg hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25"
          >
            {user ? "Go to Dashboard" : "Start Building Momentum"}
            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            to="/product"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 text-slate-300 font-medium hover:text-white transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <PlayIcon className="w-4 h-4 text-white" />
            </div>
            See the Platform in Action
          </Link>
        </motion.div>

        {/* Microcopy */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6 text-sm text-slate-500"
        >
          Free to start. No credit card required.
        </motion.p>
      </div>
    </section>
  );
};

// --- SOCIAL TRUST BAR ---
const SocialTrustBar: React.FC = () => (
  <section className="py-12 px-4 sm:px-6 bg-slate-950 border-y border-slate-800">
    <div className="max-w-6xl mx-auto text-center">
      <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-6">
        Engineering alignment for forward-thinking teams at:
      </p>
      <div className="flex flex-wrap justify-center items-center gap-x-10 sm:gap-x-16 gap-y-4">
        {['TechFlow', 'InnovateLabs', 'Nexus Corp', 'Vertex Solutions', 'Quantum Dynamics'].map((brand) => (
          <span key={brand} className="text-lg sm:text-xl font-semibold text-slate-600 hover:text-slate-500 transition-colors">
            {brand}
          </span>
        ))}
      </div>
    </div>
  </section>
);

// --- CHAOS PROBLEM SECTION ---
const ChaosProblemSection: React.FC = () => (
  <section className="py-20 sm:py-28 px-4 sm:px-6 bg-slate-50">
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative order-2 lg:order-1"
        >
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-red-100 text-red-600">
                The Status Quo: Motion Without Progress
              </div>
            </div>
            {/* Chaos Visualization */}
            <div className="relative h-48 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-4 border-dashed border-slate-300 animate-spin" style={{ animationDuration: '20s' }} />
              </div>
              <div className="relative grid grid-cols-3 gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-2xl">📊</div>
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl">💬</div>
                <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center text-2xl">📅</div>
                <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center text-2xl">📝</div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl">🎯</div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">📧</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="order-1 lg:order-2"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-8">
            Chaos Disguised<br />as Collaboration.
          </h2>
          <div className="space-y-6">
            {[
              { icon: '📊', title: 'Strategic Drift', desc: 'Goals live in spreadsheets. Every team has their own interpretation.' },
              { icon: '⏱️', title: 'The Meeting Tax', desc: 'Hours lost to synchronous updates and micro-constant interruptions.' },
              { icon: '🔄', title: 'Context Switching Fatigue', desc: 'Information scattered across endless threads, tabs, and tools.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-xl">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

// --- SOLUTION SECTION ---
const SolutionSection: React.FC = () => (
  <section className="py-20 sm:py-28 px-4 sm:px-6 bg-slate-900">
    <div className="max-w-6xl mx-auto text-center">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-8"
      >
        The SpireTrack Standard
      </motion.div>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
      >
        One Shared Brain.<br />One Steady Rhythm.
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-lg text-slate-400 max-w-2xl mx-auto mb-16"
      >
        SpireTrack replaces fragmented tools to consolidate reviews, async communication, 
        and team intentions into one place.
      </motion.p>

      {/* Three Pillars */}
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { 
            icon: LinkIcon, 
            title: 'Unified Context', 
            desc: 'SpireTrack summarizes conversations, reviews, and goals so nothing gets lost. Everyone sees the same picture.' 
          },
          { 
            icon: PauseCircleIcon, 
            title: 'Async by Default', 
            desc: 'SpireTrack respects deep work. Updates happen on your schedule, not in back-to-back meetings.' 
          },
          { 
            icon: ArrowPathIcon, 
            title: 'Continuous Calibration', 
            desc: 'Weekly reviews surface wins, blockers, and sentiment automatically—so managers stay informed without chasing updates.' 
          },
        ].map((pillar, i) => (
          <motion.div
            key={pillar.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700"
          >
            <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 mx-auto">
              <pillar.icon className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">{pillar.title}</h3>
            <p className="text-slate-400">{pillar.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// --- FEATURE DIVE SECTION ---
const FeatureDiveSection: React.FC = () => {
  const features = [
    {
      label: 'Goals & OKRs',
      headline: 'Connect Daily Work to Company Outcomes.',
      body: "Don't just set OKRs—link every task to a strategic goal. SpireTrack visualizes how individual contributions ladder up to company objectives, replacing scattered spreadsheets with a live OKR tree.",
      icon: ChartBarIcon,
      color: 'emerald',
    },
    {
      label: 'Weekly Reviews',
      headline: 'Surface Wins and Unblock Faster.',
      body: 'Replace the dreaded Monday morning status meeting. Team members submit structured weekly updates asynchronously. Managers get a consolidated view of wins, blockers, and morale—before the week starts.',
      icon: DocumentTextIcon,
      color: 'blue',
    },
    {
      label: 'Async Chat',
      headline: 'Async Messaging with Built-in Context.',
      body: 'Move away from noisy, real-time channels. SpireTrack threads are anchored to decisions, milestones, and documents—so conversations stay relevant and searchable.',
      icon: ChatBubbleLeftRightIcon,
      color: 'violet',
    },
  ];

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-600 mb-6"
          >
            Deep Feature Dive
          </motion.div>
        </div>

        <div className="space-y-20">
          {features.map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`grid lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
            >
              {/* Text */}
              <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 block">{feature.label}</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">{feature.headline}</h3>
                <p className="text-lg text-slate-600 leading-relaxed">{feature.body}</p>
              </div>
              {/* Visual Placeholder */}
              <div className={`${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="bg-slate-100 rounded-2xl aspect-video flex items-center justify-center border border-slate-200">
                  <feature.icon className="w-16 h-16 text-slate-300" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- TEAM HEALTH SECTION ---
const TeamHealthSection: React.FC = () => (
  <section className="py-20 sm:py-28 px-4 sm:px-6 bg-slate-50">
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
            Proactively Manage Team Health.
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            Get real-time insights into team morale, focus time, and engagement patterns. 
            Spot burnout risks early. Make data-informed decisions about workload and priorities—before problems escalate.
          </p>
          <Link 
            to="/product" 
            className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
          >
            Learn more about analytics
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
            {/* Mini Dashboard Preview */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Morale', value: 82, color: 'emerald' },
                { label: 'Productivity', value: 91, color: 'blue' },
                { label: 'Stress Level', value: 34, color: 'amber' },
                { label: 'Alignment', value: 88, color: 'violet' },
              ].map((metric) => (
                <div key={metric.label} className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

// --- SOCIAL PROOF SECTION ---
const SocialProofSection: React.FC = () => (
  <section className="py-20 sm:py-28 px-4 sm:px-6 bg-white">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-amber-50 text-amber-700 border border-amber-100 mb-6"
        >
          <StarIcon className="w-4 h-4" />
          Social Proof
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900"
        >
          Velocity is a Byproduct of Alignment.
        </motion.h2>
      </div>

      {/* Testimonial Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-slate-50 rounded-3xl p-8 sm:p-12 mb-12"
      >
        <div className="text-5xl text-slate-200 font-serif mb-4">"</div>
        <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed mb-8">
          SpireTrack replaced our chaotic status meetings and scattered updates. 
          Now our entire team knows exactly what matters each week. 
          <span className="font-semibold text-slate-900"> It's like having a shared brain.</span>
        </p>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">SK</div>
          <div>
            <p className="font-semibold text-slate-900">Sarah Kim</p>
            <p className="text-sm text-slate-500">Head of Product, TechFlow</p>
          </div>
        </div>
      </motion.div>

      {/* Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid grid-cols-3 gap-8"
      >
        {[
          { value: '3x', label: 'Faster Alignment' },
          { value: '85%', label: 'Fewer Status Meetings' },
          { value: '4.9/5', label: 'Avg. User Rating' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-3xl sm:text-4xl font-bold text-slate-900 mb-1">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

// --- FINAL CTA SECTION ---
const FinalCTASection: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/10 text-white/80 mb-8">
            Final CTA
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Stop Managing Chaos.<br />Start Engineering Alignment.
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10">
            Join thousands of high-performing teams who've already made the switch. 
            Get started in minutes—no complex setup, no credit card required.
          </p>
          <Link 
            to={user ? "/app" : "/register"}
            className="group inline-flex items-center gap-3 px-10 py-5 bg-emerald-500 text-white rounded-full font-semibold text-lg hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25"
          >
            Enter Your New Workspace
            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-6 text-sm text-slate-500">
            Free 14-day trial. Full feature access. Cancel anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// --- FOOTER ---
const Footer: React.FC = () => (
  <footer className="py-16 px-4 sm:px-6 bg-slate-950 border-t border-slate-800">
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        {/* Logo */}
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="SpireTrack" className="w-8 h-8" />
            <span className="text-lg font-bold text-white">SpireTrack</span>
          </Link>
          <p className="text-sm text-slate-500">
            The operating system for high-performance teams.
          </p>
        </div>

        {/* Product */}
        <div>
          <h4 className="font-semibold text-white mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/product" className="hover:text-white transition-colors">Features</Link></li>
            <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-semibold text-white mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/for-teams" className="hover:text-white transition-colors">For Teams</Link></li>
            <li><Link to="/for-individuals" className="hover:text-white transition-colors">For Individuals</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-semibold text-white mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-8 text-center">
        <p className="text-sm text-slate-500">© 2025 SpireTrack Inc. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

// --- MAIN LANDING COMPONENT ---
export const Landing: React.FC = () => {
  useEffect(() => {
    document.title = 'SpireTrack — Team Alignment, Simplified';
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <HeroSection />
      <SocialTrustBar />
      <ChaosProblemSection />
      <SolutionSection />
      <FeatureDiveSection />
      <TeamHealthSection />
      <SocialProofSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
};
