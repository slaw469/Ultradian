"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getAnalyticsData, AnalyticsData } from "@/lib/services/analytics-data";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { format, parseISO } from "date-fns";

interface FocusTimeChartProps {
  timeRange: string;
}

export function FocusTimeChart({ timeRange }: FocusTimeChartProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const analyticsData = await getAnalyticsData(timeRange);
        setData(analyticsData);
      } catch (error) {
        console.error("Failed to fetch focus time chart data:", error);
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
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.dailyFocus.length === 0) {
    return (
      <Card className="h-[400px]">
        <CardHeader>
          <CardTitle>Daily Focus Time</CardTitle>
          <CardDescription>Track your focus patterns over time</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center">
            <p className="text-muted-foreground">No focus data available</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start a focus session to see your patterns
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.dailyFocus.map(item => ({
    ...item,
    displayDate: format(parseISO(item.date), 'MMM dd'),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{format(parseISO(data.date), 'EEEE, MMM dd')}</p>
          <p className="text-blue-600">
            Focus Time: <span className="font-medium">{data.focusHours.toFixed(1)}h</span>
          </p>
          <p className="text-green-600">
            Sessions: <span className="font-medium">{data.sessions}</span>
          </p>
          <p className="text-purple-600">
            Productivity: <span className="font-medium">{data.productivity}/10</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const averageFocus = data.dailyFocus.reduce((sum, item) => sum + item.focusHours, 0) / data.dailyFocus.length;

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>Daily Focus Time</CardTitle>
        <CardDescription>
          Average: {averageFocus.toFixed(1)} hours per day
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="displayDate" 
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
              label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="focusHours" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 