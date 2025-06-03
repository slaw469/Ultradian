import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generateSessionInsightsHuggingFace } from "@/lib/services/ai-insights-huggingface";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await req.json();
    const { rating, notes, endTime } = body;

    // First, get the current session to validate ownership
    const existingSession = await prisma.workSession.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (existingSession.user.email !== session.user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Prepare the update data
    let updateData: any = {};

    if (rating !== undefined) {
      updateData.rating = rating;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // If ending the session
    if (endTime) {
      const startTime = new Date(existingSession.startTime);
      const endDateTime = new Date(endTime);
      const duration = Math.round((endDateTime.getTime() - startTime.getTime()) / (1000 * 60)); // Duration in minutes

      updateData.endTime = endDateTime;
      updateData.duration = duration;

      // Generate AI insights if not already processed
      if (!existingSession.aiProcessed) {
        try {
          const insights = await generateSessionInsightsHuggingFace({
            title: existingSession.title,
            websiteUrl: existingSession.websiteUrl || undefined,
            domain: existingSession.domain || undefined,
            duration,
            startTime,
            context: existingSession.description || undefined
          });

          updateData.aiSummary = insights.summary;
          updateData.nextSteps = insights.nextSteps;
          updateData.tags = insights.tags;
          updateData.activityType = insights.activityType;
          updateData.aiProcessed = true;
        } catch (error) {
          console.error('Failed to generate AI insights:', error);
          // Don't fail the request if AI insights fail
          updateData.aiProcessed = false;
        }
      }
    }

    // Update the session
    const updatedSession = await prisma.workSession.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updatedSession);

  } catch (error) {
    console.error("Error updating work session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify the work session belongs to the user
    const existingSession = await prisma.workSession.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: "Work session not found" },
        { status: 404 }
      );
    }

    // Delete the session
    await prisma.workSession.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Work session delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete work session" },
      { status: 500 }
    );
  }
} 