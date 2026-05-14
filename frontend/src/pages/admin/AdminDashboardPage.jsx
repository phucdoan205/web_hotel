import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  BedDouble, CalendarRange, DollarSign, Users, 
  Package, AlertTriangle, BatteryWarning, Brush,
  CheckSquare, CheckCircle, CreditCard, Receipt
} from "lucide-react";
import StatCard from "../../components/admin/dashboard/StatCard";
import BookingTable from "../../components/admin/dashboard/BookingTable";
import RevenueChart from "../../components/admin/dashboard/RevenueChart";
import RoomChart from "../../components/admin/dashboard/RoomChart";
import { dashboardApi } from "../../api/admin/dashboardApi";
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

const getRoomLabel = (booking) => {
  const labels = (booking.bookingDetails ?? []).map((detail) => {
    if (detail.roomNumber && detail.roomTypeName) {
      return `${detail.roomTypeName} - ${detail.roomNumber}`;
    }
    return detail.roomNumber || detail.roomTypeName || "Chưa gán phòng";
  });
  return labels.join(", ");
};

const STAT_CONFIG = {
  totalBookings: { icon: CalendarRange, colorClass: "bg-sky-50 text-sky-600" },
  totalRevenue: { icon: DollarSign, colorClass: "bg-emerald-50 text-emerald-600" },
  occupancyRate: { icon: BedDouble, colorClass: "bg-orange-50 text-orange-600" },
  activeUsers: { icon: Users, colorClass: "bg-violet-50 text-violet-600" },
  inStockQuantity: { icon: Package, colorClass: "bg-blue-50 text-blue-600" },
  damageReports: { icon: AlertTriangle, colorClass: "bg-red-50 text-red-600" },
  lowStockItems: { icon: BatteryWarning, colorClass: "bg-amber-50 text-amber-600" },
  dirtyRooms: { icon: Brush, colorClass: "bg-orange-50 text-orange-600" },
  cleaningRooms: { icon: CheckSquare, colorClass: "bg-emerald-50 text-emerald-600" },
  pendingBookings: { icon: CalendarRange, colorClass: "bg-amber-50 text-amber-600" },
  checkIns: { icon: CheckCircle, colorClass: "bg-emerald-50 text-emerald-600" },
  checkOuts: { icon: CreditCard, colorClass: "bg-indigo-50 text-indigo-600" },
  pendingPaymentAmount: { icon: DollarSign, colorClass: "bg-rose-50 text-rose-600" },
  paidInvoices: { icon: Receipt, colorClass: "bg-teal-50 text-teal-600" },
  fallback: { icon: BedDouble, colorClass: "bg-slate-50 text-slate-600" }
};

export default function AdminDashboardPage() {
  const {
    data: dashboardResponse,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useQuery({
    queryKey: ["admin-dashboard", "current"],
    queryFn: () => dashboardApi.getCurrentDashboard(),
  });

  // Keep legacy bookings and rooms for the charts for now
  const {
    data: bookingsResponse,
    isLoading: bookingsLoading,
  } = useQuery({
    queryKey: ["admin-dashboard", "bookings"],
    queryFn: () => bookingsApi.getBookings({ page: 1, pageSize: 50 }),
  });

  const {
    data: roomsResponse,
    isLoading: roomsLoading,
  } = useQuery({
    queryKey: ["admin-dashboard", "rooms"],
    queryFn: () => roomsApi.getRooms({ page: 1, pageSize: 500 }),
  });

  const isLoading = dashboardLoading || bookingsLoading || roomsLoading;
  const error = dashboardError;

  const dashboardData = useMemo(() => {
    let parsedJson = null;
    if (dashboardResponse?.dashboardJson) {
      try {
        parsedJson = JSON.parse(dashboardResponse.dashboardJson);
      } catch (e) {
        console.error("Failed to parse dashboard JSON", e);
      }
    }

    const cards = (parsedJson?.kpiCards || []).map(card => {
      const config = STAT_CONFIG[card.code] || STAT_CONFIG.fallback;
      const metric = parsedJson?.metrics?.[card.code];
      const trend = metric ? metric.growthRate : null;
      let displayValue = card.value;
      
      if (card.unit === "VND") displayValue = `${currency.format(card.value)} đ`;
      else if (card.unit === "%") displayValue = `${card.value}%`;
      else displayValue = card.value.toLocaleString("vi-VN");

      return {
        title: card.title,
        value: displayValue,
        trend: trend,
        subtitle: metric ? `So với tháng trước` : "",
        icon: config.icon,
        colorClass: config.colorClass,
      };
    });

    const bookings = bookingsResponse?.items ?? bookingsResponse?.Items ?? [];
    const rooms = roomsResponse?.items ?? [];

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
      .map((booking) => {
        const total = (booking.bookingDetails ?? []).reduce((sum, detail) => {
           const checkIn = new Date(detail.checkInDate);
           const checkOut = new Date(detail.checkOutDate);
           const nights = Math.max(Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)), 1);
           return sum + Number(detail.pricePerNight || 0) * nights;
        }, 0);
        return {
          id: booking.id,
          bookingCode: booking.bookingCode,
          guestName: booking.guestName,
          roomLabel: getRoomLabel(booking),
          totalLabel: `${currency.format(total)} đ`,
          status: booking.status,
          createdLabel: new Date(booking.createdAt).toLocaleString("vi-VN"),
        };
      });

    const monthlyRevenue = Array.from({ length: 6 }, (_, index) => {
        const d = new Date();
        d.setMonth(d.getMonth() - 5 + index);
        d.setDate(1);
        return {
          name: d.toLocaleDateString("vi-VN", { month: "short" }),
          revenue: Math.floor(Math.random() * 50000000) // Dummy for now, ideally backend provides this
        };
    });

    return {
      stats: cards.length > 0 ? cards : [{
        title: "Đang cập nhật",
        value: "...",
        trend: null,
        subtitle: "Hệ thống đang tính toán",
        icon: BedDouble,
        colorClass: "bg-gray-50 text-gray-600"
      }],
      roomStatusData,
      recentBookings,
      roomCount: rooms.length,
      monthlyRevenue
    };
  }, [dashboardResponse, bookingsResponse, roomsResponse]);

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-black tracking-tight text-slate-950">
          Tổng quan dashboard
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          {dashboardResponse?.roleName 
            ? `Thống kê hiển thị dành cho vai trò: ${dashboardResponse.roleName}`
            : "Thống kê vận hành theo thời gian thực được tổng hợp từ dữ liệu phòng và booking trong hệ thống."}
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
          : dashboardData.stats.map((item, index) => <StatCard key={index} {...item} />)}
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
        Dashboard đang hiển thị dữ liệu mới nhất (Cập nhật lần cuối: {
          dashboardResponse?.lastUpdatedAt ? new Date(dashboardResponse.lastUpdatedAt).toLocaleString("vi-VN") : "Chưa có"
        })
      </footer>
    </div>
  );
}
