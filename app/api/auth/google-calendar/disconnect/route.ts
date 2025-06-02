import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete Google calendar account entry
    await prisma.account.deleteMany({
      where: {
        userId: user.id,
        provider: 'google',
      },
    });

    // Update user's calendar connection status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        calendarConnected: false,
        calendarId: null,
      },
    });

    // Clear calendar event IDs from focus blocks
    await prisma.focusBlock.updateMany({
      where: { userId: user.id },
      data: { calendarEventId: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting calendar:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect calendar' },
      { status: 500 }
    );
  }
} 