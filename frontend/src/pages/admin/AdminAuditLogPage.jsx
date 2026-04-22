import React, { useEffect, useMemo, useState } from "react";
import { Download, FileSpreadsheet, RefreshCw, Search } from "lucide-react";
import AuditTable from "../../components/admin/audit/AuditTable";
import { fetchAllAuditLogs } from "../../api/admin/audit";
import { getEquipmentList } from "../../api/admin/equipmentApi";
import { roomsApi } from "../../api/admin/roomsApi";
import {
  downloadAuditSpreadsheet,
  filterAuditLogs,
  normalizeAuditLog,
} from "../../utils/auditLog";

const DEFAULT_FILTERS = {
  employeeName: "",
  roleName: "",
  fromDate: "",
  toDate: "",
};

const PAGE_SIZE = 20;

const buildRoomMap = (rooms) =>
  new Map(
    rooms.map((room) => [
      room.id,
      {
        roomNumber: room.roomNumber,
        roomTypeName: room.roomTypeName,
      },
    ]),
  );

const buildEquipmentMap = (items) =>
  new Map(
    items.map((item) => [
      item.id,
      {
        name: item.name,
      },
    ]),
  );

const buildRoleOptions = (logs) =>
  Array.from(
    new Set(
      logs
        .map((log) => log.roleName)
        .filter(Boolean)
        .filter((role) => {
          const normalized = String(role).trim().toLowerCase();
          return normalized !== "user" && normalized !== "guest" && normalized !== "system";
        }),
    ),
  ).sort((a, b) => a.localeCompare(b, "vi"));

const AdminAuditLogPage = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [allLogs, setAllLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportingFiltered, setExportingFiltered] = useState(false);
  const [exportingAll, setExportingAll] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadAuditData = async () => {
      setLoading(true);

      try {
        const [rawLogs, roomsResult, equipmentResult] = await Promise.allSettled([
          fetchAllAuditLogs(),
          roomsApi.getRooms({ page: 1, pageSize: 500 }),
          getEquipmentList({ page: 1, pageSize: 500 }),
        ]);

        if (rawLogs.status !== "fulfilled") {
          throw rawLogs.reason;
        }

        const roomsResponse =
          roomsResult.status === "fulfilled" ? roomsResult.value : { items: [] };
        const equipmentResponse =
          equipmentResult.status === "fulfilled" ? equipmentResult.value : { items: [] };

        const roomMap = buildRoomMap(roomsResponse?.items ?? []);
        const equipmentItems = equipmentResponse?.items ?? equipmentResponse?.Items ?? [];
        const equipmentMap = buildEquipmentMap(equipmentItems);

        const normalizedLogs = rawLogs.value.map((log) =>
          normalizeAuditLog(log, { roomMap, equipmentMap }),
        );

        setAllLogs(normalizedLogs);
      } catch (error) {
        console.error("Không tải được audit log", error);
        setAllLogs([]);
      } finally {
        setLoading(false);
      }
    };

    loadAuditData();
  }, []);

  const filteredLogs = useMemo(
    () => filterAuditLogs(allLogs, filters),
    [allLogs, filters],
  );
  const roleOptions = useMemo(() => buildRoleOptions(allLogs), [allLogs]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const handleExportFiltered = async () => {
    setExportingFiltered(true);
    try {
      downloadAuditSpreadsheet(
        filteredLogs,
        `audit-log-filtered-${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
    } finally {
      setExportingFiltered(false);
    }
  };

  const handleExportAll = async () => {
    setExportingAll(true);
    try {
      downloadAuditSpreadsheet(
        allLogs,
        `audit-log-all-${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
    } finally {
      setExportingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[36px] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_34%),linear-gradient(135deg,_#f8fbff_0%,_#ffffff_52%,_#f7fbff_100%)] p-6 shadow-[0_28px_80px_rgba(15,23,42,0.08)] md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200/70">
              <RefreshCw className="size-4 text-sky-600" />
              Nhật ký hoạt động
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              Theo dõi thao tác hệ thống.
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportFiltered}
              disabled={exportingFiltered || filteredLogs.length === 0}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileSpreadsheet className="size-4" />
              {exportingFiltered ? "Đang xuất..." : "Xuất theo bộ lọc"}
            </button>
            <button
              type="button"
              onClick={handleExportAll}
              disabled={exportingAll || allLogs.length === 0}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(2,132,199,0.28)] transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="size-4" />
              {exportingAll ? "Đang xuất..." : "Xuất toàn bộ"}
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-3 xl:grid-cols-[1.3fr_1fr_1fr_1fr_auto]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.employeeName}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  employeeName: event.target.value,
                }))
              }
              placeholder="Tìm theo tên nhân viên"
              className="w-full rounded-2xl border border-white/70 bg-white/90 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-200 focus:ring-4 focus:ring-sky-100"
            />
          </label>

          <select
            value={filters.roleName}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, roleName: event.target.value }))
            }
            className="w-full rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-200 focus:ring-4 focus:ring-sky-100"
          >
            <option value="">Lọc theo vai trò</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filters.fromDate}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, fromDate: event.target.value }))
            }
            className="w-full rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-200 focus:ring-4 focus:ring-sky-100"
          />

          <input
            type="date"
            value={filters.toDate}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, toDate: event.target.value }))
            }
            className="w-full rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-200 focus:ring-4 focus:ring-sky-100"
          />

          <button
            type="button"
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="rounded-2xl border border-slate-200 bg-white/90 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Đặt lại
          </button>
        </div>
      </section>

      <AuditTable
        logs={filteredLogs}
        loading={loading}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
};

export default AdminAuditLogPage;
