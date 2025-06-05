import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { AuthDialog } from "../../components/auth/AuthDialog";
import { FloatingHeader } from "../../components/layout/FloatingHeader";
import { CustomCursor } from "../../components/ui/CustomCursor";
import { CallToActionSection } from "./sections/CallToActionSection";
import { NicknameSurvey } from "../../components/dashboard/NicknameSurvey";
import { WalletAuthDialog } from "../../components/auth/WalletAuthDialog";
import { ContentWrapperSection } from "./sections/ContentWrapperSection";
import { FeatureHighlightSection } from "./sections/FeatureHighlightSection";
import { FooterSection } from "./sections/FooterSection/FooterSection";
import { HeaderSection } from "./sections/HeaderSection";
import { HeroSection } from "../../components/ui/hero-section-9";
import { IntroductionSection } from "./sections/IntroductionSection";
import { Features } from "../../components/ui/features-8";
import { MainContentSection } from "./sections/MainContentSection/MainContentSection";
import { NavigationSection } from "./sections/NavigationSection";
import { PartnerLogosSection } from "./sections/PartnerLogosSection/PartnerLogosSection";
import { SecuritySection } from "./sections/SecuritySection/SecuritySection";
import { SocialProofSection } from "./sections/SocialProofSection/SocialProofSection";
import { StatsSection } from "./sections/StatsSection/StatsSection";
import { TestimonialsSection } from "./sections/TestimonialsSection/TestimonialsSection";
import { WhitelistedPeopleSection } from "./sections/WhitelistedPeopleSection/WhitelistedPeopleSection";
import { useAlgorandWallet } from "../../components/algorand/AlgorandWallet";
import { useAuth } from "../../lib/auth";
import { useToast } from "../../components/ui/use-toast";

