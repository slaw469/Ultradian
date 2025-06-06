"use client";

import { useEffect, useState } from 'react';
import { useExtension } from '@/hooks/use-extension';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Chrome, Sparkles, TrendingUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExtensionSuccessProps {
  className?: string;
}

export function ExtensionSuccess({ className }: ExtensionSuccessProps) {
  const { status } = useExtension();
  const [showCelebration, setShowCelebration] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (status.installed && status.communicating) {
      setShowCelebration(true);
      setIsVisible(true);
      
      // Auto hide after 10 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setShowCelebration(false), 300);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [status.installed, status.communicating]);

  if (!showCelebration) {
    return null;
  }

  const benefits = [
    "Automatic session detection is now active",
    "Cross-website analytics are being collected",
    "Zero-effort productivity tracking enabled",
    "Enhanced insights will appear in your dashboard"
  ];

  return (
    <Card className={cn(
      "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 transition-all duration-300",
      isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Chrome className="w-6 h-6 text-green-700" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <CheckCircle className="w-5 h-5 text-green-600 bg-white rounded-full" />
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-green-900">Extension Installed Successfully!</h3>
                  <Sparkles className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-sm text-green-700">
                  Welcome to effortless productivity tracking
                </p>
              </div>
              
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 text-xs text-green-600">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Extension communicating</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Enhanced data collection started</span>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-green-600 hover:bg-green-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-200">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900">What's Next?</p>
              <p className="text-xs text-green-700">
                Continue working normally - your productivity data will be automatically collected and analyzed. 
                Check your analytics page in a few hours to see enhanced insights.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Minimal version for smaller spaces
export function ExtensionSuccessMinimal({ className }: ExtensionSuccessProps) {
  const { status } = useExtension();
  const [showCelebration, setShowCelebration] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (status.installed && status.communicating) {
      setShowCelebration(true);
      setIsVisible(true);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setShowCelebration(false), 300);
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [status.installed, status.communicating]);

  if (!showCelebration) {
    return null;
  }

  return (
    <Card className={cn(
      "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 transition-all duration-300",
      isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2 bg-green-100 rounded-lg">
                <Chrome className="w-5 h-5 text-green-700" />
              </div>
              <CheckCircle className="w-4 h-4 text-green-600 bg-white rounded-full absolute -top-1 -right-1" />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-green-900">Extension Active!</p>
                <Sparkles className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-sm text-green-700">Automatic tracking enabled</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-green-600 hover:bg-green-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 