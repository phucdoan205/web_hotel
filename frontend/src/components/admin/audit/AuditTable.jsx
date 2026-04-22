import React, { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileSearch,
} from "lucide-react";
import {
  formatVietnamDate,
  formatVietnamDateTime,
} from "../../../utils/vietnamTime";
import { groupAuditLogs } from "../../../utils/auditLog";

const actionStyles = {
  CREATE: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  UPDATE: "bg-amber-50 text-amber-700 ring-amber-100",
  DELETE: "bg-rose-50 text-rose-700 ring-rose-100",
  SOFT_DELETE: "bg-slate-100 text-slate-700 ring-slate-200",
};

const AuditTable = ({
  logs,
  loading,
  page,
  pageSize,
  onPageChange,
}) => {
  const [openGroups, setOpenGroups] = useState({});
  const allGroups = useMemo(
    () => groupAuditLogs(logs, formatVietnamDate),
    [logs],
  );

  const toggleGroup = (groupKey) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const totalPages = Math.max(1, Math.ceil(allGroups.length / pageSize));
  const groups = useMemo(() => {
    const start = (page - 1) * pageSize;
    return allGroups.slice(start, start + pageSize);
  }, [allGroups, page, pageSize]);

  if (loading) {
    return (
      <div className="rounded-[32px] border border-slate-200/70 bg-white/85 p-8 text-sm text-slate-500 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        Đang tải nhật ký hoạt động...
      </div>
    );
  }

  if (allGroups.length === 0) {
    return (
      <div className="rounded-[32px] border border-dashed border-slate-300 bg-white/85 px-6 py-16 text-center shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <FileSearch className="size-6" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">
          Không có audit log phù hợp
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Hãy thử đổi bộ lọc ngày, vai trò hoặc tên nhân viên.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {groups.map((group) => {
        const remainingEvents = Math.max(0, group.events.length - 1);
        const isOpen = Boolean(openGroups[group.key]);

        return (
          <section
            key={group.key}
            className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
          >
            <button
              type="button"
              onClick={() => toggleGroup(group.key)}
              className="grid w-full gap-5 border-b border-slate-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(240,247,255,0.96))] px-6 py-5 text-left transition hover:bg-slate-50 md:grid-cols-[160px_260px_1fr_auto]"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Ngày
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {group.dateLabel}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Nhân viên
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                    {group.userName.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{group.userName}</p>
                    <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      {group.roleName}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Tóm tắt hoạt động
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {group.summary}
                  {remainingEvents > 0 ? ` (và ${remainingEvents} sự kiện khác)` : ""}
                </p>
              </div>
              <div className="flex items-center justify-end">
                <span className="mr-3 text-xs font-semibold text-slate-500">
                  {isOpen ? "Ẩn chi tiết" : "Xem chi tiết"}
                </span>
                <span className="inline-flex rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm">
                  <ChevronDown
                    className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </span>
              </div>
            </button>

            {isOpen ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/80">
                    <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      <th className="px-6 py-4 whitespace-nowrap">Thời gian</th>
                      <th className="px-6 py-4 whitespace-nowrap">Hành động</th>
                      <th className="px-6 py-4 whitespace-nowrap">Đối tượng</th>
                      <th className="px-6 py-4">Nội dung</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {group.events.map((event) => (
                      <tr key={event.eventId} className="align-top hover:bg-slate-50/70">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                          {formatVietnamDateTime(event.timestamp, {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                              actionStyles[event.actionLabel] ||
                              "bg-slate-100 text-slate-700 ring-slate-200"
                            }`}
                          >
                            {event.actionLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800">
                          {event.objectName}
                        </td>
                        <td className="px-6 py-4 leading-6 text-slate-600">
                          {event.detail}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        );
      })}

      <div className="flex flex-col items-start justify-between gap-3 rounded-[28px] border border-slate-200/70 bg-white/90 px-5 py-4 text-sm text-slate-500 shadow-[0_16px_40px_rgba(15,23,42,0.06)] md:flex-row md:items-center">
        <p>
          Trang {page}/{totalPages} • {allGroups.length} bản ghi
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="size-4" />
            Trước
          </button>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sau
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditTable;
