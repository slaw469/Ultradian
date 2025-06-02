import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const CREDENTIALS = {
  client_id: process.env.GOOGLE_CLIENT_ID!,
  client_secret: process.env.GOOGLE_CLIENT_SECRET!,
  redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
};

export class GoogleCalendarService {
  private static async getOAuth2Client(userId: string) {
    const account = await prisma.account.findFirst({
      where: {
        userId,
        provider: 'google',
      },
    });

    if (!account?.access_token || !account?.refresh_token) {
      throw new Error('No Google account connected');
    }

    const oauth2Client = new google.auth.OAuth2(
      CREDENTIALS.client_id,
      CREDENTIALS.client_secret,
      CREDENTIALS.redirect_uri
    );

    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
      expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
    });

    // Handle token refresh
    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.refresh_token) {
        await prisma.account.update({
          where: { id: account.id },
          data: {
            refresh_token: tokens.refresh_token,
            access_token: tokens.access_token,
            expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : undefined,
          },
        });
      }
    });

    return oauth2Client;
  }

  static async createEvent(userId: string, focusBlock: any) {
    try {
      const oauth2Client = await this.getOAuth2Client(userId);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const event = {
        summary: focusBlock.type === 'DEEP_WORK' ? 'Focus Session' : 'Break',
        description: `${focusBlock.type} session scheduled by Ultradian`,
        start: {
          dateTime: focusBlock.startTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: focusBlock.endTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 5 },
          ],
        },
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      return response.data.id;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  static async updateEvent(userId: string, focusBlock: any) {
    try {
      const oauth2Client = await this.getOAuth2Client(userId);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      if (!focusBlock.calendarEventId) {
        throw new Error('No calendar event ID found');
      }

      const event = {
        summary: focusBlock.type === 'DEEP_WORK' ? 'Focus Session' : 'Break',
        description: `${focusBlock.type} session scheduled by Ultradian`,
        start: {
          dateTime: focusBlock.startTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: focusBlock.endTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      await calendar.events.update({
        calendarId: 'primary',
        eventId: focusBlock.calendarEventId,
        requestBody: event,
      });
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  }

  static async deleteEvent(userId: string, calendarEventId: string) {
    try {
      const oauth2Client = await this.getOAuth2Client(userId);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: calendarEventId,
      });
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }
} 