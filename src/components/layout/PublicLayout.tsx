import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicHeader } from './PublicHeader';

export const PublicLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <PublicHeader />
            <main className="flex-grow pt-20">
                <Outlet />
            </main>
            <footer className="bg-[#020617] text-slate-400 py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="font-bold text-white text-xl">SpireTrack</div>
                    <div className="flex gap-8 text-sm">
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                        <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                        <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
                        <a href="/terms" className="hover:text-white transition-colors">Terms</a>
                    </div>
                    <div className="text-sm">&copy; {new Date().getFullYear()} SpireTrack Inc.</div>
                </div>
            </footer>
        </div>
    );
};
