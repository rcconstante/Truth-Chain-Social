import React from "react";
import { Button } from "../../../../components/ui/button";

export const HeroSection = (): JSX.Element => {
  return (
    <section className="relative w-full px-4 py-16">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 opacity-90 rounded-3xl mx-4"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Where Truth Has Value
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
            A blockchain social media platform that rewards verified information 
            and builds communities around shared truth.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button className="bg-white text-black hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-lg">
              Join Waitlist
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8 py-3 text-lg font-semibold rounded-lg">
              Learn More
            </Button>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="w-full max-w-5xl mx-auto bg-black/20 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
          <div className="bg-gray-900/50 px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="ml-4 text-white/60 text-sm">TruthChain Dashboard</span>
            </div>
          </div>
          
          <div className="p-6">
            {/* Mock Dashboard Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-white/60 text-sm mb-1">Truth Score</div>
                <div className="text-white text-2xl font-bold">9.7/10</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-white/60 text-sm mb-1">Earnings</div>
                <div className="text-white text-2xl font-bold">$1,234</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-white/60 text-sm mb-1">Verified Posts</div>
                <div className="text-white text-2xl font-bold">156</div>
              </div>
            </div>
            
            {/* Mock Activity Feed */}
            <div className="space-y-3">
              <div className="bg-white/5 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm">Your post about climate data was verified</div>
                  <div className="text-white/40 text-xs">+50 TRUTH tokens earned</div>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm">New follower: @scientistX verified your research</div>
                  <div className="text-white/40 text-xs">Truth score increased</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
