import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Deluxe Suites", value: 45, color: "#0ea5e9" },
  { name: "Standard Rooms", value: 30, color: "#10b981" },
  { name: "Family Rooms", value: 25, color: "#f59e0b" },
];

const RoomChart = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 h-[400px] flex flex-col">
      <h3 className="font-bold text-gray-900 text-lg mb-6">
        Room Distribution
      </h3>

      <div className="flex-1 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={70}
              outerRadius={100}
              paddingAngle={8}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-2xl font-black text-gray-900">240</p>
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 leading-none">
            Total Rooms
          </p>
        </div>
      </div>

      {/* Legend - Chú thích phía dưới */}
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="size-2 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-xs font-medium text-gray-500">
                {item.name}
              </span>
            </div>
            <span className="text-xs font-bold text-gray-900">
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomChart;
