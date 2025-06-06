"use client";

import { useSession } from 'next-auth/react';
import { TodaySessionsFeed } from './TodaySessionsFeed';
import { ExtensionBanner } from './extension-banner';
import { ExtensionSuccess } from './extension-success';

export function FocusRhythmDashboard() {
  const { status: sessionStatus } = useSession();

  if (sessionStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (sessionStatus === 'unauthenticated') {
    return (
      <div className="text-center text-destructive">
        Please sign in to view your focus data
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your today's focus sessions.
          </p>
        </div>
      </div>

      {/* Extension Success Celebration */}
      <ExtensionSuccess />

      {/* Extension Banner */}
      <ExtensionBanner variant="dashboard" />

      {/* Today's Sessions Content */}
      <TodaySessionsFeed />
    </div>
  );
} 