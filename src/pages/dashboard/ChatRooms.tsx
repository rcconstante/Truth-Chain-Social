import React from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { ChatSystem } from '../../components/chat/ChatSystem';
import { MessageCircle } from 'lucide-react';

export function ChatRooms() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <MessageCircle className="w-8 h-8 text-purple-400" />
            Chat Rooms
          </h1>
          <p className="text-gray-400">
            Join topic-specific discussions moderated by AI experts
          </p>
        </motion.div>

        {/* Chat System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ChatSystem />
        </motion.div>
      </div>
    </DashboardLayout>
  );
} 