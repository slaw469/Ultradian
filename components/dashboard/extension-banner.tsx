"use client";

import { useState } from 'react';
import { useExtension } from '@/hooks/use-extension';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Chrome, TrendingUp, Clock, BarChart3, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExtensionBannerProps {
  variant?: 'dashboard' | 'analytics' | 'minimal';
  className?: string;
}

export function ExtensionBanner({ variant = 'dashboard', className }: ExtensionBannerProps) {
  const { status, shouldShowPrompt, dismissPrompt, installExtension } = useExtension();
  const [showDetails, setShowDetails] = useState(false);

  // Don't show banner if extension is installed or user shouldn't see prompt
  if (status.installed || !shouldShowPrompt) {
    return null;
  }

  const benefits = [
    {
      icon: Clock,
      title: "Automatic Session Detection",
      description: "Never miss a focus session again"
    },
    {
      icon: BarChart3,
      title: "Cross-Website Analytics",
      description: "See exactly which sites boost your productivity"
    },
    {
      icon: TrendingUp,
      title: "3x More Accurate Data",
      description: "Get complete insights without manual logging"
    },
    {
      icon: Zap,
      title: "Zero-Effort Tracking",
      description: "Works seamlessly in the background"
    }
  ];

  const renderMinimal = () => (
    <Card className={cn("border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Chrome className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="font-medium text-amber-900">Missing detailed insights?</p>
              <p className="text-sm text-amber-700">Install our Chrome extension for automatic tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={installExtension}
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              <Chrome className="w-4 h-4 mr-2" />
              Install
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissPrompt}
              className="text-amber-600 hover:bg-amber-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderDashboard = () => (
    <Card className={cn("border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Chrome className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Unlock Complete Productivity Insights</h3>
                <p className="text-sm text-blue-700">Get automatic tracking across all your websites</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                Free
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-2">
                  <benefit.icon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">{benefit.title}</p>
                    <p className="text-xs text-blue-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-blue-600">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>100% privacy-focused • No personal data collected • Works offline</span>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Button
              onClick={installExtension}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Chrome className="w-4 h-4 mr-2" />
              Install Extension
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissPrompt}
              className="text-blue-600 hover:bg-blue-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAnalytics = () => (
    <Card className={cn("border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-700" />
            </div>
            <div>
              <h4 className="font-semibold text-purple-900">See Your Complete Productivity Picture</h4>
              <p className="text-sm text-purple-700 mb-2">
                This analytics page shows limited data without the Chrome extension
              </p>
              <div className="flex items-center gap-4 text-xs text-purple-600">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  3x more accurate insights
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Automatic session detection
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="outline"
              size="sm"
              className="border-purple-300 text-purple-700 hover:bg-purple-100"
            >
              {showDetails ? 'Hide Details' : 'Learn More'}
            </Button>
            <Button
              onClick={installExtension}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Chrome className="w-4 h-4 mr-2" />
              Install Now
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissPrompt}
              className="text-purple-600 hover:bg-purple-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {showDetails && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h5 className="font-medium text-purple-900 mb-2">What you'll unlock:</h5>
            <div className="grid grid-cols-2 gap-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-2">
                  <benefit.icon className="w-4 h-4 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-purple-900">{benefit.title}</p>
                    <p className="text-xs text-purple-700">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  switch (variant) {
    case 'minimal':
      return renderMinimal();
    case 'analytics':
      return renderAnalytics();
    case 'dashboard':
    default:
      return renderDashboard();
  }
} 