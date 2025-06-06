import { format, subDays, startOfDay, endOfDay, eachDayOfInterval, getHours, parseISO } from 'date-fns';

export interface AnalyticsData {
  totalFocusTime: number;
  totalSessions: number;
  averageSessionLength: number;
  productivityScore: number;
  weekComparison: {
    focusTime: number;
    sessions: number;
    productivity: number;
  };
  dailyFocus: Array<{
    date: string;
    focusHours: number;
    sessions: number;
    productivity: number;
  }>;
  hourlyProductivity: Array<{
    hour: number;
    productivity: number;
    sessions: number;
  }>;
  sessionDistribution: Array<{
    duration: string;
    count: number;
  }>;
  insights: string[];
  projects: Array<{
    name: string;
    hours: number;
    sessions: number;
    productivity: number;
  }>;
}

export async function getAnalyticsData(timeRange: string): Promise<AnalyticsData> {
  try {
    // Calculate date range
    const endDate = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '3m' ? 90 : 180;
    const startDate = subDays(endDate, days);

    // Fetch work sessions from API
    const response = await fetch(`/api/work-sessions?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch analytics data');
    }

    const sessions = await response.json();

    // Process data
    const processedData = processSessionData(sessions, startDate, endDate);
    
    return processedData;
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    
    // Return mock data for development
    return getMockAnalyticsData(timeRange);
  }
}

function processSessionData(sessions: any[], startDate: Date, endDate: Date): AnalyticsData {
  // Calculate total metrics
  const totalFocusTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  const totalSessions = sessions.length;
  const averageSessionLength = totalSessions > 0 ? totalFocusTime / totalSessions : 0;

  // Calculate productivity score (0-100)
  const productivityScore = calculateProductivityScore(sessions);

  // Generate daily focus data
  const dailyFocus = generateDailyFocus(sessions, startDate, endDate);

  // Generate hourly productivity
  const hourlyProductivity = generateHourlyProductivity(sessions);

  // Generate session distribution
  const sessionDistribution = generateSessionDistribution(sessions);

  // Generate project breakdown
  const projects = generateProjectBreakdown(sessions);

  // Generate insights
  const insights = generateInsights(sessions, dailyFocus, hourlyProductivity);

  // Calculate week comparison (placeholder)
  const weekComparison = {
    focusTime: 15, // +15% vs last week
    sessions: 8,   // +8% vs last week
    productivity: 12, // +12% vs last week
  };

  return {
    totalFocusTime,
    totalSessions,
    averageSessionLength,
    productivityScore,
    weekComparison,
    dailyFocus,
    hourlyProductivity,
    sessionDistribution,
    insights,
    projects,
  };
}

function calculateProductivityScore(sessions: any[]): number {
  if (sessions.length === 0) return 0;
  
  // Score based on session completion, duration, and frequency
  const avgDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length;
  const completionRate = sessions.filter(s => s.endTime).length / sessions.length;
  const consistencyScore = Math.min(sessions.length / 5, 1); // Up to 5 sessions per day is ideal
  
  return Math.round((avgDuration * 0.4 + completionRate * 40 + consistencyScore * 20));
}

function generateDailyFocus(sessions: any[], startDate: Date, endDate: Date) {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  return days.map(date => {
    const dayStr = format(date, 'yyyy-MM-dd');
    const daySessions = sessions.filter(s => 
      format(new Date(s.startTime), 'yyyy-MM-dd') === dayStr
    );
    
    const focusHours = daySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;
    const sessionCount = daySessions.length;
    const productivity = sessionCount > 0 ? focusHours * 10 / sessionCount : 0;

    return {
      date: dayStr,
      focusHours: Math.round(focusHours * 10) / 10,
      sessions: sessionCount,
      productivity: Math.min(Math.round(productivity), 10),
    };
  });
}

function generateHourlyProductivity(sessions: any[]) {
  const hourlyData: { [hour: number]: { total: number; count: number } } = {};
  
  // Initialize all hours
  for (let i = 0; i < 24; i++) {
    hourlyData[i] = { total: 0, count: 0 };
  }
  
  sessions.forEach(session => {
    const hour = getHours(new Date(session.startTime));
    const productivity = (session.duration || 0) / 60; // Convert to hours
    
    hourlyData[hour].total += productivity;
    hourlyData[hour].count += 1;
  });
  
  return Object.entries(hourlyData).map(([hour, data]) => ({
    hour: parseInt(hour),
    productivity: data.count > 0 ? Math.round((data.total / data.count) * 10) / 10 : 0,
    sessions: data.count,
  }));
}

function generateSessionDistribution(sessions: any[]) {
  const buckets = {
    '0-15 min': 0,
    '15-30 min': 0,
    '30-45 min': 0,
    '45-60 min': 0,
    '60+ min': 0,
  };
  
  sessions.forEach(session => {
    const duration = session.duration || 0;
    if (duration <= 15) buckets['0-15 min']++;
    else if (duration <= 30) buckets['15-30 min']++;
    else if (duration <= 45) buckets['30-45 min']++;
    else if (duration <= 60) buckets['45-60 min']++;
    else buckets['60+ min']++;
  });
  
  return Object.entries(buckets).map(([duration, count]) => ({
    duration,
    count,
  }));
}

function generateProjectBreakdown(sessions: any[]) {
  const projectMap: { [key: string]: { hours: number; sessions: number; totalProductivity: number } } = {};
  
  sessions.forEach(session => {
    const project = session.domain || session.title?.split(' ')[0] || 'Other';
    
    if (!projectMap[project]) {
      projectMap[project] = { hours: 0, sessions: 0, totalProductivity: 0 };
    }
    
    projectMap[project].hours += (session.duration || 0) / 60;
    projectMap[project].sessions += 1;
    projectMap[project].totalProductivity += (session.duration || 0) / 60;
  });
  
  return Object.entries(projectMap)
    .map(([name, data]) => ({
      name,
      hours: Math.round(data.hours * 10) / 10,
      sessions: data.sessions,
      productivity: Math.round((data.totalProductivity / data.sessions) * 10) / 10,
    }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 10);
}

function generateInsights(sessions: any[], dailyFocus: any[], hourlyProductivity: any[]): string[] {
  const insights: string[] = [];
  
  // Peak productivity time
  const peakHour = hourlyProductivity.reduce((max, curr) => 
    curr.productivity > max.productivity ? curr : max
  );
  if (peakHour.productivity > 0) {
    const timeStr = peakHour.hour === 0 ? '12 AM' : 
                   peakHour.hour === 12 ? '12 PM' :
                   peakHour.hour < 12 ? `${peakHour.hour} AM` : `${peakHour.hour - 12} PM`;
    insights.push(`Your peak productivity is at ${timeStr}`);
  }
  
  // Focus consistency
  const activeDays = dailyFocus.filter(d => d.focusHours > 0).length;
  if (activeDays > 0) {
    const consistency = Math.round((activeDays / dailyFocus.length) * 100);
    insights.push(`You maintained focus on ${consistency}% of days`);
  }
  
  // Session length recommendation
  const avgDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length;
  if (avgDuration < 25) {
    insights.push("Try extending your focus sessions to 25-45 minutes for better deep work");
  } else if (avgDuration > 60) {
    insights.push("Consider taking breaks every 45-60 minutes to maintain focus quality");
  }
  
  return insights.slice(0, 3);
}

// Mock data for development
function getMockAnalyticsData(timeRange: string): AnalyticsData {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  
  return {
    totalFocusTime: Math.floor(Math.random() * 1000) + 500,
    totalSessions: Math.floor(Math.random() * 50) + 20,
    averageSessionLength: Math.floor(Math.random() * 30) + 25,
    productivityScore: Math.floor(Math.random() * 30) + 70,
    weekComparison: {
      focusTime: Math.floor(Math.random() * 30) - 15,
      sessions: Math.floor(Math.random() * 20) - 10,
      productivity: Math.floor(Math.random() * 25) - 5,
    },
    dailyFocus: Array.from({ length: days }, (_, i) => ({
      date: format(subDays(new Date(), days - i - 1), 'yyyy-MM-dd'),
      focusHours: Math.random() * 8,
      sessions: Math.floor(Math.random() * 6) + 1,
      productivity: Math.floor(Math.random() * 10) + 1,
    })),
    hourlyProductivity: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      productivity: hour >= 6 && hour <= 22 ? Math.random() * 10 : Math.random() * 2,
      sessions: hour >= 8 && hour <= 18 ? Math.floor(Math.random() * 3) : 0,
    })),
    sessionDistribution: [
      { duration: '0-15 min', count: Math.floor(Math.random() * 5) },
      { duration: '15-30 min', count: Math.floor(Math.random() * 15) + 5 },
      { duration: '30-45 min', count: Math.floor(Math.random() * 20) + 10 },
      { duration: '45-60 min', count: Math.floor(Math.random() * 15) + 5 },
      { duration: '60+ min', count: Math.floor(Math.random() * 8) },
    ],
    insights: [
      "Your peak productivity is at 10 AM",
      "You maintained focus on 85% of days",
      "Try extending sessions to 45 minutes for better deep work",
    ],
    projects: [
      { name: 'Development', hours: 45.5, sessions: 23, productivity: 8.2 },
      { name: 'Research', hours: 32.1, sessions: 18, productivity: 7.8 },
      { name: 'Design', hours: 28.3, sessions: 15, productivity: 8.5 },
      { name: 'Writing', hours: 19.7, sessions: 12, productivity: 7.1 },
    ],
  };
} 