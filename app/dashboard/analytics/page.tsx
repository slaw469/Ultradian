"use client";

import { useState, useEffect, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Clock, Target, TrendingUp, Brain, Zap } from "lucide-react";
import { OverviewCards } from "@/components/analytics/overview-cards";
import { FocusTimeChart } from "@/components/analytics/focus-time-chart";
import { ProductivityHeatmap } from "@/components/analytics/productivity-heatmap";
import { SessionDistribution } from "@/components/analytics/session-distribution";
import { WeeklyTrends } from "@/components/analytics/weekly-trends";
import { InsightsPanel } from "@/components/analytics/insights-panel";
import { ProjectBreakdown } from "@/components/analytics/project-breakdown";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ExtensionBanner } from "@/components/dashboard/extension-banner";
import { ExtensionSuccessMinimal } from "@/components/dashboard/extension-success";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [timeRange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your focus patterns and productivity insights
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Extension Success Celebration */}
      <ExtensionSuccessMinimal />

      {/* Extension Banner for Analytics */}
      <ExtensionBanner variant="analytics" />

      {/* Overview Cards */}
      <Suspense fallback={<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><LoadingSpinner /></div>}>
        <OverviewCards timeRange={timeRange} />
      </Suspense>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Suspense fallback={<Card className="h-[400px] animate-pulse" />}>
              <FocusTimeChart timeRange={timeRange} />
            </Suspense>
            <Suspense fallback={<Card className="h-[400px] animate-pulse" />}>
              <SessionDistribution timeRange={timeRange} />
            </Suspense>
          </div>
          
          <Suspense fallback={<Card className="h-[300px] animate-pulse" />}>
            <WeeklyTrends timeRange={timeRange} />
          </Suspense>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <div className="grid gap-6">
            <Suspense fallback={<Card className="h-[500px] animate-pulse" />}>
              <ProductivityHeatmap timeRange={timeRange} />
            </Suspense>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Suspense fallback={<Card className="h-[400px] animate-pulse" />}>
            <InsightsPanel timeRange={timeRange} />
          </Suspense>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Suspense fallback={<Card className="h-[400px] animate-pulse" />}>
            <ProjectBreakdown timeRange={timeRange} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
} 