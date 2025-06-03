"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { SessionCard } from './SessionCard';
import { ActiveSessionCard } from './ActiveSessionCard';
import { 
  Calendar,
  Clock,
  TrendingUp,
  Zap,
  Plus,
  RefreshCw,
  Eye,
  Users,
  Coffee,
  Brain,
  Play
} from 'lucide-react';
import { formatDistanceToNow, format, isToday, startOfDay, endOfDay } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface WorkSession {
  id: string;
  title: string;
  description?: string;
  websiteUrl?: string;
  favicon?: string;
  domain?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  activityType?: string;
  aiSummary?: string;
  nextSteps?: string[];
  tags?: string[];
  rating?: number;
  notes?: string;
  aiProcessed: boolean;
}

interface TodayStats {
  totalSessions: number;
  totalFocusTime: number;
  averageRating: number;
  topActivityType: string;
  currentStreak: number;
}

async function fetchTodaySessions(): Promise<WorkSession[]> {
  const today = new Date();
  const startDate = startOfDay(today).toISOString();
  // Don't filter by endDate to include active sessions (sessions without endTime)
  
  const response = await fetch(`/api/work-sessions?startDate=${startDate}`);
  if (!response.ok) {
    throw new Error('Failed to fetch today\'s sessions');
  }
  
  const data = await response.json();
  return data.map((session: any) => ({
    ...session,
    startTime: new Date(session.startTime),
    endTime: session.endTime ? new Date(session.endTime) : undefined,
    nextSteps: session.nextSteps || [],
    tags: session.tags || []
  }));
}

async function updateSessionRating(sessionId: string, rating: number) {
  const response = await fetch(`/api/work-sessions/${sessionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating })
  });
  
  if (!response.ok) {
    throw new Error('Failed to update session rating');
  }
  
  return response.json();
}

async function updateSessionNotes(sessionId: string, notes: string) {
  const response = await fetch(`/api/work-sessions/${sessionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes })
  });
  
  if (!response.ok) {
    throw new Error('Failed to update session notes');
  }
  
  return response.json();
}

async function createNewSession(sessionData: {
  title: string;
  description?: string;
  websiteUrl?: string;
}) {
  console.log('📡 Making API call to create session:', sessionData);
  
  const response = await fetch('/api/work-sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...sessionData,
      startTime: new Date().toISOString(),
      // Don't set endTime yet - this will be a live session
    })
  });
  
  console.log('📡 API Response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ API Error:', response.status, errorText);
    throw new Error(`Failed to create session: ${response.status} ${errorText}`);
  }
  
  const result = await response.json();
  console.log('✅ API Success:', result);
  return result;
}

