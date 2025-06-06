"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Target, TrendingUp, Zap } from "lucide-react";
import { getAnalyticsData, AnalyticsData } from "@/lib/services/analytics-data";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface OverviewCardsProps {
  timeRange: string;
}

export function OverviewCards({ timeRange }: OverviewCardsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const analyticsData = await getAnalyticsData(timeRange);
        setData(analyticsData);
      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [timeRange]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-4 w-4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded mb-2" />
              <div className="h-3 w-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Failed to load analytics data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatChange = (value: number) => {
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(0)}%`;
  };

  const getChangeColor = (value: number) => {
    if (value > 0) return "text-green-600 dark:text-green-400";
    if (value < 0) return "text-red-600 dark:text-red-400";
    return "text-muted-foreground";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Focus Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTime(data.totalFocusTime)}</div>
          <p className={`text-xs ${getChangeColor(data.weekComparison.focusTime)}`}>
            {formatChange(data.weekComparison.focusTime)} from last week
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalSessions}</div>
          <p className={`text-xs ${getChangeColor(data.weekComparison.sessions)}`}>
            {formatChange(data.weekComparison.sessions)} from last week
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Session Length</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTime(data.averageSessionLength)}</div>
          <p className="text-xs text-muted-foreground">
            Ideal range: 25-45 minutes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.productivityScore}/100</div>
          <p className={`text-xs ${getChangeColor(data.weekComparison.productivity)}`}>
            {formatChange(data.weekComparison.productivity)} from last week
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 