import React from 'react';
import { TransactionExplorer } from '../components/explorer/TransactionExplorer';

export function PublicExplorer() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-pink-900/20 via-transparent to-transparent" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      {/* Header */}
      <div className="relative border-b border-gray-700 bg-gray-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <img
                  src="/AA-removebg-preview.png"
                  alt="TruthChain"
                  className="w-5 h-5 object-contain"
                />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl">TruthChain Explorer</h1>
                <p className="text-gray-400 text-sm">Blockchain Transaction Explorer</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Back to Home
              </a>
              <a
                href="/?auth=signin"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative container mx-auto px-6 py-8">
        <TransactionExplorer />
      </div>
      
      {/* Footer */}
      <div className="relative border-t border-gray-700 bg-gray-900/30 backdrop-blur-xl mt-12">
        <div className="container mx-auto px-6 py-4">
          <div className="text-center text-gray-400 text-sm">
            <p>TruthChain Explorer - View Algorand blockchain transactions</p>
            <p className="mt-1">
              Powered by <span className="text-purple-400">Algorand Testnet</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 