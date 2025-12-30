import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { PublicLayout } from './components/layout/PublicLayout';
import { AppLayout } from './components/layout/AppLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import Report from './pages/Report';
import { OnboardingModal } from './components/auth/OnboardingModal';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

import { Dashboard } from './pages/Dashboard';
import Review from './pages/Review';
import { Calendar } from './pages/Calendar';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUsers } from './pages/AdminUsers';
import { Landing } from './pages/Landing';
import { Product } from './pages/Product';
import { Analytics } from './pages/Analytics';
import { TeamDashboard } from './pages/TeamDashboard';
import { TeamList } from './pages/TeamList';
import { TeamReviewPage } from './pages/TeamReviewPage';
import { TeamMembersPage } from './pages/TeamMembersPage';
import { TeamFormBuilder } from './pages/TeamFormBuilder';
import { ChatLayout } from './components/team/chat/ChatLayout';
import { ForTeams } from './pages/ForTeams';
import { ForIndividuals } from './pages/ForIndividuals';
import { Pricing } from './pages/Pricing';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { DocsPage } from './pages/DocsPage';
import { SplashScreen } from './pages/SplashScreen';

import { useNotificationListener } from './hooks/useNotificationListener';

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
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/product" element={<Product />} />
            <Route path="/for-teams" element={<ForTeams />} />
            <Route path="/for-individuals" element={<ForIndividuals />} />
            <Route path="/pricing" element={<Pricing />} />
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

        <OnboardingModal
          isOpen={showOnboarding}
          onComplete={() => setShowOnboarding(false)}
        />
        <SpeedInsights />
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
