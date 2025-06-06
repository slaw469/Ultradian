"use client";

import { useExtension } from '@/hooks/use-extension';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Chrome, Check, X, TrendingUp, Clock, BarChart3, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExtensionFeatureComparisonProps {
  className?: string;
  variant?: 'full' | 'compact';
}

export function ExtensionFeatureComparison({ className, variant = 'full' }: ExtensionFeatureComparisonProps) {
  const { status, shouldShowPrompt, installExtension } = useExtension();

  // Don't show if extension is already installed
  if (status.installed) {
    return null;
  }

  const features = [
    {
      name: "Session Detection",
      manual: "Manual start/stop required",
      automatic: "Automatic detection across all websites",
      icon: Clock
    },
    {
      name: "Website Analytics",
      manual: "Only manually logged sites",
      automatic: "Complete cross-website tracking",
      icon: BarChart3
    },
    {
      name: "Data Accuracy",
      manual: "Easy to forget sessions",
      automatic: "Captures every focus moment",
      icon: TrendingUp
    },
    {
      name: "Effort Required",
      manual: "Constant manual input",
      automatic: "Zero-effort background tracking",
      icon: Zap
    }
  ];

  if (variant === 'compact') {
    return (
      <Card className={cn("border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Chrome className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Upgrade to Automatic Tracking</h4>
                <p className="text-sm text-blue-700">Get 3x more accurate data with zero effort</p>
              </div>
            </div>
            <Button
              onClick={installExtension}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Chrome className="w-4 h-4 mr-2" />
              Install Extension
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Chrome className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <CardTitle className="text-blue-900">Manual vs. Automatic Tracking</CardTitle>
              <p className="text-sm text-blue-700">See what you'll unlock with the Chrome extension</p>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-700 border-green-200">
            Free Upgrade
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Comparison Table */}
        <div className="overflow-hidden rounded-lg border border-blue-200">
          <div className="grid grid-cols-3 gap-0">
            {/* Header */}
            <div className="bg-blue-100 p-3 text-sm font-medium text-blue-900">
              Feature
            </div>
            <div className="bg-red-50 p-3 text-sm font-medium text-red-900 text-center">
              Manual Tracking (Current)
            </div>
            <div className="bg-green-50 p-3 text-sm font-medium text-green-900 text-center">
              Automatic Tracking (With Extension)
            </div>

            {/* Feature Rows */}
            {features.map((feature, index) => (
              <>
                <div key={`${feature.name}-name`} className={cn(
                  "p-3 border-t border-blue-200 flex items-center gap-2",
                  index % 2 === 0 ? "bg-white" : "bg-blue-50"
                )}>
                  <feature.icon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">{feature.name}</span>
                </div>
                
                <div key={`${feature.name}-manual`} className={cn(
                  "p-3 border-t border-blue-200 text-center",
                  index % 2 === 0 ? "bg-red-25" : "bg-red-50"
                )}>
                  <div className="flex items-center justify-center gap-2 text-sm text-red-700">
                    <X className="w-4 h-4" />
                    <span>{feature.manual}</span>
                  </div>
                </div>
                
                <div key={`${feature.name}-auto`} className={cn(
                  "p-3 border-t border-blue-200 text-center",
                  index % 2 === 0 ? "bg-green-25" : "bg-green-50"
                )}>
                  <div className="flex items-center justify-center gap-2 text-sm text-green-700">
                    <Check className="w-4 h-4" />
                    <span>{feature.automatic}</span>
                  </div>
                </div>
              </>
            ))}
          </div>
        </div>

        {/* Benefits Summary */}
        <div className="bg-blue-100 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">What You'll Gain:</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Check className="w-4 h-4 text-green-600" />
              <span>3x more accurate insights</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Check className="w-4 h-4 text-green-600" />
              <span>Complete productivity picture</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Check className="w-4 h-4 text-green-600" />
              <span>Zero manual effort required</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Check className="w-4 h-4 text-green-600" />
              <span>Website-specific analytics</span>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex items-center justify-center">
          <Button
            onClick={installExtension}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Chrome className="w-5 h-5 mr-2" />
            Upgrade to Automatic Tracking
          </Button>
        </div>

        {/* Trust Signals */}
        <div className="flex items-center justify-center gap-4 text-xs text-blue-600">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>100% privacy-focused</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Takes 30 seconds to install</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Free forever</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 