import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { GoogleCalendarService } from "@/lib/google/calendar";

const focusBlockSchema = z.object({
  userId: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  type: z.enum(["DEEP_WORK", "BREAK"]),
  status: z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "INTERRUPTED"]),
});

export async function POST(req: Request) {
  const session = await getServerSession();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { startTime, endTime, type = "DEEP_WORK" } = await req.json();
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const focusBlock = await prisma.focusBlock.create({
      data: {
        userId: user.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: "PLANNED",
        type,
      },
    });

    // Create notifications for focus block
    await prisma.notification.createMany({
      data: [
        {
          userId: user.id,
          type: "FOCUS_START",
          title: "Focus Time",
          message: "Time to start focusing!",
          scheduledFor: new Date(startTime),
        },
        {
          userId: user.id,
          type: "FOCUS_END",
          title: "Break Time",
          message: "Great work! Time for a break.",
          scheduledFor: new Date(endTime),
        },
      ],
    });

    // If calendar sync is enabled, create Google Calendar event
    if (user.calendarConnected) {
      try {
        const eventId = await GoogleCalendarService.createEvent(user.id, focusBlock);
        await prisma.focusBlock.update({
          where: { id: focusBlock.id },
          data: { calendarEventId: eventId },
        });
      } catch (error) {
        console.error("Failed to create Google Calendar event:", error);
        // Don't fail the whole request if calendar sync fails
      }
    }

    return NextResponse.json(focusBlock);
  } catch (error) {
    console.error("Focus block creation error:", error);
    return NextResponse.json(
      { error: "Failed to create focus block" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const session = await getServerSession();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const focusBlocks = await prisma.focusBlock.findMany({
      where: {
        userId: user.id,
        startTime: startDate ? { gte: new Date(startDate) } : undefined,
        endTime: endDate ? { lte: new Date(endDate) } : undefined,
      },
      include: {
        feedbackLogs: true,
      },
      orderBy: {
        startTime: "desc",
      },
    });

    return NextResponse.json(focusBlocks);
  } catch (error) {
    console.error("Focus block fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch focus blocks" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();
    
    const focusBlock = await prisma.focusBlock.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(focusBlock);
  } catch (error) {
    console.error("Focus block update error:", error);
    return NextResponse.json(
      { error: "Failed to update focus block" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Missing focus block ID", { status: 400 });
    }

    const body = await req.json();
    const validatedData = focusBlockSchema.parse(body);

    const existingBlock = await prisma.focusBlock.findUnique({
      where: { id },
      include: { 
        user: { 
          select: { 
            email: true,
            calendarConnected: true,
            id: true
          } 
        } 
      },
    });

    if (!existingBlock || existingBlock.user.email !== session.user.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const focusBlock = await prisma.focusBlock.update({
      where: { id },
      data: validatedData,
    });

    // Update Google Calendar event if sync is enabled
    if (existingBlock.user.calendarConnected && focusBlock.calendarEventId) {
      try {
        await GoogleCalendarService.updateEvent(existingBlock.user.id, focusBlock);
      } catch (error) {
        console.error("Failed to update Google Calendar event:", error);
        // Don't fail the whole request if calendar sync fails
      }
    }

    return NextResponse.json(focusBlock);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    console.error("Focus block update error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Missing focus block ID", { status: 400 });
    }

    const existingBlock = await prisma.focusBlock.findUnique({
      where: { id },
      include: { 
        user: { 
          select: { 
            email: true,
            calendarConnected: true,
            id: true
          } 
        } 
      },
    });

    if (!existingBlock || existingBlock.user.email !== session.user.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete Google Calendar event if sync is enabled
    if (existingBlock.user.calendarConnected && existingBlock.calendarEventId) {
      try {
        await GoogleCalendarService.deleteEvent(existingBlock.user.id, existingBlock.calendarEventId);
      } catch (error) {
        console.error("Failed to delete Google Calendar event:", error);
        // Don't fail the whole request if calendar sync fails
      }
    }

    await prisma.focusBlock.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Focus block deletion error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 