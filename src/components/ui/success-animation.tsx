import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Mail } from 'lucide-react';

interface SuccessAnimationProps {
  type: 'login' | 'signup';
  message: string;
}

export function SuccessAnimation({ type, message }: SuccessAnimationProps) {
  const Icon = type === 'signup' ? Mail : CheckCircle2;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 15,
          delay: 0.2 
        }}
        className="mb-6"
      >
        <div className="relative">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"
          />
          <Icon 
            className="w-16 h-16 text-green-500 relative z-10" 
            strokeWidth={1.5}
          />
        </div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-2xl font-bold text-white mb-4"
      >
        {type === 'signup' ? 'Account Created!' : 'Welcome Back!'}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-gray-300 text-center max-w-sm"
      >
        {message}
      </motion.p>

      {type === 'login' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-4 text-sm text-purple-400"
        >
          Redirecting to dashboard...
        </motion.div>
      )}
    </motion.div>
  );
} 