import React from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { VoiceStudioHub } from '../components/voice/VoiceStudioHub';

export function VoiceStudio() {
  return (
    <DashboardLayout>
      <VoiceStudioHub />
    </DashboardLayout>
  );
} 