export const Desktop = (): JSX.Element => {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showSurvey, setShowSurvey] = useState(false);
  const [showWalletAuth, setShowWalletAuth] = useState(false);
  const navigate = useNavigate();
  const { peraWallet } = useAlgorandWallet();
  const { user } = useAuth();
  const { toast } = useToast();

  // Button handlers with session detection
  const handleJoinWaitlist = () => {
    // Check if user is already logged in
    if (user) {
      console.log('🔄 User already authenticated, redirecting to dashboard...');
      navigate('/dashboard');
      return;
    }
    setAuthMode('signup');
    setAuthOpen(true);
  };

  const handleStartEarning = () => {
    // Check if user is already logged in
    if (user) {
      console.log('🔄 User already authenticated, redirecting to dashboard...');
      navigate('/dashboard');
      return;
    }
    setAuthMode('signin');
    setAuthOpen(true);
  };

  const handleVerifyAction = () => {
    // Check if user is already logged in
    if (user) {
      console.log('🔄 User already authenticated, redirecting to dashboard...');
      navigate('/dashboard');
      return;
    }
    setAuthMode('signin');
    setAuthOpen(true);
  };

  const handleConnectWallet = () => {
    // Check if user is already logged in
    if (user) {
      console.log('🔄 User already authenticated, redirecting to dashboard...');
      navigate('/dashboard');
      return;
    }
    setShowWalletAuth(true);
  };

  const handleSurveyComplete = (nickname: string, bio: string) => {
    // Save user profile to localStorage
    localStorage.setItem('truthchain-profile', JSON.stringify({ nickname, bio }));
    setShowSurvey(false);
    // Show wallet connection after survey
    setShowWalletAuth(true);
  };

  const handleWalletConnected = () => {
    setShowWalletAuth(false);
    
    // Show success notification with toast
    toast({
      title: "🎉 Wallet Connected Successfully!",
      description: "You are now being redirected to your dashboard. Welcome to TruthChain!",
      duration: 3000,
    });
    
    // Navigate to dashboard after wallet connection
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const handleLearnMore = () => {
    // Smooth scroll to the crisis section
    const crisisSection = document.querySelector('#crisis-section');
    if (crisisSection) {
      crisisSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Stats data for the crisis section
  const statsData = [
    {
      value: "73%",
      description: "of people can't distinguish real news from fake",
    },
    {
      value: "$78B",
      description: "lost annually due to misinformation",
    },
    {
      value: "48",
      description: "countries affected by coordinated disinformation",
    },
  ];

  return (
    <div className="bg-black min-h-screen w-full landing-page">
      <CustomCursor />
      <FloatingHeader onSignIn={handleStartEarning} />
      {/* Bolt.new Badge - Enhanced */}
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

      <div className="w-full max-w-[1440px] mx-auto">

        {/* New Hero Section */}
        <HeroSection />

        {/* Partner Logos Section */}
        <section className="w-full py-16 px-6">
          <div className="text-center mb-12">
            <h3 className="font-medium text-white text-2xl mb-4">
              Grateful for Our Amazing Technology Providers
            </h3>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Thanks to these wonderful companies that make TruthChain possible. 
              Their cutting-edge technologies power our platform's innovation.
            </p>
          </div>

          <div className="relative overflow-hidden w-full">
            <div className="flex animate-scroll-left">
              <div className="flex items-center justify-center gap-16 min-w-full shrink-0">
                <img
                  className="w-32 h-20 object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100 mx-8"
                  alt="Algorand - Blockchain Infrastructure"
                  src="/algorand_full_logo_white.png"
                />
                <img
                  className="w-32 h-20 object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100 mx-8"
                  alt="ElevenLabs - AI Voice Technology"
                  src="/Eleven labs.png"
                />
                <img
                  className="w-32 h-20 object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100 mx-8"
                  alt="Netlify - Deployment Platform"
                  src="/Netlify_logo_(2).svg.png"
                />
                <img
                  className="w-32 h-20 object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100 mx-8"
                  alt="Supabase - Database Platform"
                  src="/supabase-logo-wordmark--dark.png"
                />
                <img
                  className="w-32 h-20 object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100 mx-8"
                  alt="Suentry  - Database Platform"
                  src="/entri-logo-removebg-preview.png"
                />       
                <img
                  className="w-32 h-20 object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100 mx-8"
                  alt="Supabase - Database Platform"
                  src="/nodely.png"
                />                           
                <img
                  className="w-28 h-20 object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100 mx-8"
                  alt="Powered By Technology"
                  src="/logotext_poweredby_360w.png"
                />
              </div>
              
              {/* Duplicate for seamless loop */}
              <div className="flex items-center justify-center gap-16 min-w-full shrink-0">
                <img
                  className="w-32 h-20 object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100 mx-8"
                  alt="Algorand - Blockchain Infrastructure"
                  src="/algorand_full_logo_white.png"
                />
                <img
                  className="w-32 h-20 object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100 mx-8"
                  alt="ElevenLabs - AI Voice Technology"
                  src="/Eleven labs.png"
                />
                <img
                  className="w-32 h-20 object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100 mx-8"
                  alt="Netlify - Deployment Platform"
                  src="/Netlify_logo_(2).svg.png"
                />
                <img
                  className="w-32 h-20 object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100 mx-8"
                  alt="Supabase - Database Platform"
                  src="/supabase-logo-wordmark--dark.png"
                />
                <img
                  className="w-32 h-20 object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100 mx-8"
                  alt="Entri - se Platform"
                  src="/entri-logo-removebg-preview.png"
                />     
                <img
                  className="w-32 h-20 object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100 mx-8"
                  alt="nd - Database Platform"
                  src="/nodely.png"
                />                           
                <img
                  className="w-28 h-20 object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100 mx-8"
                  alt="Powered By Technology"
                  src="/logotext_poweredby_360w.png"
                />
              </div>
            </div>
          </div>
        </section>

        {/* App Showcase Video Section */}
        <section className="w-full py-20 px-6 relative overflow-hidden">
          {/* 3D Background elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-pink-500/30 to-cyan-500/30 rounded-full blur-3xl animate-bounce"></div>
          </div>

          <div className="relative z-10 max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="font-black text-white text-4xl md:text-6xl mb-8 leading-tight"
              >
                🎬 See TruthChain{" "}
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
                  In Action
                </span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-gray-300 text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed"
              >
                🚀 Watch our platform revolutionize social media with blockchain-powered truth verification and AI moderation
              </motion.p>
            </div>

            {/* Video Container with 3D Effects */}
            <motion.div 
              initial={{ opacity: 0, y: 50, rotateX: 15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative perspective-1000 max-w-5xl mx-auto"
            >
              <div className="relative transform-gpu hover:rotateY-1 transition-transform duration-700">
                {/* Glowing border effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-3xl blur-xl opacity-30 animate-pulse scale-[1.02]"></div>
                
                {/* Video container */}
                <div className="relative bg-black/40 backdrop-blur-xl rounded-3xl border border-white/30 overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] group">
                  {/* Enhanced frame with browser-like header */}
                  <div className="bg-gray-900/90 backdrop-blur-sm px-6 py-4 border-b border-white/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                          <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg animate-pulse"></div>
                          <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-lg animate-pulse delay-75"></div>
                          <div className="w-4 h-4 bg-green-500 rounded-full shadow-lg animate-pulse delay-150"></div>
                        </div>
                        <div className="ml-4 text-white/80 text-sm font-mono bg-white/10 px-4 py-2 rounded-lg">
                          🎥 app.truthchain.com - Live Demo
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-white/60 text-sm font-semibold">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        <span>LIVE SHOWCASE</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Video element */}
                  <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-black">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      disablePictureInPicture
                      controlsList="nodownload nofullscreen noremoteplayback"
                      className="w-full h-full object-cover"
                      style={{
                        pointerEvents: 'none', // Disable all user interactions
                      }}
                    >
                      {/* Placeholder - Replace with your actual video */}
                      <source src="/app-showcase-video.mp4" type="video/mp4" />
                      
                      {/* Fallback for browsers that don't support video */}
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900">
                        <div className="text-center">
                          <div className="text-8xl mb-4">🎬</div>
                          <h3 className="text-white text-2xl font-bold mb-2">App Showcase Video</h3>
                          <p className="text-gray-300">Your browser doesn't support video playback</p>
                        </div>
                      </div>
                    </video>
                    
                    {/* Video overlay for extra styling */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
                    
                    {/* Floating UI elements to make it look more app-like */}
                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 pointer-events-none">
                      <span className="text-white text-sm font-medium">🚀 TruthChain Demo</span>
                    </div>
                    
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 pointer-events-none">
                      <span className="text-green-400 text-sm font-medium">● LIVE</span>
                    </div>
                    
                    {/* Bottom info bar */}
                    <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 pointer-events-none">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-white text-sm font-medium">⚡ Real-time Truth Verification</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-purple-400 text-sm">🔒 Blockchain Secured</span>
                          <span className="text-cyan-400 text-sm">🤖 AI Powered</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Shimmer effect overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-all duration-1000 pointer-events-none"></div>
                </div>
              </div>
            </motion.div>

            {/* Video description */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-center mt-12"
            >
              <div className="max-w-3xl mx-auto">
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  Experience the future of social media where truth has real value. See how our AI moderators, 
                  blockchain verification, and community-driven fact-checking create a platform built on trust and transparency.
                </p>
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2">
                    <span className="text-blue-400">🎯</span>
                    <span className="text-white">Video Demo</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2">
                    <span className="text-green-400">⚡</span>
                    <span className="text-white">Real Features</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2">
                    <span className="text-purple-400">🚀</span>
                    <span className="text-white">Live Platform</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Crisis of Truth Section - Enhanced with 3D */}
        <section id="crisis-section" className="w-full py-24 px-6 relative overflow-hidden">
          {/* 3D Background elements */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-bounce"></div>
          </div>

          <div className="relative z-10 max-w-6xl mx-auto text-center mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="font-black text-white text-5xl md:text-7xl mb-8 leading-tight"
            >
              The Crisis of{" "}
              <span className="bg-gradient-to-r from-red-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                Truth
              </span>{" "}
              in Social Media
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-medium text-gray-300 text-xl md:text-2xl leading-relaxed max-w-4xl mx-auto"
            >
              In today's digital landscape, misinformation spreads{" "}
              <span className="text-red-400 font-bold">six times faster</span>{" "}
              than factual content. Our platform aims to solve this
              growing crisis by{" "}
              <span className="text-cyan-400 font-bold">incentivizing truth</span>.
            </motion.p>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {statsData.map((stat, index) => (
              <motion.div
                initial={{ opacity: 0, y: 50, rotateX: 45 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                key={index}
                className="perspective-1000"
              >
                <Card className="group relative bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-700/50 rounded-3xl backdrop-blur-xl hover:border-gray-500/80 transition-all duration-500 transform hover:scale-105 hover:rotate-y-12 overflow-hidden">
                  {/* Glowing effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Animated border */}
                  <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <CardContent className="relative p-10 text-center z-10">
                    <div className="relative">
                      <div className="font-black text-6xl md:text-7xl mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent animate-pulse transform group-hover:scale-110 transition-transform duration-300">
                        {stat.value}
                      </div>
                      <div className="font-semibold text-gray-300 text-lg md:text-xl leading-relaxed group-hover:text-white transition-colors duration-300">
                        {stat.description}
                      </div>
                      
                      {/* Floating particles */}
                      <div className="absolute -top-2 -right-2 w-2 h-2 bg-purple-400 rounded-full animate-ping opacity-75"></div>
                      <div className="absolute top-4 -left-1 w-1 h-1 bg-pink-400 rounded-full animate-pulse opacity-50"></div>
                      <div className="absolute -bottom-1 right-4 w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce opacity-60"></div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Enhanced call to action */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mt-16"
          >
            <Button 
              className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 text-white px-12 py-4 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-[0_20px_50px_rgba(255,50,150,0.4)] transition-all duration-500 transform hover:scale-105 animate-pulse"
              onClick={handleJoinWaitlist}
            >
              Join the Solution
            </Button>
          </motion.div>
        </section>

        {/* Truth Staking Demo Section */}
        <section className="w-full py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-bold text-white text-4xl mb-6">
                Introducing Truth Staking
              </h2>
              <p className="text-gray-300 text-xl max-w-3xl mx-auto">
                Stake tokens on information you believe is true. Earn rewards when your 
                judgment is validated by our decentralized verification network.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left side - Community Feed */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6 hover:shadow-2xl hover:shadow-purple-500/20 transition-all"
              >
                <h3 className="text-white text-xl font-semibold mb-4">Community Feed</h3>
                <div className="space-y-4">
                  <div className="bg-black/30 rounded-lg p-4 border border-gray-600">
                    <div className="text-white text-sm mb-2">@climate_researcher</div>
                    <div className="text-gray-300 text-sm mb-3">
                      New study shows 15% reduction in Arctic ice this year...
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <span className="text-green-400 text-xs">✓ 156 verified</span>
                        <span className="text-gray-500 text-xs">12 staked</span>
                      </div>
                      <Button size="sm" className="text-xs" onClick={handleVerifyAction}>Verify</Button>
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4 border border-gray-600">
                    <div className="text-white text-sm mb-2">@tech_analyst</div>
                    <div className="text-gray-300 text-sm mb-3">
                      AI model accuracy improved by 23% using new algorithm...
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <span className="text-green-400 text-xs">✓ 89 verified</span>
                        <span className="text-gray-500 text-xs">7 staked</span>
                      </div>
                      <Button size="sm" className="text-xs" onClick={handleVerifyAction}>Verify</Button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right side - Earnings Overview */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6 hover:shadow-2xl hover:shadow-pink-500/20 transition-all"
              >
                <h3 className="text-white text-xl font-semibold mb-4">Earnings Overview</h3>
                <div className="space-y-4">
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300 text-sm">Total Earned</span>
                      <span className="text-white font-bold">$1,234.56</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{width: '73%'}}></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/30 rounded-lg p-4 text-center">
                      <div className="text-white text-lg font-bold">89%</div>
                      <div className="text-gray-400 text-xs">Accuracy Rate</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4 text-center">
                      <div className="text-white text-lg font-bold">156</div>
                      <div className="text-gray-400 text-xs">Verifications</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="text-center mt-12">
              <Button 
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 text-lg font-semibold rounded-lg hover:shadow-lg transition-all"
                onClick={handleStartEarning}
              >
                Start Earning
              </Button>
            </div>
          </div>
        </section>

        {/* Revolutionary Features Section */}
        <Features />

        {/* Whitelisted People Section */}
        <WhitelistedPeopleSection />

        {/* Call to Action Section */}
        <section className="w-full py-20 px-6 relative overflow-hidden">
          {/* Enhanced background elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-80 h-80 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl animate-bounce"></div>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="font-black text-white text-4xl md:text-6xl mb-6 leading-tight"
            >
              🚀 Join{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
                Now
              </span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-gray-300 text-xl mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              🌟 Join thousands of truth-seekers building the future of verified information.
              Early access includes <span className="text-yellow-400 font-semibold">bonus tokens</span> and <span className="text-cyan-400 font-semibold">exclusive features</span>.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
            >
              <Button 
                className="group relative bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-4 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-[0_20px_50px_rgba(168,85,247,0.4)] transition-all duration-500 transform hover:scale-105 btn-3d"
                onClick={handleJoinWaitlist}
              >
                <span className="relative z-10 flex items-center gap-2">
                  ⚡ Join Waitlist Now
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              </Button>
            </motion.div>

            {/* Enhanced spinning logo with stats */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-spin flex items-center justify-center shadow-2xl">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">⚡</span>
                  </div>
                </div>
                {/* Orbiting particles */}
                <div className="absolute inset-0 animate-spin" style={{animationDuration: '3s', animationDirection: 'reverse'}}>
                  <div className="absolute top-0 left-1/2 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                </div>
                <div className="absolute inset-0 animate-spin" style={{animationDuration: '4s'}}>
                  <div className="absolute left-0 top-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
                  <div className="absolute right-0 top-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              {/* Mini stats display */}
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2">
                  <span className="text-purple-400">🚀</span>
                  <span className="text-white ml-2">Pre-launch Phase</span>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2">
                  <span className="text-green-400">✅</span>
                  <span className="text-white ml-2">Limited Spots</span>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-white ml-2">Early Rewards</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <FooterSection />
      </div>
      <AuthDialog 
        isOpen={authOpen} 
        onClose={() => setAuthOpen(false)} 
        defaultTab={authMode}
      />
      <NicknameSurvey 
        isOpen={showSurvey} 
        onComplete={handleSurveyComplete} 
      />
      <WalletAuthDialog 
        isOpen={showWalletAuth} 
        onClose={() => setShowWalletAuth(false)}
        onWalletConnect={handleWalletConnected}
      />
    </div>
  );
};