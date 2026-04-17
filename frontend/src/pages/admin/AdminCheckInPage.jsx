import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  FilterX,
  ChevronRight,
  X,
} from "lucide-react";
import GuestTable from "../../components/receptionist/checkinout/GuestTable";
import { bookingsApi } from "../../api/admin/bookingsApi";
import { buildBookingRoomEntries } from "../../utils/bookingRoomEntries";
import {
  formatVietnamDate,
  getVietnamDateKey,
  parseVietnamDateValue,
} from "../../utils/vietnamTime";

const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const ACTIVE_BOOKING_STATUSES = ["Pending", "Confirmed", "CheckedIn"];
const DAY_MS = 1000 * 60 * 60 * 24;

const DAY_NAME_MAP = {
  T2: "Thứ hai",
  T3: "Thứ ba",
  T4: "Thứ tư",
  T5: "Thứ năm",
  T6: "Thứ sáu",
  T7: "Thứ bảy",
  CN: "Chủ nhật",
};

const toDateKey = (value) => getVietnamDateKey(value);

const addDays = (value, amount) => {
  const date = parseVietnamDateValue(value) || new Date();
  return new Date(date.getTime() + amount * DAY_MS);
};

const getWeekStart = (value) => {
  const date = parseVietnamDateValue(value) || new Date();
  const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = normalized.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  normalized.setDate(normalized.getDate() + diff);
  return normalized;
};

