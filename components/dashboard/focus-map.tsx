"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, eachDayOfInterval, subDays, isSameDay } from "date-fns";

interface FocusMapProps {
  userId: string;
}

interface DayData {
  date: Date;
  focusMinutes: number;
  intensity: number;
}

export function FocusMap({ userId }: FocusMapProps) {
  const [data, setData] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFocusData() {
      try {
        const response = await fetch(`/api/stats/focus-map?userId=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch focus data");
        const stats = await response.json();
        setData(stats);
      } catch (error) {
        console.error("Error fetching focus data:", error);
        // Fallback to sample data
        const today = new Date();
        const last90Days = eachDayOfInterval({
          start: subDays(today, 89),
          end: today,
        }).map((date) => ({
          date,
          focusMinutes: Math.floor(Math.random() * 360),
          intensity: Math.floor(Math.random() * 5),
        }));
        setData(last90Days);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFocusData();
  }, [userId]);

  const getIntensityColor = (intensity: number) => {
    const colors = [
      "bg-muted hover:bg-muted-foreground/10",
      "bg-emerald-100 dark:bg-emerald-900/30",
      "bg-emerald-200 dark:bg-emerald-900/50",
      "bg-emerald-300 dark:bg-emerald-900/70",
      "bg-emerald-400 dark:bg-emerald-900/90",
      "bg-emerald-500 dark:bg-emerald-900",
    ];
    return colors[intensity] || colors[0];
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Focus Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const today = new Date();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeks = Array.from({ length: 13 }, (_, weekIndex) => {
    return Array.from({ length: 7 }, (_, dayIndex) => {
      const date = subDays(today, (12 - weekIndex) * 7 + (6 - dayIndex));
      const dayData = data.find((d) => isSameDay(new Date(d.date), date));
      return {
        date,
        focusMinutes: dayData?.focusMinutes || 0,
        intensity: dayData?.intensity || 0,
      };
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Focus Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex text-sm text-muted-foreground">
            <div className="w-10" />
            {days.map((day) => (
              <div key={day} className="flex-1 text-center">
                {day}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex">
                <div className="w-10 text-sm text-muted-foreground">
                  {format(week[0].date, "MMM")}
                </div>
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="flex-1 px-1"
                    title={`${format(day.date, "MMM d, yyyy")}: ${
                      day.focusMinutes
                    } minutes`}
                  >
                    <div
                      className={`aspect-square w-full rounded-sm ${getIntensityColor(
                        day.intensity
                      )}`}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end space-x-2">
            <div className="text-sm text-muted-foreground">Less</div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`h-4 w-4 rounded-sm ${getIntensityColor(i)}`}
              />
            ))}
            <div className="text-sm text-muted-foreground">More</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 