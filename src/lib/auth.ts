import React, { useEffect, useState, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, type Profile } from './supabase';
import { UserService } from './supabase-service';

// Enhanced user type with reputation and wallet data
export interface EnhancedUser extends User {
  profile?: Profile;
}

// DISABLE fallback auth - use only Supabase
const ENABLE_FALLBACK_AUTH = false; // Disabled for proper Supabase-only authentication

export function useAuth() {
  const [user, setUser] = useState<EnhancedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Use ref to prevent multiple initializations and maintain state stability
  const initializationPromise = useRef<Promise<void> | null>(null);
  const authSubscription = useRef<any>(null);
  const isInitializing = useRef<boolean>(false);

  useEffect(() => {
    // Prevent multiple initializations and maintain session across tab switches
    if (isInitialized || initializationPromise.current || isInitializing.current) return;
    
    console.log('🚀 Initializing TruthChain Auth System (Tab-Switch Stable)...');
    
    isInitializing.current = true;
    // Store the initialization promise to prevent race conditions
    initializationPromise.current = initializeSupabaseAuth();
    
    // Add visibility change listener to prevent session loss on tab switch
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        console.log('🔄 Tab visible again, maintaining session for user:', user.id);
        // Don't reload, just ensure we're not in loading state
        if (loading) setLoading(false);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      // Cleanup subscription on unmount
      if (authSubscription.current) {
        authSubscription.current.unsubscribe();
        authSubscription.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      isInitializing.current = false;
    };
  }, []); // Empty dependency array to prevent re-initialization

  const initializeSupabaseAuth = async () => {
    try {
      setLoading(true);
      
      // Clear any existing TruthChain fallback data on startup
      clearLocalSession();
      
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session?.user && !error) {
        console.log('✅ Valid Supabase session found');
        await loadUserProfile(session.user);
      } else {
        console.log('❌ No valid Supabase session');
        setUser(null);
        setLoading(false);
      }

      // Setup auth state listener only once with stability for tab switching
      if (!authSubscription.current) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log(`🔄 Auth event: ${event}`, session ? `User: ${session.user.id}` : 'No session');
            
            // Prevent logout on tab switching - only handle actual auth events
            if (event === 'SIGNED_IN' && session?.user) {
              // Only reload if this is actually a new user
              if (!user || user.id !== session.user.id) {
                console.log('🆕 New user signed in, loading profile...');
                await loadUserProfile(session.user);
              } else {
                console.log('👤 Same user, maintaining existing state');
                if (loading) setLoading(false);
              }
            } else if (event === 'SIGNED_OUT') {
              // Only clear state if this is an actual logout, not a tab switch
              console.log('🚪 User signed out');
              setUser(null);
              setWalletAddress(null);
              setOnboardingCompleted(false);
              setWalletConnected(false);
              clearLocalSession();
              setLoading(false);
            } else if (event === 'TOKEN_REFRESHED' && session?.user) {
              console.log('🔄 Token refreshed, maintaining user state');
              // Don't reload profile on token refresh, just ensure loading is false
              if (loading) setLoading(false);
            } else if (event === 'USER_UPDATED' && session?.user) {
              console.log('👤 User updated, maintaining profile');
              // Keep existing profile data but update auth user
              if (user && user.id === session.user.id) {
                setUser(prev => prev ? { ...prev, ...session.user } : session.user);
              }
              if (loading) setLoading(false);
            }
            // Remove the catch-all else clause that was causing tab switch issues
          }
        );
        
        authSubscription.current = subscription;
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error('❌ Auth initialization failed:', error);
      setUser(null);
      setLoading(false);
      setIsInitialized(true);
    }
  };

  const loadUserProfile = async (authUser: User) => {
    try {
      console.log('📋 Loading user profile for:', authUser.id);
      
      // Simplified timeout - just clear loading, don't reset state
      const loadingTimeout = setTimeout(() => {
        console.warn('⚠️ Profile loading timeout, clearing loading state');
        setLoading(false);
      }, 10000); // Reduced to 10s for faster recovery
      
      // Try to load profile from database first
      let profile: Profile | null = null;
      try {
        const { data: dbProfile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (!error && dbProfile) {
          // Use database profile data - ensure proper boolean conversion
          profile = {
            ...dbProfile,
            avatar_url: dbProfile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dbProfile.username}`,
            algo_address: dbProfile.algo_address || null,
            onboarding_completed: Boolean(dbProfile.onboarding_completed),
            wallet_connected: Boolean(dbProfile.wallet_connected),
          };
          console.log('✅ Loaded profile from database:', {
            username: profile?.username || 'unknown',
            onboarding_completed: Boolean(profile?.onboarding_completed),
            wallet_connected: Boolean(profile?.wallet_connected),
            algo_address: profile?.algo_address ? 'set' : 'not set'
          });
        } else {
          console.log('⚠️ No profile found in database, creating new one');
        }
      } catch (error) {
        console.warn('⚠️ Database profile load failed:', error);
      }
      
      // Create new profile if none exists
      if (!profile) {
        const newProfile = createFallbackProfile(authUser);
        
        // Try to insert the new profile into database
        try {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: newProfile.id,
              username: newProfile.username,
              bio: newProfile.bio,
              avatar_url: newProfile.avatar_url,
              reputation_score: newProfile.reputation_score,
              algo_balance: newProfile.algo_balance,
              algo_address: null,
              total_stakes: newProfile.total_stakes,
              successful_challenges: newProfile.successful_challenges,
              accuracy_rate: newProfile.accuracy_rate,
              onboarding_completed: false,
              wallet_connected: false,
              created_at: newProfile.created_at,
              updated_at: newProfile.updated_at
            });

          if (!insertError) {
            console.log('✅ Created new profile in database');
            profile = {
              ...newProfile,
              onboarding_completed: false,
              wallet_connected: false,
              algo_address: null
            };
          } else if (insertError.code !== '23505') { // Ignore duplicate key errors
            console.error('❌ Failed to create profile in database:', insertError);
            profile = newProfile;
          } else {
            // Profile already exists (race condition), fetch it
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authUser.id)
              .single();
            
            if (existingProfile) {
              profile = {
                ...existingProfile,
                onboarding_completed: Boolean(existingProfile.onboarding_completed),
                wallet_connected: Boolean(existingProfile.wallet_connected),
              };
            } else {
              profile = newProfile;
            }
          }
        } catch (error) {
          console.error('❌ Database insert failed:', error);
          profile = newProfile;
        }
      }

      // Ensure profile is never null at this point
      if (!profile) {
        profile = createFallbackProfile(authUser);
      }

      const enhancedUser: EnhancedUser = {
        ...authUser,
        profile: profile,
      };

      // Clear the loading timeout since we're done
      clearTimeout(loadingTimeout);

      // Update state with proper values
      setUser(enhancedUser);
      setOnboardingCompleted(Boolean(profile.onboarding_completed));
      setWalletConnected(Boolean(profile.wallet_connected));
      
      // Only set wallet address if user actually has one
      if (profile.algo_address && profile.wallet_connected) {
        setWalletAddress(profile.algo_address);
      } else {
        setWalletAddress(null);
      }
      
      console.log('🎯 Auth state updated successfully:', {
        username: profile.username,
        onboarding_completed: Boolean(profile.onboarding_completed),
        wallet_connected: Boolean(profile.wallet_connected),
        has_algo_address: Boolean(profile.algo_address)
      });
      
    } catch (error) {
      console.error('❌ Profile loading failed completely:', error);
      
      // Use absolute fallback profile only
      const fallbackUser: EnhancedUser = {
        ...authUser,
        profile: createFallbackProfile(authUser),
      };
      
      setUser(fallbackUser);
      setOnboardingCompleted(false);
      setWalletConnected(false);
      setWalletAddress(null);
    } finally {
      // Always clear loading state
      setLoading(false);
    }
  };

  const createFallbackProfile = (authUser: User): Profile => {
    // Generate a better username from email or metadata
    let username = 'User';
    
    if (authUser.user_metadata?.username) {
      username = authUser.user_metadata.username;
    } else if (authUser.user_metadata?.display_name) {
      username = authUser.user_metadata.display_name;
    } else if (authUser.email) {
      const emailPart = authUser.email.split('@')[0];
      username = emailPart.charAt(0).toUpperCase() + emailPart.slice(1);
    } else {
      // Use a random username with user ID suffix
      username = `User${authUser.id.slice(-8)}`;
    }
    
    return {
      id: authUser.id,
      username: username,
      bio: 'Welcome to TruthChain! Verify truth, earn rewards.',
      avatar_url: authUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      reputation_score: 100,
      algo_balance: 0,
      algo_address: null,
      total_stakes: 0,
      successful_challenges: 0,
      accuracy_rate: 1.0,
      onboarding_completed: false,
      wallet_connected: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };

  const clearLocalSession = () => {
    // Clear all local storage auth data
    localStorage.removeItem('truthchain_auth');
    localStorage.removeItem('truthchain_users');
    localStorage.removeItem('truthchain_local_posts');
    
    // Debug: Log what was cleared
    console.log('🧹 Cleared all local storage data');
  };

  const signUp = async (email: string, password: string, username?: string) => {
    console.log('🚀 Starting Supabase signup process...');
    
    try {
      // ONLY use Supabase signup
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username?.trim(),
            display_name: username?.trim()
          }
        }
      });

      if (error) {
        console.error('❌ Supabase signup error:', error);
        throw error;
      }

      if (user) {
        console.log('✅ Supabase signup successful');
        await loadUserProfile(user);
        return { user, error: null };
      } else {
        throw new Error('Signup failed - no user returned');
      }
    } catch (error: any) {
      console.error('❌ Signup failed:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🚀 Starting Supabase signin process...');
    
    try {
      // ONLY use Supabase signin
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Supabase signin error:', error);
        throw error;
      }

      if (data.user) {
        console.log('✅ Supabase signin successful');
        await loadUserProfile(data.user);
        return { user: data.user, error: null };
      } else {
        throw new Error('Signin failed - no user returned');
      }
    } catch (error: any) {
      console.error('❌ Signin failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('🚀 Signing out...');
    
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Supabase signout error:', error);
      }
    } catch (error) {
      console.error('❌ Signout error:', error);
    }
    
    // Always clear all local data
    clearLocalSession();
    setUser(null);
    setWalletAddress(null);
    setOnboardingCompleted(false);
    setWalletConnected(false);
    
    console.log('✅ Signout successful');
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.profile) return null;

    try {
      // Try database update first
      const updatedProfile = await UserService.updateUserProfile(user.id, updates);
      if (updatedProfile) {
        const updatedUser = { ...user, profile: updatedProfile };
        setUser(updatedUser);
        return updatedProfile;
      }
    } catch (error) {
      console.warn('⚠️ Database profile update failed');
    }

    // Fallback to local update only if database fails
    const updatedProfile = { ...user.profile, ...updates, updated_at: new Date().toISOString() };
    const updatedUser = { ...user, profile: updatedProfile };
    setUser(updatedUser);
    
    return updatedProfile;
  };

  const connectWallet = async (address: string) => {
    if (!user) return false;

    try {
      // Use enhanced Algorand service for wallet connection WITHOUT balance syncing
      const { AlgorandService } = await import('./algorand-service');
      const connectionResult = await AlgorandService.connectWallet(user.id, address);
      
      if (!connectionResult.success) {
        console.error('❌ Wallet connection failed:', connectionResult.error);
        return false;
      }
      
      // Update local state WITHOUT balance changes
      const updates = { 
        algo_address: address, 
        wallet_connected: true
        // Remove algo_balance update
      };
      
      await updateProfile(updates);
      setWalletAddress(address);
      setWalletConnected(true);
      
      console.log(`✅ Wallet connected successfully: ${address} (balance preserved)`);
      return true;
    } catch (error: any) {
      console.error('❌ Error connecting wallet:', error);
      return false;
    }
  };

  const unlinkWallet = async () => {
    if (!user) return false;

    try {
      const updates = { 
        algo_address: null, 
        wallet_connected: false
        // Remove algo_balance reset
      };
      
      await updateProfile(updates);
      setWalletAddress(null);
      setWalletConnected(false);
      
      console.log('✅ Wallet unlinked successfully');
      return true;
    } catch (error: any) {
      console.error('❌ Error unlinking wallet:', error);
      return false;
    }
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    connectWallet,
    unlinkWallet,
    walletAddress,
    onboardingCompleted,
    walletConnected,
    isAuthenticated: !!user,
  };
}

export const authRoutes = {
  LANDING: '/',
  DASHBOARD: '/dashboard',
  SIGN_IN: '/?auth=signin',
  SIGN_UP: '/?auth=signup'
};