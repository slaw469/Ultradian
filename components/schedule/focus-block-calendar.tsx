"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  parse,
  startOfWeek,
} from "date-fns";

interface FocusBlock {
  id: string;
  startTime: Date;
  endTime: Date;
  status: string;
  type: string;
}

interface FocusBlockCalendarProps {
  userId: string;
  focusBlocks: FocusBlock[];
  workStartTime: string;
  workEndTime: string;
}

export function FocusBlockCalendar({
  userId,
  focusBlocks,
  workStartTime,
  workEndTime,
}: FocusBlockCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const workStart = parse(workStartTime, "HH:mm", new Date());
  const workEnd = parse(workEndTime, "HH:mm", new Date());
  const hours = Array.from(
    { length: workEnd.getHours() - workStart.getHours() + 1 },
    (_, i) => workStart.getHours() + i
  );

  const getBlockPosition = (block: FocusBlock) => {
    const start = new Date(block.startTime);
    const end = new Date(block.endTime);
    const dayIndex = days.findIndex((day) => isSameDay(day, start));
    const startHour = start.getHours() - workStart.getHours();
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    return {
      gridColumn: `${dayIndex + 2}`,
      gridRow: `${startHour + 2} / span ${duration}`,
      className: `rounded-md p-2 text-sm ${
        block.type === "DEEP_WORK"
          ? "bg-primary/10 text-primary-foreground"
          : "bg-muted text-muted-foreground"
      }`,
    };
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Schedule</CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedDate(addDays(selectedDate, -7))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedDate(addDays(selectedDate, 7))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[auto,repeat(7,1fr)] grid-rows-[auto,repeat(12,1fr)] gap-[2px] rounded-lg border bg-muted p-4">
          {/* Time labels */}
          <div className="row-start-1 col-start-1" />
          {days.map((day, i) => (
            <div
              key={i}
              className="row-start-1 text-center text-sm font-medium"
            >
              {format(day, "EEE")}
              <br />
              {format(day, "MMM d")}
            </div>
          ))}

          {/* Hour labels */}
          {hours.map((hour, i) => (
            <div
              key={hour}
              className="col-start-1 text-right text-sm text-muted-foreground pr-2"
              style={{ gridRow: i + 2 }}
            >
              {format(new Date().setHours(hour, 0), "ha")}
            </div>
          ))}

          {/* Grid lines */}
          {Array.from({ length: hours.length * days.length }).map((_, i) => (
            <div
              key={i}
              className="bg-background"
              style={{
                gridColumn: (i % days.length) + 2,
                gridRow: Math.floor(i / days.length) + 2,
              }}
            />
          ))}

          {/* Focus blocks */}
          {focusBlocks.map((block) => {
            const position = getBlockPosition(block);
            return (
              <div
                key={block.id}
                style={{
                  gridColumn: position.gridColumn,
                  gridRow: position.gridRow,
                }}
                className={position.className}
              >
                {format(new Date(block.startTime), "h:mm a")}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 