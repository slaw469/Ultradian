"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Clock, Target } from "lucide-react";

interface FocusBlock {
  id: string;
  startTime: Date;
  endTime: Date;
  status: string;
  type: string;
}

interface DailyProgressProps {
  focusBlocks: FocusBlock[];
}

export function DailyProgress({ focusBlocks }: DailyProgressProps) {
  const completedBlocks = focusBlocks.filter(
    (block) => block.status === "COMPLETED" && block.type === "DEEP_WORK"
  );

  const totalFocusTime = completedBlocks.reduce((acc, block) => {
    const duration = new Date(block.endTime).getTime() - new Date(block.startTime).getTime();
    return acc + duration / (1000 * 60); // Convert to minutes
  }, 0);

  const targetHours = 4; // 4 hours of deep work per day
  const progressPercentage = Math.min((totalFocusTime / (targetHours * 60)) * 100, 100);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="flex items-center space-x-4">
            <Target className="h-8 w-8 text-muted-foreground" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                Daily Goal: {targetHours} hours
              </p>
              <div className="mt-2">
                <Progress value={progressPercentage} className="h-2" />
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDuration(totalFocusTime)} completed
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{completedBlocks.length}</p>
                <p className="text-xs text-muted-foreground">Focus Sessions</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {Math.round((totalFocusTime / (targetHours * 60)) * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">Goal Progress</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Sessions</h4>
            <div className="space-y-2">
              {completedBlocks.slice(0, 3).map((block) => (
                <div
                  key={block.id}
                  className="flex items-center justify-between rounded-lg border p-2"
                >
                  <div className="text-sm">
                    {new Date(block.startTime).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {" - "}
                    {new Date(block.endTime).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round(
                      (new Date(block.endTime).getTime() -
                        new Date(block.startTime).getTime()) /
                        (1000 * 60)
                    )}
                    m
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 