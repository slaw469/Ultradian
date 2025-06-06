"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getAnalyticsData, AnalyticsData } from "@/lib/services/analytics-data";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { format, parseISO, startOfWeek, endOfWeek } from "date-fns";

interface WeeklyTrendsProps {
  timeRange: string;
}

export function WeeklyTrends({ timeRange }: WeeklyTrendsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const analyticsData = await getAnalyticsData(timeRange);
        setData(analyticsData);
      } catch (error) {
        console.error("Failed to fetch weekly trends data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [timeRange]);

  if (isLoading) {
    return (
      <Card className="h-[300px]">
        <CardHeader>
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.dailyFocus.length === 0) {
    return (
      <Card className="h-[300px]">
        <CardHeader>
          <CardTitle>Weekly Trends</CardTitle>
          <CardDescription>Focus time trends over time</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <div className="text-center">
            <p className="text-muted-foreground">No trend data available</p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete sessions over several weeks to see trends
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group daily data into weeks
  const weeklyData = data.dailyFocus.reduce((acc, day) => {
    const date = parseISO(day.date);
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekKey = format(weekStart, 'yyyy-MM-dd');
    
    if (!acc[weekKey]) {
      acc[weekKey] = {
        week: format(weekStart, 'MMM dd'),
        totalHours: 0,
        totalSessions: 0,
        avgProductivity: 0,
        days: 0,
      };
    }
    
    acc[weekKey].totalHours += day.focusHours;
    acc[weekKey].totalSessions += day.sessions;
    acc[weekKey].avgProductivity += day.productivity;
    acc[weekKey].days += 1;
    
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(weeklyData).map((week: any) => ({
    ...week,
    avgProductivity: week.avgProductivity / week.days,
    avgHoursPerDay: week.totalHours / week.days,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">Week of {label}</p>
          <p className="text-blue-600">
            Total Hours: <span className="font-medium">{data.totalHours.toFixed(1)}h</span>
          </p>
          <p className="text-green-600">
            Daily Average: <span className="font-medium">{data.avgHoursPerDay.toFixed(1)}h</span>
          </p>
          <p className="text-purple-600">
            Sessions: <span className="font-medium">{data.totalSessions}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const totalWeeks = chartData.length;
  const avgWeeklyHours = chartData.reduce((sum, week) => sum + week.totalHours, 0) / totalWeeks;
  const trend = chartData.length > 1 ? 
    (chartData[chartData.length - 1].totalHours - chartData[0].totalHours) / chartData[0].totalHours * 100 : 0;

  return (
    <Card className="h-[300px]">
      <CardHeader>
        <CardTitle>Weekly Trends</CardTitle>
        <CardDescription>
          Average: {avgWeeklyHours.toFixed(1)}h per week
          {trend !== 0 && (
            <span className={`ml-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              ({trend > 0 ? '+' : ''}{trend.toFixed(1)}% trend)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="week" 
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
              label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="totalHours" 
              stroke="hsl(var(--primary))" 
              fillOpacity={1} 
              fill="url(#colorHours)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 