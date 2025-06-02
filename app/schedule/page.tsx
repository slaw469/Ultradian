import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FocusBlockCalendar } from "@/components/schedule/focus-block-calendar";
import { FocusBlockForm } from "@/components/schedule/focus-block-form";

export const metadata: Metadata = {
  title: "Schedule - Ultradian",
  description: "Schedule your focus blocks",
};

async function getUser() {
  const session = await getServerSession();
  if (!session?.user?.email) return null;

  return prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      focusBlocks: {
        where: {
          startTime: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
        orderBy: { startTime: "asc" },
      },
    },
  });
}

export default async function SchedulePage() {
  const user = await getUser();
  if (!user) redirect("/auth/login");
  if (!user.onboardingCompleted) redirect("/onboarding");

  return (
    <div className="container py-6">
      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <FocusBlockCalendar
          userId={user.id}
          focusBlocks={user.focusBlocks}
          workStartTime={user.workStartTime}
          workEndTime={user.workEndTime}
        />
        <div>
          <FocusBlockForm
            userId={user.id}
            focusBlockDuration={user.focusBlockDuration}
            breakDuration={user.breakDuration}
            workStartTime={user.workStartTime}
            workEndTime={user.workEndTime}
          />
        </div>
      </div>
    </div>
  );
} 