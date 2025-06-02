import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FocusSession } from "@/components/focus/focus-session";
import { FeedbackForm } from "@/components/focus/feedback-form";

export const metadata: Metadata = {
  title: "Focus Session - Ultradian",
  description: "Stay focused and track your progress",
};

async function getFocusBlock(id: string) {
  const session = await getServerSession();
  if (!session?.user?.email) return null;

  const focusBlock = await prisma.focusBlock.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          email: true,
          focusBlockDuration: true,
          breakDuration: true,
        },
      },
    },
  });

  if (!focusBlock || focusBlock.user.email !== session.user.email) {
    return null;
  }

  return focusBlock;
}

interface FocusPageProps {
  params: {
    id: string;
  };
}

export default async function FocusPage({ params }: FocusPageProps) {
  const focusBlock = await getFocusBlock(params.id);
  if (!focusBlock) redirect("/dashboard");

  return (
    <div className="container py-6">
      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <FocusSession
          id={focusBlock.id}
          startTime={focusBlock.startTime}
          endTime={focusBlock.endTime}
          type={focusBlock.type}
          status={focusBlock.status}
          duration={
            focusBlock.type === "DEEP_WORK"
              ? focusBlock.user.focusBlockDuration
              : focusBlock.user.breakDuration
          }
        />
        <div>
          <FeedbackForm
            focusBlockId={focusBlock.id}
            type={focusBlock.type}
          />
        </div>
      </div>
    </div>
  );
} 