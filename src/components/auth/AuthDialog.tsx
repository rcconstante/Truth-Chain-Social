import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup';
}

export function AuthDialog({ isOpen, onClose, defaultTab = 'signin' }: AuthDialogProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'signin' | 'signup');
  };

  const handleSuccess = () => {
    // Don't immediately close - let the success animation play
    setTimeout(onClose, 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <AnimatePresence mode="wait">
        {isOpen && (
          <DialogContent 
            key="auth-dialog-content"
            className="sm:max-w-[500px] bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 text-white overflow-hidden"
            aria-describedby="auth-dialog-description"
          >
            <motion.div
              key="auth-dialog-motion"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Custom close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-50 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700 transition-colors"
                aria-label="Close dialog"
              >
                <X size={16} className="text-gray-400 hover:text-white" />
              </button>

              <DialogHeader className="text-center space-y-4 pb-6">
                <div className="flex justify-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                  >
                    <img
                      src="/AA-removebg-preview.png"
                      alt="TruthChain"
                      className="w-8 h-8 object-contain"
                    />
                  </motion.div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Welcome to TruthChain
                  </DialogTitle>
                  <DialogDescription 
                    id="auth-dialog-description"
                    className="text-gray-400 mt-2"
                  >
                    {activeTab === 'signin' 
                      ? 'Sign in to your account to continue' 
                      : 'Create an account to get started'
                    }
                  </DialogDescription>
                </motion.div>
              </DialogHeader>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-gray-700/50 rounded-lg p-1">
                    <TabsTrigger 
                      value="signin" 
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white text-gray-400 font-medium transition-all duration-200"
                    >
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger 
                      value="signup" 
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white text-gray-400 font-medium transition-all duration-200"
                    >
                      Sign Up
                    </TabsTrigger>
                  </TabsList>

                  <AnimatePresence mode="wait">
                    <TabsContent value="signin" className="mt-0">
                      <motion.div
                        key="signin-content"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <SignInForm 
                          onSuccess={handleSuccess} 
                          onSwitchToSignUp={() => setActiveTab('signup')}
                        />
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="signup" className="mt-0">
                      <motion.div
                        key="signup-content"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <SignUpForm 
                          onSuccess={handleSuccess} 
                          onSwitchToSignIn={() => setActiveTab('signin')}
                        />
                      </motion.div>
                    </TabsContent>
                  </AnimatePresence>
                </Tabs>
              </motion.div>

              {/* Background decoration */}
              <div className="absolute inset-0 -z-10 overflow-hidden">
                <motion.div
                  animate={{
                    background: [
                      'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%)',
                      'radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%)',
                      'radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.1) 0%, transparent 50%)',
                    ]
                  }}
                  transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
                  className="absolute inset-0"
                />
              </div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}