import React from 'react';
import { motion } from 'framer-motion';
import { Book, Code, FileText, GitBranch, MessageCircle, Search, Zap, Database, Shield, Globe, Terminal, Rocket } from 'lucide-react';
import { Button } from '../components/ui/button';
import { FloatingHeader } from '../components/layout/FloatingHeader';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';

export function Docs() {
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
  const sections = [
    {
      title: "Getting Started",
      icon: Rocket,
      color: "from-blue-500 to-cyan-500",
      gradient: "from-blue-500/20 to-cyan-500/20",
      items: [
        "Introduction to TruthChain",
        "Setting up your wallet",
        "Creating your first post",
        "Understanding truth scores"
      ]
    },
    {
      title: "Core Concepts",
      icon: Database,
      color: "from-purple-500 to-pink-500",
      gradient: "from-purple-500/20 to-pink-500/20",
      items: [
        "Truth staking mechanism",
        "Verification process",
        "Reward distribution",
        "Community governance"
      ]
    },
    {
      title: "Technical Guides",
      icon: Terminal,
      color: "from-emerald-500 to-green-500",
      gradient: "from-emerald-500/20 to-green-500/20",
      items: [
        "Smart contract integration",
        "Algorand wallet setup",
        "API documentation",
        "Security best practices"
      ]
    }
  ];

  const quickLinks = [
    { 
      icon: Book, 
      label: "Guides", 
      color: "from-blue-600 to-blue-400",
      gradient: "from-blue-500/20 to-cyan-500/20",
      description: "Step-by-step tutorials"
    },
    { 
      icon: Code, 
      label: "API Reference", 
      color: "from-purple-600 to-purple-400",
      gradient: "from-purple-500/20 to-pink-500/20",
      description: "Complete API documentation"
    },
    { 
      icon: GitBranch, 
      label: "SDK", 
      color: "from-emerald-600 to-emerald-400",
      gradient: "from-emerald-500/20 to-green-500/20",
      description: "Software development kit"
    },
    { 
      icon: MessageCircle, 
      label: "Support", 
      color: "from-amber-600 to-amber-400",
      gradient: "from-amber-500/20 to-yellow-500/20",
      description: "Get help from community"
    }
  ];

  const resources = [
    {
      title: "Video Tutorials",
      description: "Step-by-step guides to help you get started",
      icon: Globe,
      color: "from-red-500 to-pink-500"
    },
    {
      title: "Sample Projects",
      description: "Example implementations and use cases",
      icon: Zap,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Community Forums",
      description: "Connect with other developers",
      icon: Shield,
      color: "from-green-500 to-emerald-500"
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
        <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-60 right-20 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-60 right-1/4 w-48 h-48 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-full blur-xl animate-levitate"></div>
      </div>

      {/* Enhanced Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-transparent" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-8xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-2xl">
                Documentation
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent animate-pulse">
                Center
              </span>
            </h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto font-light mb-12 leading-relaxed"
            >
              Everything you need to know about TruthChain's features,{" "}
              <span className="text-cyan-400 font-semibold">technical details</span>, and integration guides.
            </motion.p>
            
            {/* Enhanced Search Bar with 3D effect */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="max-w-3xl mx-auto relative mb-12"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                  <Input 
                    type="search"
                    placeholder="Search documentation..."
                    className="w-full bg-black/60 backdrop-blur-xl border-gray-700/50 hover:border-gray-500/80 pl-16 py-8 text-lg rounded-2xl transition-all duration-300 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                  />
                </div>
              </div>
            </motion.div>

            {/* 3D floating code elements */}
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="flex justify-center items-center gap-8 mb-12"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse shadow-2xl shadow-purple-500/50 flex items-center justify-center">
                <Code className="w-8 h-8 text-white" />
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-bounce shadow-2xl shadow-cyan-500/50 flex items-center justify-center">
                <Book className="w-6 h-6 text-white" />
              </div>
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full animate-float shadow-2xl shadow-emerald-500/50 flex items-center justify-center">
                <Terminal className="w-10 h-10 text-white" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Quick Links with 3D Cards */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {quickLinks.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 50, rotateX: 45 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              className="perspective-1000"
            >
              <Card className="group card-3d bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-700/50 rounded-3xl backdrop-blur-xl hover:border-gray-500/80 transition-all duration-700 overflow-hidden cursor-pointer">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}></div>
                <CardContent className="relative p-8 flex items-center gap-6 z-10">
                  <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-xl tracking-wide group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300 mb-2">
                      {item.label}
                    </h3>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 text-sm">
                      {item.description}
                    </p>
                  </div>
                  
                  {/* Floating particles */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-purple-400 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse opacity-60"></div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Enhanced Documentation Sections */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Explore Documentation
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive guides and references to master TruthChain
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 50, rotateX: 45 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                className="perspective-1000"
              >
                <Card className="group card-3d bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-700/50 rounded-3xl backdrop-blur-xl hover:border-gray-500/80 transition-all duration-700 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}></div>
                  <CardContent className="relative p-8 z-10">
                    {/* Section icon and title */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${section.color} rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                        <section.icon className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                        {section.title}
                      </h2>
                    </div>
                    
                    <ul className="space-y-4">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-left text-gray-300 hover:text-white hover:bg-gray-800/60 transition-all duration-300 rounded-xl p-4 group-hover:bg-white/10"
                          >
                            <FileText className="w-5 h-5 mr-3 opacity-70" />
                            <span className="flex-1">{item}</span>
                          </Button>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Floating particles */}
                    <div className="absolute top-6 right-6 w-2 h-2 bg-purple-400 rounded-full animate-ping opacity-75"></div>
                    <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse opacity-60"></div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Code Example Section */}
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
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white via-green-200 to-emerald-200 bg-clip-text text-transparent">
              Quick Start Example
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Get up and running with TruthChain in minutes
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: 15 }}
            whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 0.8 }}
            className="perspective-1000"
          >
            <Card className="group card-3d bg-black/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl hover:border-green-500/50 transition-all duration-700 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Code editor header */}
              <div className="relative bg-gray-900/90 backdrop-blur-sm px-6 py-4 border-b border-gray-700/50 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse delay-75"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-150"></div>
                    </div>
                    <div className="text-white/80 text-sm font-mono bg-white/10 px-3 py-1 rounded-lg">
                      quick-start.js
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm font-semibold">Ready</span>
                  </div>
                </div>
              </div>
              
              <CardContent className="relative p-8 z-10">
                <pre className="text-sm text-gray-200 font-mono leading-relaxed overflow-x-auto">
                  <code>
{`import { TruthChainClient } from '@truthchain/sdk';

// Initialize client with enhanced configuration
const client = new TruthChainClient({
  apiKey: 'your-api-key',
  network: 'testnet',
  algorithms: ['SHA-256', 'ECDSA']
});

// Create a new post with staking
const post = await client.createPost({
  content: 'This is a verifiable claim about climate change',
  stakeAmount: 1.5, // ALGO
  confidence: 90,
  sources: ['https://ipcc.ch/report'],
  tags: ['climate', 'science']
});

// Verify a post and earn rewards
const verification = await client.verifyPost({
  postId: post.id,
  verdict: true,
  stake: 0.5, // ALGO
  evidence: 'Cross-referenced with peer-reviewed studies'
});

console.log('Post created:', post.id);
console.log('Verification submitted:', verification.txnId);`}
                  </code>
                </pre>
                
                {/* Code highlighting effects */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"></div>
                <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse opacity-60"></div>
                <div className="absolute top-1/2 right-8 w-1 h-1 bg-cyan-400 rounded-full animate-bounce opacity-50"></div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Resources Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Additional Resources
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Explore more tools and community resources
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {resources.map((resource, index) => (
              <motion.div
                key={resource.title}
                initial={{ opacity: 0, y: 50, rotateX: 45 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                className="perspective-1000"
              >
                <Card className="group card-3d bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-700/50 rounded-3xl backdrop-blur-xl hover:border-gray-500/80 transition-all duration-700 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${resource.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}></div>
                  <CardContent className="relative p-8 z-10">
                    <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${resource.color} rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                      <resource.icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-center text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                      {resource.title}
                    </h3>
                    <p className="text-gray-400 text-center mb-6 group-hover:text-gray-300 transition-colors duration-300">
                      {resource.description}
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full border-gray-500/50 hover:bg-white/10 hover:border-gray-400/80 transition-all duration-300 font-semibold"
                    >
                      Learn More
                    </Button>
                    
                    {/* Floating particles */}
                    <div className="absolute top-4 right-4 w-2 h-2 bg-purple-400 rounded-full animate-ping opacity-75"></div>
                    <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse opacity-60"></div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-cyan-600/20"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-black mb-8 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Start Building Today
            </h2>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto">
              Join thousands of developers building the future of verified information with TruthChain.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button className="group btn-3d bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white px-12 py-4 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-[0_20px_50px_rgba(168,85,247,0.4)] transition-all duration-500 transform hover:scale-105 overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  Get Started
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </Button>
              
              <Button variant="outline" className="group btn-3d border-2 border-white/50 text-white hover:bg-white/10 bg-black/20 backdrop-blur-sm px-12 py-4 text-xl font-bold rounded-2xl">
                <span className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  View Examples
                </span>
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