import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { FloatingParticles } from './FloatingParticles';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { NicknameSurvey } from './NicknameSurvey';
import { WalletAuthDialog } from '../auth/WalletAuthDialog';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { user, onboardingCompleted, walletConnected, loading } = useAuth();
  const [userProfile, setUserProfile] = useState<{nickname: string; bio: string} | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [showWalletAuth, setShowWalletAuth] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Only run auth check once on initial mount, not on every navigation
    if (!authInitialized && !loading) {
      const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log('🚪 No session found, redirecting to home');
          navigate('/', { replace: true });
        } else {
          console.log('✅ Valid session found, staying on dashboard');
        }
        setAuthInitialized(true);
      };

      checkAuth();
    }

    // Load user profile from localStorage if available
    const savedProfile = localStorage.getItem('truthchain-profile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
    
    // Check onboarding status only when user changes, not on every navigation
    if (user && authInitialized) {
      checkOnboardingStatus();
    }
  }, []); // Remove dependencies that cause re-runs during tab switching

  // Separate useEffect for auth state listener to prevent remounting
  useEffect(() => {
    // Only set up auth listener once
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        console.log('🚪 Auth state: User signed out, redirecting');
        navigate('/', { replace: true });
      }
      // Don't navigate on other events like TOKEN_REFRESHED to prevent navigation resets
    });

    return () => subscription.unsubscribe();
  }, []); // Empty dependency to prevent re-subscription

  // Handle user state changes separately to prevent remounting
  useEffect(() => {
    if (user && authInitialized) {
      checkOnboardingStatus();
    }
  }, [user?.id, authInitialized]); // Only depend on user ID to prevent unnecessary re-runs

  const checkOnboardingStatus = async () => {
    if (!user) return;
    
    try {
      // Check if user has completed onboarding from profiles table only
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed, wallet_connected')
        .eq('id', user.id)
        .single();
      
      console.log('Onboarding status:', { 
        profile: profile?.onboarding_completed, 
        wallet: profile?.wallet_connected
      });
      
      // Show survey if user hasn't completed onboarding
      if (!profile?.onboarding_completed) {
        console.log('Showing survey for new user');
        setShowSurvey(true);
      } else if (profile?.onboarding_completed && !profile?.wallet_connected) {
        console.log('Showing wallet auth for user who completed survey');
        setShowWalletAuth(true);
      } else {
        console.log('User has completed full onboarding');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // For new users without any records, show the survey
      if (!user.profile?.onboarding_completed) {
        setShowSurvey(true);
      }
    }
  };

  const handleSurveyComplete = (nickname: string, bio: string) => {
    // Save user profile to localStorage
    const profile = { nickname, bio };
    localStorage.setItem('truthchain-profile', JSON.stringify(profile));
    setUserProfile(profile);
    setShowSurvey(false);
    
    // Update profile in database - this is handled by NicknameSurvey component
    console.log('Survey completed, proceeding to wallet connection');
    
    // Show wallet connection dialog
    setShowWalletAuth(true);
  };

  const handleWalletConnected = async () => {
    setShowWalletAuth(false);
    
    // Update profile in database to mark wallet as connected
    if (user?.id) {
      try {
        await supabase
        .from('profiles')
        .update({ wallet_connected: true })
        .eq('id', user.id);
        console.log('Wallet connection marked as complete');
      } catch (error) {
        console.error('Error updating wallet connection status:', error);
      }
    }
  };

  const handleSignOut = () => {
    setUserProfile(null);
  };

  if (showSurvey) {
    return <NicknameSurvey isOpen={true} onComplete={handleSurveyComplete} />;
  }

  if (showWalletAuth) {
    return <WalletAuthDialog isOpen={true} onClose={() => {}} onWalletConnect={handleWalletConnected} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-900 light:bg-gray-50 text-white dark:text-white light:text-gray-900 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] light:bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
      
      {/* Bolt.new Badge */}
      <a 
        href="https://bolt.new" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="fixed top-4 right-4 z-50 hover:scale-110 transition-all duration-300 group"
      >
        <div className="relative">
          <img
            src="/white_circle_360x360.png"
            alt="Bolt.new"
            className="w-16 h-16 drop-shadow-2xl group-hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-all duration-300"
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse scale-110"></div>
        </div>
      </a>
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar userProfile={userProfile} onSignOut={handleSignOut} />
        
        {/* Main Content */}
        <motion.div 
          className="flex-1 ml-64 min-h-screen bg-gray-900/50 dark:bg-gray-900/50 light:bg-gray-50"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6 min-h-screen">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}