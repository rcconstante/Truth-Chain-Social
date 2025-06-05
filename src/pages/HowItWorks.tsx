import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Code, Coins, Shield, Target, Users, Zap, Database, Globe } from 'lucide-react';
import { Button } from '../components/ui/button';
import { FloatingHeader } from '../components/layout/FloatingHeader';
import { Card, CardContent } from '../components/ui/card';
import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';

export function HowItWorks() {
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
  const steps = [
    {
      title: "Create Your Account",
      description: "Sign up and connect your Algorand wallet to start participating in the truth verification network.",
      icon: Users,
      color: "from-blue-600 to-cyan-400",
      gradient: "from-blue-500/20 to-cyan-500/20"
    },
    {
      title: "Stake on Truth",
      description: "Put your ALGO tokens behind information you believe is accurate and verifiable.",
      icon: Coins,
      color: "from-purple-600 to-pink-400",
      gradient: "from-purple-500/20 to-pink-500/20"
    },
    {
      title: "Verify Claims",
      description: "Participate in the community verification process by validating other users' posts.",
      icon: CheckCircle,
      color: "from-emerald-600 to-green-400",
      gradient: "from-emerald-500/20 to-green-500/20"
    },
    {
      title: "Build Reputation",
      description: "Earn reputation points and increase your truth score through accurate verifications.",
      icon: Target,
      color: "from-amber-600 to-yellow-400",
      gradient: "from-amber-500/20 to-yellow-500/20"
    },
    {
      title: "Earn Rewards",
      description: "Get rewarded with ALGO tokens when your verifications prove correct.",
      icon: Shield,
      color: "from-rose-600 to-red-400",
      gradient: "from-rose-500/20 to-red-500/20"
    }
  ];

  const techFeatures = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Sub-second transaction confirmation",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Database,
      title: "Immutable Records",
      description: "Permanent verification history",
      color: "from-purple-500 to-indigo-500"
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Decentralized truth verification",
      color: "from-cyan-500 to-blue-500"
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
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-40 right-1/3 w-32 h-32 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-full blur-xl animate-levitate"></div>
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
                How TruthChain
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent animate-pulse">
                Works
              </span>
            </h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto font-light mb-12 leading-relaxed"
            >
              Discover how our revolutionary blockchain-powered platform incentivizes truth and
              builds a <span className="text-cyan-400 font-semibold">more reliable information ecosystem</span>.
            </motion.p>
            
            {/* 3D floating elements */}
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="flex justify-center items-center gap-8 mb-12"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse shadow-2xl shadow-purple-500/50"></div>
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-bounce shadow-2xl shadow-cyan-500/50"></div>
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full animate-float shadow-2xl shadow-emerald-500/50"></div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Steps Section with 3D Cards */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              The Journey to Truth
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Follow these simple steps to become part of the truth revolution
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 50, rotateX: 45 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                className="perspective-1000"
              >
                <Card className="group relative card-3d bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-700/50 rounded-3xl backdrop-blur-xl hover:border-gray-500/80 transition-all duration-700 overflow-hidden">
                  {/* Glowing background effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}></div>
                  
                  {/* Animated border */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${step.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl`}></div>
                  
                  <CardContent className="relative p-8 z-10">
                    {/* Step number */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-gray-800 to-gray-900 border-2 border-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-2xl backdrop-blur-sm">
                      {index + 1}
                    </div>
                    
                    {/* Icon with 3D effect */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-2xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                      <step.icon className="w-8 h-8 text-white drop-shadow-lg" />
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 text-white tracking-wide group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                      {step.title}
                    </h3>
                    
                    <p className="text-gray-300/90 leading-relaxed group-hover:text-white transition-colors duration-300">
                      {step.description}
                    </p>
                    
                    {/* Floating particles */}
                    <div className="absolute top-4 right-8 w-2 h-2 bg-purple-400 rounded-full animate-ping opacity-75"></div>
                    <div className="absolute bottom-8 left-6 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse opacity-60"></div>
                    <div className="absolute top-1/2 left-4 w-1 h-1 bg-cyan-400 rounded-full animate-bounce opacity-50"></div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Technical Details with 3D Effects */}
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
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Powered by Innovation
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Built on cutting-edge blockchain technology for maximum security and transparency
            </p>
          </motion.div>

          {/* Tech Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {techFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.8, rotateY: 45 }}
                whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                className="perspective-1000"
              >
                <Card className="group relative card-3d bg-black/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl hover:border-gray-500/80 transition-all duration-700 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}></div>
                  <CardContent className="relative p-8 text-center z-10">
                    <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                      <feature.icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Technical Implementation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50, rotateY: 30 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8 }}
              className="perspective-1000"
            >
              <Card className="group card-3d bg-black/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl hover:border-purple-500/50 transition-all duration-700 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="relative p-8 z-10">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Code className="w-6 h-6 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                      Smart Contract Integration
                    </span>
                  </h3>
                  <ul className="space-y-4 text-gray-300">
                    <li className="flex items-center gap-3 group-hover:text-white transition-colors">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      Automated stake distribution
                    </li>
                    <li className="flex items-center gap-3 group-hover:text-white transition-colors">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-75"></div>
                      Transparent verification process
                    </li>
                    <li className="flex items-center gap-3 group-hover:text-white transition-colors">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-150"></div>
                      Immutable record keeping
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
              <Card className="group card-3d bg-black/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl hover:border-green-500/50 transition-all duration-700 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="relative p-8 z-10">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-white via-green-200 to-emerald-200 bg-clip-text text-transparent">
                      Security Features
                    </span>
                  </h3>
                  <ul className="space-y-4 text-gray-300">
                    <li className="flex items-center gap-3 group-hover:text-white transition-colors">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      Multi-signature verification
                    </li>
                    <li className="flex items-center gap-3 group-hover:text-white transition-colors">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-75"></div>
                      Decentralized consensus
                    </li>
                    <li className="flex items-center gap-3 group-hover:text-white transition-colors">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-150"></div>
                      Fraud prevention mechanisms
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
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-red-600/20"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-black mb-8 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto">
              Join our growing community of truth-seekers and start earning rewards
              for verifying information on the blockchain.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button className="group btn-3d bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white px-12 py-4 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-[0_20px_50px_rgba(168,85,247,0.4)] transition-all duration-500 transform hover:scale-105 overflow-hidden">
                <span className="relative z-10">Join TruthChain</span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </Button>
              
              <Button variant="outline" className="group btn-3d border-2 border-white/50 text-white hover:bg-white/10 bg-black/20 backdrop-blur-sm px-12 py-4 text-xl font-bold rounded-2xl">
                View Demo
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