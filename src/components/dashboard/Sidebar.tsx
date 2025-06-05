import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, FileText, Wallet, Trophy, User, Star, 
  LogOut, Search, MessageCircle, Bot, Mic, Users,
  Shield, Target, GraduationCap, ExternalLink
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

interface SidebarProps {
  userProfile?: {
    nickname: string;
    bio: string;
  } | null;
  onSignOut?: () => void;
}

const primaryNavItems = [
  { 
    icon: Home, 
    label: 'Home', 
    path: '/dashboard/feed',
    isExternal: false
  },
  { 
    icon: FileText, 
    label: 'My Posts', 
    path: '/dashboard/my-posts',
    isExternal: false
  },
  { 
    icon: Star, 
    label: 'Staked Posts', 
    path: '/dashboard/staked',
    isExternal: false
  },
  { 
    icon: Shield, 
    label: 'Challenges', 
    path: '/dashboard/challenges',
    isExternal: false
  },
  { 
    icon: Wallet, 
    label: 'Wallet', 
    path: '/dashboard/wallet',
    isExternal: false
  },
  { 
    icon: User, 
    label: 'Profile', 
    path: '/dashboard/profile',
    isExternal: false
  }
];

const communityNavItems = [
  { 
    icon: MessageCircle, 
    label: 'Chat Rooms', 
    path: '/dashboard/chat-rooms',
    isExternal: false
  },
  { 
    icon: Mic, 
    label: 'Voice Rooms', 
    path: '/dashboard/voice-rooms',
    isExternal: false
  },
  { 
    icon: Bot, 
    label: 'AI Moderator Hub', 
    path: '/dashboard/ai-moderator-hub',
    isExternal: false
  },
  { 
    icon: Trophy, 
    label: 'Leaderboard', 
    path: '/dashboard/leaderboard',
    isExternal: false
  },
  { 
    icon: GraduationCap, 
    label: 'Learning Center', 
    path: '/dashboard/learning',
    isExternal: false
  },
  { 
    icon: Search, 
    label: 'Explorer', 
    path: '/explorer',
    isExternal: true
  }
];

