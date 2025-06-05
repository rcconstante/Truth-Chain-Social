import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface CompactStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  gradient: string;
  delay?: number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
}

export function CompactStatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  gradient, 
  delay = 0,
  change 
}: CompactStatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, type: "spring", stiffness: 100 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="relative overflow-hidden rounded-xl bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 p-4 group hover:border-gray-600/50 transition-all duration-300"
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            style={{
              left: `${20 + i * 30}%`,
              top: `${80 - i * 20}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient} bg-opacity-20`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          {change && (
            <div className={`text-xs font-medium ${
              change.type === 'increase' ? 'text-green-400' : 'text-red-400'
            }`}>
              {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <div className="text-xl font-bold text-white">
            {value}
          </div>
          <div className="text-xs font-medium text-gray-400">
            {title}
          </div>
          {subtitle && (
            <div className="text-xs text-gray-500">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Hover glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 blur-xl`} />
    </motion.div>
  );
} 