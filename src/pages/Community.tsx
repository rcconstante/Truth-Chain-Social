import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Users, Star, Trophy, Target, ArrowRight, Heart, Zap, Globe, Award } from 'lucide-react';
import { Button } from '../components/ui/button';
import { FloatingHeader } from '../components/layout/FloatingHeader';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';

export function Community() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = () => {
    // Check if user is already logged in
    if (user) {
      console.log('🔄 User already authenticated, redirecting to dashboard...');
      navigate('/dashboard');
      return;
    }
    // If not logged in, navigate to main page (which has auth functionality)
    navigate('/');
  };

  // Real contributors will be loaded from the database
  const topContributors: Array<{ name: string; score: number; contributions: number }> = [
    // Will be populated with real user data from the database
  ];

  // Real events will be managed through the platform
  const upcomingEvents: Array<{ title: string; date: string; description: string }> = [
    // Will be populated with real events from the database
  ];

  const communityValues = [
    {
      icon: Heart,
      title: "Truth First",
      description: "Unwavering commitment to accuracy and verification",
      color: "from-red-500 to-pink-500",
      gradient: "from-red-500/20 to-pink-500/20"
    },
    {
      icon: Users,
      title: "Collaborative",
      description: "Building knowledge together through diverse perspectives",
      color: "from-blue-500 to-cyan-500",
      gradient: "from-blue-500/20 to-cyan-500/20"
    },
    {
      icon: Zap,
      title: "Innovative",
      description: "Leveraging cutting-edge technology for transparency",
      color: "from-yellow-500 to-orange-500",
      gradient: "from-yellow-500/20 to-orange-500/20"
    },
    {
      icon: Globe,
      title: "Global Impact",
      description: "Creating positive change in information sharing worldwide",
      color: "from-green-500 to-emerald-500",
      gradient: "from-green-500/20 to-emerald-500/20"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <FloatingHeader onSignIn={handleSignIn} />
      
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
      
      {/* Floating Background Particles */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-60 right-20 w-48 h-48 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-60 right-1/4 w-32 h-32 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-full blur-xl animate-levitate"></div>
      </div>

      {/* Enhanced Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 via-pink-600/20 to-transparent" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-8xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-2xl">
                Join Our
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent animate-pulse">
                Community
              </span>
            </h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto font-light mb-12 leading-relaxed"
            >
              Connect with fellow truth-seekers and help build{" "}
              <span className="text-cyan-400 font-semibold">a more reliable information ecosystem</span>.
            </motion.p>
            
            {/* 3D floating community icons */}
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="flex justify-center items-center gap-8 mb-12"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse shadow-2xl shadow-purple-500/50 flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-bounce shadow-2xl shadow-cyan-500/50 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full animate-float shadow-2xl shadow-emerald-500/50 flex items-center justify-center">
                <Star className="w-10 h-10 text-white" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Stats Section with 3D Cards */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: Users, label: "Members", value: "0", color: "text-blue-400", gradient: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30" },
            { icon: Star, label: "Verifications", value: "0", color: "text-purple-400", gradient: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/30" },
            { icon: Trophy, label: "Rewards Distributed", value: "0 ALGO", color: "text-amber-400", gradient: "from-amber-500/20 to-yellow-500/20", border: "border-amber-500/30" },
            { icon: Target, label: "Accuracy Rate", value: "N/A", color: "text-emerald-400", gradient: "from-emerald-500/20 to-green-500/20", border: "border-emerald-500/30" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 50, rotateX: 45 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              className="perspective-1000"
            >
              <Card className={`group card-3d bg-gradient-to-br from-gray-900/80 to-black/80 border ${stat.border} rounded-3xl backdrop-blur-xl hover:border-gray-500/80 transition-all duration-700 overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}></div>
                <CardContent className="relative p-8 text-center z-10">
                  <stat.icon className={`w-12 h-12 ${stat.color} mb-6 mx-auto transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`} />
                  <div className={`text-4xl font-black mb-3 ${stat.color} group-hover:scale-110 transition-transform duration-300`}>{stat.value}</div>
                  <div className="text-gray-400 group-hover:text-white transition-colors duration-300 font-semibold">{stat.label}</div>
                  
                  {/* Floating particles */}
                  <div className={`absolute top-4 right-4 w-2 h-2 bg-${stat.color.split('-')[1]}-400 rounded-full animate-ping opacity-75`}></div>
                  <div className={`absolute bottom-4 left-4 w-1.5 h-1.5 bg-${stat.color.split('-')[1]}-400 rounded-full animate-pulse opacity-60`}></div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Community Values Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Our Values
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The principles that guide our community in the pursuit of truth
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {communityValues.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 50, rotateX: 45 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                className="perspective-1000"
              >
                <Card className="group relative card-3d bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-700/50 rounded-3xl backdrop-blur-xl hover:border-gray-500/80 transition-all duration-700 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}></div>
                  <CardContent className="relative p-8 text-center z-10">
                    <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                      <value.icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                      {value.title}
                    </h3>
                    <p className="text-gray-300/90 leading-relaxed group-hover:text-white transition-colors duration-300 text-sm">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Top Contributors */}
      <section className="py-24 px-6 bg-gradient-to-br from-gray-900/50 to-black/80 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-bounce"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Top Contributors
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Celebrating our community leaders who champion truth and transparency
            </p>
          </motion.div>

          {topContributors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {topContributors.map((contributor, index) => (
                <motion.div
                  key={contributor.name}
                  initial={{ opacity: 0, y: 50, rotateX: 45 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                  className="perspective-1000"
                >
                  <Card className="group card-3d bg-black/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl hover:border-purple-500/50 transition-all duration-700 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="relative p-8 text-center z-10">
                      <Avatar className="w-20 h-20 mx-auto mb-6 ring-4 ring-purple-500/30 group-hover:ring-purple-400/60 transition-all duration-300 transform group-hover:scale-110">
                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-400 text-xl font-bold">
                          {contributor.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold mb-3 text-white text-xl tracking-wide group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                        {contributor.name}
                      </h3>
                      <div className="text-purple-400 font-semibold mb-2 group-hover:text-purple-300 transition-colors">
                        Truth Score: {contributor.score}
                      </div>
                      <div className="text-white/80 text-sm group-hover:text-white transition-colors">
                        Contributions: {contributor.contributions}
                      </div>
                      
                      {/* Rank badge */}
                      <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center shadow-2xl">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center py-20"
            >
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                <Trophy className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">No contributors yet</h3>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
                Be the first to contribute and earn your place on the leaderboard! 
                Start verifying information and building your truth score today.
              </p>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 text-lg font-semibold rounded-xl hover:shadow-lg transition-all transform hover:scale-105">
                Start Contributing
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Enhanced Upcoming Events */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Upcoming Events
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join our community events and workshops to learn and connect
            </p>
          </motion.div>

          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.title}
                  initial={{ opacity: 0, y: 50, rotateX: 45 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                  className="perspective-1000"
                >
                  <Card className="group card-3d bg-black/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl hover:border-gray-500/80 transition-all duration-700 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="relative p-8 z-10">
                      <h3 className="font-bold mb-3 text-xl text-white tracking-wide group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                        {event.title}
                      </h3>
                      <p className="text-purple-400 text-sm mb-4 font-semibold">{event.date}</p>
                      <p className="text-gray-400 text-sm mb-6 group-hover:text-gray-300 transition-colors duration-300">
                        {event.description}
                      </p>
                      <Button 
                        variant="outline" 
                        className="w-full border-purple-500/50 hover:bg-purple-500/20 hover:border-purple-400/80 transition-all duration-300 font-semibold"
                      >
                        Learn More
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center py-20"
            >
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                <MessageCircle className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">No events scheduled</h3>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
                Check back later for community events and workshops! 
                We're planning exciting gatherings for truth-seekers like you.
              </p>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 text-lg font-semibold rounded-xl hover:shadow-lg transition-all transform hover:scale-105">
                Subscribe to Updates
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Enhanced Community Guidelines */}
      <section className="py-24 px-6 bg-gradient-to-br from-gray-900/50 to-black/80 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-bounce"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white via-green-200 to-emerald-200 bg-clip-text text-transparent">
              Community Guidelines
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our community is built on trust, respect, and a shared commitment to truth
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50, rotateY: 30 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8 }}
              className="perspective-1000"
            >
              <Card className="group card-3d bg-black/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl hover:border-green-500/50 transition-all duration-700 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="relative p-8 z-10">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-white via-green-200 to-emerald-200 bg-clip-text text-transparent">
                      Core Values
                    </span>
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-gray-300 group-hover:text-white transition-colors">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      Commitment to accuracy and truth
                    </li>
                    <li className="flex items-center gap-3 text-gray-300 group-hover:text-white transition-colors">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-75"></div>
                      Respect for diverse perspectives
                    </li>
                    <li className="flex items-center gap-3 text-gray-300 group-hover:text-white transition-colors">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-150"></div>
                      Transparency in verification process
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50, rotateY: -30 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8 }}
              className="perspective-1000"
            >
              <Card className="group card-3d bg-black/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl hover:border-purple-500/50 transition-all duration-700 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="relative p-8 z-10">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                      Participation Rules
                    </span>
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-gray-300 group-hover:text-white transition-colors">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      Verify claims with credible sources
                    </li>
                    <li className="flex items-center gap-3 text-gray-300 group-hover:text-white transition-colors">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-75"></div>
                      Maintain professional discourse
                    </li>
                    <li className="flex items-center gap-3 text-gray-300 group-hover:text-white transition-colors">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-150"></div>
                      Support others in their truth journey
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-blue-600/20"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-black mb-8 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Ready to Join Us?
            </h2>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto">
              Become part of the truth revolution and help build a more transparent digital world.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button className="group btn-3d bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white px-12 py-4 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-[0_20px_50px_rgba(168,85,247,0.4)] transition-all duration-500 transform hover:scale-105 overflow-hidden">
                <span className="relative z-10">Join Community</span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </Button>
              
              <Button variant="outline" className="group btn-3d border-2 border-white/50 text-white hover:bg-white/10 bg-black/20 backdrop-blur-sm px-12 py-4 text-xl font-bold rounded-2xl">
                Learn More
              </Button>
            </div>
            
            {/* Floating particles around CTA */}
            <div className="absolute -top-10 -left-10 w-4 h-4 bg-purple-400 rounded-full animate-ping opacity-60"></div>
            <div className="absolute top-20 -right-8 w-3 h-3 bg-pink-400 rounded-full animate-bounce opacity-70"></div>
            <div className="absolute -bottom-8 left-20 w-2 h-2 bg-cyan-400 rounded-full animate-pulse opacity-50"></div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}