/**
 * ✅ PÁGINA: TOP HOST LEADERBOARD
 * Ranking público de hosts
 */

'use client';

import { TopHostLeaderboard } from '@/components/top-host/TopHostLeaderboard';

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <TopHostLeaderboard />
    </div>
  );
}


