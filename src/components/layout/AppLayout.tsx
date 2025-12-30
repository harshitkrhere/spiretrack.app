import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
    Squares2X2Icon, 
    CalendarIcon, 
    ChartPieIcon, 
    UserGroupIcon, 
    PencilSquareIcon,
    Cog6ToothIcon,
    ChevronDownIcon,
    ShieldCheckIcon,
    Bars3Icon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { UserProfileDropdown } from './UserProfileDropdown';
import { NotificationBell } from '../notifications/NotificationBell';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { OnboardingOverlay } from '../onboarding/OnboardingOverlay';

interface Team {
  id: string;
  name: string;
}

// Main navigation sections
const mainNavigation = [
  { name: 'Dashboard', href: '/app', icon: Squares2X2Icon },
  { name: 'Weekly Review', href: '/app/review', icon: PencilSquareIcon },
  { name: 'Calendar', href: '/app/calendar', icon: CalendarIcon },
  { name: 'Analytics', href: '/app/analytics', icon: ChartPieIcon },
  { name: 'Admin', href: '/admin', icon: ShieldCheckIcon },
];

export const AppLayout = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsExpanded, setTeamsExpanded] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if first-time user for onboarding
  useEffect(() => {
    if (user) {
      const hasSeenOnboarding = localStorage.getItem(`spiretrack_onboarding_${user.id}`);
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  const handleOnboardingComplete = () => {
    if (user) {
      localStorage.setItem(`spiretrack_onboarding_${user.id}`, 'completed');
    }
    setShowOnboarding(false);
  };

  useEffect(() => {
    if (user) {
      fetchTeams();
    }
  }, [user]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const fetchTeams = async () => {
    const { data } = await supabase
      .from('team_members')
      .select('team_id, teams(id, name)')
      .eq('user_id', user?.id);
    
    if (data) {
      setTeams(data.map((m: any) => m.teams).filter(Boolean));
    }
  };

  const isActive = (href: string) => {
    if (href === '/app') {
      return location.pathname === '/app';
    }
    return location.pathname.startsWith(href);
  };

  // Light theme colors
  const colors = {
    sidebarBg: '#F8F7F4',
    sidebarHover: '#EFEEE9',
    activeText: '#1F8A4C',
    activeBg: '#E8F5E9',
    text: '#1A1A1A',
    textMuted: '#6B7280',
    border: '#E5E4E0',
    accent: '#1F8A4C',
  };

  const SidebarContent = () => (
    <>
      {/* Logo / Brand */}
      <div className="h-14 px-4 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center">
          <img src="/logo.png" alt="SpireTrack" className="w-8 h-8 object-contain" />
        </div>
        <span className="font-bold text-lg" style={{ color: colors.text }}>SpireTrack</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-3">
        {/* Main Navigation */}
        <div className="space-y-1">
          {mainNavigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: active ? colors.activeBg : 'transparent',
                  color: active ? colors.activeText : colors.text,
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = colors.sidebarHover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Teams Section */}
        <div className="mt-6">
          <div 
            className="px-3 mb-2 flex items-center justify-between cursor-pointer"
            onClick={() => setTeamsExpanded(!teamsExpanded)}
          >
            <div className="flex items-center gap-2">
              <UserGroupIcon className="w-5 h-5" style={{ color: colors.textMuted }} />
              <p className="text-sm font-medium" style={{ color: colors.text }}>Teams</p>
            </div>
            <ChevronDownIcon 
              className={`w-4 h-4 transition-transform ${teamsExpanded ? '' : '-rotate-90'}`}
              style={{ color: colors.textMuted }}
            />
          </div>
          
          {teamsExpanded && (
            <div className="space-y-1 ml-2">
              {teams.length > 0 ? (
                teams.map((team) => {
                  const isTeamActive = location.pathname.includes(`/team/${team.id}`);
                  return (
                    <Link
                      key={team.id}
                      to={`/app/team/${team.id}`}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: isTeamActive ? colors.activeBg : 'transparent',
                        color: isTeamActive ? colors.activeText : colors.text,
                      }}
                      onMouseEnter={(e) => {
                        if (!isTeamActive) {
                          e.currentTarget.style.backgroundColor = colors.sidebarHover;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isTeamActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <span 
                        className="w-2 h-2 rounded-sm"
                        style={{ backgroundColor: colors.accent }}
                      />
                      {team.name}
                    </Link>
                  );
                })
              ) : (
                <p className="px-3 text-sm" style={{ color: colors.textMuted }}>No teams yet</p>
              )}
              
              <Link
                to="/app/team"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
                style={{ color: colors.textMuted }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.sidebarHover;
                  e.currentTarget.style.color = colors.text;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = colors.textMuted;
                }}
              >
                <span className="text-lg">+</span>
                Browse Teams
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Section - Settings */}
      <div 
        className="px-3 py-2"
        style={{ borderTop: `1px solid ${colors.border}` }}
      >
        <Link
          to="/app/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
          style={{ color: colors.textMuted }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.sidebarHover;
            e.currentTarget.style.color = colors.text;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = colors.textMuted;
          }}
        >
          <Cog6ToothIcon className="w-5 h-5" />
          Settings
        </Link>
      </div>

      {/* User Profile */}
      <div 
        className="p-3"
        style={{ borderTop: `1px solid ${colors.border}` }}
      >
        <UserProfileDropdown variant="light" />
      </div>
    </>
  );

  return (
    <div className="h-screen flex overflow-hidden font-sans bg-gray-50">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div 
        className="hidden md:flex w-56 flex-col flex-shrink-0 border-r"
        style={{ backgroundColor: colors.sidebarBg, borderColor: colors.border }}
      >
        <SidebarContent />
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      {/* Mobile Sidebar Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: colors.sidebarBg }}
      >
        {/* Close button */}
        <div className="absolute top-4 right-4">
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-200"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <SidebarContent />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
        {/* Top Header Bar */}
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 border-b border-slate-200 bg-white">
          {/* Mobile Hamburger Menu */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Bars3Icon className="w-6 h-6 text-gray-600" />
          </button>

          {/* Mobile Logo */}
          <div className="md:hidden flex items-center gap-2">
            <img src="/logo.png" alt="SpireTrack" className="w-6 h-6" />
            <span className="font-semibold text-gray-900">SpireTrack</span>
          </div>

          {/* Desktop spacer */}
          <div className="hidden md:block" />

          {/* Notifications */}
          {user && <NotificationBell userId={user.id} />}
        </header>
        
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* First-time user onboarding overlay */}
      <OnboardingOverlay 
        isOpen={showOnboarding} 
        onComplete={handleOnboardingComplete} 
      />
    </div>
  );
};
