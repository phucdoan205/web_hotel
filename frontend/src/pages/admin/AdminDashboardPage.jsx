import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BedDouble, CalendarRange, DollarSign, Users } from "lucide-react";
import StatCard from "../../components/admin/dashboard/StatCard";
import BookingTable from "../../components/admin/dashboard/BookingTable";
import RevenueChart from "../../components/admin/dashboard/RevenueChart";
import RoomChart from "../../components/admin/dashboard/RoomChart";
import { bookingsApi } from "../../api/admin/bookingsApi";
import { roomsApi } from "../../api/admin/roomsApi";

const currency = new Intl.NumberFormat("vi-VN");
const STATUS_COLORS = {
  Available: "#10b981",
  Occupied: "#0ea5e9",
  Cleaning: "#f59e0b",
  Maintenance: "#ef4444",
  OutOfOrder: "#64748b",
};

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const addMonths = (date, amount) => new Date(date.getFullYear(), date.getMonth() + amount, 1);
const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameMonth = (dateA, dateB) =>
  dateA.getFullYear() === dateB.getFullYear() && dateA.getMonth() === dateB.getMonth();

const toDate = (value) => new Date(value);

const getDetailNights = (detail) => {
  const checkIn = toDate(detail.checkInDate);
  const checkOut = toDate(detail.checkOutDate);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  return Math.max(nights, 1);
};

const getDetailTotal = (detail) => Number(detail.pricePerNight || 0) * getDetailNights(detail);

const getBookingTotal = (booking) =>
  (booking.bookingDetails ?? []).reduce((sum, detail) => sum + getDetailTotal(detail), 0);

const isDetailActiveOnDate = (detail, date) => {
  const target = startOfDay(date).getTime();
  const checkIn = startOfDay(toDate(detail.checkInDate)).getTime();
  const checkOut = startOfDay(toDate(detail.checkOutDate)).getTime();
  return checkIn <= target && target < checkOut;
};

const getActiveDetailsOnDate = (bookings, date) =>
  bookings
    .filter((booking) => !["Cancelled", "Completed"].includes(booking.status))
    .flatMap((booking) =>
      (booking.bookingDetails ?? [])
        .filter((detail) => isDetailActiveOnDate(detail, date))
        .map((detail) => ({ booking, detail })),
    );

const getTrend = (current, previous) => {
  if (!previous && !current) return 0;
  if (!previous) return 100;
  return ((current - previous) / previous) * 100;
};

const formatDateTime = (value) =>
  new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const getRoomLabel = (booking) => {
  const labels = (booking.bookingDetails ?? []).map((detail) => {
    if (detail.roomNumber && detail.roomTypeName) {
      return `${detail.roomTypeName} - ${detail.roomNumber}`;
    }
    return detail.roomNumber || detail.roomTypeName || "Chưa gán phòng";
  });

  return labels.join(", ");
};

