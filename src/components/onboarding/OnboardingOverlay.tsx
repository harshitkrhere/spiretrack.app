import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface OnboardingOverlayProps {
  isOpen: boolean;
  onComplete: () => void;
}

const slides = [
  {
    headline: 'Hello.',
    subline: 'Welcome to SpireTrack.',
    body: 'Your new home for team alignment. We help distributed teams stay synchronized through structured communication and actionable insights.',
  },
  {
    headline: 'Stay aligned.',
    subline: 'Every week.',
    body: 'Submit a brief weekly review covering what you accomplished, what blocked you, and what you\'re focusing on next. It takes just 5 minutes and keeps your entire team informed.',
    details: [
      'Share your wins and accomplishments',
      'Flag blockers before they become problems',
      'Set clear priorities for the week ahead',
      'Optional mood and workload check-in',
    ],
  },
  {
    headline: 'Communicate.',
    subline: 'Without the noise.',
    body: 'Join or create team channels to keep conversations organized. No more searching through endless chat threads or missing important updates.',
    details: [
      'Dedicated channels for each project or topic',
      'Threaded replies keep discussions focused',
      'Pin important messages for quick access',
      '@mentions notify the right people',
    ],
  },
  {
    headline: 'Track progress.',
    subline: 'See the bigger picture.',
    body: 'Your personal dashboard shows your contribution trends over time. Team leads can access team-wide analytics to understand engagement patterns.',
    details: [
      'Visual history of your submissions',
      'Spot patterns and trends in your work',
      'Celebrate streaks and achievements',
      'Identify areas for growth',
    ],
  },
  {
    headline: 'Get started.',
    subline: 'Here\'s what to do next.',
    body: 'You\'re all set up. To get the most out of SpireTrack, we recommend these first steps:',
    actions: [
      { num: '1', title: 'Join a team', desc: 'Connect with your colleagues or create your own team' },
      { num: '2', title: 'Submit your first review', desc: 'Start building your weekly rhythm' },
      { num: '3', title: 'Explore your dashboard', desc: 'See your personal insights and analytics' },
    ],
  },
];

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ isOpen, onComplete }) => {
  const [current, setCurrent] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 100);
    }
  }, [isOpen]);

  const slide = slides[current];
  const isLast = current === slides.length - 1;
  const isFirst = current === 0;

  const next = () => {
    if (isLast) {
      setIsVisible(false);
      setTimeout(onComplete, 400);
    } else {
      setCurrent(prev => prev + 1);
    }
  };

  const prev = () => {
    if (!isFirst) setCurrent(prev => prev - 1);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'Enter') next();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'Escape') {
      setIsVisible(false);
      setTimeout(onComplete, 400);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [current]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] bg-white flex flex-col overflow-y-auto"
        >
          {/* Main content - centered */}
          <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-8 sm:py-12">
            <div className="max-w-2xl w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                  className="text-center"
                >
                  {/* Headline */}
                  <motion.h1 
                    className="text-4xl sm:text-5xl md:text-7xl font-light text-gray-900 tracking-tight mb-2 sm:mb-3"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}
                  >
                    {slide.headline}
                  </motion.h1>

                  {/* Subline */}
                  <motion.p 
                    className="text-xl sm:text-2xl md:text-3xl font-light text-gray-400 mb-6 sm:mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    {slide.subline}
                  </motion.p>

                  {/* Body text */}
                  {slide.body && (
                    <motion.p 
                      className="text-sm sm:text-base md:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {slide.body}
                    </motion.p>
                  )}

                  {/* Details list */}
                  {slide.details && (
                    <motion.div 
                      className="max-w-md mx-auto text-left px-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="grid gap-2 sm:gap-3">
                        {slide.details.map((item, i) => (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="flex items-center gap-2 sm:gap-3"
                          >
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                            <span className="text-gray-600 text-xs sm:text-sm">{item}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Actions list for final slide */}
                  {slide.actions && (
                    <motion.div 
                      className="max-w-sm mx-auto px-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="space-y-3 sm:space-y-4">
                        {slide.actions.map((action, i) => (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + i * 0.15 }}
                            className="flex items-start gap-3 sm:gap-4 text-left p-3 sm:p-4 rounded-xl bg-gray-50"
                          >
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0">
                              {action.num}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm sm:text-base">{action.title}</p>
                              <p className="text-xs sm:text-sm text-gray-500">{action.desc}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Footer navigation */}
          <div className="px-4 sm:px-8 py-4 sm:py-6 border-t border-gray-100">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              {/* Left side - Skip or Back */}
              <div className="w-20 sm:w-28">
                {isFirst ? (
                  <button
                    onClick={() => {
                      setIsVisible(false);
                      setTimeout(onComplete, 400);
                    }}
                    className="text-xs sm:text-sm text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Skip
                  </button>
                ) : (
                  <button
                    onClick={prev}
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ArrowLeftIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    Back
                  </button>
                )}
              </div>

              {/* Center - Progress dots */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                      i === current 
                        ? 'bg-gray-900 w-5 sm:w-8' 
                        : 'bg-gray-200 w-1.5 sm:w-2 hover:bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Right side - Continue */}
              <div className="w-20 sm:w-28 flex justify-end">
                <button
                  onClick={next}
                  className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-900 text-white rounded-full text-xs sm:text-sm font-medium hover:bg-gray-800 transition-all"
                >
                  {isLast ? 'Start' : 'Next'}
                  <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
