'use client';

import React from 'react';
import { AuctionDashboard } from '@/components/dashboard/AuctionDashboard';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export default function ProprietorDashboardPage() {
  return (
    <ErrorBoundary>
      <AuctionDashboard />
    </ErrorBoundary>
  );
}
