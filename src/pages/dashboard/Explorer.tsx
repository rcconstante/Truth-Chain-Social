import React from 'react';
import { TransactionExplorer } from '../../components/explorer/TransactionExplorer';

export function Explorer() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-6 py-8">
        <TransactionExplorer />
      </div>
    </div>
  );
} 