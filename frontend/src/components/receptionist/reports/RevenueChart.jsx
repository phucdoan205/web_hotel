import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Mon", online: 4000, walkIn: 2400 },
  { name: "Tue", online: 3000, walkIn: 1398 },
  { name: "Wed", online: 2000, walkIn: 9800 },
  { name: "Thu", online: 2780, walkIn: 3908 },
  { name: "Fri", online: 1890, walkIn: 4800 },
  { name: "Sat", online: 2390, walkIn: 3800 },
  { name: "Sun", online: 3490, walkIn: 4300 },
];

const RevenueChart = () => {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
          Revenue Trend
        </h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
            <div className="size-2 rounded-full bg-[#0085FF]" /> Online
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
            <div className="size-2 rounded-full bg-cyan-400" /> Walk-in
          </div>
        </div>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorOnline" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0085FF" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#0085FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F3F4F6"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 900 }}
              dy={10}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                borderRadius: "16px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
            />
            <Area
              type="monotone"
              dataKey="online"
              stroke="#0085FF"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorOnline)"
            />
            <Area
              type="monotone"
              dataKey="walkIn"
              stroke="#22D3EE"
              strokeWidth={3}
              fill="transparent"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
