import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { SEOHead } from '../components/SEOHead';

/**
 * Geekbot Alternative Page - Competitor Interception
 * 
 * Targets: geekbot alternative, geekbot vs spiretrack, best geekbot alternative
 * Intent: Users frustrated with Geekbot or comparing options
 */
export const GeekbotAlternative: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Best Geekbot Alternative 2026 — SpireTrack vs Geekbot Comparison"
        description="Looking for a Geekbot alternative? SpireTrack offers async standups PLUS team chat and project tracking. No Slack dependency. Free plan available. See the full comparison."
        keywords="geekbot alternative, geekbot vs spiretrack, best geekbot alternative, geekbot alternative free, geekbot competitor, replace geekbot, geekbot pricing, standup bot alternative, async standup tool, slack standup alternative, geekbot review"
        canonicalUrl="https://spiretrack.app/alternatives/geekbot"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
        {/* ========== HERO SECTION ========== */}
        <section className="relative px-6 py-24 sm:py-32 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
          </div>
          
          <div className="max-w-5xl mx-auto relative text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-full text-sm font-medium text-blue-300 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Comparison Guide 2026
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-6"
            >
              The Best{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Geekbot Alternative
              </span>
              {' '}in 2026
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-300 leading-relaxed mb-8 max-w-3xl mx-auto"
            >
              Geekbot is a Slack standup bot. SpireTrack is a <strong>complete team operating system</strong>. 
              Async standups, real-time team chat, project tracking — all in one place. 
              No Slack dependency. More features. Better price.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
              >
                Try SpireTrack Free
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <a
                href="#comparison"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white rounded-full font-medium hover:bg-white/10 transition-colors"
              >
                See Full Comparison
              </a>
            </motion.div>
          </div>
        </section>

        {/* ========== TL;DR SECTION ========== */}
        <section className="relative px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
            >
              <h2 className="text-2xl font-semibold text-white mb-4">TL;DR — Quick Summary</h2>
              <div className="grid md:grid-cols-2 gap-6 text-slate-300">
                <div>
                  <p className="font-semibold text-white mb-2">Choose Geekbot if:</p>
                  <ul className="space-y-2 text-sm">
                    <li>• You ONLY need daily standups in Slack</li>
                    <li>• Your team is under 5 people</li>
                    <li>• You don't need project context</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-emerald-400 mb-2">Choose SpireTrack if:</p>
                  <ul className="space-y-2 text-sm">
                    <li>• You want to REPLACE Slack noise, not add to it</li>
                    <li>• You need visibility beyond "what did you do yesterday"</li>
                    <li>• You want async standups + team chat + project tracking</li>
                    <li>• You're tired of paying $4+/user for just a bot</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ========== FEATURE COMPARISON TABLE ========== */}
        <section id="comparison" className="relative px-6 py-24">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
                Feature-by-Feature Comparison
              </h2>
              <p className="text-lg text-slate-400">
                See exactly what you get with each platform
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="overflow-x-auto"
            >
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-4 px-4 text-slate-400 font-medium">Feature</th>
                    <th className="py-4 px-4 text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-full">
                        <span className="font-semibold text-emerald-400">SpireTrack</span>
                      </div>
                    </th>
                    <th className="py-4 px-4 text-center">
                      <span className="text-slate-400">Geekbot</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    { feature: 'Async Daily Standups', spiretrack: true, geekbot: true },
                    { feature: 'Weekly Check-ins', spiretrack: true, geekbot: false },
                    { feature: 'Real-time Team Chat', spiretrack: true, geekbot: false },
                    { feature: 'Project Tracking', spiretrack: true, geekbot: false },
                    { feature: 'Team Analytics Dashboard', spiretrack: true, geekbot: 'limited' },
                    { feature: 'Works Without Slack', spiretrack: true, geekbot: false },
                    { feature: 'Custom Check-in Forms', spiretrack: true, geekbot: true },
                    { feature: 'Smart Reminders', spiretrack: true, geekbot: true },
                    { feature: 'File Sharing in Chat', spiretrack: true, geekbot: false },
                    { feature: 'Mobile App', spiretrack: true, geekbot: 'slack only' },
                    { feature: 'Free Plan', spiretrack: 'generous', geekbot: 'limited' },
                    { feature: 'Pricing', spiretrack: '$5/user', geekbot: '$4+/user' },
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 text-white font-medium">{row.feature}</td>
                      <td className="py-4 px-4 text-center">
                        {row.spiretrack === true ? (
                          <CheckIcon className="w-5 h-5 text-emerald-400 mx-auto" />
                        ) : row.spiretrack === false ? (
                          <XMarkIcon className="w-5 h-5 text-red-400 mx-auto" />
                        ) : (
                          <span className="text-emerald-400 text-xs font-medium">{row.spiretrack}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {row.geekbot === true ? (
                          <CheckIcon className="w-5 h-5 text-slate-400 mx-auto" />
                        ) : row.geekbot === false ? (
                          <XMarkIcon className="w-5 h-5 text-red-400 mx-auto" />
                        ) : (
                          <span className="text-slate-500 text-xs">{row.geekbot}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>
        </section>

        {/* ========== WHY SWITCH SECTION ========== */}
        <section className="relative px-6 py-24">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-950/20" />
          
          <div className="max-w-4xl mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-6">
                Why Teams Switch from Geekbot to SpireTrack
              </h2>
              
              <div className="prose prose-lg prose-invert max-w-none">
                <p className="text-slate-300 leading-relaxed text-lg mb-6">
                  Geekbot works well for what it is — a Slack bot that collects daily standups. 
                  But many teams discover that a standup bot isn't enough. Here's what we hear 
                  from teams who switched:
                </p>
              </div>
            </motion.div>

            <div className="space-y-6">
              {[
                {
                  pain: '"Slack is already too noisy. Adding another bot made it worse."',
                  solution: 'SpireTrack gives you a dedicated space for team updates — separate from the chaos of Slack. Clean, focused, searchable.',
                },
                {
                  pain: '"We needed more than just standups. We wanted project context."',
                  solution: 'SpireTrack includes project tracking and team chat. See updates alongside the actual work being done.',
                },
                {
                  pain: '"We wanted weekly check-ins, not daily. Geekbot felt too frequent."',
                  solution: 'SpireTrack\'s weekly rhythm is designed for modern teams. Deep reflection once a week beats shallow updates every day.',
                },
                {
                  pain: '"The bot kept pinging us. It felt more like surveillance than support."',
                  solution: 'SpireTrack\'s reminders are gentle and customizable. We respect focus time.',
                },
                {
                  pain: '"We\'re not a Slack-first team anymore. Geekbot doesn\'t work without it."',
                  solution: 'SpireTrack is a standalone platform. No Slack required (though we integrate if you want).',
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                >
                  <p className="text-slate-400 italic mb-3">{item.pain}</p>
                  <p className="text-white font-medium">→ {item.solution}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== FAQ SECTION (for featured snippets) ========== */}
        <section className="relative px-6 py-24">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-semibold text-white mb-4">
                Frequently Asked Questions
              </h2>
            </motion.div>

            <div className="space-y-4">
              {[
                {
                  q: 'Is SpireTrack really better than Geekbot?',
                  a: 'It depends on your needs. If you only need a Slack standup bot, Geekbot is fine. If you want a complete team operating system with chat, project tracking, and async check-ins — SpireTrack is the better choice.',
                },
                {
                  q: 'How much does SpireTrack cost compared to Geekbot?',
                  a: 'SpireTrack offers a generous free tier. Paid plans start at $5/user/month with unlimited features. Geekbot charges $4+/user but only provides the standup bot functionality.',
                },
                {
                  q: 'Can I import my data from Geekbot?',
                  a: 'We offer migration support for teams switching from Geekbot. Contact us and we\'ll help you get set up quickly.',
                },
                {
                  q: 'Does SpireTrack work with Slack?',
                  a: 'Yes! SpireTrack can integrate with Slack, but unlike Geekbot, it doesn\'t require Slack. You can use SpireTrack as a standalone platform or alongside your existing tools.',
                },
                {
                  q: 'What if my team is already used to Geekbot?',
                  a: 'SpireTrack has a similar workflow for async standups, so the transition is smooth. Most teams adapt within their first week. We also offer onboarding support.',
                },
              ].map((faq, idx) => (
                <motion.details
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-6 cursor-pointer text-white font-medium hover:bg-white/5 transition-colors">
                    {faq.q}
                    <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="px-6 pb-6 text-slate-400 leading-relaxed">
                    {faq.a}
                  </div>
                </motion.details>
              ))}
            </div>
          </div>
        </section>

        {/* ========== CTA SECTION ========== */}
        <section className="relative px-6 py-24">
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/30 to-transparent" />
          
          <div className="max-w-4xl mx-auto text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-6">
                Ready to upgrade from Geekbot?
              </h2>
              <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join hundreds of teams who've switched to SpireTrack for more features, 
                better pricing, and a complete team operating system — not just a bot.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-semibold hover:bg-slate-100 transition-colors shadow-lg"
                >
                  Start Free — No Credit Card
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white rounded-full font-medium hover:bg-white/10 transition-colors"
                >
                  View Pricing
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default GeekbotAlternative;
