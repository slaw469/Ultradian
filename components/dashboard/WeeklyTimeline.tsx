import { format, parseISO } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DailyPattern {
  date: string;
  focusHours: number;
  breakHours: number;
  averageEnergy: number;
  averageFocus: number;
}

interface WeeklyTimelineProps {
  data: DailyPattern[];
}

export function WeeklyTimeline({ data }: WeeklyTimelineProps) {
  const chartData = data.map(day => ({
    ...day,
    date: format(parseISO(day.date), 'EEE'),
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            label={{
              value: 'Hours',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: '12px' },
            }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-background border rounded-lg shadow-lg p-3">
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-emerald-500">
                      Focus: {payload[0].value.toFixed(1)}h
                    </p>
                    <p className="text-sm text-red-500">
                      Break: {payload[1].value.toFixed(1)}h
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Bar
            dataKey="focusHours"
            name="Focus Time"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="breakHours"
            name="Break Time"
            fill="#f43f5e"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 