const getSelectedDateLabel = (dateKey) =>
  formatVietnamDate(`${dateKey}T00:00:00+07:00`, {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const getDayHeaderLabel = (day) =>
  `${DAY_NAME_MAP[day.label] || day.label} ${formatVietnamDate(day.value, {
    day: "2-digit",
    month: "2-digit",
  })}`;

const getRangeDayCount = (startKey, endKey) => {
  const start = parseVietnamDateValue(startKey);
  const end = parseVietnamDateValue(endKey);
  if (!start || !end) return 1;
  return Math.max(1, Math.round((end - start) / DAY_MS) + 1);
};

const AdminCheckInPage = () => {
  const todayKey = getVietnamDateKey();
  const [searchParams] = useSearchParams();
  const requestedDate = searchParams.get("date");
  const requestedTab = searchParams.get("tab");
  const initialSelectedDate = requestedDate || todayKey;
  const [screenNotice, setScreenNotice] = useState(null);
  const [activeTab, setActiveTab] = useState(requestedTab === "in" ? "in" : "schedule");
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [weekAnchor, setWeekAnchor] = useState(getWeekStart(initialSelectedDate));

  useEffect(() => {
    if (!screenNotice) return undefined;

    const timer = window.setTimeout(() => {
      setScreenNotice(null);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [screenNotice]);

  const weekDays = useMemo(() => {
    const weekStart = getWeekStart(weekAnchor);
    return DAY_LABELS.map((label, index) => {
      const value = addDays(weekStart, index);
      return {
        label,
        value,
        key: toDateKey(value),
      };
    });
  }, [weekAnchor]);

  useEffect(() => {
    const hasSelectedDateInWeek = weekDays.some((day) => day.key === selectedDate);
    if (!hasSelectedDateInWeek && weekDays[0]?.key) {
      setSelectedDate(weekDays[0].key);
    }
  }, [selectedDate, weekDays]);

  const weekStartKey = weekDays[0]?.key;
  const weekEndKey = weekDays[weekDays.length - 1]?.key;

  const weeklyBookingsQuery = useQuery({
    queryKey: ["weekly-bookings", weekStartKey, weekEndKey],
    queryFn: () =>
      bookingsApi.getBookings({
        page: 1,
        pageSize: 500,
      }),
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(weekStartKey && weekEndKey),
  });

  const arrivalsQuery = useQuery({
    queryKey: ["arrivals", selectedDate],
    queryFn: () => bookingsApi.getArrivals({ date: selectedDate, page: 1, pageSize: 200 }),
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(selectedDate),
  });

  const weeklyBookings = useMemo(() => {
    return (weeklyBookingsQuery.data?.items || []).filter((booking) =>
      ACTIVE_BOOKING_STATUSES.includes(booking.status)
    );
  }, [weeklyBookingsQuery.data]);

  const weekRangeLabel = useMemo(() => {
    if (!weekDays[0] || !weekDays[6]) return "--";
    return `${formatVietnamDate(weekDays[0].value)} - ${formatVietnamDate(weekDays[6].value)}`;
  }, [weekDays]);

  const scheduleLayout = useMemo(() => {
    const spans = [];

    weeklyBookings.forEach((booking) => {
      (booking.bookingDetails || []).forEach((detail, detailIndex) => {
        const checkInKey = toDateKey(detail?.checkInDate);
        const checkOutKey = toDateKey(detail?.checkOutDate);

        if (!checkInKey || !checkOutKey || !weekStartKey || !weekEndKey) return;

        const visibleStartKey = checkInKey > weekStartKey ? checkInKey : weekStartKey;
        const visibleEndKey = checkOutKey < weekEndKey ? checkOutKey : weekEndKey;

        if (visibleStartKey > visibleEndKey) return;

        const startColumn = weekDays.findIndex((day) => day.key === visibleStartKey) + 1;
        const endColumn = weekDays.findIndex((day) => day.key === visibleEndKey) + 1;

        if (startColumn <= 0 || endColumn <= 0) return;

        spans.push({
          id: `${booking.id}-${detail.id || detailIndex}`,
          bookingId: booking.id,
          bookingCode: booking.bookingCode,
          guestName: booking.guestName || booking.guest?.name || "Khách chưa rõ tên",
          roomNumber: detail.room?.roomNumber || detail.roomNumber || "--",
          roomTypeName: detail.roomTypeName || detail.roomType?.name || "Phòng",
          status: booking.status,
          checkInKey,
          checkOutKey,
          visibleStartKey,
          visibleEndKey,
          startColumn,
          endColumn,
        });
      });
    });

    spans.sort((left, right) => {
      if (left.startColumn !== right.startColumn) return left.startColumn - right.startColumn;
      if (left.endColumn !== right.endColumn) return left.endColumn - right.endColumn;
      return String(left.roomNumber).localeCompare(String(right.roomNumber));
    });

    const rows = [];

    spans.forEach((span) => {
      let assignedRow = 0;

      while (rows[assignedRow]?.some((item) => !(span.startColumn > item.endColumn || span.endColumn < item.startColumn))) {
        assignedRow += 1;
      }

      if (!rows[assignedRow]) rows[assignedRow] = [];
      rows[assignedRow].push(span);
      span.row = assignedRow + 1;
    });

    const dayCounts = weekDays.map((day, index) => {
      const column = index + 1;
      return spans.filter((span) => span.startColumn <= column && column <= span.endColumn).length;
    });

    return {
      spans,
      rowCount: Math.max(rows.length, 1),
      dayCounts,
    };
  }, [weeklyBookings, weekDays, weekStartKey, weekEndKey]);

  const arrivals = useMemo(
    () =>
      (arrivalsQuery.data?.items || []).filter((booking) =>
        (booking.bookingDetails || []).some((detail) =>
          ["Pending", "Confirmed"].includes(detail?.status),
        ),
      ),
    [arrivalsQuery.data],
  );

  // Show all arrival room entries for the date (both paid and unpaid) so receptionist
  // can see and pay per-room; filter only out rooms already checked-in.
  const arrivalRooms = useMemo(
    () =>
      buildBookingRoomEntries(arrivals, selectedDate, {
        dateKey: selectedDate,
        detailStatuses: ["Pending", "Confirmed"],
      }).filter((entry) => !entry.checkedIn),
    [arrivals, selectedDate],
  );

  const isLoading =
    activeTab === "schedule" ? weeklyBookingsQuery.isLoading : arrivalsQuery.isLoading;

  const isError = activeTab === "schedule" ? weeklyBookingsQuery.isError : arrivalsQuery.isError;

  return (
    <div className="animate-in space-y-8 p-8 fade-in duration-700">
      {screenNotice ? (
        <div className="sticky top-20 z-30">
          <div
            className={`mx-auto flex max-w-3xl items-start justify-between gap-4 rounded-3xl border px-5 py-4 shadow-lg ${
              screenNotice.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
          >
            <div className="flex items-start gap-3">
              {screenNotice.type === "success" ? (
                <CheckCircle2 className="mt-0.5 text-emerald-600" size={22} />
              ) : (
                <AlertTriangle className="mt-0.5 text-amber-600" size={22} />
              )}
              <div>
                <p className="font-bold">{screenNotice.title}</p>
                <p className="text-sm">{screenNotice.message}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setScreenNotice(null)}
              className="rounded-xl p-2 transition hover:bg-white/70"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Nhận phòng</h1>
          <p className="mt-1 text-sm font-bold text-gray-400">
            Theo dõi lịch phòng trong tuần và check in theo ngày đã chọn.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-[2rem] border border-gray-100 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex rounded-2xl border border-gray-100 bg-slate-50 p-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("schedule")}
            className={`rounded-xl px-8 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === "schedule"
                ? "bg-blue-700 text-white shadow-lg shadow-blue-200"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Lịch
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("in")}
            className={`rounded-xl px-8 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === "in"
                ? "bg-blue-700 text-white shadow-lg shadow-blue-200"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Nhận phòng
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setWeekAnchor((current) => addDays(current, 7))}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-4 py-2 font-bold text-white transition hover:bg-blue-800"
          >
            Tuần sau
            <ChevronRight size={16} />
          </button>
          <label className="flex items-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700">
            <CalendarDays size={18} />
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => {
                const nextDate = event.target.value;
                setSelectedDate(nextDate);
                setWeekAnchor(getWeekStart(nextDate));
              }}
              className="bg-transparent font-bold text-orange-700 outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setSelectedDate(todayKey);
              setWeekAnchor(getWeekStart(todayKey));
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 font-bold text-slate-600 transition hover:bg-slate-50"
          >
            <FilterX size={16} />
            Clear filter
          </button>
        </div>
      </div>

      {activeTab === "schedule" ? (
        <div className="space-y-6">
          {isLoading ? (
            <div className="py-10 text-center text-gray-400">Loading...</div>
          ) : isError ? (
            <div className="py-10 text-center text-red-400">Không tải được lịch đặt phòng trong tuần.</div>
          ) : (
            <div className="overflow-x-auto rounded-[1.75rem] border-2 border-slate-400 bg-white shadow-md">
              <div className="border-b-2 border-slate-400 bg-slate-50 px-4 py-3 text-lg font-black text-slate-900">
                {weekRangeLabel}
              </div>

              <div className="min-w-[1400px]">
                <div className="grid grid-cols-7 border-b-2 border-slate-400">
                  {weekDays.map((day, index) => {
                    const isSelected = day.key === selectedDate;
                    const isToday = day.key === todayKey;

                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => {
                          setSelectedDate(day.key);
                          setActiveTab("in");
                        }}
                        className={`flex items-center justify-between border-r-2 border-slate-300 px-4 py-3 text-left text-base font-black text-white transition last:border-r-0 ${
                          isToday
                            ? "bg-red-600 hover:bg-red-700"
                            : isSelected
                              ? "bg-sky-700 hover:bg-sky-800"
                              : "bg-blue-700 hover:bg-blue-800"
                        }`}
                      >
                        <span>{getDayHeaderLabel(day)}</span>
                        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs">
                          {scheduleLayout.dayCounts[index]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div
                  className="relative grid grid-cols-7 bg-white"
                  style={{
                    gridTemplateRows: `repeat(${scheduleLayout.rowCount}, minmax(170px, auto))`,
                  }}
                >
                  {weekDays.map((day) => (
                    <div
                      key={`bg-${day.key}`}
                      className="min-h-full border-r-2 border-slate-300 last:border-r-0"
                      style={{ gridColumn: day.key === weekDays[0].key ? "auto" : "auto" }}
                    />
                  ))}

                  {scheduleLayout.spans.length > 0 ? (
                    scheduleLayout.spans.map((span) => (
                      <button
                        key={span.id}
                        type="button"
                        onClick={() => {
                          setSelectedDate(span.visibleStartKey);
                          setActiveTab("in");
                        }}
                        className="m-3 rounded-2xl border-2 border-slate-300 bg-white px-4 py-4 text-center shadow-md ring-1 ring-slate-200 transition hover:border-blue-400 hover:bg-blue-50/30"
                        style={{
                          gridColumn: `${span.startColumn} / ${span.endColumn + 1}`,
                          gridRow: span.row,
                        }}
                      >
                        <p className="text-2xl font-black text-slate-900">P{span.roomNumber}</p>
                        <p className="mt-1 text-base font-bold text-slate-900">{span.roomTypeName}</p>
                        <p className="mt-1 text-sm font-semibold text-blue-700">
                          {span.status === "CheckedIn" ? "Đang ở" : "Đã đặt"}
                        </p>
                        <p className="mt-2 text-base italic text-slate-800">{span.guestName}</p>
                        <p className="mt-2 text-sm font-semibold text-slate-600">
                          Nhận: {formatVietnamDate(`${span.checkInKey}T00:00:00+07:00`)}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-600">
                          Trả: {formatVietnamDate(`${span.checkOutKey}T00:00:00+07:00`)}
                        </p>
                        <p className="mt-2 text-xs font-semibold text-rose-500">{span.bookingCode}</p>
                        <p className="mt-2 text-xs text-slate-400">
                          {getRangeDayCount(span.visibleStartKey, span.visibleEndKey)} ngày hiển thị trong tuần
                        </p>
                      </button>
                    ))
                  ) : (
                    <div className="col-span-7 flex min-h-[260px] items-center justify-center text-center text-sm font-medium text-slate-300">
                      Không có phòng đặt trong tuần này
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : isLoading ? (
        <div className="py-10 text-center text-gray-400">Loading...</div>
      ) : isError ? (
        <div className="py-10 text-center text-red-400">Không tải được dữ liệu nhận phòng.</div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50 px-5 py-4">
            <p className="text-sm font-bold text-emerald-700">Danh sách check in theo ngày lọc</p>
            <p className="mt-1 text-lg font-black text-emerald-900">{getSelectedDateLabel(selectedDate)}</p>
          </div>

          <GuestTable
            activeTab="in"
            data={arrivalRooms}
            dataMode="room"
            onActionSuccess={(result) => {
              if (result?.notice) {
                setScreenNotice(result.notice);
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AdminCheckInPage;
