import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '../ui/badge';

interface PostExpirationIndicatorProps {
  expiresAt: string;
  createdAt: string;
  className?: string;
}

export function PostExpirationIndicator({ expiresAt, createdAt, className }: PostExpirationIndicatorProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [status, setStatus] = useState<'active' | 'expiring' | 'expired'>('active');

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date();
      const expiry = new Date(expiresAt);
      const difference = expiry.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft('Expired');
        setStatus('expired');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      // Set status based on time remaining
      if (days < 1) {
        setStatus('expiring');
      } else {
        setStatus('active');
      }

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [expiresAt]);

  const getStatusInfo = () => {
    switch (status) {
      case 'expired':
        return {
          color: 'bg-red-500/20 text-red-400 border-red-500/30',
          icon: <AlertTriangle className="w-3 h-3" />,
          text: 'Expired'
        };
      case 'expiring':
        return {
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
          icon: <Clock className="w-3 h-3" />,
          text: `${timeLeft} left`
        };
      case 'active':
        return {
          color: 'bg-green-500/20 text-green-400 border-green-500/30',
          icon: <Clock className="w-3 h-3" />,
          text: `${timeLeft} left`
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={className}
    >
      <Badge className={`${statusInfo.color} flex items-center gap-1`}>
        {statusInfo.icon}
        <span className="text-xs">{statusInfo.text}</span>
      </Badge>
    </motion.div>
  );
}

export function PostDurationInfo({ createdAt, expiresAt }: { createdAt: string; expiresAt: string }) {
  const created = new Date(createdAt);
  const expires = new Date(expiresAt);
  const now = new Date();
  
  const totalDuration = expires.getTime() - created.getTime();
  const elapsed = now.getTime() - created.getTime();
  const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Post Duration</span>
        <PostExpirationIndicator expiresAt={expiresAt} createdAt={createdAt} />
      </div>
      
      <div className="w-full bg-gray-700 rounded-full h-1.5">
        <motion.div
          className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-1.5 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Created: {created.toLocaleDateString()}</span>
        <span>Expires: {expires.toLocaleDateString()}</span>
      </div>
    </div>
  );
} 