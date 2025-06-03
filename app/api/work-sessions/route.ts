import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generateSessionInsightsHuggingFace, extractDomainFromUrl, getFaviconUrl } from "@/lib/services/ai-insights-huggingface";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const activityType = searchParams.get("activityType");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const workSessions = await prisma.workSession.findMany({
      where: {
        userId: user.id,
        ...(startDate && { startTime: { gte: new Date(startDate) } }),
        ...(endDate && { endTime: { lte: new Date(endDate) } }),
        ...(activityType && { activityType }),
      },
      orderBy: {
        startTime: "desc",
      },
    });

    return NextResponse.json(workSessions);
  } catch (error) {
    console.error("Work session fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch work sessions" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      description,
      websiteUrl,
      startTime,
      endTime,
      focusBlockId,
      tabSwitches,
      totalTabs,
      context
    } = body;

    // Validate required fields
    if (!title || !startTime) {
      return NextResponse.json(
        { error: "Title and start time are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate duration if endTime is provided
    const duration = endTime 
      ? Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60))
      : null;

    // Extract domain and favicon from URL
    const domain = websiteUrl ? extractDomainFromUrl(websiteUrl) : null;
    const favicon = domain ? getFaviconUrl(domain) : null;

    // Create the work session
    const workSession = await prisma.workSession.create({
      data: {
        userId: user.id,
        focusBlockId,
        title,
        description,
        websiteUrl,
        favicon,
        domain,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        duration,
        tabSwitches: tabSwitches || 0,
        totalTabs: totalTabs || 1,
        aiProcessed: false,
      },
    });

    // Generate AI insights asynchronously (don't wait for completion)
    if (duration && duration > 5) { // Only process sessions longer than 5 minutes
      generateAIInsights(workSession.id, {
        title,
        websiteUrl,
        domain,
        duration,
        startTime: new Date(startTime),
        context
      }).catch(error => {
        console.error('Failed to generate AI insights:', error);
      });
    }

    return NextResponse.json(workSession, { status: 201 });
  } catch (error) {
    console.error("Work session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create work session" },
      { status: 500 }
    );
  }
}

// Helper function to generate AI insights asynchronously using Hugging Face
async function generateAIInsights(sessionId: string, sessionData: any) {
  try {
    const insights = await generateSessionInsightsHuggingFace(sessionData);
    
    await prisma.workSession.update({
      where: { id: sessionId },
      data: {
        aiSummary: insights.summary,
        nextSteps: insights.nextSteps,
        tags: insights.tags,
        activityType: insights.activityType,
        aiProcessed: true,
      },
    });
  } catch (error) {
    console.error('Error updating session with AI insights:', error);
    // Mark as processed even if AI failed, with fallback data
    await prisma.workSession.update({
      where: { id: sessionId },
      data: {
        aiProcessed: true,
        activityType: 'OTHER',
      },
    });
  }
} 