"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

interface FocusBlock {
  id: string;
  startTime: Date;
  endTime: Date;
  status: string;
  type: string;
}

interface NextFocusBlockProps {
  focusBlocks: FocusBlock[];
}

export function NextFocusBlock({ focusBlocks }: NextFocusBlockProps) {
  const router = useRouter();
  const now = new Date();
  
  const nextBlock = focusBlocks.find(
    (block) => new Date(block.startTime) > now
  );

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Next Focus Block</CardTitle>
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/schedule")}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {nextBlock ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {formatTime(nextBlock.startTime)} - {formatTime(nextBlock.endTime)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {nextBlock.type === "DEEP_WORK" ? "Deep Work" : "Break"} Session
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                className="w-full"
                onClick={() => router.push(`/focus/${nextBlock.id}`)}
              >
                Start Session
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/schedule")}
              >
                View All
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 py-6">
            <p className="text-sm text-muted-foreground">No upcoming focus blocks</p>
            <Button onClick={() => router.push("/schedule")}>
              Schedule Focus Block
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 