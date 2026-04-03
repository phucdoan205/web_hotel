import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const data = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 3000 },
  { name: "Mar", revenue: 5000 },
  { name: "Apr", revenue: 4500 },
  { name: "May", revenue: 6000 },
  { name: "Jun", revenue: 8500 }, // Tháng hiện tại nổi bật
];

const RevenueChart = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-900 text-lg">
          Monthly Revenue & Occupancy
        </h3>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Weekly
          </button>
          <button className="px-3 py-1 text-xs font-medium bg-white text-sky-600 rounded-md shadow-sm">
            Monthly
          </button>
        </div>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0f0f0"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
            />
            <Bar dataKey="revenue" radius={[6, 6, 6, 6]} barSize={45}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === data.length - 1 ? "#0ea5e9" : "#e0f2fe"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
