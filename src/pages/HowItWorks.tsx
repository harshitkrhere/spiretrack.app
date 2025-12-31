import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { SEOHead } from '../components/SEOHead';

/**
 * How It Works Page - Unified Dark Theme Design
 */
export const HowItWorks: React.FC = () => {
  return (
    <>
      <SEOHead
        title="How SpireTrack Works — Simple Weekly Team Check-ins"
        description="Learn how SpireTrack replaces status meetings with 5-minute weekly reviews. Three simple steps: submit, review, act. No complex setup required."
        keywords="how weekly check-ins work, team review process, async team updates, simple team tracking"
        canonicalUrl="https://spiretrack.app/how-it-works"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
        {/* ========== HERO SECTION ========== */}
        <section className="relative px-6 py-24 sm:py-32 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px]" />
          </div>
          
          <div className="max-w-4xl mx-auto text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium text-white/80 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Simple Process
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-6"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}
            >
              How SpireTrack{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
                Works
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
            >
              Replace hour-long status meetings with a simple weekly rhythm. 
              Three steps. Five minutes. Complete team visibility.
            </motion.p>
          </div>
        </section>

        {/* ========== THE PROBLEM SECTION ========== */}
        <section className="relative px-6 py-24">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-semibold text-white mb-8">
                The problem with traditional status updates
              </h2>
              
              <div className="prose prose-lg prose-invert max-w-none mb-12">
                <p className="text-slate-300 leading-relaxed text-lg mb-6">
                  Most teams waste hours every week in status meetings. People gather in a room 
                  (or a video call), wait their turn, and share updates that could have been written 
                  in two minutes. Meanwhile, important information gets lost between meetings.
                </p>
                
                <p className="text-slate-300 leading-relaxed text-lg mb-6">
                  Managers chase updates through Slack, email, and spreadsheets. Team members feel 
                  invisible when their work goes unnoticed. Blockers stay hidden until they become 
                  project delays. There has to be a better way.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ========== THREE STEPS SECTION ========== */}
        <section className="relative px-6 py-24">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent" />
          
          <div className="max-w-5xl mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
                Three simple steps
              </h2>
              <p className="text-lg text-slate-400">
                SpireTrack creates a weekly rhythm that keeps everyone aligned.
              </p>
            </motion.div>

            <div className="space-y-20">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid lg:grid-cols-2 gap-12 items-center"
              >
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-full text-sm font-semibold mb-6">
                    Step 1
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    Team members submit weekly reviews
                  </h3>
                  <p className="text-slate-300 leading-relaxed mb-6">
                    Every week, each team member spends 5 minutes answering three simple questions. 
                    No meetings, no scheduling conflicts. Everyone submits on their own time.
                  </p>
                  <ul className="space-y-3">
                    {[
                      'What did you accomplish this week?',
                      'What are you working on next?',
                      'Are you blocked on anything?',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircleIcon className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="text-sm text-slate-500 mb-4">Weekly Review</div>
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="text-sm font-medium text-slate-300 mb-2">This week's wins</div>
                      <div className="text-slate-500 text-sm">Completed API integration...</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="text-sm font-medium text-slate-300 mb-2">Next week's focus</div>
                      <div className="text-slate-500 text-sm">Launch beta to 10 users...</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="text-sm font-medium text-slate-300 mb-2">Blockers</div>
                      <div className="text-slate-500 text-sm">Waiting on design review...</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid lg:grid-cols-2 gap-12 items-center"
              >
                <div className="order-2 lg:order-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="text-sm text-slate-500 mb-4">Team Dashboard</div>
                  <div className="space-y-3">
                    {['Sarah Chen', 'Alex Kumar', 'Maya Rivera'].map((name, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500/30 to-blue-500/30 flex items-center justify-center text-teal-400 text-sm font-medium">
                            {name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm font-medium text-slate-300">{name}</span>
                        </div>
                        <span className="text-xs text-teal-400 bg-teal-500/20 px-2 py-1 rounded border border-teal-500/30">Submitted</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/20 border border-teal-500/30 text-teal-400 rounded-full text-sm font-semibold mb-6">
                    Step 2
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    Managers see everything in one place
                  </h3>
                  <p className="text-slate-300 leading-relaxed mb-6">
                    All reviews are collected automatically. Managers get a clear view of 
                    the whole team without scheduling a single meeting or chasing anyone for updates.
                  </p>
                  <ul className="space-y-3">
                    {[
                      'What the whole team accomplished',
                      'Who needs help or is blocked',
                      'Team morale and engagement trends',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircleIcon className="w-6 h-6 text-teal-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid lg:grid-cols-2 gap-12 items-center"
              >
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/20 border border-violet-500/30 text-violet-400 rounded-full text-sm font-semibold mb-6">
                    Step 3
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    Take action on what matters
                  </h3>
                  <p className="text-slate-300 leading-relaxed mb-6">
                    With visibility comes clarity. Teams can act quickly on blockers, 
                    celebrate wins together, and make better decisions with real-time data.
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Unblock teammates before problems escalate',
                      'Celebrate wins and build momentum',
                      'Make better decisions with real-time data',
                      'Skip the Monday status meeting entirely',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircleIcon className="w-6 h-6 text-violet-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 backdrop-blur-sm border border-violet-500/30 rounded-2xl p-6">
                  <div className="text-lg font-semibold text-white mb-6">Results</div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <span className="text-slate-300">Status meetings</span>
                      <span className="font-bold text-violet-400">-85%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <span className="text-slate-300">Team visibility</span>
                      <span className="font-bold text-violet-400">100%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <span className="text-slate-300">Time per check-in</span>
                      <span className="font-bold text-violet-400">5 min</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ========== WHY IT WORKS SECTION ========== */}
        <section className="relative px-6 py-24">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-semibold text-white mb-4">
                Why this approach works
              </h2>
            </motion.div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Async by default',
                  desc: 'Team members submit reviews on their schedule. No synchronous meetings required. Works across any timezone.',
                },
                {
                  title: 'Low friction',
                  desc: 'Three questions, five minutes. Simple enough that people actually do it. No training needed.',
                },
                {
                  title: 'Automatic visibility',
                  desc: 'Everyone sees the same picture. No chasing updates through DMs or waiting for the next standup.',
                },
                {
                  title: 'Problems surface early',
                  desc: 'Blockers become visible the moment they\'re reported. Help can arrive in hours, not days.',
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
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
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
                Ready to try a simpler way?
              </h2>
              <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
                Start free. No credit card required. Set up your first team in under 2 minutes.
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
