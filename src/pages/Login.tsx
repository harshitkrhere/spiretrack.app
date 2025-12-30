import React, { useState } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PublicHeader } from '../components/layout/PublicHeader';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const location = useLocation();
    const isRegister = location.pathname === '/register';
    
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Redirect to app if already logged in
    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }
    
    if (user) {
        return <Navigate to="/splash" replace />;
    }

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: window.location.origin + '/splash',
                },
            });

            if (error) throw error;
            setMessage({ type: 'success', text: 'Check your email for the login link!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/splash',
                },
            });
            if (error) throw error;
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header Navigation */}
            <PublicHeader />
            
            <div className="flex min-h-screen pt-16">
                {/* Left Side - Brand Visual */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden items-center justify-center p-12">
                    {/* Abstract visual elements */}
                    <div className="absolute inset-0">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
                        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl"></div>
                    </div>
                    
                    {/* 3D-like decorative elements */}
                    <div className="absolute inset-0 opacity-30">
                        <svg className="absolute top-20 right-20 w-32 h-32 text-emerald-400" viewBox="0 0 100 100" fill="currentColor">
                            <circle cx="50" cy="50" r="40" fillOpacity="0.3"/>
                        </svg>
                        <svg className="absolute bottom-32 left-20 w-24 h-24 text-teal-400" viewBox="0 0 100 100" fill="currentColor">
                            <rect x="20" y="20" width="60" height="60" rx="10" fillOpacity="0.3"/>
                        </svg>
                    </div>
                    
                    <div className="relative z-10 text-white max-w-lg">
                        <div className="w-16 h-16 mb-8 flex items-center justify-center">
                            <img src="/logo.png" alt="SpireTrack" className="w-full h-full object-contain drop-shadow-2xl" />
                        </div>
                        <h1 className="text-5xl font-bold mb-6 tracking-tight leading-tight">
                            Work Smarter.<br/>
                            <span className="text-emerald-400">Operate Faster.</span>
                        </h1>
                        <p className="text-xl text-slate-300 leading-relaxed">
                            SpireTrack streamlines teams, workflows, and communication in one unified hub.
                        </p>
                        
                        <div className="mt-12 flex items-center gap-4 text-sm text-slate-300">
                            <div className="flex -space-x-2">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-slate-800 flex items-center justify-center text-white font-bold text-xs">A</div>
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 border-2 border-slate-800 flex items-center justify-center text-white font-bold text-xs">C</div>
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 border-2 border-slate-800 flex items-center justify-center text-white font-bold text-xs">M</div>
                            </div>
                            <span className="font-medium">Trusted by high-performing teams</span>
                        </div>
                    </div>
                    
                    {/* Bottom right decorative element */}
                    <div className="absolute bottom-8 right-8 opacity-20">
                        <svg className="w-20 h-20 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                </div>

                {/* Right Side - Auth Form */}
                <div className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-white">
                    <div className="w-full max-w-md space-y-8">
                        <div className="text-left">
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                                {isRegister ? 'Create your account' : 'Welcome back'}
                            </h2>
                            <div className="mt-2 text-gray-600">
                                 {isRegister ? (
                                    <>
                                        Already have an account?{' '}
                                        <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline">
                                            Sign in
                                        </Link>
                                    </>
                                 ) : (
                                    <>
                                        Sign in to your SpireTrack account or{' '}
                                        <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline">
                                            create one
                                        </Link>
                                    </>
                                 )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <Button
                                variant="secondary"
                                className="w-full h-12 text-base font-medium flex items-center justify-center gap-3 border border-gray-200 hover:bg-gray-50 transition-all duration-200 rounded-lg"
                                onClick={handleGoogleLogin}
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">Or continue with email</span>
                                </div>
                            </div>

                            <form className="space-y-5" onSubmit={handleEmailLogin}>
                                <Input
                                    id="email"
                                    type="email"
                                    label="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="name@company.com"
                                    className="h-12"
                                />

                                {message && (
                                    <div className={`p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                        {message.type === 'success' ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-green-700 font-semibold">
                                                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                    Check your email for the login link!
                                                </div>
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                    <p className="text-blue-800 font-medium text-xs flex items-center gap-2 mb-1">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                        Don't see it in your inbox?
                                                    </p>
                                                    <p className="text-blue-700 text-xs leading-relaxed">
                                                        Check your <strong>spam or promotions folder</strong>. If found there, please move it to your inbox and mark as <strong>"Not Spam"</strong> to receive future emails directly.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-red-700 font-medium">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                {message.text}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <Button type="submit" className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700 rounded-lg" isLoading={loading}>
                                    Send Magic Link
                                </Button>
                            </form>
                        </div>

                        <p className="text-xs text-center text-gray-500">
                            By signing in, you agree to our <Link to="/privacy" className="text-emerald-600 hover:underline font-medium">Privacy Policy</Link> and <Link to="/terms" className="text-emerald-600 hover:underline font-medium">Terms of Service</Link>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
