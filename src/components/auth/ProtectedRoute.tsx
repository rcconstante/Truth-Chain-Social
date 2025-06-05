import React from 'react';
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LoadingSpinner } from '../ui/loading-spinner';
import { NicknameSurvey } from '../dashboard/NicknameSurvey';
import { WalletAuthDialog } from './WalletAuthDialog';
import { useAuth } from '../../lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, onboardingCompleted } = useAuth();
  const [showSurvey, setShowSurvey] = useState(false);
  const [showWalletAuth, setShowWalletAuth] = useState(false);

  console.log('ProtectedRoute - user:', user, 'loading:', loading);

  useEffect(() => {
    if (user && !loading) {
      // Check if user needs to complete onboarding
      if (!onboardingCompleted) {
        setShowSurvey(true);
      } else {
        // Check if user has a linked wallet - if not, show wallet authentication
        const hasLinkedWallet = user?.profile?.algo_address;
        if (!hasLinkedWallet) {
          setShowWalletAuth(true);
        }
      }
    }
  }, [user, loading, onboardingCompleted]);

  const handleSurveyComplete = (nickname: string, bio: string) => {
    setShowSurvey(false);
    
    // After survey completion, check if wallet needs to be connected
    const hasLinkedWallet = user?.profile?.algo_address;
    if (!hasLinkedWallet) {
      setShowWalletAuth(true);
    }
  };

  const handleWalletConnected = () => {
    setShowWalletAuth(false);
  };

  if (loading) {
    console.log('ProtectedRoute: Still loading...');
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <LoadingSpinner size="lg" />
          <p className="text-white text-lg">Loading TruthChain...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to landing page');
    return <Navigate to="/" replace />;
  }

  if (showSurvey) {
    return <NicknameSurvey isOpen={true} onComplete={handleSurveyComplete} />;
  }

  if (showWalletAuth) {
    return (
      <WalletAuthDialog 
        isOpen={true} 
        onClose={() => setShowWalletAuth(false)} 
        onWalletConnect={handleWalletConnected} 
      />
    );
  }

  console.log('ProtectedRoute: User authenticated, rendering children');
  return <>{children}</>;
} 