export function Sidebar({ userProfile, onSignOut }: SidebarProps) {
  const [userStats, setUserStats] = useState({
    truthScore: 0,
    algoBalance: 0,
    totalStaked: 0
  });
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user?.id) {
      loadUserStats();
      checkWalletConnection();
    }
  }, [user]);

  // Listen for wallet connection events
  useEffect(() => {
    const handleWalletUpdate = () => {
      if (user?.id) {
        checkWalletConnection();
        loadUserStats();
      }
    };

    window.addEventListener('walletBalanceUpdated', handleWalletUpdate);
    window.addEventListener('transactionCompleted', handleWalletUpdate);

    return () => {
      window.removeEventListener('walletBalanceUpdated', handleWalletUpdate);
      window.removeEventListener('transactionCompleted', handleWalletUpdate);
    };
  }, [user?.id]);

  const checkWalletConnection = async () => {
    if (!user?.id) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('wallet_connected, algo_address, wallet_address')
        .eq('id', user.id)
        .single();

      const isConnected = profile?.wallet_connected && (profile?.algo_address || profile?.wallet_address);
      setWalletConnected(isConnected);
      setWalletAddress(profile?.algo_address || profile?.wallet_address || null);
      
      console.log('Wallet connection status:', { isConnected, address: walletAddress });
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      setWalletConnected(false);
    }
  };

  const loadUserStats = async () => {
    if (!user?.id) return;
    
    try {
      // Get user profile for stats
      const { data: profile } = await supabase
        .from('profiles')
        .select('reputation_score, algo_balance, algo_address, wallet_address, wallet_connected')
        .eq('id', user.id)
        .single();

      // Only load financial stats if wallet is connected
      let algoBalance = 0;
      let totalStaked = 0;

      if (profile?.wallet_connected && (profile?.algo_address || profile?.wallet_address)) {
        algoBalance = profile?.algo_balance || 0;
        
        // Get user's total staked amount
        const { data: posts } = await supabase
          .from('posts')
          .select('stake_amount')
          .eq('user_id', user.id);

        totalStaked = posts?.reduce((sum, post) => sum + post.stake_amount, 0) || 0;
      }

      const truthScore = profile ? (profile.reputation_score / 10) : 0;

      setUserStats({
        truthScore: truthScore,
        algoBalance: algoBalance,
        totalStaked: totalStaked
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handleSignOut = () => {
    supabase.auth.signOut();
    if (onSignOut) onSignOut();
    navigate('/');
  };

  const getUserDisplayName = () => {
    return userProfile?.nickname || user?.email?.split('@')[0] || 'User';
  };

  const getUserRole = () => {
    return 'Truth Seeker'; // You can make this dynamic based on user stats
  };

  const renderNavItem = (item: any) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    
    if (item.isExternal) {
      return (
        <a
          key={item.path}
          href={item.path}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700/50 light:text-gray-600 light:hover:text-gray-900 light:hover:bg-gray-200/50 transition-colors"
        >
          <Icon size={18} />
          <span>{item.label}</span>
          <ExternalLink size={14} className="ml-auto" />
        </a>
      );
    }
    
    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive 
            ? 'bg-amber-500/20 text-amber-400 border-l-2 border-amber-400' 
            : 'text-gray-300 hover:text-white hover:bg-gray-700/50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700/50 light:text-gray-600 light:hover:text-gray-900 light:hover:bg-gray-200/50'
        }`}
      >
        <Icon size={18} />
        <span>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-800 dark:bg-gray-800 light:bg-white border-r border-gray-700 dark:border-gray-700 light:border-gray-200 overflow-y-auto">
      <div className="p-4">
        {/* Profile Section */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-10 h-10 ring-2 ring-amber-400/20">
              <AvatarImage 
                src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${getUserDisplayName()}`} 
                alt={getUserDisplayName()}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm">
                {getUserDisplayName().charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-white dark:text-white light:text-gray-900 truncate">
                Hello! I'm {getUserDisplayName()}
              </h2>
              <p className="text-xs text-amber-400 font-medium">
                {getUserRole()}
              </p>
            </div>
          </div>
          
          {userProfile?.bio && (
            <p className="text-gray-300 dark:text-gray-300 light:text-gray-600 text-xs leading-relaxed mb-3 line-clamp-2">
              {userProfile.bio}
            </p>
          )}

          {/* Compact Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-md p-2">
              <div className="text-amber-400 text-xs font-medium">Truth Score</div>
              <div className="text-white dark:text-white light:text-gray-900 font-bold text-sm">
                {userStats.truthScore.toFixed(1)}<span className="text-amber-400 text-xs">/10</span>
              </div>
            </div>
            {walletConnected ? (
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-md p-2">
                <div className="text-blue-400 text-xs font-medium">ALGO</div>
                <div className="text-white dark:text-white light:text-gray-900 font-bold text-sm">
                  {userStats.algoBalance.toFixed(2)}
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate('/dashboard/wallet')}
                className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-md p-2 hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-200 cursor-pointer"
              >
                <div className="text-purple-400 text-xs font-medium">Wallet</div>
                <div className="text-purple-300 font-bold text-xs">
                  Connect
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-1 mb-6">
          {primaryNavItems.map(renderNavItem)}
        </nav>

        {/* Community Section */}
        <div className="mb-6">
          <h3 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-500 light:text-gray-400 font-semibold mb-2">
            Community
          </h3>
          <nav className="space-y-1">
            {communityNavItems.map(renderNavItem)}
          </nav>
        </div>

        {/* Logout */}
        <div className="pt-4 border-t border-gray-700 dark:border-gray-700 light:border-gray-200">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-red-400 hover:bg-red-500/10 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-500/10 light:text-gray-600 light:hover:text-red-600 light:hover:bg-red-100 transition-colors w-full"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}