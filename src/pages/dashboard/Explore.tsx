import React from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { SearchSystem } from '../../components/search/SearchSystem';

export function Explore() {
  return (
    <DashboardLayout>
      <SearchSystem />
    </DashboardLayout>
  );
} 