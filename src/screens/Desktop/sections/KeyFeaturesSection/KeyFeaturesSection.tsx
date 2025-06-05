import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../../../../components/ui/card";

export const KeyFeaturesSection = (): JSX.Element => {
  const features = [
    {
      title: "🤖 AI Video Moderators",
      description: "Tavus-powered avatars for each community that facilitate discussions and ensure adherence to community standards.",
      icon: "🎥",
      gradient: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/30 hover:border-blue-400/60"
    },
    {
      title: "⭐ Reputation System", 
      description: "Build credibility over time with our truth score that follows you across the platform and can be publicly verified.",
      icon: "🏆",
      gradient: "from-yellow-500 to-orange-500",
      bgColor: "from-yellow-500/20 to-orange-500/20", 
      borderColor: "border-yellow-500/30 hover:border-yellow-400/60"
    },
    {
      title: "🔒 Blockchain Security",
      description: "Algorand-powered verification ensures immutable record-keeping and secure token transactions.",
      icon: "⛓️",
      gradient: "from-green-500 to-emerald-500",
      bgColor: "from-green-500/20 to-emerald-500/20",
      borderColor: "border-green-500/30 hover:border-green-400/60"
    },
    {
      title: "💰 Truth Staking",
      description: "Stake tokens on information you believe is true. Earn rewards when your judgment is validated by the community.",
      icon: "📊",
      gradient: "from-purple-500 to-pink-500", 
      bgColor: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-500/30 hover:border-purple-400/60"
    },
    {
      title: "🎙️ Voice Rooms",
      description: "Join live audio discussions with verified experts and community members in specialized voice channels.",
      icon: "🔊",
      gradient: "from-red-500 to-rose-500",
      bgColor: "from-red-500/20 to-rose-500/20", 
      borderColor: "border-red-500/30 hover:border-red-400/60"
    },
    {
      title: "📈 Analytics Dashboard",
      description: "Track your earnings, reputation score, and community impact with comprehensive analytics and insights.",
      icon: "📊",
      gradient: "from-indigo-500 to-purple-500",
      bgColor: "from-indigo-500/20 to-purple-500/20",
      borderColor: "border-indigo-500/30 hover:border-indigo-400/60"
    }
  ];

  return (
    <section id="features" className="w-full py-20 px-6 relative overflow-hidden">
      {/* 3D Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-black text-white text-5xl md:text-6xl mb-8 leading-tight"
          >
            🚀 Revolutionary{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              Features
            </span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-gray-300 text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed"
          >
            Built with cutting-edge technology to ensure transparency, security, and rewards for truth in the digital age 🌟
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              initial={{ opacity: 0, y: 50, rotateX: 45 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              key={index}
              className="perspective-1000"
            >
              <Card className={`group relative bg-gradient-to-br from-gray-900/80 to-black/80 border ${feature.borderColor} rounded-3xl backdrop-blur-xl transition-all duration-500 transform hover:scale-105 hover:rotate-y-6 overflow-hidden h-full`}>
                {/* Glowing effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Animated border */}
                <div className={`absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <CardContent className="relative p-8 text-center z-10 h-full flex flex-col">
                  {/* 3D Icon */}
                  <div className="relative mb-6">
                    <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                      <span className="text-4xl filter drop-shadow-lg">{feature.icon}</span>
                    </div>
                    
                    {/* Floating particles around icon */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full animate-ping opacity-75"></div>
                    <div className="absolute top-2 -left-2 w-2 h-2 bg-pink-400 rounded-full animate-pulse opacity-50"></div>
                    <div className="absolute -bottom-2 right-2 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce opacity-60"></div>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-white text-xl font-bold mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed group-hover:text-white transition-colors duration-300 flex-1">
                      {feature.description}
                    </p>
                  </div>
                  
                  {/* Hover effect indicator */}
                  <div className={`mt-6 w-0 h-1 bg-gradient-to-r ${feature.gradient} rounded-full group-hover:w-full transition-all duration-500 mx-auto`}></div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {/* Call to action */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl px-8 py-4">
            <span className="text-3xl animate-bounce">🎯</span>
            <span className="text-white text-lg font-semibold">
              Ready to explore these amazing features?
            </span>
            <span className="text-3xl animate-pulse">✨</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
