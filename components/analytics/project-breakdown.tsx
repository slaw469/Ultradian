"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { getAnalyticsData, AnalyticsData } from "@/lib/services/analytics-data";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Progress } from "@/components/ui/progress";

interface ProjectBreakdownProps {
  timeRange: string;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(210, 100%, 56%)',
  'hsl(195, 100%, 50%)', 
  'hsl(180, 100%, 45%)',
  'hsl(165, 100%, 40%)',
  'hsl(150, 100%, 35%)',
  'hsl(135, 100%, 40%)',
  'hsl(120, 100%, 45%)',
];

export function ProjectBreakdown({ timeRange }: ProjectBreakdownProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const analyticsData = await getAnalyticsData(timeRange);
        setData(analyticsData);
      } catch (error) {
        console.error("Failed to fetch project breakdown data:", error);
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
          <div className="h-4 w-56 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.projects.length === 0) {
    return (
      <Card className="h-[400px]">
        <CardHeader>
          <CardTitle>Project Breakdown</CardTitle>
          <CardDescription>Time distribution across your projects</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center">
            <p className="text-muted-foreground">No project data available</p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete sessions with different websites to see project breakdown
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalHours = data.projects.reduce((sum, project) => sum + project.hours, 0);
  const chartData = data.projects.map((project, index) => ({
    ...project,
    value: project.hours,
    color: COLORS[index % COLORS.length],
    percentage: ((project.hours / totalHours) * 100).toFixed(1),
  }));

  const topProject = data.projects[0];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-primary">
            Hours: <span className="font-medium">{data.hours}h</span>
          </p>
          <p className="text-muted-foreground text-sm">
            {data.percentage}% of total time
          </p>
          <p className="text-muted-foreground text-sm">
            {data.sessions} sessions
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices < 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>Project Breakdown</CardTitle>
        <CardDescription>
          Top project: {topProject.name} ({topProject.hours.toFixed(1)}h)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[300px]">
          {/* Pie Chart */}
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Project List */}
          <div className="space-y-3 overflow-y-auto">
            {data.projects.slice(0, 6).map((project, index) => {
              const percentage = (project.hours / totalHours) * 100;
              return (
                <div key={project.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium truncate">{project.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {project.hours.toFixed(1)}h
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{project.sessions} sessions</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
            
            {data.projects.length > 6 && (
              <div className="text-center pt-2">
                <span className="text-sm text-muted-foreground">
                  +{data.projects.length - 6} more projects
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 