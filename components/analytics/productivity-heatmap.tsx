"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalyticsData, AnalyticsData } from "@/lib/services/analytics-data";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ProductivityHeatmapProps {
  timeRange: string;
}

export function ProductivityHeatmap({ timeRange }: ProductivityHeatmapProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const analyticsData = await getAnalyticsData(timeRange);
        setData(analyticsData);
      } catch (error) {
        console.error("Failed to fetch heatmap data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [timeRange]);

  if (isLoading) {
    return (
      <Card className="h-[500px]">
        <CardHeader>
          <div className="h-6 w-40 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="h-[500px]">
        <CardHeader>
          <CardTitle>Productivity Heatmap</CardTitle>
          <CardDescription>See when you're most productive</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">Failed to load heatmap data</p>
        </CardContent>
      </Card>
    );
  }

  const maxProductivity = Math.max(...data.hourlyProductivity.map(h => h.productivity));
  const peakHour = data.hourlyProductivity.reduce((max, curr) => 
    curr.productivity > max.productivity ? curr : max
  );

  const getIntensity = (productivity: number) => {
    if (productivity === 0) return 0;
    return (productivity / maxProductivity) * 0.8 + 0.2; // Ensure minimum visibility
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return "bg-muted";
    if (intensity < 0.3) return "bg-blue-200 dark:bg-blue-900/30";
    if (intensity < 0.5) return "bg-blue-300 dark:bg-blue-800/50";
    if (intensity < 0.7) return "bg-blue-400 dark:bg-blue-700/70";
    return "bg-blue-500 dark:bg-blue-600";
  };

  return (
    <Card className="h-[500px]">
      <CardHeader>
        <CardTitle>Productivity Heatmap</CardTitle>
        <CardDescription>
          Peak productivity: {formatHour(peakHour.hour)} 
          {peakHour.sessions > 0 && ` (${peakHour.sessions} sessions)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Low activity</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-muted rounded-sm" />
              <div className="w-3 h-3 bg-blue-200 dark:bg-blue-900/30 rounded-sm" />
              <div className="w-3 h-3 bg-blue-300 dark:bg-blue-800/50 rounded-sm" />
              <div className="w-3 h-3 bg-blue-400 dark:bg-blue-700/70 rounded-sm" />
              <div className="w-3 h-3 bg-blue-500 dark:bg-blue-600 rounded-sm" />
            </div>
            <span className="text-muted-foreground">High activity</span>
          </div>

          {/* Heatmap Grid */}
          <div className="grid grid-cols-12 gap-1">
            {data.hourlyProductivity.map((hourData) => {
              const intensity = getIntensity(hourData.productivity);
              return (
                <div
                  key={hourData.hour}
                  className={`
                    aspect-square rounded-sm cursor-pointer transition-all hover:scale-110
                    ${getIntensityColor(intensity)}
                  `}
                  title={`${formatHour(hourData.hour)}: ${hourData.productivity.toFixed(1)} avg productivity, ${hourData.sessions} sessions`}
                />
              );
            })}
          </div>

          {/* Hour Labels */}
          <div className="grid grid-cols-12 gap-1 text-xs text-muted-foreground">
            {data.hourlyProductivity.map((hourData) => (
              <div key={hourData.hour} className="text-center">
                {hourData.hour % 3 === 0 ? formatHour(hourData.hour).split(' ')[0] : ''}
              </div>
            ))}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Most Active Period</p>
              <p className="text-lg font-bold text-primary">
                {formatHour(peakHour.hour)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Active Hours</p>
              <p className="text-lg font-bold text-primary">
                {data.hourlyProductivity.filter(h => h.sessions > 0).length}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 