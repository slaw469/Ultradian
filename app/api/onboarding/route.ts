import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.error("No session found");
      return NextResponse.json({ error: "Unauthorized - No session" }, { status: 401 });
    }

    if (!session.user?.email) {
      console.error("No user email in session", session);
      return NextResponse.json({ error: "Unauthorized - Invalid session" }, { status: 401 });
    }

    const { answers } = await req.json();
    
    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid answers format" }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.error("User not found for email:", session.user.email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Save quiz responses
    const savedAnswers = await Promise.all(
      answers.map((answer: { question: string; answer: string }) =>
        prisma.onboardingQuizResponse.create({
          data: {
            userId: user.id,
            question: answer.question,
            answer: answer.answer,
          },
        })
      )
    );

    // Update user onboarding status
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        onboardingCompleted: true,
        // Update preferences based on answers
        chronotype: answers.find((a: any) => a.question === "chronotype")?.answer,
        workStartTime: answers.find((a: any) => a.question === "workStartTime")?.answer,
        workEndTime: answers.find((a: any) => a.question === "workEndTime")?.answer,
      },
    });

    return NextResponse.json({ success: true, answers: savedAnswers });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save onboarding responses" },
      { status: 500 }
    );
  }
} 