async function endSession(sessionId: string) {
  const endTime = new Date();
  const response = await fetch(`/api/work-sessions/${sessionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      endTime: endTime.toISOString()
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to end session');
  }
  
  return response.json();
}

interface SessionStartFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { title: string; description?: string; websiteUrl?: string; }) => void;
  isLoading?: boolean;
}

function SessionStartForm({ open, onOpenChange, onSubmit, isLoading }: SessionStartFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setWebsiteUrl('');
  };

  const getSuggestedTitle = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning coding session';
    if (hour < 17) return 'Afternoon deep work';
    return 'Evening project work';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start Focus Session</DialogTitle>
          <DialogDescription>
            Tell us what you're working on so we can provide better AI insights when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">What are you working on? *</Label>
            <Input
              id="title"
              placeholder={getSuggestedTitle()}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Brief description (optional)</Label>
            <Textarea
              id="description"
              placeholder="e.g., Fixing the user authentication bug, Writing the project proposal..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              rows={2}
            />
          </div>
          
          <div>
            <Label htmlFor="website">Website/Tool you'll use (optional)</Label>
            <Input
              id="website"
              placeholder="e.g., https://github.com/user/repo, https://docs.google.com/..."
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || isLoading}>
              <Play className="h-4 w-4 mr-2" />
              {isLoading ? 'Starting...' : 'Start Session'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TodaySessionsFeed() {
  const { data: session } = useSession();
  const [selectedPeriod, setSelectedPeriod] = useState<'morning' | 'afternoon' | 'evening' | 'all'>('all');
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: sessions = [],
    isLoading,
    error,
    refetch
  } = useQuery<WorkSession[]>({
    queryKey: ['todaySessions'],
    queryFn: fetchTodaySessions,
    enabled: !!session,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  const updateRatingMutation = useMutation({
    mutationFn: ({ sessionId, rating }: { sessionId: string; rating: number }) => 
      updateSessionRating(sessionId, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todaySessions'] });
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: ({ sessionId, notes }: { sessionId: string; notes: string }) => 
      updateSessionNotes(sessionId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todaySessions'] });
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: createNewSession,
    onSuccess: (newSession) => {
      console.log('✅ Session created successfully:', newSession);
      queryClient.invalidateQueries({ queryKey: ['todaySessions'] });
      refetch();
      toast({
        title: "Focus session started!",
        description: "Your session is now being tracked. Stay focused!",
      });
    },
    onError: (error) => {
      console.error('❌ Failed to create session:', error);
      toast({
        title: "Error",
        description: "Failed to start focus session. Please try again.",
        variant: "destructive",
      });
    }
  });

  const endSessionMutation = useMutation({
    mutationFn: endSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todaySessions'] });
      toast({
        title: "Session completed!",
        description: "Great work! AI is now analyzing your session.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to end session. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Separate active sessions (no endTime) from completed sessions
  const activeSessions = sessions.filter(s => !s.endTime);
  const completedSessions = sessions.filter(s => s.endTime);

  // Debug logging
  console.log('📊 Sessions data:', { 
    totalSessions: sessions.length, 
    activeSessions: activeSessions.length, 
    completedSessions: completedSessions.length,
    sessions: sessions.map(s => ({ id: s.id, title: s.title, hasEndTime: !!s.endTime }))
  });

  // Group completed sessions by time period
  const groupedSessions = completedSessions.reduce((acc, session) => {
    const hour = session.startTime.getHours();
    let period: 'morning' | 'afternoon' | 'evening';
    
    if (hour < 12) period = 'morning';
    else if (hour < 17) period = 'afternoon';
    else period = 'evening';
    
    if (!acc[period]) acc[period] = [];
    acc[period].push(session);
    return acc;
  }, {} as Record<'morning' | 'afternoon' | 'evening', WorkSession[]>);

  // Calculate today's stats
  const todayStats: TodayStats = {
    totalSessions: sessions.length,
    totalFocusTime: completedSessions.reduce((acc, s) => acc + (s.duration || 0), 0),
    averageRating: completedSessions.filter(s => s.rating).reduce((acc, s, _, arr) => 
      acc + (s.rating || 0) / arr.length, 0),
    topActivityType: 'NONE', // Will be calculated below
    currentStreak: completedSessions.filter(s => s.rating && s.rating >= 4).length
  };

  // Calculate top activity type
  const activityCounts = completedSessions.reduce((acc, s) => {
    const type = s.activityType || 'OTHER';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topActivityType = Object.entries(activityCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'NONE';

  // Update the stats with the calculated top activity type
  todayStats.topActivityType = topActivityType;

  const filteredSessions = selectedPeriod === 'all' 
    ? completedSessions 
    : groupedSessions[selectedPeriod] || [];

  const handleRatingChange = (sessionId: string, rating: number) => {
    updateRatingMutation.mutate({ sessionId, rating });
  };

  const handleNotesChange = (sessionId: string, notes: string) => {
    updateNotesMutation.mutate({ sessionId, notes });
  };

  const handleNextStepComplete = (sessionId: string, stepIndex: number) => {
    toast({
      title: "Step completed!",
      description: "Keep up the great momentum!",
    });
  };

  const handleStartSession = () => {
    console.log('🚀 Start session button clicked!');
    setShowSessionForm(true);
  };

  const handleCreateSession = (sessionData: { title: string; description?: string; websiteUrl?: string; }) => {
    console.log('🎯 Creating session with data:', sessionData);
    setIsStartingSession(true);
    setShowSessionForm(false);

    createSessionMutation.mutate(sessionData);
    setIsStartingSession(false);
  };

  const handleEndSession = (sessionId: string) => {
    endSessionMutation.mutate(sessionId);
  };

  const formatFocusTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getPeriodIcon = (period: string) => {
    switch (period) {
      case 'morning': return <Coffee className="h-4 w-4" />;
      case 'afternoon': return <Brain className="h-4 w-4" />;
      case 'evening': return <Users className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'morning': return 'Morning (6AM - 12PM)';
      case 'afternoon': return 'Afternoon (12PM - 5PM)';
      case 'evening': return 'Evening (5PM - 11PM)';
      default: return 'All Day';
    }
  };

  if (!session) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Please sign in to view your sessions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats and Start Session Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Today's Sessions</h2>
          <p className="text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleStartSession}
            disabled={isStartingSession || createSessionMutation.isPending || activeSessions.length > 0}
            className="bg-primary hover:bg-primary/90"
          >
            <Play className="h-4 w-4 mr-2" />
            {isStartingSession || createSessionMutation.isPending ? 'Starting...' : 
             activeSessions.length > 0 ? 'Session Active' : 'Start Focus Session'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Active Session</h3>
          {activeSessions.map((activeSession) => (
            <ActiveSessionCard
              key={activeSession.id}
              session={activeSession}
              onEndSession={handleEndSession}
            />
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">{todayStats.totalSessions}</p>
                <p className="text-xs text-muted-foreground">Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">{formatFocusTime(todayStats.totalFocusTime)}</p>
                <p className="text-xs text-muted-foreground">Focus Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">
                  {todayStats.averageRating ? todayStats.averageRating.toFixed(1) : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">{todayStats.currentStreak}</p>
                <p className="text-xs text-muted-foreground">High Rated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period Filter */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Filter by time:</span>
        {['all', 'morning', 'afternoon', 'evening'].map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod(period as any)}
            className="h-8"
          >
            {getPeriodIcon(period)}
            <span className="ml-1 capitalize">{period}</span>
          </Button>
        ))}
      </div>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>{getPeriodLabel(selectedPeriod)}</span>
            <Badge variant="secondary" className="ml-auto">
              {filteredSessions.length} completed session{filteredSessions.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center py-8">
              <p className="text-destructive">Failed to load sessions</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          )}

          {isLoading && filteredSessions.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {!isLoading && filteredSessions.length === 0 && (
            <div className="text-center py-8">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No completed sessions yet {selectedPeriod !== 'all' ? `this ${selectedPeriod}` : 'today'}</h3>
              <p className="text-muted-foreground mb-4">
                {activeSessions.length > 0 
                  ? 'You have an active session running! Complete it to see AI insights.'
                  : `Start your ${selectedPeriod !== 'all' ? `${selectedPeriod} ` : ''}focus session to see insights here!`
                }
              </p>
              {activeSessions.length === 0 && (
                <Button onClick={handleStartSession} disabled={isStartingSession || createSessionMutation.isPending}>
                  <Play className="h-4 w-4 mr-2" />
                  {isStartingSession || createSessionMutation.isPending ? 'Starting...' : 'Start Focus Session'}
                </Button>
              )}
            </div>
          )}

          {filteredSessions.length > 0 && (
            <div className="space-y-4">
              {filteredSessions
                .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
                .map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onRatingChange={handleRatingChange}
                    onNotesChange={handleNotesChange}
                    onNextStepComplete={handleNextStepComplete}
                  />
                ))
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Start Form */}
      <SessionStartForm
        open={showSessionForm}
        onOpenChange={setShowSessionForm}
        onSubmit={handleCreateSession}
        isLoading={isStartingSession || createSessionMutation.isPending}
      />
    </div>
  );
} 