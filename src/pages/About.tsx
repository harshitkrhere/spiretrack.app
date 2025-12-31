import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { SEOHead } from '../components/SEOHead';

// ============================================
// SPIRETRACK ABOUT PAGE
// Comprehensive design with 3D graphics
// ============================================

const AboutPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="About SpireTrack — Simple Weekly Team Check-ins"
        description="Learn why we built SpireTrack. We believe the best teams aren't the ones with the most meetings—they're the ones with the clearest systems. Simple weekly alignment for modern teams."
        keywords="about SpireTrack, team alignment company, weekly check-in tool, async team management, team productivity mission"
        canonicalUrl="https://spiretrack.app/about"
      />
      <div className="min-h-screen bg-white overflow-hidden">
      {/* ========== HERO SECTION WITH 3D ART ========== */}
      <section className="relative px-6 py-32 sm:py-40 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* 3D Hero Image */}
        <div className="absolute inset-0 opacity-60">
          <img 
            src="/images/about-hero-3d.png" 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900" />
        
        {/* Animated Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-[10%] w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-400/20 backdrop-blur-sm border border-white/10"
          />
          <motion.div 
            animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-32 right-[15%] w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-400/20 backdrop-blur-sm border border-white/10"
          />
          <motion.div 
            animate={{ y: [0, 15, 0], x: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-32 left-[20%] w-12 h-12 rounded-lg bg-gradient-to-br from-violet-400/20 to-purple-400/20 backdrop-blur-sm border border-white/10"
          />
          <motion.div 
            animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-40 right-[25%] w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-400/10 to-emerald-400/10 backdrop-blur-sm border border-white/10"
          />
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-sm font-medium text-white/80">About SpireTrack</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white leading-tight tracking-tight"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}
          >
            Make team alignment<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
              simpler, faster, and visible.
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            SpireTrack is where teams stay in sync. Weekly check-ins, 
            async communication, and actionable insights—all in one place.
          </motion.p>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
          >
            <div className="w-1 h-2 rounded-full bg-white/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* ========== BUILDING THE FUTURE SECTION ========== */}
      <section className="px-6 py-24 sm:py-32 bg-white relative">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-5">
          <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-emerald-500" style={{ filter: 'blur(100px)' }} />
        </div>
        
        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-sm font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Our Mission
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 mb-8"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>
                Building the weekly rhythm for modern teams
              </h2>
              
              <div className="space-y-6">
                <p className="text-lg text-slate-600 leading-relaxed">
                  SpireTrack was born from a simple observation: the best teams aren't the ones with 
                  the most meetings—they're the ones with the clearest systems.
                </p>
                
                <p className="text-lg text-slate-600 leading-relaxed">
                  We watched countless teams struggle with scattered updates across Slack, email, and 
                  spreadsheets. Status meetings consuming hours but producing little alignment. 
                  Managers flying blind between quarterly reviews.
                </p>
                
                <p className="text-lg text-slate-600 leading-relaxed">
                  So we built something different. A structured weekly rhythm where every team member 
                  spends just five minutes sharing their wins, blockers, and focus areas. That's it.
                </p>
              </div>
              
              <div className="mt-8 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                  <span className="text-2xl">⚡</span>
                  <span className="text-sm font-medium text-slate-700">5 min weekly check-ins</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                  <span className="text-2xl">🎯</span>
                  <span className="text-sm font-medium text-slate-700">100% team visibility</span>
                </div>
              </div>
            </motion.div>

            {/* 3D Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="/images/about-team-3d.png" 
                  alt="Team collaboration" 
                  className="w-full h-auto"
                />
                {/* Glass overlay card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-lg rounded-2xl p-4 border border-white/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <span className="text-white text-lg">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Team Aligned</p>
                      <p className="text-sm text-slate-500">8 members synced this week</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
              >
                Async-First 🚀
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== STATS SECTION WITH 3D CARDS ========== */}
      <section className="px-6 py-24 sm:py-32 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
        
        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 mb-4"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>
              The impact of better alignment
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              When teams know what each other are working on, everything moves faster.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: '5', unit: 'min', label: 'Average check-in time', icon: '⏱️', color: 'from-emerald-500 to-teal-500' },
              { value: '85', unit: '%', label: 'Fewer status meetings', icon: '📉', color: 'from-blue-500 to-cyan-500' },
              { value: '3', unit: 'x', label: 'Faster issue resolution', icon: '🚀', color: 'from-violet-500 to-purple-500' },
              { value: '100', unit: '%', label: 'Team visibility', icon: '👁️', color: 'from-orange-500 to-red-500' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20, rotateX: -10 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                className="relative group"
                style={{ perspective: '1000px' }}
              >
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-full transition-all duration-300">
                  {/* Icon */}
                  <div className="text-3xl mb-4">{stat.icon}</div>
                  
                  {/* Value */}
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className={`text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </span>
                    <span className="text-2xl font-semibold text-slate-400">{stat.unit}</span>
                  </div>
                  
                  {/* Label */}
                  <p className="text-sm text-slate-600">{stat.label}</p>
                  
                  {/* Decorative gradient line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== WHO WE ARE SECTION ========== */}
      <section className="px-6 py-24 sm:py-32 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* 3D Analytics Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative order-2 lg:order-1"
            >
              <div className="relative">
                <img 
                  src="/images/about-analytics-3d.png" 
                  alt="Analytics dashboard" 
                  className="w-full h-auto rounded-3xl shadow-xl"
                />
                
                {/* Floating cards */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <span className="text-emerald-600">📊</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Submissions</p>
                      <p className="font-bold text-slate-900">94%</p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600">😊</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Team Morale</p>
                      <p className="font-bold text-slate-900">High</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Who We Are
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 mb-8"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>
                A team that believes in working smarter, not louder
              </h2>
              
              <div className="space-y-6">
                <p className="text-lg text-slate-600 leading-relaxed">
                  We're a small, focused team that's been on both sides of the alignment problem. 
                  We've led distributed teams across time zones and felt the frustration of never 
                  knowing what was actually happening.
                </p>
                
                <p className="text-lg text-slate-600 leading-relaxed">
                  SpireTrack is the tool we wished existed. We built it for ourselves first, 
                  then realized other teams had the exact same problems. Now we're on a mission 
                  to help every team find their rhythm.
                </p>
              </div>
              
              {/* Values Grid */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: '🌐', label: 'Remote-First' },
                  { icon: '🔇', label: 'Async by Default' },
                  { icon: '✨', label: 'Simplicity First' },
                  { icon: '🤝', label: 'Team Focused' },
                ].map((value, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <span className="text-2xl">{value.icon}</span>
                    <span className="font-medium text-slate-700">{value.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== THE SPIRETRACK WAY ========== */}
      <section className="px-6 py-24 sm:py-32 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -left-1/2 w-full h-full"
          >
            <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full border border-white/5" />
            <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full border border-white/5" />
            <div className="absolute top-1/2 left-1/2 w-[700px] h-[700px] rounded-full border border-white/5" />
          </motion.div>
        </div>
        
        <div className="max-w-4xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>
              The SpireTrack Way
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              We believe alignment shouldn't be expensive—in time, money, or energy.
            </p>
          </motion.div>
          
          <div className="space-y-6">
            {[
              {
                num: '01',
                title: 'Replace meetings with rhythm',
                content: 'The average manager spends 23 hours per week in meetings. Most of that is status updates that could be asynchronous. SpireTrack creates a weekly cadence where updates happen automatically.',
                icon: '🔄'
              },
              {
                num: '02',
                title: 'Surface problems before they escalate',
                content: 'When someone is blocked, the whole team should know—now, not in next week\'s standup. SpireTrack makes blockers visible the moment they\'re reported.',
                icon: '🚨'
              },
              {
                num: '03',
                title: 'Celebrate wins, not just tasks',
                content: 'Too many tools focus on what\'s not done. SpireTrack highlights accomplishments alongside tasks. When the team sees each other\'s wins, morale improves.',
                icon: '🏆'
              },
              {
                num: '04',
                title: 'Respect deep work',
                content: 'We\'re allergic to notifications. SpireTrack batches updates into a weekly digest. No pings, no red badges, no artificial urgency. Your focus time is sacred.',
                icon: '🧘'
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all hover:border-white/20">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-3xl">
                        {item.icon}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono text-emerald-400">{item.num}</span>
                        <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                      </div>
                      <p className="text-slate-400 leading-relaxed">{item.content}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA SECTION ========== */}
      <section className="px-6 py-24 sm:py-32 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-emerald-500/5 to-teal-500/5" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 mb-8 shadow-lg">
              <span className="text-4xl">🚀</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-900 mb-6"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>
              Ready to find your team's rhythm?
            </h2>
            <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto">
              Join thousands of teams who've replaced scattered updates with 
              simple weekly check-ins. Start free—no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full font-semibold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
              >
                Get Started Free
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/product"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-slate-200 text-slate-700 rounded-full font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all"
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

export default AboutPage;
