import React from "react";
import { CalendarRange, FileText, Users2 } from "lucide-react";

const cards = [
  {
    key: "totalLogs",
    label: "Nhóm nhật ký",
    icon: CalendarRange,
    color: "bg-sky-50 text-sky-600",
  },
  {
    key: "totalEvents",
    label: "Sự kiện hiển thị",
    icon: FileText,
    color: "bg-amber-50 text-amber-600",
  },
  {
    key: "uniqueEmployees",
    label: "Nhân viên có log",
    icon: Users2,
    color: "bg-emerald-50 text-emerald-600",
  },
];

const AuditWidgets = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.key}
            className="rounded-[28px] border border-slate-200/70 bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-2xl p-3 ${card.color}`}>
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  {card.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {stats?.[card.key] ?? 0}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AuditWidgets;
