"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Play, Pause, StopCircle, Brain, Coffee } from "lucide-react";

interface FocusSessionProps {
  id: string;
  startTime: Date;
  endTime: Date;
  type: string;
  status: string;
  duration: number;
}

export function FocusSession({
  id,
  startTime,
  endTime,
  type,
  status: initialStatus,
  duration,
}: FocusSessionProps) {
  const [status, setStatus] = useState(initialStatus);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [progress, setProgress] = useState(100);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (status === "IN_PROGRESS") {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            handleComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    setProgress((timeLeft / (duration * 60)) * 100);
  }, [timeLeft, duration]);

  useEffect(() => {
    // Request notification permission
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const showNotification = (title: string, body: string) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  };

  const handleStart = async () => {
    try {
      const response = await fetch(`/api/focus-blocks?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "IN_PROGRESS",
        }),
      });

      if (!response.ok) throw new Error("Failed to start session");

      setStatus("IN_PROGRESS");
      toast({
        title: type === "DEEP_WORK" ? "Focus session started" : "Break started",
        description: "Stay focused and minimize distractions",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start session",
        variant: "destructive",
      });
    }
  };

  const handlePause = async () => {
    try {
      const response = await fetch(`/api/focus-blocks?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "INTERRUPTED",
        }),
      });

      if (!response.ok) throw new Error("Failed to pause session");

      setStatus("INTERRUPTED");
      toast({
        title: "Session paused",
        description: "Take a moment if you need to",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to pause session",
        variant: "destructive",
      });
    }
  };

  const handleComplete = async () => {
    try {
      const response = await fetch(`/api/focus-blocks?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "COMPLETED",
        }),
      });

      if (!response.ok) throw new Error("Failed to complete session");

      setStatus("COMPLETED");
      showNotification(
        type === "DEEP_WORK" ? "Focus session completed!" : "Break time's up!",
        type === "DEEP_WORK"
          ? "Great work! Take a well-deserved break."
          : "Ready to get back to work?"
      );
      toast({
        title: type === "DEEP_WORK" ? "Focus session completed!" : "Break time's up!",
        description:
          type === "DEEP_WORK"
            ? "Great work! Take a well-deserved break."
            : "Ready to get back to work?",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete session",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <div
        className={`absolute inset-0 ${
          type === "DEEP_WORK"
            ? "bg-primary/5"
            : "bg-muted"
        } transition-colors duration-200`}
      />
      <CardHeader className="relative">
        <CardTitle className="flex items-center space-x-2">
          {type === "DEEP_WORK" ? (
            <Brain className="h-5 w-5" />
          ) : (
            <Coffee className="h-5 w-5" />
          )}
          <span>
            {type === "DEEP_WORK" ? "Focus Session" : "Break Time"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative flex items-center justify-center">
            <div className="absolute">
              <span className="text-6xl font-bold tabular-nums">
                {formatTime(timeLeft)}
              </span>
            </div>
            <svg className="h-48 w-48 -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-muted"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 88}
                strokeDashoffset={
                  2 * Math.PI * 88 * ((100 - progress) / 100)
                }
                className="text-primary transition-all duration-200 ease-in-out"
              />
            </svg>
          </div>
          <div className="flex space-x-2">
            {status === "PLANNED" && (
              <Button size="lg" onClick={handleStart}>
                <Play className="mr-2 h-4 w-4" />
                Start
              </Button>
            )}
            {status === "IN_PROGRESS" && (
              <>
                <Button variant="outline" size="lg" onClick={handlePause}>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
                <Button variant="outline" size="lg" onClick={handleComplete}>
                  <StopCircle className="mr-2 h-4 w-4" />
                  Complete
                </Button>
              </>
            )}
            {status === "INTERRUPTED" && (
              <Button size="lg" onClick={handleStart}>
                <Play className="mr-2 h-4 w-4" />
                Resume
              </Button>
            )}
            {status === "COMPLETED" && (
              <Button size="lg" onClick={() => router.push("/schedule")}>
                Schedule Next
              </Button>
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