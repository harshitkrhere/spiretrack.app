import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { SEOHead } from '../components/SEOHead';

/**
 * For Small Business Page - Unified Dark Theme with Blue/Cyan Accents
 */
export const ForSmallBusiness: React.FC = () => {
  return (
    <>
      <SEOHead
        title="SpireTrack for Small Business — Simple Team Tracking That Works"
        description="Built for small businesses that need team visibility without complexity. Weekly check-ins, clear communication, no learning curve. Free to start."
        keywords="small business productivity, simple team tracking, small team management, lightweight project tracking"
        canonicalUrl="https://spiretrack.app/for-small-business"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
        {/* ========== HERO SECTION ========== */}
        <section className="relative px-6 py-24 sm:py-32 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
          </div>
          
          <div className="max-w-4xl mx-auto text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium text-white/80 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              For Small Businesses
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-6"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}
            >
              Keep your team on the same page.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Without the enterprise overhead.
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8"
            >
              SpireTrack is team tracking built for small businesses. Simple enough 
              to use on day one. Powerful enough to scale as you grow.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg"
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
                Running a small business is hard enough
              </h2>
              
              <div className="prose prose-lg prose-invert max-w-none mb-12">
                <p className="text-slate-300 leading-relaxed text-lg mb-6">
                  You shouldn't need a full-time project manager just to know what your team is 
                  working on. You shouldn't need enterprise software with a three-month implementation 
                  period. And you definitely shouldn't need to spend hours every week in status meetings.
                </p>
                
                <p className="text-slate-300 leading-relaxed text-lg mb-6">
                  Small businesses need simple tools that work from day one. Tools that don't require 
                  training programs or dedicated administrators. Tools that fit the way you already 
                  work—not the other way around.
                </p>
                
                <p className="text-slate-300 leading-relaxed text-lg mb-6">
                  That's why we built SpireTrack. A straightforward way to keep your team aligned 
                  without the complexity that comes with enterprise solutions.
                </p>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  problem: 'Complex tools don\'t fit',
                  detail: 'Jira and Asana are built for large enterprises with dedicated project managers. You need something simpler—a tool that works without training and doesn\'t require someone to manage it.',
                },
                {
                  problem: 'Updates fall through the cracks',
                  detail: 'Without a system, important information gets lost between meetings and messages. Someone finished a project, but nobody knows. Someone is stuck, but nobody heard about it.',
                },
                {
                  problem: 'You don\'t have time to chase updates',
                  detail: 'As a small business owner or manager, you can\'t spend hours tracking down status reports. You have customers to serve, problems to solve, a business to run.',
                },
                {
                  problem: 'Everyone is wearing multiple hats',
                  detail: 'Your team is already stretched thin. The last thing they need is another tool that adds to their workload. They need something fast and lightweight.',
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
                  <h3 className="text-lg font-semibold text-white mb-3">{item.problem}</h3>
                  <p className="text-slate-400 leading-relaxed">{item.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== SOLUTION SECTION ========== */}
        <section className="relative px-6 py-24">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent" />
          
          <div className="max-w-4xl mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-semibold text-white mb-6">
                SpireTrack is built for businesses like yours
              </h2>
              
              <div className="prose prose-lg prose-invert max-w-none mb-12">
                <p className="text-slate-300 leading-relaxed text-lg mb-6">
                  We designed SpireTrack with small businesses in mind. No complex features you'll 
                  never use. No enterprise pricing with seats and tiers. Just a simple weekly rhythm 
                  that keeps your team aligned.
                </p>
                
                <p className="text-slate-300 leading-relaxed text-lg mb-6">
                  Here's how it works: once a week, each team member takes five minutes to answer 
                  three questions—what they accomplished, what's coming next, and whether anything 
                  is blocking them. You get a dashboard showing everything at a glance.
                </p>
                
                <p className="text-slate-300 leading-relaxed text-lg mb-6">
                  That's it. No training needed. No monthly "adoption" meetings. No wondering if 
                  people are using it correctly. It just works.
                </p>
              </div>
            </motion.div>
            
            <div className="space-y-6">
              {[
                {
                  title: 'No learning curve',
                  desc: 'Your team can start using SpireTrack in minutes. Three questions, once a week. If they can fill out a simple form, they already know how to use SpireTrack.',
                },
                {
                  title: 'Everything in one place',
                  desc: 'See what everyone is working on, what they accomplished, and where they need help—all in one dashboard. No more hunting through Slack or email.',
                },
                {
                  title: 'Works with how you work',
                  desc: 'Whether your team is in the office, remote, or hybrid, SpireTrack keeps everyone connected. Async by default, so no scheduling conflicts.',
                },
                {
                  title: 'Scales with your business',
                  desc: 'Start free with a small team. Add more people as you grow. Simple pricing, no surprises. The same tool that works for 5 people works for 50.',
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                >
                  <CheckCircleIcon className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== USE CASES SECTION ========== */}
        <section className="relative px-6 py-24">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-semibold text-white mb-4">
                Small businesses using SpireTrack
              </h2>
              <p className="text-lg text-slate-400">
                Teams across industries rely on SpireTrack to stay aligned.
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Marketing Agencies',
                  desc: 'Track client projects and team capacity without complex project management tools. Know who\'s working on what, always.',
                },
                {
                  title: 'Service Businesses',
                  desc: 'Keep field teams and office staff aligned on priorities and deadlines. Everyone stays on the same page.',
                },
                {
                  title: 'Growing Startups',
                  desc: 'Maintain team visibility as you scale from 5 to 50 people. The same simple system grows with you.',
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
                  <div className="w-2 h-2 rounded-full bg-blue-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== GETTING STARTED SECTION ========== */}
        <section className="relative px-6 py-24">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent" />
          
          <div className="max-w-4xl mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-semibold text-white mb-4">
                Getting started takes two minutes
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                No complex setup. No training required. You can have your team aligned this week.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '1',
                  title: 'Create your team',
                  desc: 'Sign up for free (no credit card needed) and create your team. Give it a name. That\'s it.',
                },
                {
                  step: '2',
                  title: 'Invite your people',
                  desc: 'Share an invite link or add people by email. They\'ll know exactly what to do.',
                },
                {
                  step: '3',
                  title: 'Start your rhythm',
                  desc: 'Set a weekly deadline. Team members submit. You see everything. Done.',
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
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                    {item.step}
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
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent" />
          
          <div className="max-w-4xl mx-auto text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-6">
                Start keeping your team aligned today
              </h2>
              <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
                Free for small teams. No credit card required. Setup in 2 minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-semibold hover:bg-slate-100 transition-colors shadow-lg"
                >
                  Get Started Free
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <Link
                  to="/features"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white rounded-full font-medium hover:bg-white/10 transition-colors"
                >
                  See All Features
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};
