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
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create sample work sessions for today
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const sampleSessions = [
      {
        userId: user.id,
        title: "Working on React components",
        description: "Building the session feed component",
        websiteUrl: "https://github.com/user/project",
        favicon: "https://www.google.com/s2/favicons?domain=github.com&sz=32",
        domain: "github.com",
        startTime: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9 AM
        endTime: new Date(today.getTime() + 10.5 * 60 * 60 * 1000), // 10:30 AM
        duration: 90,
        activityType: "CODING",
        aiSummary: "You were developing React components for the session feed, focusing on the UI layout and data flow.",
        nextSteps: ["Add real-time updates", "Implement AI insights", "Test with sample data"],
        tags: ["react", "frontend", "development"],
        aiProcessed: true,
        rating: 4,
      },
      {
        userId: user.id,
        title: "API Documentation Review",
        description: "Reviewing and updating API documentation",
        websiteUrl: "https://docs.google.com/document/d/123",
        favicon: "https://www.google.com/s2/favicons?domain=docs.google.com&sz=32",
        domain: "docs.google.com",
        startTime: new Date(today.getTime() + 11 * 60 * 60 * 1000), // 11 AM
        endTime: new Date(today.getTime() + 12 * 60 * 60 * 1000), // 12 PM
        duration: 60,
        activityType: "WRITING",
        aiSummary: "You spent time reviewing and updating API documentation, ensuring clarity and completeness.",
        nextSteps: ["Add code examples", "Review with team", "Publish updates"],
        tags: ["documentation", "api", "writing"],
        aiProcessed: true,
        rating: 3,
      },
      {
        userId: user.id,
        title: "Research on AI Integration",
        description: "Researching best practices for AI integration",
        websiteUrl: "https://openai.com/docs",
        favicon: "https://www.google.com/s2/favicons?domain=openai.com&sz=32",
        domain: "openai.com",
        startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000), // 2 PM
        endTime: new Date(today.getTime() + 15.5 * 60 * 60 * 1000), // 3:30 PM
        duration: 90,
        activityType: "RESEARCH",
        aiSummary: "You researched AI integration patterns and best practices for implementing intelligent features.",
        nextSteps: ["Implement OpenAI integration", "Test AI responses", "Add error handling"],
        tags: ["ai", "research", "integration"],
        aiProcessed: true,
        rating: 5,
      }
    ];

    // Create the sessions
    const createdSessions = await Promise.all(
      sampleSessions.map(sessionData => 
        prisma.workSession.create({ data: sessionData })
      )
    );

    return NextResponse.json({ 
      message: "Sample sessions created successfully",
      sessions: createdSessions 
    });
  } catch (error) {
    console.error("Test session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create test sessions" },
      { status: 500 }
    );
  }
} 