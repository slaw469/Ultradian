"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getAnalyticsData, AnalyticsData } from "@/lib/services/analytics-data";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface SessionDistributionProps {
  timeRange: string;
}

export function SessionDistribution({ timeRange }: SessionDistributionProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const analyticsData = await getAnalyticsData(timeRange);
        setData(analyticsData);
      } catch (error) {
        console.error("Failed to fetch session distribution data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [timeRange]);

  if (isLoading) {
    return (
      <Card className="h-[400px]">
        <CardHeader>
          <div className="h-6 w-40 bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.sessionDistribution.length === 0) {
    return (
      <Card className="h-[400px]">
        <CardHeader>
          <CardTitle>Session Length Distribution</CardTitle>
          <CardDescription>Breakdown of your session durations</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center">
            <p className="text-muted-foreground">No session data available</p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete some focus sessions to see the distribution
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalSessions = data.sessionDistribution.reduce((sum, item) => sum + item.count, 0);
  const mostCommonDuration = data.sessionDistribution.reduce((max, curr) => 
    curr.count > max.count ? curr : max
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const percentage = ((value / totalSessions) * 100).toFixed(1);
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-primary">
            Sessions: <span className="font-medium">{value}</span>
          </p>
          <p className="text-muted-foreground text-sm">
            {percentage}% of all sessions
          </p>
        </div>
      );
    }
    return null;
  };

  const chartData = data.sessionDistribution.map(item => ({
    ...item,
    percentage: ((item.count / totalSessions) * 100).toFixed(1),
  }));

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>Session Length Distribution</CardTitle>
        <CardDescription>
          Most common: {mostCommonDuration.duration} 
          ({mostCommonDuration.count} sessions)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="duration" 
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
              label={{ value: 'Sessions', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="count" 
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Sessions</p>
            <p className="text-lg font-bold text-primary">{totalSessions}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Most Common</p>
            <p className="text-lg font-bold text-primary">{mostCommonDuration.duration}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Focus Range</p>
            <p className="text-lg font-bold text-primary">
              {chartData.filter(d => d.duration.includes('30') || d.duration.includes('45')).reduce((sum, d) => sum + d.count, 0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 