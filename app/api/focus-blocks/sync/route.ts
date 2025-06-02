import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { GoogleCalendarService } from '@/lib/services/google-calendar';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.calendarConnected) {
      return NextResponse.json(
        { error: 'Calendar not connected' },
        { status: 400 }
      );
    }

    const { focusBlockId, action } = await request.json();

    const focusBlock = await prisma.focusBlock.findUnique({
      where: { id: focusBlockId },
    });

    if (!focusBlock) {
      return NextResponse.json(
        { error: 'Focus block not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'create':
        await GoogleCalendarService.createCalendarEvent(user.id, focusBlock);
        break;
      case 'update':
        await GoogleCalendarService.updateCalendarEvent(user.id, focusBlock);
        break;
      case 'delete':
        await GoogleCalendarService.deleteCalendarEvent(user.id, focusBlock);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error syncing calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to sync calendar event' },
      { status: 500 }
    );
  }
}

// Sync calendar events for a date range
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.calendarConnected) {
      return NextResponse.json(
        { error: 'Calendar not connected' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = new Date(searchParams.get('startDate') || '');
    const endDate = new Date(searchParams.get('endDate') || '');

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date range' },
        { status: 400 }
      );
    }

    const events = await GoogleCalendarService.syncCalendarEvents(
      user.id,
      startDate,
      endDate
    );

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
} 