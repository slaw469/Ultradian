import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { sessionId, domainTimes, tabSwitches, totalTabs, currentDomain } = body;

    console.log('Received browser tracking data:', { sessionId, domainTimes, tabSwitches, totalTabs });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If sessionId is provided, update specific session
    if (sessionId) {
      const workSession = await prisma.workSession.findFirst({
        where: {
          id: sessionId,
          userId: user.id,
        },
      });

      if (workSession) {
        await prisma.workSession.update({
          where: { id: sessionId },
          data: {
            domainTimes: domainTimes || {},
            tabSwitches: tabSwitches || 0,
            totalTabs: totalTabs || 0,
          },
        });
      }
    } else {
      // Find active session (no endTime) and update it
      const activeSession = await prisma.workSession.findFirst({
        where: {
          userId: user.id,
          endTime: null,
        },
        orderBy: {
          startTime: 'desc',
        },
      });

      if (activeSession) {
        console.log('Updating active session:', activeSession.id);
        await prisma.workSession.update({
          where: { id: activeSession.id },
          data: {
            domainTimes: domainTimes || {},
            tabSwitches: tabSwitches || 0,
            totalTabs: totalTabs || 0,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Browser tracking sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync browser data" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get current active session
    const activeSession = await prisma.workSession.findFirst({
      where: {
        userId: user.id,
        endTime: null,
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    if (activeSession) {
      return NextResponse.json({
        sessionId: activeSession.id,
        startTime: activeSession.startTime,
        title: activeSession.title,
      });
    }

    return NextResponse.json({ message: "No active session" }, { status: 404 });
  } catch (error) {
    console.error("Get active session error:", error);
    return NextResponse.json(
      { error: "Failed to get active session" },
      { status: 500 }
    );
  }
} 