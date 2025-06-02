import { format } from 'date-fns';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

interface WeeklyStats {
  totalFocusHours: number;
  totalBreakHours: number;
  averageEnergyLevel: number;
  averageFocusLevel: number;
  mostProductiveHour: number;
}

interface ProductivityInsightsProps {
  stats: WeeklyStats;
}

export function ProductivityInsights({ stats }: ProductivityInsightsProps) {
  const pieData = [
    { name: 'Focus Time', value: stats.totalFocusHours },
    { name: 'Break Time', value: stats.totalBreakHours },
  ];

  const COLORS = ['#10b981', '#f43f5e'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Avg. Energy</p>
          <p className="text-2xl font-bold">
            {stats.averageEnergyLevel.toFixed(1)}/5
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Avg. Focus</p>
          <p className="text-2xl font-bold">
            {stats.averageFocusLevel.toFixed(1)}/5
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Total Focus</p>
          <p className="text-2xl font-bold">
            {stats.totalFocusHours.toFixed(1)}h
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Peak Hour</p>
          <p className="text-2xl font-bold">
            {format(new Date().setHours(stats.mostProductiveHour, 0), 'ha')}
          </p>
        </div>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border rounded-lg shadow-lg p-3">
                      <p className="font-medium">{payload[0].name}</p>
                      <p className="text-sm">
                        {payload[0].value.toFixed(1)} hours
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 