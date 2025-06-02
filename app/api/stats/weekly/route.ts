import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from "date-fns";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new NextResponse("Missing userId", { status: 400 });
    }

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 0 });

    const focusBlocks = await prisma.focusBlock.findMany({
      where: {
        userId,
        startTime: {
          gte: weekStart,
          lte: weekEnd,
        },
        type: "DEEP_WORK",
        status: "COMPLETED",
      },
      orderBy: {
        startTime: "asc",
      },
    });

    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const stats = days.map((date) => {
      const dayBlocks = focusBlocks.filter(
        (block) =>
          format(new Date(block.startTime), "yyyy-MM-dd") ===
          format(date, "yyyy-MM-dd")
      );

      const focusMinutes = dayBlocks.reduce((acc, block) => {
        const duration =
          new Date(block.endTime).getTime() -
          new Date(block.startTime).getTime();
        return acc + duration / (1000 * 60);
      }, 0);

      return {
        date: format(date, "EEE"),
        focusMinutes: Math.round(focusMinutes),
        sessions: dayBlocks.length,
      };
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Weekly stats error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 