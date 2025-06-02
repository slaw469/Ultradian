import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, endOfDay } from "date-fns";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new NextResponse("Missing userId", { status: 400 });
    }

    const today = new Date();
    const ninetyDaysAgo = subDays(today, 89);

    const focusBlocks = await prisma.focusBlock.findMany({
      where: {
        userId,
        startTime: {
          gte: startOfDay(ninetyDaysAgo),
          lte: endOfDay(today),
        },
        type: "DEEP_WORK",
        status: "COMPLETED",
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // Group blocks by day and calculate total focus minutes
    const dailyStats = focusBlocks.reduce((acc, block) => {
      const date = startOfDay(new Date(block.startTime));
      const dateKey = date.toISOString();

      if (!acc[dateKey]) {
        acc[dateKey] = {
          date,
          focusMinutes: 0,
          blocks: 0,
        };
      }

      const duration =
        new Date(block.endTime).getTime() - new Date(block.startTime).getTime();
      acc[dateKey].focusMinutes += duration / (1000 * 60);
      acc[dateKey].blocks += 1;

      return acc;
    }, {} as Record<string, { date: Date; focusMinutes: number; blocks: number }>);

    // Calculate intensity levels (0-5) based on focus minutes
    const maxMinutes = Math.max(
      ...Object.values(dailyStats).map((day) => day.focusMinutes)
    );
    const intensityLevels = [0, 60, 120, 180, 240, 300]; // Minutes thresholds

    const focusData = Object.values(dailyStats).map((day) => ({
      date: day.date,
      focusMinutes: Math.round(day.focusMinutes),
      intensity: intensityLevels.findIndex(
        (threshold) => day.focusMinutes <= threshold
      ),
    }));

    return NextResponse.json(focusData);
  } catch (error) {
    console.error("Focus map error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 