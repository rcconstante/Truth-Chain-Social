import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Ban, Gavel, Eye } from 'lucide-react';
import { Card } from './card';

interface TruthReminderProps {
  type: 'post' | 'verify' | 'challenge';
  className?: string;
}

export function TruthReminder({ type, className = '' }: TruthReminderProps) {
  const getContent = () => {
    switch (type) {
      case 'post':
        return {
          icon: AlertTriangle,
          title: '⚠️ Truth Accountability Warning',
          message: 'By creating this post, you stake your reputation on its truthfulness. False claims will result in stake loss and potential account suspension.',
          details: [
            'Deliberately false information will result in permanent ban',
            'Your stake will be distributed to challengers if proven false',
            'Repeated violations lead to account termination',
            'AI fact-checking systems monitor all posts'
          ],
          color: 'border-yellow-500/50 bg-yellow-500/10',
          iconColor: 'text-yellow-400'
        };
      case 'verify':
        return {
          icon: Shield,
          title: '🛡️ Verification Responsibility',
          message: 'Verifying a post means you believe it is true and are willing to stake on it. False verifications damage your reputation.',
          details: [
            'Only verify posts you have researched and believe are true',
            'False verifications result in stake loss and reputation damage',
            'Pattern of false verifications leads to verification privileges removal',
            'Community relies on honest verification to maintain trust'
          ],
          color: 'border-blue-500/50 bg-blue-500/10',
          iconColor: 'text-blue-400'
        };
      case 'challenge':
        return {
          icon: Gavel,
          title: '⚖️ Challenge Ethics Notice',
          message: 'Challenging a post is a serious action. Only challenge posts you have evidence are false or misleading.',
          details: [
            'Provide credible sources and evidence for your challenge',
            'Frivolous challenges result in stake loss and penalties',
            'Malicious challenging to harm others will result in ban',
            'Failed challenges without merit damage your credibility score'
          ],
          color: 'border-red-500/50 bg-red-500/10',
          iconColor: 'text-red-400'
        };
    }
  };

  const content = getContent();
  const Icon = content.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${className}`}
    >
      <Card className={`border ${content.color} backdrop-blur-sm`}>
        <div className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className={`p-2 rounded-lg bg-black/20 ${content.iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white text-sm mb-1">{content.title}</h3>
              <p className="text-gray-300 text-xs leading-relaxed">{content.message}</p>
            </div>
          </div>
          
          <div className="space-y-1 mb-3">
            {content.details.map((detail, index) => (
              <div key={index} className="flex items-start gap-2 text-xs text-gray-400">
                <div className="w-1 h-1 bg-gray-500 rounded-full mt-2 flex-shrink-0" />
                <span>{detail}</span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-black/30 rounded-lg border border-gray-700/50">
            <Ban className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="text-xs text-red-300 font-medium">
              Violation of truth standards results in immediate account suspension
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
} 