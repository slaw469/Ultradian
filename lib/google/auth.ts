import { prisma } from "@/lib/prisma";

export async function hasCalendarPermissions(userId: string): Promise<boolean> {
  try {
    const account = await prisma.account.findFirst({
      where: {
        userId,
        provider: "google",
      },
      select: {
        scope: true,
      },
    });

    if (!account?.scope) return false;

    const requiredScopes = [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ];

    return requiredScopes.every((scope) => account.scope?.includes(scope));
  } catch (error) {
    console.error("Error checking calendar permissions:", error);
    return false;
  }
} 