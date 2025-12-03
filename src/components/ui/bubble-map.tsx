"use client";

import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, ZAxis } from "recharts";

interface BubbleMapProps {
  data: Array<{
    city: string;
    lat: number;
    lng: number;
    value: number; // revenue or spend
    performance: number; // controls bubble color (ROAS or CTR, etc.)
  }>;
}

function getColorForValue(value: number) {
  if (value < 1) return "#ef4444";       // 🔴 red
  if (value < 2.5) return "#f59e0b";     // 🟡 yellow/orange
  return "#10b981";                      // 🟢 green
}
export function BubbleMap({ data }: BubbleMapProps) {
  return (
    <div className="w-full h-[500px] bg-white p-4 rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Campaign Bubble Map</h2>
      <p className="text-gray-600 mb-4">Bubble size reflects higher spend or revenue</p>

      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart>
          <XAxis
            type="number"
            dataKey="lng"
            name="Longitude"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            type="number"
            dataKey="lat"
            name="Latitude"
            tick={{ fontSize: 12 }}
          />
          <ZAxis
            type="number"
            dataKey="value"
            range={[40, 200]}  // bubble size scaling
            name="Value"
          />

          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(value: any, name: string) => {
              if (name === "value") return [`$${value.toLocaleString()}`, "Revenue"];
              if (name === "performance") return [`${value.toFixed(2)}x`, "ROAS"];
              return [value, name];
            }}
            labelFormatter={() => ""}
          />

          <Scatter
            name="Cities"
            data={data}
            fill="#8884d8"
            opacity={0.8}
          >   </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
