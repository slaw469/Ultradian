"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { 
  Clock, 
  ExternalLink, 
  Star, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle,
  Edit3,
  Save,
  X,
  ArrowRight,
  Brain,
  Target
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

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
  domainTimes?: Record<string, number>;
  tabSwitches?: number;
  totalTabs?: number;
}

interface SessionCardProps {
  session: WorkSession;
  onRatingChange?: (sessionId: string, rating: number) => void;
  onNotesChange?: (sessionId: string, notes: string) => void;
  onNextStepComplete?: (sessionId: string, stepIndex: number) => void;
}

export function SessionCard({ 
  session, 
  onRatingChange,
  onNotesChange,
  onNextStepComplete 
}: SessionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState(session.notes || '');
  const [hoveredRating, setHoveredRating] = useState(0);
  const { toast } = useToast();

  const handleRatingClick = (rating: number) => {
    onRatingChange?.(session.id, rating);
    toast({
      title: "Rating saved",
      description: `You rated this session ${rating} stars`,
    });
  };

  const handleSaveNotes = () => {
    onNotesChange?.(session.id, editedNotes);
    setIsEditingNotes(false);
    toast({
      title: "Notes saved",
      description: "Your session notes have been updated",
    });
  };

  const handleNextStepComplete = (stepIndex: number) => {
    onNextStepComplete?.(session.id, stepIndex);
    toast({
      title: "Step completed",
      description: "Great progress on your next steps!",
    });
  };

  const getActivityTypeColor = (type?: string) => {
    switch (type) {
      case 'CODING': return 'bg-blue-100 text-blue-800';
      case 'WRITING': return 'bg-green-100 text-green-800';
      case 'RESEARCH': return 'bg-purple-100 text-purple-800';
      case 'COMMUNICATION': return 'bg-orange-100 text-orange-800';
      case 'DESIGN': return 'bg-pink-100 text-pink-800';
      case 'LEARNING': return 'bg-yellow-100 text-yellow-800';
      case 'PLANNING': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'Unknown duration';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20 w-full overflow-visible">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            {/* Favicon */}
            {session.favicon && (
              <img 
                src={session.favicon} 
                alt="" 
                className="w-5 h-5 mt-0.5 rounded-sm flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-medium text-sm break-words">{session.title}</h3>
                {session.websiteUrl && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-4 w-4 p-0 flex-shrink-0"
                    onClick={() => window.open(session.websiteUrl, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-muted-foreground flex-wrap">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span>{format(session.startTime, 'h:mm a')}</span>
                {session.endTime && (
                  <>
                    <span>•</span>
                    <span>{formatDuration(session.duration)}</span>
                  </>
                )}
                {session.domain && (
                  <>
                    <span>•</span>
                    <span className="break-words">{session.domain}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Expand/Collapse Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0 flex-shrink-0"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Tags and Activity Type */}
        <div className="flex items-center space-x-2 flex-wrap">
          {session.activityType && (
            <Badge 
              variant="secondary" 
              className={`text-xs ${getActivityTypeColor(session.activityType)}`}
            >
              {session.activityType}
            </Badge>
          )}
          {session.tags?.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-4 overflow-visible">
          {/* Domain Time Breakdown */}
          {session.domainTimes && Object.keys(session.domainTimes).length > 0 && (
            <div className="bg-slate-50 p-3 rounded-lg border">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-900">Time Breakdown</span>
              </div>
              <div className="space-y-1">
                {Object.entries(session.domainTimes)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 5)
                  .map(([domain, timeMs]) => {
                    const timeMinutes = Math.round((timeMs as number) / 1000 / 60);
                    const percentage = session.duration ? Math.round((timeMinutes / session.duration) * 100) : 0;
                    return (
                      <div key={domain} className="flex justify-between items-center text-sm">
                        <span className="text-slate-700 break-words flex-1">{domain}</span>
                        <span className="text-slate-600 ml-2 flex-shrink-0">
                          {timeMinutes}m ({percentage}%)
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Browser Metrics */}
          {((session.tabSwitches ?? 0) > 0 || (session.totalTabs ?? 0) > 0) && (
            <div className="bg-amber-50 p-3 rounded-lg border">
              <div className="flex items-center space-x-2 mb-2">
                <ArrowRight className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-900">Browser Activity</span>
              </div>
              <div className="flex space-x-4 text-sm">
                <span className="text-amber-800">
                  <strong>{session.tabSwitches || 0}</strong> tab switches
                </span>
                <span className="text-amber-800">
                  <strong>{session.totalTabs || 0}</strong> total tabs
                </span>
              </div>
            </div>
          )}

          {/* AI Summary */}
          {session.aiSummary && (
            <div className="bg-blue-50 p-3 rounded-lg border">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">AI Summary</span>
              </div>
              <p className="text-sm text-blue-800 break-words whitespace-pre-wrap">{session.aiSummary}</p>
            </div>
          )}

          {/* Next Steps */}
          {session.nextSteps && session.nextSteps.length > 0 && (
            <div className="bg-green-50 p-3 rounded-lg border">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Next Steps</span>
              </div>
              <div className="space-y-2">
                {session.nextSteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 mt-0.5 flex-shrink-0"
                      onClick={() => handleNextStepComplete(index)}
                    >
                      <ArrowRight className="h-3 w-3 text-green-600" />
                    </Button>
                    <span className="text-sm text-green-800 break-words flex-1 whitespace-pre-wrap">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center space-x-2 flex-wrap">
            <span className="text-sm font-medium">Rate this session:</span>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => handleRatingClick(star)}
                >
                  <Star 
                    className={`h-4 w-4 ${
                      star <= (hoveredRating || session.rating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </Button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Notes:</span>
              {!isEditingNotes && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingNotes(true)}
                  className="h-6 text-xs"
                >
                  <Edit3 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>
            
            {isEditingNotes ? (
              <div className="space-y-2">
                <Textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  placeholder="Add your thoughts about this session..."
                  className="min-h-[60px] text-sm w-full resize-y"
                />
                <div className="flex space-x-2">
                  <Button size="sm" onClick={handleSaveNotes}>
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setIsEditingNotes(false);
                      setEditedNotes(session.notes || '');
                    }}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground break-words whitespace-pre-wrap">
                {session.notes || 'No notes added yet'}
              </p>
            )}
          </div>

          {/* Processing indicator */}
          {!session.aiProcessed && (
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
              <span>AI is analyzing this session...</span>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
} 