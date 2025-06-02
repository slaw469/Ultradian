import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Scopes required for Google Calendar integration
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
];

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate OAuth URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent', // Force consent screen to ensure we get refresh token
      state: session.user.email, // Pass user email as state for verification
    });

    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { code, state } = await request.json();

    // Get tokens from Google
    const { tokens } = await oauth2Client.getToken(code);
    
    // Find user by email (passed in state)
    const user = await prisma.user.findUnique({
      where: { email: state },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update or create Google account entry
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: tokens.sub || 'calendar',
        },
      },
      create: {
        userId: user.id,
        type: 'oauth',
        provider: 'google',
        providerAccountId: tokens.sub || 'calendar',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expiry_date
          ? Math.floor(tokens.expiry_date / 1000)
          : undefined,
        token_type: tokens.token_type,
        scope: tokens.scope,
      },
      update: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expiry_date
          ? Math.floor(tokens.expiry_date / 1000)
          : undefined,
      },
    });

    // Update user's calendar connection status
    await prisma.user.update({
      where: { id: user.id },
      data: { calendarConnected: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    return NextResponse.json(
      { error: 'Failed to process OAuth callback' },
      { status: 500 }
    );
  }
} 