import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getFocusAnalytics } from '@/lib/services/focus-analytics';
import { authOptions } from '@/lib/auth-config';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    
    if (!startDate) {
      return new NextResponse('Start date is required', { status: 400 });
    }

    const analytics = await getFocusAnalytics(
      session.user.id,
      new Date(startDate)
    );

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error in focus analytics API:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal server error',
      { status: 500 }
    );
  }
} 