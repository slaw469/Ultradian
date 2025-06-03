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
    const {
      sessionId,
      domainTimes,
      tabSwitches,
      totalTabs,
      currentDomain
    } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the work session
    const workSession = await prisma.workSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id,
        endTime: null // Only update active sessions
      }
    });

    if (!workSession) {
      return NextResponse.json(
        { error: "Active session not found" },
        { status: 404 }
      );
    }

    // Update the session with browser tracking data
    const updatedSession = await prisma.workSession.update({
      where: { id: sessionId },
      data: {
        tabSwitches: tabSwitches || 0,
        totalTabs: totalTabs || 1,
        // Store domain times as JSON for detailed analysis
        domainTimes: domainTimes || {},
        // Update the main domain if we have current domain info
        ...(currentDomain && { domain: currentDomain })
      }
    });

    return NextResponse.json({
      success: true,
      sessionId: updatedSession.id,
      message: "Browser tracking data updated"
    });

  } catch (error) {
    console.error("Browser tracking update error:", error);
    return NextResponse.json(
      { error: "Failed to update browser tracking data" },
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

    // Get the current active session for browser extension sync
    const activeSession = await prisma.workSession.findFirst({
      where: {
        userId: user.id,
        endTime: null
      },
      orderBy: {
        startTime: 'desc'
      }
    });

    if (!activeSession) {
      return NextResponse.json({ error: "No active session found" }, { status: 404 });
    }

    return NextResponse.json({
      sessionId: activeSession.id,
      title: activeSession.title,
      startTime: activeSession.startTime,
      description: activeSession.description
    });

  } catch (error) {
    console.error("Browser tracking session fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch session data" },
      { status: 500 }
    );
  }
} 