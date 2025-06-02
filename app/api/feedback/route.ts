import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { focusBlockId, energyLevel, focusLevel, mood, notes } = await req.json();
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify focus block belongs to user
    const focusBlock = await prisma.focusBlock.findFirst({
      where: {
        id: focusBlockId,
        userId: user.id,
      },
    });

    if (!focusBlock) {
      return NextResponse.json({ error: "Focus block not found" }, { status: 404 });
    }

    const feedback = await prisma.feedbackLog.create({
      data: {
        userId: user.id,
        focusBlockId,
        energyLevel,
        focusLevel,
        mood,
        notes,
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Feedback creation error:", error);
    return NextResponse.json(
      { error: "Failed to save feedback" },
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
    const focusBlockId = searchParams.get("focusBlockId");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const feedback = await prisma.feedbackLog.findMany({
      where: {
        userId: user.id,
        focusBlockId: focusBlockId || undefined,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Feedback fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
} 