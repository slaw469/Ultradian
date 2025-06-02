import { prisma } from '@/lib/prisma';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, parseISO } from 'date-fns';

export interface FocusAnalytics {
  dailyPatterns: {
    date: string;
    focusHours: number;
    breakHours: number;
    averageEnergy: number;
    averageFocus: number;
  }[];
  weeklyStats: {
    totalFocusHours: number;
    totalBreakHours: number;
    averageEnergyLevel: number;
    averageFocusLevel: number;
    mostProductiveHour: number;
  };
}

export async function getFocusAnalytics(userId: string, startDate: Date): Promise<FocusAnalytics> {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!startDate || !(startDate instanceof Date) || isNaN(startDate.getTime())) {
      throw new Error('Invalid start date');
    }

    // Get week range
    const weekStart = startOfWeek(startDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(startDate, { weekStartsOn: 1 });

    // Fetch focus blocks for the week
    const focusBlocks = await prisma.focusBlock.findMany({
      where: {
        userId,
        startTime: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      include: {
        feedbackLogs: true,
      },
    }).catch(error => {
      console.error('Error fetching focus blocks:', error);
      throw new Error('Failed to fetch focus data');
    });

    // Initialize daily patterns
    const dailyPatterns = eachDayOfInterval({ start: weekStart, end: weekEnd }).map(date => ({
      date: format(date, 'yyyy-MM-dd'),
      focusHours: 0,
      breakHours: 0,
      averageEnergy: 0,
      averageFocus: 0,
      feedbackCount: 0,
    }));

    // Process focus blocks and feedback
    let totalFocusHours = 0;
    let totalBreakHours = 0;
    let totalEnergyLevel = 0;
    let totalFocusLevel = 0;
    let feedbackCount = 0;
    const hourlyProductivity: { [hour: number]: { total: number; count: number } } = {};

    focusBlocks.forEach(block => {
      const startDate = format(block.startTime, 'yyyy-MM-dd');
      const durationHours = (block.endTime.getTime() - block.startTime.getTime()) / (1000 * 60 * 60);
      const dayIndex = dailyPatterns.findIndex(d => d.date === startDate);

      if (dayIndex !== -1) {
        if (block.type === 'DEEP_WORK') {
          dailyPatterns[dayIndex].focusHours += durationHours;
          totalFocusHours += durationHours;
        } else {
          dailyPatterns[dayIndex].breakHours += durationHours;
          totalBreakHours += durationHours;
        }

        // Track hourly productivity
        const hour = block.startTime.getHours();
        if (block.type === 'DEEP_WORK' && block.feedbackLogs.length > 0) {
          if (!hourlyProductivity[hour]) {
            hourlyProductivity[hour] = { total: 0, count: 0 };
          }
          block.feedbackLogs.forEach(log => {
            hourlyProductivity[hour].total += log.focusLevel;
            hourlyProductivity[hour].count += 1;
          });
        }

        // Process feedback
        if (block.feedbackLogs.length > 0) {
          block.feedbackLogs.forEach(log => {
            dailyPatterns[dayIndex].averageEnergy += log.energyLevel;
            dailyPatterns[dayIndex].averageFocus += log.focusLevel;
            dailyPatterns[dayIndex].feedbackCount += 1;
            totalEnergyLevel += log.energyLevel;
            totalFocusLevel += log.focusLevel;
            feedbackCount += 1;
          });
        }
      }
    });

    // Calculate averages for each day
    dailyPatterns.forEach(day => {
      if (day.feedbackCount > 0) {
        day.averageEnergy /= day.feedbackCount;
        day.averageFocus /= day.feedbackCount;
      }
      delete day.feedbackCount;
    });

    // Find most productive hour
    let mostProductiveHour = 9; // Default to 9 AM
    let highestProductivity = 0;
    Object.entries(hourlyProductivity).forEach(([hour, data]) => {
      const avgProductivity = data.total / data.count;
      if (avgProductivity > highestProductivity) {
        highestProductivity = avgProductivity;
        mostProductiveHour = parseInt(hour);
      }
    });

    return {
      dailyPatterns,
      weeklyStats: {
        totalFocusHours,
        totalBreakHours,
        averageEnergyLevel: feedbackCount > 0 ? totalEnergyLevel / feedbackCount : 0,
        averageFocusLevel: feedbackCount > 0 ? totalFocusLevel / feedbackCount : 0,
        mostProductiveHour,
      },
    };
  } catch (error) {
    console.error('Error in getFocusAnalytics:', error);
    throw error;
  }
} 