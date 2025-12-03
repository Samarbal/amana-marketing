import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

interface LineChartProps {
  data: Array<{ label: string; value: number }>;
}

export function LineChartComponent({ data }: LineChartProps) {
  return (
    <div className="w-full h-80 rounded-2xl p-4 shadow-md bg-white">
      <h2 className="text-xl font-semibold mb-4">Line Chart</h2>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
