import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon, StarIcon } from '@heroicons/react/24/solid';
import { SEOHead } from '../components/SEOHead';

/**
 * Best Async Standup Tools Page - Ranking/Comparison
 * 
 * Targets: best async standup tools, async standup software, standup tool comparison
 * Intent: Users researching options before buying
 */
export const AsyncStandupTools: React.FC = () => {
  const tools = [
    {
      rank: 1,
      name: 'SpireTrack',
      tagline: 'Best Overall',
      description: 'The only tool that combines async check-ins, real-time team chat, AND project tracking. No Slack dependency. Generous free tier.',
      pros: ['All-in-one platform', 'Works standalone', 'Weekly + daily options', 'Built-in team chat', 'Project tracking included'],
      cons: ['Newer to market'],
      pricing: 'Free tier, $5/user/month',
      rating: 4.9,
      isTopPick: true,
      link: '/register',
    },
    {
      rank: 2,
      name: 'Geekbot',
      tagline: 'Best for Slack Loyalists',
      description: 'A solid Slack bot for daily standups. If you live in Slack and just need a simple bot, it works.',
      pros: ['Deep Slack integration', 'Simple setup', 'Custom questions'],
      cons: ['Slack-only', 'No project context', 'Gets noisy', 'Limited free tier'],
      pricing: '$4+/user/month',
      rating: 4.2,
      isTopPick: false,
      link: '/alternatives/geekbot',
    },
    {
      rank: 3,
      name: 'Range.co',
      tagline: 'Best for Enterprises',
      description: 'Full-featured platform with goal tracking and deep integrations. Great for large orgs with budget.',
      pros: ['Goal/OKR tracking', 'Many integrations', 'Enterprise features'],
      cons: ['Expensive', 'Slow', 'Overkill for most teams'],
      pricing: '$8+/user/month',
      rating: 4.0,
      isTopPick: false,
    },
    {
      rank: 4,
      name: 'Friday.app',
      tagline: 'Best for Goal Setting',
      description: 'Focuses on OKRs and weekly planning alongside check-ins. Good for goal-oriented teams.',
      pros: ['OKR integration', 'Planning tools', 'Clean UI'],
      cons: ['No real-time chat', 'Limited integrations'],
      pricing: '$5+/user/month',
      rating: 3.9,
      isTopPick: false,
    },
    {
      rank: 5,
      name: 'StatusHero',
      tagline: 'Honorable Mention',
      description: 'Simple, focused standup tool. Does one thing reasonably well.',
      pros: ['Simple', 'Focused'],
      cons: ['Dated UI', 'Limited features', 'No chat'],
      pricing: '$3+/user/month',
      rating: 3.5,
      isTopPick: false,
    },
    {
      rank: 6,
      name: 'Standuply',
      tagline: 'Best for Slack Power Users',
      description: 'Advanced Slack workflows and automation. Powerful but complex.',
      pros: ['Advanced automation', 'Flexible workflows'],
      cons: ['Complex setup', 'Bot fatigue', 'Slack-only'],
      pricing: '$5+/user/month',
      rating: 3.8,
      isTopPick: false,
    },
  ];

  return (
    <>
      <SEOHead
        title="7 Best Async Standup Tools in 2026 — Compared & Ranked"
        description="Looking for the best async standup tool? We compared SpireTrack, Geekbot, Range, Friday, StatusHero, and more. See features, pricing, and which one is right for your team."
        keywords="best async standup tools, async standup software, standup tool comparison, daily standup alternative, async standup app, team check-in tools, standup bot comparison, remote standup tools, weekly standup software"
        canonicalUrl="https://spiretrack.app/best-async-standup-tools"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
        {/* ========== HERO ========== */}
        <section className="relative px-6 py-24 sm:py-32 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
          </div>
          
          <div className="max-w-4xl mx-auto relative text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 rounded-full text-sm font-medium text-purple-300 mb-6"
            >
              <StarIcon className="w-4 h-4" />
              Updated January 2026
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-6"
            >
              The{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">
                7 Best Async Standup Tools
              </span>
              {' '}in 2026
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-300 leading-relaxed mb-8 max-w-3xl mx-auto"
            >
              Daily standups don't work for remote teams. Async standup tools let your team 
              share updates on their own schedule. Here's our honest ranking of the best options.
            </motion.p>
          </div>
        </section>

        {/* ========== RANKINGS ========== */}
        <section className="relative px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {tools.map((tool, idx) => (
                <motion.article
                  key={tool.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`relative bg-white/5 backdrop-blur-sm border rounded-2xl p-8 ${
                    tool.isTopPick 
                      ? 'border-emerald-500/50 ring-2 ring-emerald-500/20' 
                      : 'border-white/10'
                  }`}
                >
                  {tool.isTopPick && (
                    <div className="absolute -top-3 left-6">
                      <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                        ⭐ Our Top Pick
                      </span>
                    </div>
                  )}
                  
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Rank Badge */}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      tool.rank === 1 
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-500' 
                        : 'bg-white/10'
                    }`}>
                      <span className={`text-2xl font-bold ${tool.rank === 1 ? 'text-white' : 'text-slate-400'}`}>
                        #{tool.rank}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h2 className="text-2xl font-semibold text-white">{tool.name}</h2>
                        <span className="px-2 py-1 bg-white/10 text-slate-300 text-xs rounded-full">
                          {tool.tagline}
                        </span>
                        <div className="flex items-center gap-1 text-amber-400">
                          <StarIcon className="w-4 h-4" />
                          <span className="text-sm font-medium">{tool.rating}</span>
                        </div>
                      </div>
                      
                      <p className="text-slate-400 mb-4">{tool.description}</p>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Pros</p>
                          <ul className="space-y-1">
                            {tool.pros.map((pro, i) => (
                              <li key={i} className="text-sm text-slate-300 flex items-center gap-2">
                                <span className="text-emerald-400">✓</span> {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Cons</p>
                          <ul className="space-y-1">
                            {tool.cons.map((con, i) => (
                              <li key={i} className="text-sm text-slate-400 flex items-center gap-2">
                                <span className="text-red-400">✗</span> {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="text-sm text-slate-500">
                          <strong className="text-white">Pricing:</strong> {tool.pricing}
                        </span>
                        {tool.link && (
                          <Link
                            to={tool.link}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                              tool.isTopPick
                                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                          >
                            {tool.isTopPick ? 'Try Free' : 'Compare'}
                            <ArrowRightIcon className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* ========== VERDICT ========== */}
        <section className="relative px-6 py-24">
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/30 to-transparent" />
          
          <div className="max-w-4xl mx-auto text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-6">
                Our Verdict: SpireTrack Wins
              </h2>
              <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                If you just need a Slack standup bot, Geekbot works. But if you want a 
                <strong> complete team operating system</strong> — async check-ins, team chat, 
                project tracking — SpireTrack is the clear winner.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-semibold hover:bg-slate-100 transition-colors shadow-lg"
              >
                Try SpireTrack Free
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AsyncStandupTools;
