"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Play, Pause, RotateCcw, Coffee } from "lucide-react";

interface FocusTimerProps {
  focusBlockDuration: number;
  breakDuration: number;
}

type TimerState = "idle" | "focus" | "break" | "paused";

export function FocusTimer({ focusBlockDuration, breakDuration }: FocusTimerProps) {
  const [timeLeft, setTimeLeft] = useState(focusBlockDuration * 60);
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [progress, setProgress] = useState(100);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerState === "focus" || timerState === "break") {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            const isBreak = timerState === "break";
            toast({
              title: isBreak ? "Break finished!" : "Focus session complete!",
              description: isBreak
                ? "Time to get back to work!"
                : "Take a well-deserved break.",
            });
            setTimerState("idle");
            setTimeLeft(isBreak ? focusBlockDuration * 60 : breakDuration * 60);
            return isBreak ? focusBlockDuration * 60 : breakDuration * 60;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timerState, focusBlockDuration, breakDuration, toast]);

  useEffect(() => {
    const totalSeconds =
      timerState === "break" ? breakDuration * 60 : focusBlockDuration * 60;
    setProgress((timeLeft / totalSeconds) * 100);
  }, [timeLeft, timerState, focusBlockDuration, breakDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startTimer = (type: "focus" | "break") => {
    setTimerState(type);
    setTimeLeft(type === "focus" ? focusBlockDuration * 60 : breakDuration * 60);
    
    // Request notification permission if not granted
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  const pauseTimer = () => {
    setTimerState("paused");
  };

  const resumeTimer = () => {
    setTimerState(timeLeft === focusBlockDuration * 60 ? "focus" : "break");
  };

  const resetTimer = () => {
    setTimerState("idle");
    setTimeLeft(focusBlockDuration * 60);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Focus Timer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-6">
          <div className="relative flex items-center justify-center">
            <div className="absolute">
              <span className="text-4xl font-bold">{formatTime(timeLeft)}</span>
            </div>
            <svg className="h-32 w-32 -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-muted"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 56}
                strokeDashoffset={
                  2 * Math.PI * 56 * ((100 - progress) / 100)
                }
                className="text-primary transition-all duration-200 ease-in-out"
              />
            </svg>
          </div>
          <div className="flex space-x-2">
            {timerState === "idle" && (
              <>
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => startTimer("focus")}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Focus
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => startTimer("break")}
                >
                  <Coffee className="mr-2 h-4 w-4" />
                  Take Break
                </Button>
              </>
            )}
            {(timerState === "focus" || timerState === "break") && (
              <>
                <Button variant="outline" size="lg" onClick={pauseTimer}>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
                <Button variant="outline" size="lg" onClick={resetTimer}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </>
            )}
            {timerState === "paused" && (
              <>
                <Button variant="default" size="lg" onClick={resumeTimer}>
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </Button>
                <Button variant="outline" size="lg" onClick={resetTimer}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </>
            )}
          </div>
          <div className="w-full">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 