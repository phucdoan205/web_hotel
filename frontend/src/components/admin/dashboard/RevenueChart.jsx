import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const RevenueChart = ({ data = [] }) => {
  return (
    <div className="flex h-[400px] flex-col rounded-2xl border border-gray-50 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Doanh thu theo tháng</h3>
          <p className="text-sm font-medium text-gray-400">
            Doanh thu ước tính từ chi tiết booking trong 6 tháng gần nhất
          </p>
        </div>
      </div>

      <div className="w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" vertical={false} />
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
              formatter={(value) => [`${Number(value || 0).toLocaleString("vi-VN")} đ`, "Doanh thu"]}
              contentStyle={{
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
            />
            <Bar dataKey="revenue" radius={[6, 6, 6, 6]} barSize={42}>
              {data.map((entry, index) => (
                <Cell
                  key={`${entry.name}-${index}`}
                  fill={index === data.length - 1 ? "#0ea5e9" : "#dbeafe"}
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
