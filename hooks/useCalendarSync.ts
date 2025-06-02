import { useState } from 'react';
import { toast } from 'sonner';
import { FocusBlock } from '@prisma/client';

interface UseCalendarSyncProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useCalendarSync({ onSuccess, onError }: UseCalendarSyncProps = {}) {
  const [isLoading, setIsLoading] = useState(false);

  const syncCalendarEvent = async (focusBlockId: string, action: 'create' | 'update' | 'delete') => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/focus-blocks/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ focusBlockId, action }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to sync calendar event');
      }

      toast.success('Calendar synced successfully');
      onSuccess?.();
    } catch (error) {
      console.error('Calendar sync error:', error);
      toast.error('Failed to sync with calendar');
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCalendarEvents = async (startDate: Date, endDate: Date) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/focus-blocks/sync?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch calendar events');
      }

      const data = await response.json();
      return data.events;
    } catch (error) {
      console.error('Calendar fetch error:', error);
      toast.error('Failed to fetch calendar events');
      onError?.(error as Error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to sync a batch of focus blocks
  const syncBatchCalendarEvents = async (focusBlocks: FocusBlock[]) => {
    try {
      setIsLoading(true);
      await Promise.all(
        focusBlocks.map((block) =>
          syncCalendarEvent(block.id, block.calendarEventId ? 'update' : 'create')
        )
      );
      toast.success('All focus blocks synced with calendar');
      onSuccess?.();
    } catch (error) {
      console.error('Batch calendar sync error:', error);
      toast.error('Failed to sync some focus blocks');
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    syncCalendarEvent,
    fetchCalendarEvents,
    syncBatchCalendarEvents,
  };
} 