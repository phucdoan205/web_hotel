import { TrendingDown, TrendingUp } from "lucide-react";

const formatTrend = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return Math.abs(value).toFixed(1);
};

const StatCard = ({ title, value, trend, subtitle, icon: Icon, colorClass }) => {
  const trendValue = formatTrend(trend);
  const isPositive = typeof trend === "number" ? trend >= 0 : null;

  return (
    <div className="rounded-2xl border border-gray-50 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className={`rounded-xl p-3 ${colorClass}`}>
          <Icon className="size-6" />
        </div>

        {trendValue ? (
          <div
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold ${
              isPositive
                ? "bg-emerald-50 text-emerald-600"
                : "bg-rose-50 text-rose-600"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            {trendValue}%
          </div>
        ) : null}
      </div>

      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="mt-1 text-2xl font-bold text-gray-900">{value}</h3>
        {subtitle ? (
          <p className="mt-2 text-xs font-medium text-gray-400">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
};

export default StatCard;
