"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Clock, 
  Square,
  Timer,
  Zap
} from 'lucide-react';
import { formatDistanceToNow, format, differenceInMinutes } from 'date-fns';

interface WorkSession {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
}

interface ActiveSessionCardProps {
  session: WorkSession;
  onEndSession?: (sessionId: string) => void;
}

export function ActiveSessionCard({ session, onEndSession }: ActiveSessionCardProps) {
  const [isEnding, setIsEnding] = useState(false);
  const { toast } = useToast();

  const handleEndSession = async () => {
    setIsEnding(true);
    try {
      onEndSession?.(session.id);
      toast({
        title: "Session completed!",
        description: "Great work! Your session has been saved with AI insights.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to end session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnding(false);
    }
  };

  const sessionDuration = differenceInMinutes(new Date(), session.startTime);
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card className="border-l-4 border-l-green-500 bg-green-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Active Session
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Timer className="h-4 w-4 text-green-600" />
            <span className="text-sm font-mono text-green-700">
              {formatDuration(sessionDuration)}
            </span>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-sm">{session.title}</h3>
          {session.description && (
            <p className="text-xs text-muted-foreground mt-1">{session.description}</p>
          )}
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
            <Clock className="h-3 w-3" />
            <span>Started {format(session.startTime, 'h:mm a')}</span>
            <span>•</span>
            <span>{formatDistanceToNow(session.startTime, { addSuffix: true })}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center space-x-2">
          <Button 
            onClick={handleEndSession}
            disabled={isEnding}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <Square className="h-3 w-3 mr-1" />
            {isEnding ? 'Ending...' : 'End Session'}
          </Button>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Zap className="h-3 w-3" />
            <span>Stay focused! AI will analyze when you finish.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 