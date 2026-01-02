import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [phase, setPhase] = useState(0);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [authProcessed, setAuthProcessed] = useState(false);
  const hasNavigated = useRef(false);

  // Animation phases
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 2500);
    const t4 = setTimeout(() => setPhase(4), 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  // Handle magic link callback - process auth from URL if present
  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check if this is a redirect from magic link (has hash params)
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        // Let Supabase process the hash automatically
        // The onAuthStateChange in AuthContext will pick this up
        await supabase.auth.getSession();
      }
      setAuthProcessed(true);
    };
    
    handleAuthCallback();
  }, []);

  // Minimum time before navigation (allows auth to complete)
  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Navigate after auth processed, min time elapsed, and not loading
  useEffect(() => {
    if (minTimeElapsed && !loading && authProcessed && !hasNavigated.current) {
      hasNavigated.current = true;
      navigate(user ? '/app' : '/register', { replace: true });
    }
  }, [minTimeElapsed, loading, authProcessed, user, navigate]);

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