export default function AdminDashboardPage() {
  const {
    data: bookingsResponse,
    isLoading: bookingsLoading,
    error: bookingsError,
  } = useQuery({
    queryKey: ["admin-dashboard", "bookings"],
    queryFn: () => bookingsApi.getBookings({ page: 1, pageSize: 1000 }),
  });

  const {
    data: roomsResponse,
    isLoading: roomsLoading,
    error: roomsError,
  } = useQuery({
    queryKey: ["admin-dashboard", "rooms"],
    queryFn: () => roomsApi.getRooms({ page: 1, pageSize: 500 }),
  });

  const bookings = bookingsResponse?.items ?? bookingsResponse?.Items ?? [];
  const rooms = roomsResponse?.items ?? [];
  const isLoading = bookingsLoading || roomsLoading;
  const error = bookingsError || roomsError;

  const dashboardData = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const monthStart = startOfMonth(now);
    const previousMonthStart = addMonths(monthStart, -1);

    const currentMonthBookings = bookings.filter((booking) =>
      isSameMonth(toDate(booking.createdAt), now),
    ).length;
    const previousMonthBookings = bookings.filter((booking) =>
      isSameMonth(toDate(booking.createdAt), previousMonthStart),
    ).length;

    const activeToday = getActiveDetailsOnDate(bookings, today);
    const activeYesterday = getActiveDetailsOnDate(bookings, yesterday);

    const todayRevenue = activeToday.reduce(
      (sum, item) => sum + Number(item.detail.pricePerNight || 0),
      0,
    );
    const yesterdayRevenue = activeYesterday.reduce(
      (sum, item) => sum + Number(item.detail.pricePerNight || 0),
      0,
    );

    const occupancyToday = rooms.length ? (activeToday.length / rooms.length) * 100 : 0;
    const occupancyYesterday = rooms.length
      ? (activeYesterday.length / rooms.length) * 100
      : 0;

    const currentGuests = new Set(
      activeToday.map(({ booking }) => booking.guestId || booking.guestName || booking.id),
    ).size;
    const previousGuests = new Set(
      activeYesterday.map(({ booking }) => booking.guestId || booking.guestName || booking.id),
    ).size;

    const monthlyRevenue = Array.from({ length: 6 }, (_, index) => {
      const baseDate = addMonths(monthStart, index - 5);
      const revenue = bookings.reduce((sum, booking) => {
        const bookingSum = (booking.bookingDetails ?? []).reduce((detailSum, detail) => {
          const checkIn = toDate(detail.checkInDate);
          if (!isSameMonth(checkIn, baseDate)) return detailSum;
          return detailSum + getDetailTotal(detail);
        }, 0);

        return sum + bookingSum;
      }, 0);

      return {
        name: baseDate.toLocaleDateString("vi-VN", { month: "short" }),
        revenue,
      };
    });

    const roomStatusData = Object.entries(
      rooms.reduce((acc, room) => {
        const status = room.status || "Chưa rõ";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
    ).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] || "#94a3b8",
    }));

    const recentBookings = [...bookings]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
      .map((booking) => ({
        id: booking.id,
        bookingCode: booking.bookingCode,
        guestName: booking.guestName,
        roomLabel: getRoomLabel(booking),
        totalLabel: `${currency.format(getBookingTotal(booking))} đ`,
        status: booking.status,
        createdLabel: formatDateTime(booking.createdAt),
      }));

    return {
      stats: [
        {
          title: "Tổng booking",
          value: bookings.length.toLocaleString("vi-VN"),
          trend: getTrend(currentMonthBookings, previousMonthBookings),
          subtitle: `Tháng này có ${currentMonthBookings} booking`,
          icon: CalendarRange,
          colorClass: "bg-sky-50 text-sky-600",
        },
        {
          title: "Doanh thu hôm nay",
          value: `${currency.format(todayRevenue)} đ`,
          trend: getTrend(todayRevenue, yesterdayRevenue),
          subtitle: "Ước tính từ các phòng đang lưu trú hôm nay",
          icon: DollarSign,
          colorClass: "bg-emerald-50 text-emerald-600",
        },
        {
          title: "Tỷ lệ lấp phòng",
          value: `${occupancyToday.toFixed(1)}%`,
          trend: occupancyToday - occupancyYesterday,
          subtitle: `${activeToday.length}/${rooms.length || 0} phòng đang có khách hôm nay`,
          icon: BedDouble,
          colorClass: "bg-orange-50 text-orange-600",
        },
        {
          title: "Khách đang lưu trú",
          value: currentGuests.toLocaleString("vi-VN"),
          trend: getTrend(currentGuests, previousGuests),
          subtitle: "Số khách có lưu trú đang hoạt động hôm nay",
          icon: Users,
          colorClass: "bg-violet-50 text-violet-600",
        },
      ],
      monthlyRevenue,
      roomStatusData,
      recentBookings,
      roomCount: rooms.length,
    };
  }, [bookings, rooms]);

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-black tracking-tight text-slate-950">
          Tổng quan dashboard
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Thống kê vận hành theo thời gian thực được tổng hợp từ dữ liệu phòng và booking trong hệ thống.
        </p>
      </div>

      {error ? (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
          Không thể tải dữ liệu dashboard. {error.message || ""}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))
          : dashboardData.stats.map((item) => <StatCard key={item.title} {...item} />)}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="h-[400px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
          ) : (
            <RevenueChart data={dashboardData.monthlyRevenue} />
          )}
        </div>
        <div className="lg:col-span-1">
          {isLoading ? (
            <div className="h-[400px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
          ) : (
            <RoomChart data={dashboardData.roomStatusData} total={dashboardData.roomCount} />
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="h-[280px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
      ) : (
        <BookingTable bookings={dashboardData.recentBookings} />
      )}

      <footer className="pb-4 pt-6 text-center text-xs text-gray-400">
        Dashboard đang hiển thị từ dữ liệu phòng và booking hiện có.
      </footer>
    </div>
  );
}
