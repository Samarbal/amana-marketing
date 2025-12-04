"use client";

import React, { useMemo } from "react";
import { ResponsiveContainer, ScatterChart, XAxis, YAxis, ZAxis, Tooltip, Scatter } from "recharts";
import { scaleLinear } from "d3-scale";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

// This is a standard public URL for a lightweight world map shapefile
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface BubbleMapProps {
  data: Array<{
    city: string;
    lat: number;
    lng: number;
    value: number; // Revenue or spend
    performance: number; // ROAS etc
  }>;
}

export function BubbleMap({ data }: BubbleMapProps) {
  // 1. Calculate the range of values to determine bubble size
  const { minVal, maxVal } = useMemo(() => {
    if (!data || data.length === 0) return { minVal: 0, maxVal: 1 };
    const values = data.map((d) => d.value);
    return { minVal: Math.min(...values), maxVal: Math.max(...values) };
  }, [data]);

  // 2. Create a scale: Smallest value = 4px, Largest value = 25px
  const sizeScale = scaleLinear()
    .domain([minVal, maxVal])
    .range([4, 25]);

  return (
    <div className="w-full h-[500px] bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-700 flex flex-col">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-white">Campaign Distribution</h2>
        <p className="text-gray-400 text-sm">Bubble size represents total revenue + spend</p>
      </div>

      <div className="flex-1 w-full h-full relative">
        <ComposableMap projection="geoMercator" projectionConfig={{ scale: 100 }}>
          {/* Draw the World Map Background */}
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#374151" // gray-700 (Land color)
                  stroke="#1f2937" // gray-800 (Border color)
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#4b5563", outline: "none" }, // Slightly lighter on hover
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Draw the Bubbles */}
          {data.map((item, index) => (
            <Marker key={index} coordinates={[item.lng, item.lat]}>
              <circle
                r={sizeScale(item.value)}
                fill={getColorForPerformance(item.performance)}
                fillOpacity={0.7}
                stroke="#fff"
                strokeWidth={1}
                className="cursor-pointer transition-all duration-300 hover:fill-opacity-100"
              />
              {/* Simple Tooltip on Hover via standard SVG title */}
              <title>{`${item.city}: $${item.value.toLocaleString()} (ROAS: ${item.performance.toFixed(2)}x)`}</title>
            </Marker>
          ))}
        </ComposableMap>
      </div>

      {/* Simple Legend */}
      <div className="flex gap-4 mt-2 justify-center text-xs text-gray-300">
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> Low Perf</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Avg Perf</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> High Perf</div>
      </div>
    </div>
  );
}

// Helper for bubble colors
function getColorForPerformance(roas: number) {
  if (roas < 1) return "#ef4444"; // Red
  if (roas < 2.5) return "#f59e0b"; // Yellow
  return "#10b981"; // Green
}