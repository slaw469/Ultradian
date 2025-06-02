import { format, parseISO } from 'date-fns';
import {
  LineChart,
  Line,
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

interface DailyStatsProps {
  data: DailyPattern[];
}

export function DailyStats({ data }: DailyStatsProps) {
  const chartData = data.map(day => ({
    ...day,
    date: format(parseISO(day.date), 'EEE'),
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
            domain={[0, 5]}
            ticks={[0, 1, 2, 3, 4, 5]}
            tick={{ fontSize: 12 }}
            label={{
              value: 'Level (1-5)',
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
                    <p className="text-sm text-blue-500">
                      Energy: {payload[0].value.toFixed(1)}
                    </p>
                    <p className="text-sm text-purple-500">
                      Focus: {payload[1].value.toFixed(1)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="averageEnergy"
            name="Energy Level"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="averageFocus"
            name="Focus Level"
            stroke="#a855f7"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 