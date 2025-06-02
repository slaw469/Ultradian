import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { FocusBlock } from '@prisma/client';

export class GoogleCalendarService {
  private static async getAuthClient(userId: string) {
    const account = await prisma.account.findFirst({
      where: {
        userId,
        provider: 'google',
      },
    });

    if (!account?.access_token) {
      throw new Error('No Google account connected');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
      expiry_date: account.expires_at ? account.expires_at * 1000 : null,
    });

    return oauth2Client;
  }

  static async createCalendarEvent(userId: string, focusBlock: FocusBlock) {
    try {
      const auth = await this.getAuthClient(userId);
      const calendar = google.calendar({ version: 'v3', auth });

      const event = {
        summary: focusBlock.type === 'DEEP_WORK' ? '🎯 Focus Block' : '☕️ Break',
        description: `Ultradian focus session - ${focusBlock.type.toLowerCase().replace('_', ' ')}`,
        start: {
          dateTime: focusBlock.startTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: focusBlock.endTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 5 },
          ],
        },
        transparency: focusBlock.type === 'DEEP_WORK' ? 'opaque' : 'transparent',
        colorId: focusBlock.type === 'DEEP_WORK' ? '9' : '7', // Deep work = green, Break = yellow
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      // Update the focus block with the calendar event ID
      await prisma.focusBlock.update({
        where: { id: focusBlock.id },
        data: { calendarEventId: response.data.id },
      });

      return response.data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  static async updateCalendarEvent(userId: string, focusBlock: FocusBlock) {
    if (!focusBlock.calendarEventId) {
      return this.createCalendarEvent(userId, focusBlock);
    }

    try {
      const auth = await this.getAuthClient(userId);
      const calendar = google.calendar({ version: 'v3', auth });

      const event = {
        summary: focusBlock.type === 'DEEP_WORK' ? '🎯 Focus Block' : '☕️ Break',
        description: `Ultradian focus session - ${focusBlock.type.toLowerCase().replace('_', ' ')}`,
        start: {
          dateTime: focusBlock.startTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: focusBlock.endTime.toISOString(),
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

  static async deleteCalendarEvent(userId: string, focusBlock: FocusBlock) {
    if (!focusBlock.calendarEventId) return;

    try {
      const auth = await this.getAuthClient(userId);
      const calendar = google.calendar({ version: 'v3', auth });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: focusBlock.calendarEventId,
      });
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }

  static async syncCalendarEvents(userId: string, startDate: Date, endDate: Date) {
    try {
      const auth = await this.getAuthClient(userId);
      const calendar = google.calendar({ version: 'v3', auth });

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items;
    } catch (error) {
      console.error('Error syncing calendar events:', error);
      throw error;
    }
  }
} 