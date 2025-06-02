"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface WeeklyTrendsProps {
  userId: string;
}

interface DailyStats {
  date: string;
  focusMinutes: number;
  sessions: number;
}

export function WeeklyTrends({ userId }: WeeklyTrendsProps) {
  const [data, setData] = useState<DailyStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWeeklyStats() {
      try {
        const response = await fetch(`/api/stats/weekly?userId=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch stats");
        const stats = await response.json();
        setData(stats);
      } catch (error) {
        console.error("Error fetching weekly stats:", error);
        // Fallback to sample data for demo
        const sampleData = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return {
            date: date.toLocaleDateString("en-US", { weekday: "short" }),
            focusMinutes: Math.floor(Math.random() * 240 + 60),
            sessions: Math.floor(Math.random() * 4 + 1),
          };
        });
        setData(sampleData);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWeeklyStats();
  }, [userId]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            {Math.round(payload[0].value)} minutes
          </p>
          <p className="text-sm text-muted-foreground">
            {payload[1].value} sessions
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
            >
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}m`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="focusMinutes"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="sessions"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 