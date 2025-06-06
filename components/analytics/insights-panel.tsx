"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Lightbulb, TrendingUp, Clock } from "lucide-react";
import { getAnalyticsData, AnalyticsData } from "@/lib/services/analytics-data";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface InsightsPanelProps {
  timeRange: string;
}

export function InsightsPanel({ timeRange }: InsightsPanelProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const analyticsData = await getAnalyticsData(timeRange);
        setData(analyticsData);
      } catch (error) {
        console.error("Failed to fetch insights data:", error);
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

  if (!data) {
    return (
      <Card className="h-[400px]">
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
          <CardDescription>Personalized productivity recommendations</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">Failed to load insights</p>
        </CardContent>
      </Card>
    );
  }

  const getInsightIcon = (insight: string) => {
    if (insight.includes('peak') || insight.includes('time')) return <Clock className="h-4 w-4" />;
    if (insight.includes('maintained') || insight.includes('consistency')) return <TrendingUp className="h-4 w-4" />;
    return <Lightbulb className="h-4 w-4" />;
  };

  const getInsightBadgeVariant = (index: number) => {
    return index === 0 ? "default" : index === 1 ? "secondary" : "outline";
  };

  // Generate additional insights based on data
  const additionalInsights = [];
  
  if (data.productivityScore >= 80) {
    additionalInsights.push("You're in the top productivity tier! Keep up the excellent work.");
  } else if (data.productivityScore >= 60) {
    additionalInsights.push("Good productivity levels. Small improvements can lead to big gains.");
  } else {
    additionalInsights.push("Opportunity for improvement. Focus on consistency and session length.");
  }

  const activeDays = data.dailyFocus.filter(d => d.focusHours > 0).length;
  const consistency = Math.round((activeDays / data.dailyFocus.length) * 100);
  
  if (consistency >= 80) {
    additionalInsights.push("Excellent consistency! Your routine is well-established.");
  } else if (consistency >= 60) {
    additionalInsights.push("Good consistency. Try to maintain daily focus habits.");
  } else {
    additionalInsights.push("Building consistency will significantly improve your outcomes.");
  }

  const allInsights = [...data.insights, ...additionalInsights].slice(0, 5);

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Insights
        </CardTitle>
        <CardDescription>
          Personalized recommendations based on your productivity patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {allInsights.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Complete more focus sessions to unlock personalized insights
            </p>
          </div>
        ) : (
          <>
            {/* Key Insights */}
            <div className="space-y-3">
              {allInsights.map((insight, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                >
                  <div className="text-primary mt-0.5">
                    {getInsightIcon(insight)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{insight}</p>
                    <Badge 
                      variant={getInsightBadgeVariant(index)} 
                      className="mt-2"
                    >
                      {index === 0 ? "Priority" : index === 1 ? "Pattern" : "Tip"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Quick Analysis</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-primary/5 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{data.productivityScore}</p>
                  <p className="text-xs text-muted-foreground">Productivity Score</p>
                </div>
                <div className="text-center p-3 bg-green-500/5 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{consistency}%</p>
                  <p className="text-xs text-muted-foreground">Consistency Rate</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 