import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const palette = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#64748b"];

const RoomChart = ({ data = [], total = 0 }) => {
  return (
    <div className="flex h-[400px] flex-col rounded-2xl border border-gray-50 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Phân bố trạng thái phòng</h3>
        <p className="text-sm font-medium text-gray-400">
          Số lượng phòng hiện tại được nhóm theo trạng thái vận hành
        </p>
      </div>

      <div className="relative flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={70}
              outerRadius={100}
              paddingAngle={6}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`${entry.name}-${index}`}
                  fill={entry.color || palette[index % palette.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} phòng`, "Số lượng"]} />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-2xl font-black text-gray-900">{total}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Tổng phòng
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={`${item.name}-${index}`} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="size-2 rounded-full"
                style={{ backgroundColor: item.color || palette[index % palette.length] }}
              />
              <span className="text-xs font-medium text-gray-500">{item.name}</span>
            </div>
            <span className="text-xs font-bold text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomChart;
