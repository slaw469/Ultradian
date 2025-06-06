"use client";

import { useExtension } from '@/hooks/use-extension';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Chrome, TrendingUp, Clock, BarChart3, Lightbulb, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextualExtensionPromptProps {
  context: 'empty-sessions' | 'limited-analytics' | 'manual-logging' | 'missing-insights';
  className?: string;
}

export function ContextualExtensionPrompt({ context, className }: ContextualExtensionPromptProps) {
  const { status, shouldShowPrompt, installExtension } = useExtension();

  // Don't show if extension is installed or user shouldn't see prompts
  if (status.installed || !shouldShowPrompt) {
    return null;
  }

  const contextConfig = {
    'empty-sessions': {
      icon: Clock,
      title: "Missing some work time?",
      description: "Our Chrome extension automatically captures focus sessions you might forget to log manually",
      benefit: "Never miss a session again",
      color: "amber",
      gradient: "from-amber-50 to-yellow-50",
      border: "border-amber-200"
    },
    'limited-analytics': {
      icon: BarChart3,
      title: "Want more detailed insights?",
      description: "Get comprehensive analytics across all your websites with automatic tracking",
      benefit: "3x more accurate data",
      color: "blue",
      gradient: "from-blue-50 to-indigo-50",
      border: "border-blue-200"
    },
    'manual-logging': {
      icon: Zap,
      title: "Tired of manual tracking?",
      description: "Switch to effortless automatic session detection across all your websites",
      benefit: "Zero-effort productivity tracking",
      color: "green",
      gradient: "from-green-50 to-emerald-50",
      border: "border-green-200"
    },
    'missing-insights': {
      icon: Lightbulb,
      title: "Unlock deeper productivity insights",
      description: "Discover which websites actually boost your focus and productivity",
      benefit: "Website-specific analytics",
      color: "purple",
      gradient: "from-purple-50 to-pink-50",
      border: "border-purple-200"
    }
  };

  const config = contextConfig[context];
  const Icon = config.icon;

  return (
    <Card className={cn(`${config.border} bg-gradient-to-r ${config.gradient}`, className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-${config.color}-100 rounded-lg`}>
            <Icon className={`w-5 h-5 text-${config.color}-700`} />
          </div>
          
          <div className="flex-1">
            <h4 className={`font-medium text-${config.color}-900`}>{config.title}</h4>
            <p className={`text-sm text-${config.color}-700 mb-1`}>{config.description}</p>
            <div className={`flex items-center gap-1 text-xs text-${config.color}-600`}>
              <TrendingUp className="w-3 h-3" />
              <span>{config.benefit}</span>
            </div>
          </div>

          <Button
            onClick={installExtension}
            size="sm"
            className={`bg-${config.color}-600 hover:bg-${config.color}-700 text-white`}
          >
            <Chrome className="w-4 h-4 mr-2" />
            Install Extension
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Specialized components for specific use cases
export function EmptySessionsPrompt({ className }: { className?: string }) {
  return (
    <ContextualExtensionPrompt 
      context="empty-sessions" 
      className={className}
    />
  );
}

export function LimitedAnalyticsPrompt({ className }: { className?: string }) {
  return (
    <ContextualExtensionPrompt 
      context="limited-analytics" 
      className={className}
    />
  );
}

export function ManualLoggingPrompt({ className }: { className?: string }) {
  return (
    <ContextualExtensionPrompt 
      context="manual-logging" 
      className={className}
    />
  );
}

export function MissingInsightsPrompt({ className }: { className?: string }) {
  return (
    <ContextualExtensionPrompt 
      context="missing-insights" 
      className={className}
    />
  );
} 