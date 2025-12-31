import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Unified Public Header for all public-facing pages.
 * Ensures consistent navigation across Landing, Product, Pricing, etc.
 */
export const PublicHeader: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    React.useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    React.useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const navLinks = [
        { name: 'About', path: '/about' },
        { name: 'Features', path: '/features' },
        { name: 'How It Works', path: '/how-it-works' },
        { name: 'For Teams', path: '/for-teams' },
        { name: 'For Founders', path: '/for-founders' },
        { name: 'For Small Business', path: '/for-small-business' },
        { name: 'Pricing', path: '/pricing' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            <header 
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                    scrolled 
                        ? 'bg-white/90 backdrop-blur-xl shadow-sm py-3' 
                        : 'bg-transparent py-4 sm:py-5'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <img src="/logo.png" alt="SpireTrack" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                        </div>
                        <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">SpireTrack</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6 lg:gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm font-medium transition-colors ${
                                    isActive(link.path)
                                        ? 'text-[#1F8A4C]'
                                        : 'text-slate-600 hover:text-[#0C3D5F]'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop CTAs */}
                    <div className="hidden sm:flex items-center gap-3 sm:gap-4">
                        <Link 
                            to="/login" 
                            className="text-sm font-medium text-slate-600 hover:text-[#0C3D5F] transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link 
                            to="/register" 
                            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#1F8A4C] text-white rounded-lg text-sm font-semibold hover:bg-[#178544] transition-all shadow-md hover:shadow-lg"
                        >
                            Start Free
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 -mr-2 text-slate-600 hover:text-slate-900"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <XMarkIcon className="w-6 h-6" />
                        ) : (
                            <Bars3Icon className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Menu Panel */}
            <div className={`
                fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden
                ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Mobile Menu Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-100">
                        <span className="font-semibold text-slate-900">Menu</span>
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-2 -mr-2 text-slate-400 hover:text-slate-600"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Mobile Navigation Links */}
                    <nav className="flex-1 px-4 py-6 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                                    isActive(link.path)
                                        ? 'bg-emerald-50 text-[#1F8A4C]'
                                        : 'text-slate-700 hover:bg-slate-50'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Mobile CTAs */}
                    <div className="p-4 border-t border-slate-100 space-y-3">
                        <Link 
                            to="/login" 
                            className="block w-full px-4 py-3 text-center text-slate-700 font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Sign In
                        </Link>
                        <Link 
                            to="/register" 
                            className="block w-full px-4 py-3 text-center bg-[#1F8A4C] text-white font-semibold rounded-lg hover:bg-[#178544] transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Start Your Team — Free
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};
