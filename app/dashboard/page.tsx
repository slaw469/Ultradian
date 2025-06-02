import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FocusMap } from "@/components/dashboard/focus-map";
import { FocusTimer } from "@/components/dashboard/focus-timer";
import { NextFocusBlock } from "@/components/dashboard/next-focus-block";
import { DailyProgress } from "@/components/dashboard/daily-progress";
import { WeeklyTrends } from "@/components/dashboard/weekly-trends";
import { FocusRhythmDashboard } from '@/components/dashboard/FocusRhythmDashboard';

export const metadata: Metadata = {
  title: "Dashboard - Ultradian",
  description: "Track your focus and productivity",
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

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/auth/login");
  if (!user.onboardingCompleted) redirect("/onboarding");

  return (
    <div className="container py-8">
      <FocusRhythmDashboard />
    </div>
  );
}
