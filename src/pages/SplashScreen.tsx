import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [phase, setPhase] = useState(0);
  const [splashComplete, setSplashComplete] = useState(false);

  // Animation phases
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 3500);
    const t4 = setTimeout(() => setPhase(4), 4700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSplashComplete(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (splashComplete && !loading) {
      navigate(user ? '/app' : '/register', { replace: true });
    }
  }, [splashComplete, loading, user, navigate]);

  return (
    <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center px-4 sm:px-6">
      <div className="flex flex-col items-center w-full max-w-sm">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: phase >= 1 ? 1 : 0, 
            scale: phase >= 1 ? 1 : 0.8 
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-6 sm:mb-8"
        >
          <img 
            src="/splash-logo.png" 
            alt="SpireTrack" 
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
          />
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: phase >= 2 ? 1 : 0, 
            y: phase >= 2 ? 0 : 10 
          }}
          transition={{ duration: 0.5 }}
          className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight mb-1 sm:mb-2"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}
        >
          SpireTrack
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 2 ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xs sm:text-sm text-gray-400 mb-10 sm:mb-12"
        >
          Team Alignment, Simplified
        </motion.p>

        {/* Minimal loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 3 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-1"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gray-300"
              animate={{
                backgroundColor: ['#d1d5db', '#9ca3af', '#d1d5db'],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Fade out overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 4 ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-white pointer-events-none"
      />
    </div>
  );
};
