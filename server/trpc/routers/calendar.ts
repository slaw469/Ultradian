import { z } from 'zod';
import { router as createTRPCRouter, protectedProcedure } from '../trpc';
import { GoogleCalendarService } from '@/lib/google/calendar';
import { TRPCError } from '@trpc/server';
import { hasCalendarPermissions } from '@/lib/google/auth';

export const calendarRouter = createTRPCRouter({
  checkPermissions: protectedProcedure.query(async ({ ctx }) => {
    const hasPermissions = await hasCalendarPermissions(ctx.session.user.id);
    return { hasPermissions };
  }),

  toggleSync: protectedProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx;
      
      try {
        if (input.enabled) {
          const hasPermissions = await hasCalendarPermissions(session.user.id);
          if (!hasPermissions) {
            throw new TRPCError({
              code: 'PRECONDITION_FAILED',
              message: 'Calendar permissions required',
            });
          }
        }

        await prisma.user.update({
          where: { id: session.user.id },
          data: { calendarConnected: input.enabled },
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update calendar sync settings',
        });
      }
    }),

  syncFocusBlock: protectedProcedure
    .input(z.object({
      focusBlockId: z.string(),
      action: z.enum(['CREATE', 'UPDATE', 'DELETE']),
    }))
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx;

      try {
        const focusBlock = await prisma.focusBlock.findUnique({
          where: { id: input.focusBlockId },
        });

        if (!focusBlock) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Focus block not found',
          });
        }

        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
        });

        if (!user?.calendarConnected) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: 'Calendar sync is not enabled',
          });
        }

        const hasPermissions = await hasCalendarPermissions(session.user.id);
        if (!hasPermissions) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: 'Calendar permissions required',
          });
        }

        switch (input.action) {
          case 'CREATE': {
            const eventId = await GoogleCalendarService.createEvent(session.user.id, focusBlock);
            await prisma.focusBlock.update({
              where: { id: focusBlock.id },
              data: { calendarEventId: eventId },
            });
            break;
          }
          case 'UPDATE': {
            if (focusBlock.calendarEventId) {
              await GoogleCalendarService.updateEvent(session.user.id, focusBlock);
            }
            break;
          }
          case 'DELETE': {
            if (focusBlock.calendarEventId) {
              await GoogleCalendarService.deleteEvent(session.user.id, focusBlock.calendarEventId);
              await prisma.focusBlock.update({
                where: { id: focusBlock.id },
                data: { calendarEventId: null },
              });
            }
            break;
          }
        }

        return { success: true };
      } catch (error) {
        console.error('Calendar sync error:', error);
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to sync with Google Calendar',
        });
      }
    }),
}); 