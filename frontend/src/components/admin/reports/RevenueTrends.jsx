import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { day: "01", rev: 4000 },
  { day: "05", rev: 5500 },
  { day: "10", rev: 7000 },
  { day: "15", rev: 8500 },
  { day: "20", rev: 6000 },
  { day: "25", rev: 7800 },
  { day: "30", rev: 8200 },
];

const RevenueTrends = () => (
  <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm h-[400px] flex flex-col lg:col-span-2">
    <div className="flex justify-between items-center mb-8">
      <h3 className="font-bold text-gray-900 text-lg">
        Revenue vs Occupancy Trends
      </h3>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="size-2 bg-blue-500 rounded-full" />{" "}
          <span className="text-[10px] font-bold text-gray-400">Revenue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-2 bg-gray-200 rounded-full" />{" "}
          <span className="text-[10px] font-bold text-gray-400">Occupancy</span>
        </div>
      </div>
    </div>
    <div className="flex-1 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f8fafc"
          />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#cbd5e1", fontSize: 11 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#cbd5e1", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: "#f8fafc" }}
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
            }}
          />
          <Bar dataKey="rev" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default RevenueTrends;
