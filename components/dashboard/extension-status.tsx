"use client";

import { useExtension } from '@/hooks/use-extension';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Chrome, CheckCircle, AlertCircle, Wifi, WifiOff, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExtensionStatusProps {
  className?: string;
  variant?: 'full' | 'badge' | 'inline';
}

export function ExtensionStatus({ className, variant = 'full' }: ExtensionStatusProps) {
  const { status, isLoading, installExtension } = useExtension();

  const getStatusConfig = () => {
    if (isLoading) {
      return {
        icon: Chrome,
        label: 'Checking...',
        color: 'gray',
        description: 'Checking extension status',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-700',
        badgeClass: 'bg-gray-100 text-gray-700'
      };
    }

    if (status.installed && status.communicating) {
      return {
        icon: CheckCircle,
        label: 'Active',
        color: 'green',
        description: 'Extension is installed and working',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-700',
        badgeClass: 'bg-green-100 text-green-700'
      };
    }

    if (status.installed && !status.communicating) {
      return {
        icon: AlertCircle,
        label: 'Installed (Not Communicating)',
        color: 'amber',
        description: 'Extension installed but not responding',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-700',
        badgeClass: 'bg-amber-100 text-amber-700'
      };
    }

    return {
      icon: Download,
      label: 'Not Installed',
      color: 'blue',
      description: 'Install extension for automatic tracking',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      badgeClass: 'bg-blue-100 text-blue-700'
    };
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  if (variant === 'badge') {
    return (
      <Badge className={cn(config.badgeClass, className)}>
        <StatusIcon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <StatusIcon className={`w-4 h-4 ${config.textColor}`} />
        <span className={`text-sm ${config.textColor}`}>{config.label}</span>
        {!status.installed && (
          <Button
            onClick={installExtension}
            size="sm"
            variant="outline"
            className="ml-2"
          >
            Install
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={cn(`${config.borderColor} ${config.bgColor}`, className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 ${config.bgColor} rounded-lg border ${config.borderColor}`}>
              <StatusIcon className={`w-5 h-5 ${config.textColor}`} />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h4 className={`font-medium ${config.textColor}`}>Chrome Extension</h4>
                <Badge className={config.badgeClass}>
                  {config.label}
                </Badge>
              </div>
              <p className={`text-sm ${config.textColor} opacity-75`}>
                {config.description}
              </p>
              
              {status.installed && status.version && (
                <p className={`text-xs ${config.textColor} opacity-60 mt-1`}>
                  Version {status.version}
                </p>
              )}
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {status.installed && (
              <div className="flex items-center gap-1">
                {status.communicating ? (
                  <Wifi className="w-4 h-4 text-green-600" />
                ) : (
                  <WifiOff className="w-4 h-4 text-amber-600" />
                )}
                <span className={`text-xs ${status.communicating ? 'text-green-600' : 'text-amber-600'}`}>
                  {status.communicating ? 'Connected' : 'Not responding'}
                </span>
              </div>
            )}
            
            {!status.installed && (
              <Button
                onClick={installExtension}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Chrome className="w-4 h-4 mr-2" />
                Install Extension
              </Button>
            )}
          </div>
        </div>

        {/* Additional Info for Problem States */}
        {status.installed && !status.communicating && (
          <div className="mt-3 p-3 bg-amber-100 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-700">
              The extension is installed but not responding. Try refreshing the page or restarting Chrome.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Convenience components for specific use cases
export function ExtensionStatusBadge({ className }: { className?: string }) {
  return <ExtensionStatus variant="badge" className={className} />;
}

export function ExtensionStatusInline({ className }: { className?: string }) {
  return <ExtensionStatus variant="inline" className={className} />;
} 