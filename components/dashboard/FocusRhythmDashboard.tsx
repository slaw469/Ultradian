"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { startOfWeek, endOfWeek, format, addWeeks, subWeeks } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { WeeklyTimeline } from './WeeklyTimeline';
import { DailyStats } from './DailyStats';
import { ProductivityInsights } from './ProductivityInsights';
import type { FocusAnalytics } from '@/lib/services/focus-analytics';
import { useQuery } from '@tanstack/react-query';

async function fetchFocusAnalytics(startDate: Date): Promise<FocusAnalytics> {
  const response = await fetch(`/api/focus-analytics?startDate=${startDate.toISOString()}`);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  return response.json();
}

export function FocusRhythmDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  const {
    data: analytics,
    isLoading,
    error,
  } = useQuery<FocusAnalytics>({
    queryKey: ['focusAnalytics', selectedWeek],
    queryFn: () => fetchFocusAnalytics(selectedWeek),
    enabled: sessionStatus === 'authenticated',
    retry: 1,
  });

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });

  const handlePreviousWeek = () => {
    setSelectedWeek(subWeeks(selectedWeek, 1));
  };

  const handleNextWeek = () => {
    setSelectedWeek(addWeeks(selectedWeek, 1));
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive">
        <p>Error loading focus data</p>
        <p className="text-sm mt-2">{error instanceof Error ? error.message : 'Unknown error occurred'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Focus Rhythm</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousWeek}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextWeek}
            disabled={weekStart >= new Date()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {analytics && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Weekly Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyTimeline data={analytics.dailyPatterns} />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daily Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <DailyStats data={analytics.dailyPatterns} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Productivity Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductivityInsights stats={analytics.weeklyStats} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
} 