import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { PublicLayout } from './components/layout/PublicLayout';
import { AppLayout } from './components/layout/AppLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { OnboardingModal } from './components/auth/OnboardingModal';
import { useState, useEffect, lazy, Suspense } from 'react';
import { supabase } from './lib/supabase';

// Keep Landing eager for fast initial paint
import { Landing } from './pages/Landing';

// Lazy load all other pages for code splitting
const Report = lazy(() => import('./pages/Report'));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Review = lazy(() => import('./pages/Review'));
const Calendar = lazy(() => import('./pages/Calendar').then(m => ({ default: m.Calendar })));
const History = lazy(() => import('./pages/History').then(m => ({ default: m.History })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminUsers = lazy(() => import('./pages/AdminUsers').then(m => ({ default: m.AdminUsers })));
const Product = lazy(() => import('./pages/Product').then(m => ({ default: m.Product })));
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const TeamDashboard = lazy(() => import('./pages/TeamDashboard').then(m => ({ default: m.TeamDashboard })));
const TeamList = lazy(() => import('./pages/TeamList').then(m => ({ default: m.TeamList })));
const TeamReviewPage = lazy(() => import('./pages/TeamReviewPage').then(m => ({ default: m.TeamReviewPage })));
const TeamMembersPage = lazy(() => import('./pages/TeamMembersPage').then(m => ({ default: m.TeamMembersPage })));
const TeamFormBuilder = lazy(() => import('./pages/TeamFormBuilder').then(m => ({ default: m.TeamFormBuilder })));
const ChatLayout = lazy(() => import('./components/team/chat/ChatLayout').then(m => ({ default: m.ChatLayout })));
const ForTeams = lazy(() => import('./pages/ForTeams').then(m => ({ default: m.ForTeams })));
const ForFounders = lazy(() => import('./pages/ForFounders').then(m => ({ default: m.ForFounders })));
const ForSmallBusiness = lazy(() => import('./pages/ForSmallBusiness').then(m => ({ default: m.ForSmallBusiness })));
const HowItWorks = lazy(() => import('./pages/HowItWorks').then(m => ({ default: m.HowItWorks })));
const Pricing = lazy(() => import('./pages/Pricing').then(m => ({ default: m.Pricing })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/TermsOfService').then(m => ({ default: m.TermsOfService })));
// ErrorBoundary must be eager since it wraps the entire app
import { ErrorBoundary } from './components/ui/ErrorBoundary';
const DocsPage = lazy(() => import('./pages/DocsPage').then(m => ({ default: m.DocsPage })));
const SplashScreen = lazy(() => import('./pages/SplashScreen').then(m => ({ default: m.SplashScreen })));
const AboutPage = lazy(() => import('./pages/About'));

import { useNotificationListener } from './hooks/useNotificationListener';

// Minimal loading fallback for Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  // Start listening for real-time notifications
  useNotificationListener();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user needs onboarding (e.g. missing name)
    const checkOnboarding = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (profile && !profile.full_name) {
          setShowOnboarding(true);
        }
      }
    };
    checkOnboarding();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/product" element={<Product />} />
            <Route path="/features" element={<Product />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/for-teams" element={<ForTeams />} />
            <Route path="/for-founders" element={<ForFounders />} />
            <Route path="/for-small-business" element={<ForSmallBusiness />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Login />} />
          </Route>

          {/* Splash Screen Route */}
          <Route path="/splash" element={<SplashScreen />} />

          {/* App Routes (Protected) */}
          <Route path="/app" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="review" element={<Review />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="report/:id?" element={<Report />} />
            <Route path="history" element={<History />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="docs" element={<DocsPage />} />
            <Route path="team" element={<TeamList />} />
            <Route path="team/:teamId" element={<TeamDashboard />} />
            <Route path="team/:teamId/members" element={<TeamMembersPage />} />
            <Route path="team/:teamId/chat" element={<ChatLayout />} />
            <Route path="team/:teamId/form-builder" element={<TeamFormBuilder />} />
            <Route path="team/:teamId/review" element={<TeamReviewPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Admin Routes (Protected) */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>

        <OnboardingModal
          isOpen={showOnboarding}
          onComplete={() => setShowOnboarding(false)}
        />
        <SpeedInsights />
        <VercelAnalytics />
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
