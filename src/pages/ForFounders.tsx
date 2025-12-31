import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { SEOHead } from '../components/SEOHead';

/**
 * For Founders Page - Unified Dark Theme with Amber/Orange Accents
 */
export const ForFounders: React.FC = () => {
  return (
    <>
      <SEOHead
        title="SpireTrack for Founders — Keep Your Startup Team Aligned"
        description="Built for startup founders who need visibility without micromanagement. Weekly check-ins that take 5 minutes, not hours. Know what your team is building."
        keywords="startup team alignment, founder productivity tool, small team visibility, startup team management"
        canonicalUrl="https://spiretrack.app/for-founders"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
        {/* ========== HERO SECTION ========== */}
        <section className="relative px-6 py-24 sm:py-32 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]" />
          </div>
          
          <div className="max-w-4xl mx-auto text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium text-white/80 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              For Founders & Team Leads
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-6"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}
            >
              You're building fast.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                Stay aligned without slowing down.
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8"
            >
              SpireTrack gives founders visibility into their team without the overhead 
              of complex tools or endless meetings. Simple weekly check-ins that work.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
              >
                Start Free — No Credit Card
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white rounded-full font-medium hover:bg-white/10 transition-colors"
              >
                See How It Works
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ========== PAIN POINTS SECTION ========== */}
        <section className="relative px-6 py-24">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-semibold text-white mb-8">
                The founder's visibility problem
              </h2>
              
              <div className="prose prose-lg prose-invert max-w-none mb-12">
                <p className="text-slate-300 leading-relaxed text-lg mb-6">
                  As a founder, you're pulled in a dozen directions at once. You're talking to customers, 
                  investors, and partners. You're thinking about strategy, product, and hiring. In the 
                  chaos, it's easy to lose track of what your team is actually building day-to-day.
                </p>
                
                <p className="text-slate-300 leading-relaxed text-lg mb-6">
                  The problem is, you can't lead effectively without visibility. You need to know when 
                  someone is blocked. You need to see when priorities are drifting. You need to understand 
                  if the team is aligned on what matters most. But you don't have time to micromanage.
                </p>
                
                <p className="text-slate-300 leading-relaxed text-lg mb-6">
                  That's the tension every founder faces: you need visibility, but you can't afford to 
                  spend hours chasing updates or sitting in status meetings. You need something lighter.
                </p>
              </div>
            </motion.div>

            <div className="space-y-6">
              {[
                {
                  problem: 'You\'re heads-down building, but you don\'t know what your team is working on',
                  detail: 'Everyone is moving fast, but in slightly different directions. By the time you realize, weeks have been wasted on the wrong things. The misalignment wasn\'t obvious until it was expensive.',
                },
                {
                  problem: 'Slack is chaos. Important updates get buried in noise.',
                  detail: 'You scroll through hundreds of messages looking for the information that matters. You miss the blocker that could have been fixed yesterday. Critical context is scattered across channels, DMs, and threads.',
                },
                {
                  problem: 'Status meetings feel like a waste, but you can\'t skip them',
                  detail: 'The alternative—not knowing what\'s happening—is worse. So you spend hours every week in sync meetings, even though you know there has to be a better way.',
                },
                {
                  problem: 'You want to help, but you don\'t want to micromanage',
                  detail: 'Asking "what are you working on?" every day feels like surveillance. It signals distrust. But waiting until things break is too late. You need visibility without the overhead.',
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-amber-500/10 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-white mb-3">{item.problem}</h3>
                  <p className="text-slate-400 leading-relaxed">{item.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== SOLUTION SECTION ========== */}
        <section className="relative px-6 py-24">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-950/20 to-transparent" />
          
          <div className="max-w-4xl mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-semibold text-white mb-6">
                SpireTrack solves this with simplicity
              </h2>
              
              <div className="prose prose-lg prose-invert max-w-none mb-12">
                <p className="text-slate-300 leading-relaxed text-lg mb-6">
                  The solution isn't more tools or more meetings. It's a simple weekly rhythm where 
                  everyone shares what they accomplished, what's next, and what's blocking them. 
                  Five minutes per person, once a week. That's it.
                </p>
                
                <p className="text-slate-300 leading-relaxed text-lg mb-6">
                  As a founder, you get a dashboard that shows you everything at a glance. Who 
                  submitted, who's blocked, what's happening across the team. No chasing updates. 
                  No scheduling conflicts. Just clarity, delivered automatically every week.
                </p>
              </div>
            </motion.div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Weekly visibility in 5 minutes',
                  desc: 'Each team member answers three questions once a week. You see everything in one dashboard. No meetings required.',
                },
                {
                  title: 'Blockers surface immediately',
                  desc: 'When someone is stuck, you know right away—not in next week\'s standup. Help arrives before problems compound.',
                },
                {
                  title: 'Async-first, meeting-free',
                  desc: 'No scheduled syncs required. Everyone submits on their own time. Perfect for focused, heads-down work.',
                },
                {
                  title: 'Recognition happens naturally',
                  desc: 'Wins are visible to the whole team. Good work gets noticed. People feel valued and stay motivated.',
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
                >
                  <div className="flex gap-4">
                    <CheckCircleIcon className="w-6 h-6 text-amber-400 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                      <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== WHY FOUNDERS CHOOSE SECTION ========== */}
        <section className="relative px-6 py-24">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-semibold text-white mb-4">
                Why founders choose SpireTrack
              </h2>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Setup in 2 minutes',
                  desc: 'No complex onboarding or configuration. Create a team, invite your people, start this week. It\'s that simple.',
                },
                {
                  title: 'Built for small teams',
                  desc: 'Not a bloated enterprise tool. Just what you need, nothing more. Scales with you as you grow.',
                },
                {
                  title: 'Free to start',
                  desc: 'Start free with your early team. No credit card required. Upgrade when you\'re ready.',
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
                    <span className="text-amber-400 font-bold text-lg">{idx + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== CTA SECTION ========== */}
        <section className="relative px-6 py-24">
          <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 to-transparent" />
          
          <div className="max-w-4xl mx-auto text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-6">
                Get your team aligned this week
              </h2>
              <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
                Join founders who've traded chaos for clarity. Setup takes 2 minutes. 
                No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-semibold hover:bg-slate-100 transition-colors shadow-lg"
                >
                  Start Free Today
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <Link
                  to="/for-teams"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white rounded-full font-medium hover:bg-white/10 transition-colors"
                >
                  For Larger Teams
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};
