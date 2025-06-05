import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Desktop } from './screens/Desktop/Desktop';
import { HowItWorks } from './pages/HowItWorks';
import { Community } from './pages/Community';
import { Docs } from './pages/Docs';
import { AlgorandDashboard } from './pages/dashboard/AlgorandDashboard';
import { HomeFeed } from './pages/dashboard/HomeFeed';
import { Explore } from './pages/dashboard/Explore';
import { MyPosts } from './pages/dashboard/MyPosts';
import { StakedPosts } from './pages/dashboard/StakedPosts';
import { Challenges } from './pages/dashboard/Challenges';
import { Profile } from './pages/dashboard/Profile';
import { Wallet } from './pages/dashboard/Wallet';
import { ChatRooms } from './pages/dashboard/ChatRooms';
import { VoiceRooms } from './pages/dashboard/VoiceRooms';
import { Leaderboard } from './pages/dashboard/Leaderboard';
import { LearningCenter } from './pages/dashboard/LearningCenter';
import { AIModeratorHub } from './pages/dashboard/AIModeratorHub';
import { Settings } from './pages/dashboard/Settings';
import { VoiceStudio } from './pages/VoiceStudio';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Toaster } from './components/ui/toaster';
import { SmartContract } from './pages/SmartContract';
import { ThemeProvider } from './contexts/ThemeContext';
import { Explorer } from './pages/dashboard/Explorer';
import { PublicExplorer } from './pages/PublicExplorer';

export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          {/* Landing page at root */}
          <Route path="/" element={<Desktop />} />
          
          {/* Public pages */}
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/community" element={<Community />} />
          <Route path="/docs" element={<Docs />} />
          
          {/* Public Explorer - No auth required */}
          <Route path="/explorer" element={<PublicExplorer />} />
          
          {/* Protected dashboard routes - Primary Navigation */}
          <Route 
            path="/dashboard" 
            element={<Navigate to="/dashboard/feed" replace />}
          />
          <Route 
            path="/dashboard/feed" 
            element={
              <ProtectedRoute>
                <HomeFeed />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/explore" 
            element={
              <ProtectedRoute>
                <Explore />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/my-posts" 
            element={
              <ProtectedRoute>
                <MyPosts />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/staked" 
            element={
              <ProtectedRoute>
                <StakedPosts />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/challenges" 
            element={
              <ProtectedRoute>
                <Challenges />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/wallet" 
            element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/explorer" 
            element={
              <ProtectedRoute>
                <Explorer />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />

          {/* Protected dashboard routes - Secondary Navigation */}
          <Route 
            path="/dashboard/chat-rooms" 
            element={
              <ProtectedRoute>
                <ChatRooms />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/voice-rooms" 
            element={
              <ProtectedRoute>
                <VoiceRooms />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/ai-moderator-hub" 
            element={
              <ProtectedRoute>
                <AIModeratorHub />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/voice-studio" 
            element={
              <ProtectedRoute>
                <VoiceStudio />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/leaderboard" 
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/learning" 
            element={
              <ProtectedRoute>
                <LearningCenter />
              </ProtectedRoute>
            } 
          />

          {/* Legacy routes for backward compatibility */}
          <Route 
            path="/dashboard/algorand" 
            element={
              <ProtectedRoute>
                <AlgorandDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/smart-contract" 
            element={
              <ProtectedRoute>
                <SmartContract />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Global toast notifications */}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}