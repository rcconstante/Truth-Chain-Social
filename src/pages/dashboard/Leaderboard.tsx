import React from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { LeaderboardSystem } from '../../components/leaderboard/LeaderboardSystem';

export function Leaderboard() {
  return (
    <DashboardLayout>
      <LeaderboardSystem />
    </DashboardLayout>
  );
} 