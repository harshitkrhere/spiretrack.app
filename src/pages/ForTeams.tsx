import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { SEOHead } from '../components/SEOHead';

/**
 * For Teams Page - Comprehensive Long-Form Content
 * 
 * Purpose: Target teams looking for weekly alignment tools
 * Keywords: weekly team check-ins, async team reviews, team alignment
 */
export const ForTeams: React.FC = () => {
  return (
    <>
      <SEOHead
        title="SpireTrack for Teams — Weekly Check-ins That Actually Work | Team Productivity App"
        description="Built for teams that want visibility without the meeting overhead. Replace status meetings with 5-minute weekly reviews. Async-first, remote-friendly, simple to use. Free to start."
        keywords="spiretrack for teams, team check-in app, weekly team check-ins, async team reviews, team alignment tool, remote team management, team visibility software, team tracking app, team productivity software, weekly standup alternative, async standup app, remote work tools, distributed team software, team collaboration platform, team status updates, team progress tracking, engineering team tools, product team management, design team collaboration, sales team tracking, marketing team alignment, startup team software, enterprise team tools, hybrid team management, team meeting alternative, team sync tool, team dashboard software, team analytics, team performance tracking, team engagement software, employee check-in tool, staff management app, workforce visibility"
        canonicalUrl="https://spiretrack.app/for-teams"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
        {/* ========== HERO SECTION ========== */}
        <section className="relative px-6 py-24 sm:py-32 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px]" />
          </div>
          
          <div className="max-w-6xl mx-auto relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium text-white/80 mb-6"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  For Teams of All Sizes
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-6"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}
                >
                  Weekly check-ins that take{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                    5 minutes, not 50.
                  </span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg text-slate-300 leading-relaxed mb-8"
                >
                  SpireTrack replaces scattered status updates with a simple weekly rhythm. 
                  Everyone shares what they accomplished, what's next, and where they're stuck. 
                  Managers get complete visibility. Team members get recognition. No meetings required.
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
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
              
              {/* 3D Hero Image */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="relative"
              >
                <img 
                  src="/images/teams-hero-3d.png" 
                  alt="Team collaboration dashboard" 
                  className="w-full h-auto rounded-2xl"
                />
                {/* Floating card overlay */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -bottom-4 -left-4 bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <CheckCircleIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">100% Visibility</p>
                      <p className="text-sm text-slate-400">Team aligned</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ========== LONG-FORM PROBLEM SECTION ========== */}
        <section className="relative px-6 py-24">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-8">
                The hidden cost of not knowing what your team is working on
              </h2>
              
              <div className="prose prose-lg prose-invert max-w-none">
                <p className="text-slate-300 leading-relaxed text-lg mb-6">
                  Every week, the same pattern plays out in teams around the world. Monday arrives, and 
                  managers start the ritual of chasing updates. They scroll through Slack channels, dig 
                  through email threads, and try to piece together what happened last week. The information 
                  is scattered across a dozen places, and half of it is already outdated.
                </p>
                
                <p className="text-slate-300 leading-relaxed text-lg mb-6">
                  Then come the status meetings. Everyone gathers—in person or on a video call—and takes 
                  turns sharing updates. An hour passes. Most people zone out while others talk. The 
                  information could have been shared in a two-minute read, but instead, it consumed an 
                  hour of everyone's time. Multiply that by every team in the company, every week of the 
                  year, and the cost becomes staggering.
                </p>
                
                <p className="text-slate-300 leading-relaxed text-lg mb-6">
                  But here's what's really concerning: the meetings don't even solve the problem. By 
                  Tuesday, the updates are stale. Someone finishes a project. Someone else gets blocked. 
                  A new priority emerges. And you're back to chasing updates through DMs and hoping you 
                  don't miss something important.
                </p>

                <p className="text-slate-300 leading-relaxed text-lg mb-6">
                  The real damage isn't just wasted time—it's delayed decisions, missed blockers, and 
                  invisible work. When someone is stuck for three days before anyone notices, the project 
                  slips. When great work goes unrecognized, morale drops. When you can't see what's 
                  happening across your team, you can't lead effectively.
                </p>
              </div>
            </motion.div>
            
            {/* Problem Cards */}
            <div className="space-y-6">
              {[
                {
                  problem: 'The visibility problem',
                  detail: 'You lead a team, but you\'re flying blind between meetings. Updates are scattered across Slack, email, documents, and your own memory. There\'s no single source of truth. By the time you realize someone is blocked or going in the wrong direction, days have passed. The information you need exists—it\'s just buried in noise and impossible to find when you need it.',
                },
                {
                  problem: 'The meeting problem',
                  detail: 'Status meetings feel necessary, but they\'re a terrible use of time. Everyone waits their turn. Most people tune out. The format encourages rambling instead of clarity. And even when people share useful information, it\'s forgotten by the next day. You know there has to be a better way, but the alternative—having no visibility at all—seems worse.',
                },
                {
                  problem: 'The recognition problem',
                  detail: 'Great work happens on your team every week, but it often goes unnoticed. Wins get buried in the daily chaos. People ship features, solve hard problems, and help teammates—but nobody sees it. Over time, this takes a toll. People feel invisible. Morale suffers. Your best performers start looking elsewhere because they don\'t feel valued.',
                },
                {
                  problem: 'The blocker problem',
                  detail: 'When someone gets stuck, the clock starts ticking. Every hour they stay blocked is an hour lost. But without visibility, blockers stay hidden. People don\'t want to bother their manager with "small" issues. They try to solve it themselves. Days pass. By the time the blocker surfaces in a status meeting, the damage is done. The deadline slipped. The sprint failed.',
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors"
                >
                  <h3 className="text-xl font-semibold text-white mb-4">{item.problem}</h3>
                  <p className="text-slate-400 leading-relaxed">{item.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== THE SOLUTION SECTION ========== */}
        <section className="relative px-6 py-24">
          {/* Background gradient transition */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-950/30" />
          
          <div className="max-w-6xl mx-auto relative">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              {/* 3D Dashboard Image */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="sticky top-24"
              >
                <img 
                  src="/images/teams-dashboard-3d.png" 
                  alt="Team dashboard" 
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
              </motion.div>
              
              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-6">
                  There's a simpler way to stay aligned
                </h2>
                
                <div className="prose prose-lg prose-invert max-w-none mb-8">
                  <p className="text-slate-300 leading-relaxed text-lg mb-6">
                    What if you could see what your entire team accomplished this week in under two 
                    minutes? What if blockers surfaced immediately instead of waiting for the next 
                    meeting? What if great work was visible to everyone—automatically?
                  </p>
                  
                  <p className="text-slate-300 leading-relaxed text-lg mb-6">
                    SpireTrack makes this possible with a deceptively simple approach: structured 
                    weekly reviews. Once a week, every team member spends five minutes answering three 
                    questions. That's it. No meetings required. No complex tools to learn. Just a 
                    weekly rhythm that keeps everyone aligned.
                  </p>
                  
                  <p className="text-slate-300 leading-relaxed text-lg mb-6">
                    The questions are simple, but they capture everything that matters:
                  </p>
                </div>
                
                <div className="space-y-8 mb-8">
                  {[
                    {
                      question: 'What did you accomplish this week?',
                      explanation: 'This isn\'t a task list—it\'s a celebration. What shipped? What problems did you solve? What are you proud of? When teammates share their wins, good work becomes visible. Recognition happens naturally. Morale improves because people see that their work matters.',
                    },
                    {
                      question: 'What are you working on next week?',
                      explanation: 'This creates alignment. When everyone knows what everyone else is focused on, duplicate work disappears. Dependencies become visible early. Managers can spot potential issues before they become problems. The whole team moves in the same direction.',
                    },
                    {
                      question: 'Are you blocked on anything?',
                      explanation: 'This is where the magic happens. When someone is stuck, the whole team knows immediately—not in next week\'s standup, not in a Friday retrospective. Right now. Help can arrive in hours instead of days. Problems get solved before they derail projects.',
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-400 font-bold text-lg">{idx + 1}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-white text-lg mb-2">{item.question}</p>
                        <p className="text-slate-400 leading-relaxed">{item.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="prose prose-lg prose-invert max-w-none">
                  <p className="text-slate-300 leading-relaxed text-lg">
                    The beauty of this system is its simplicity. Five minutes per person, once a week. 
                    No scheduling conflicts. No timezone issues. No "let's sync up later." Just clear, 
                    structured information that flows automatically to everyone who needs it.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ========== HOW IT WORKS IN PRACTICE ========== */}
        <section className="relative px-6 py-24">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-6">
                What a week with SpireTrack looks like
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Here's how SpireTrack transforms your team's weekly rhythm from chaos to clarity.
              </p>
            </motion.div>

            <div className="space-y-12">
              {[
                {
                  day: 'Friday Afternoon',
                  title: 'Team members submit their weekly reviews',
                  content: 'At a time that works for them—could be 2pm or 6pm, doesn\'t matter—each team member opens SpireTrack and spends five minutes answering the three questions. They reflect on their week, note their wins, share their focus for next week, and flag any blockers. The whole thing takes less time than waiting for coffee to brew.',
                },
                {
                  day: 'Friday Evening',
                  title: 'SpireTrack compiles everything automatically',
                  content: 'No manual aggregation needed. SpireTrack collects all submissions and organizes them into a clear, scannable view. Blockers are highlighted. Wins are celebrated. The team\'s collective progress becomes visible at a glance. Anyone who hasn\'t submitted gets a gentle reminder.',
                },
                {
                  day: 'Monday Morning',
                  title: 'Managers start the week with complete visibility',
                  content: 'Instead of scheduling a status meeting, managers open their dashboard and see everything in two minutes. What did the team accomplish? What\'s on deck? Who needs help? All the information they need to make decisions, prioritize, and support their team—without a single meeting.',
                },
                {
                  day: 'Throughout the Week',
                  title: 'Blockers get resolved quickly',
                  content: 'When a blocker is flagged, the right people are notified immediately. No waiting for the next standup. No hoping the manager notices. The person who can help sees it right away and can step in. Problems that used to take days to surface and resolve now get fixed in hours.',
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex gap-6"
                >
                  <div className="flex-shrink-0 w-32">
                    <div className="text-emerald-400 font-semibold text-sm uppercase tracking-wide">
                      {item.day}
                    </div>
                  </div>
                  <div className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{item.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== FEATURES SECTION ========== */}
        <section className="relative px-6 py-24">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50" />
          
          <div className="max-w-6xl mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
                Everything your team needs to stay aligned
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                SpireTrack is intentionally focused. We built what matters and left out the bloat. 
                Every feature exists to solve a real problem.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: '/images/icon-reviews.png',
                  title: 'Weekly Reviews',
                  desc: 'Structured check-ins that capture wins, plans, and blockers. Takes five minutes to complete. Provides a week\'s worth of clarity. The foundation of everything else.',
                },
                {
                  icon: '/images/icon-dashboard.png',
                  title: 'Team Dashboard',
                  desc: 'See your entire team\'s status at a glance. Who submitted, who\'s blocked, what\'s happening. Filter by person, by date, by status. The visibility you\'ve always wanted.',
                },
                {
                  icon: '/images/icon-reminders.png',
                  title: 'Smart Reminders',
                  desc: 'Gentle nudges that go out automatically so you don\'t have to chase people. Customizable timing. Respectful of focus time. Set it once, forget it forever.',
                },
                {
                  icon: '/images/icon-analytics.png',
                  title: 'Team Analytics',
                  desc: 'Submission rates, team health trends, engagement patterns over time. Spot potential issues before they become problems. Data that helps you lead better.',
                },
                {
                  icon: '/images/icon-forms.png',
                  title: 'Custom Forms',
                  desc: 'The default questions work great, but you can customize them. Add questions specific to your team. Create different templates for different purposes.',
                },
                {
                  icon: '/images/icon-chat.png',
                  title: 'Team Chat',
                  desc: 'Context-rich messaging for follow-ups and discussions. Comments on submissions. Threads that keep conversations organized. Everything in one place.',
                },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group"
                >
                  <img 
                    src={feature.icon} 
                    alt={feature.title} 
                    className="w-14 h-14 mb-4 group-hover:scale-110 transition-transform"
                  />
                  <h3 className="font-semibold text-white text-lg mb-2">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== TEAM TYPES SECTION ========== */}
        <section className="relative px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
                Built for every type of team
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Whether you're fully remote, hybrid, or in-person, SpireTrack adapts to how your team works.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
              {/* 3D Sync Image */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <img 
                  src="/images/teams-sync-3d.png" 
                  alt="Team synchronization" 
                  className="w-full h-auto rounded-2xl"
                />
              </motion.div>
              
              {/* Team Types */}
              <div className="space-y-10">
                {[
                  {
                    title: 'Remote Teams',
                    desc: 'When your team is spread across time zones, synchronous meetings become a nightmare. Someone is always joining at midnight or missing their morning with their kids. SpireTrack\'s async-first approach changes everything. Everyone submits on their own schedule. The whole team stays aligned without anyone sacrificing their personal time. No more "can we find a time that works for everyone?" Just clarity, delivered asynchronously.',
                    color: 'from-blue-500 to-cyan-500',
                  },
                  {
                    title: 'Hybrid Teams',
                    desc: 'The biggest challenge with hybrid work isn\'t the technology—it\'s the information asymmetry. People in the office overhear conversations, catch each other in the hallway, get context that remote workers miss. SpireTrack levels the playing field. Everyone shares the same written updates. Everyone has access to the same information. Location doesn\'t determine how informed you are.',
                    color: 'from-violet-500 to-purple-500',
                  },
                  {
                    title: 'Growing Teams',
                    desc: 'There\'s a moment in every team\'s growth when informal communication stops working. At five people, you know what everyone is doing. At fifteen, you don\'t. At twenty-five, you\'re drowning. SpireTrack helps you maintain alignment as you scale. New hires understand the rhythm from day one. Managers stay connected without micromanaging. The system that worked for your small team keeps working as you grow.',
                    color: 'from-amber-500 to-orange-500',
                  },
                ].map((team, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className={`w-1 rounded-full bg-gradient-to-b ${team.color}`} />
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-3">{team.title}</h3>
                      <p className="text-slate-400 leading-relaxed">{team.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========== STATS SECTION ========== */}
        <section className="relative px-6 py-24">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/20 to-transparent" />
          
          <div className="max-w-4xl mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-semibold text-white mb-4">
                The results speak for themselves
              </h2>
              <p className="text-lg text-slate-400">
                Teams using SpireTrack report measurable improvements in alignment and productivity.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { value: '5 min', label: 'Average check-in time', detail: 'Down from 60+ minutes in status meetings' },
                { value: '85%', label: 'Fewer status meetings', detail: 'More time for actual work' },
                { value: '3x', label: 'Faster blocker resolution', detail: 'Problems solved in hours, not days' },
                { value: '100%', label: 'Team visibility', detail: 'Everyone knows what everyone is doing' },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl"
                >
                  <p className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-2">
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-white mb-1">{stat.label}</p>
                  <p className="text-xs text-slate-500">{stat.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== GETTING STARTED SECTION ========== */}
        <section className="relative px-6 py-24">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-semibold text-white mb-4">
                Getting started takes two minutes
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                No lengthy setup. No training required. No "implementation period." 
                You can have your team submitting reviews this week.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '1',
                  title: 'Create your team',
                  desc: 'Sign up for free (no credit card needed) and create your team. Give it a name. That\'s it. Takes about 30 seconds.',
                },
                {
                  step: '2',
                  title: 'Invite your people',
                  desc: 'Share an invite link or add people by email. They\'ll get a welcome message explaining how it works. No training needed—the system is intuitive.',
                },
                {
                  step: '3',
                  title: 'Start your weekly rhythm',
                  desc: 'Set a deadline (Friday afternoon works well for most teams). Team members submit their reviews. You see everything in one place. Done.',
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
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
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
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/30 to-transparent" />
          
          <div className="max-w-4xl mx-auto text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-6">
                Ready to transform how your team stays aligned?
              </h2>
              <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join the teams who've traded scattered updates for structured clarity. 
                Weekly check-ins that actually work. No credit card required. 
                Setup in two minutes. Cancel anytime.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-semibold hover:bg-slate-100 transition-colors shadow-lg"
                >
                  Start Your Team Free
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

export default ForTeams;
