import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  TrendingUp, TrendingDown, RefreshCw, LayoutDashboard,
  BedDouble, DollarSign, Users, Activity, Package, AlertTriangle,
  BatteryWarning, Brush, CheckSquare, CheckCircle, CreditCard, Clock,
  Receipt, LogIn, LogOut, CalendarRange, Layers, Hammer, BarChart3,
  Calendar, UserCircle, Plus
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
  AreaChart, Area, ComposedChart, Line
} from "recharts";
import { getNotifications } from "../../api/notifications/notificationApi";
import { dashboardApi } from "../../api/admin/dashboardApi";
import { useStoredAuth } from "../../hooks/useStoredAuth";

// ─── Helpers ───────────────────────────────────────────────────────────────
const vndFmt = new Intl.NumberFormat("vi-VN");

function fmtVND(val) {
  if (val == null) return "—";
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)} tỷ đ`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)} tr đ`;
  return `${vndFmt.format(val)} đ`;
}

function fmtNum(val) {
  if (val == null) return "—";
  return vndFmt.format(val);
}

function fmtValue(val, unit) {
  if (val == null) return "—";
  if (unit === "VND") return fmtVND(val);
  if (unit === "%") return `${val}%`;
  return fmtNum(val);
}

// ─── Icon + color map per kpi code ─────────────────────────────────────────
const KPI_CONFIG = {
  totalRevenue: { icon: DollarSign, color: "emerald" },
  roomRevenue: { icon: DollarSign, color: "teal" },
  serviceRevenue: { icon: DollarSign, color: "cyan" },
  occupancyRate: { icon: BedDouble, color: "orange" },
  totalBookings: { icon: CalendarRange, color: "sky" },
  pendingBookings: { icon: CalendarRange, color: "amber" },
  checkIns: { icon: LogIn, color: "teal" },
  checkOuts: { icon: LogOut, color: "indigo" },
  availableRooms: { icon: BedDouble, color: "green" },
  activeUsers: { icon: Users, color: "violet" },
  auditEvents: { icon: Activity, color: "slate" },
  inStockQuantity: { icon: Package, color: "blue" },
  lowStockItems: { icon: BatteryWarning, color: "amber" },
  damageReports: { icon: AlertTriangle, color: "red" },
  dirtyRooms: { icon: Brush, color: "rose" },
  cleaningRooms: { icon: CheckSquare, color: "amber" },
  penaltyAmount: { icon: CreditCard, color: "rose" },
  paidInvoices: { icon: Receipt, color: "teal" },
  currentDamagedQuantity: { icon: Hammer, color: "red" },
  totalGuests: { icon: Users, color: "sky" },
  userRoleCount: { icon: UserCircle, color: "violet" },
  fallback: { icon: BarChart3, color: "slate" },
};

const COLOR_CLASSES = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100" },
  teal: { bg: "bg-teal-50", text: "text-teal-600", ring: "ring-teal-100" },
  cyan: { bg: "bg-cyan-50", text: "text-cyan-600", ring: "ring-cyan-100" },
  orange: { bg: "bg-orange-50", text: "text-orange-600", ring: "ring-orange-100" },
  sky: { bg: "bg-sky-50", text: "text-sky-600", ring: "ring-sky-100" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-100" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600", ring: "ring-indigo-100" },
  green: { bg: "bg-green-50", text: "text-green-600", ring: "ring-green-100" },
  violet: { bg: "bg-violet-50", text: "text-violet-600", ring: "ring-violet-100" },
  slate: { bg: "bg-slate-50", text: "text-slate-600", ring: "ring-slate-100" },
  blue: { bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-100" },
  rose: { bg: "bg-rose-50", text: "text-rose-600", ring: "ring-rose-100" },
  red: { bg: "bg-red-50", text: "text-red-600", ring: "ring-red-100" },
};

const ROLE_LABEL = {
  Admin: "Quản trị hệ thống",
  Manager: "Quản lý vận hành",
  Receptionist: "Lễ tân",
  Housekeeping: "Buồng phòng",
  HouseKeeping: "Buồng phòng",
  WarehouseStaff: "Kho vật tư",
  Warehouse: "Kho vật tư",
};

const ROOM_STATUS_COLORS = {
  Available: "#10b981",
  Occupied: "#0ea5e9",
  Cleaning: "#f59e0b",
  Maintenance: "#ef4444",
  OutOfOrder: "#64748b",
};

// ─── KPI Stat Card ──────────────────────────────────────────────────────────
function StatCard({ code, title, value, unit, growthRate, trendDir }) {
  const cfg = KPI_CONFIG[code] || KPI_CONFIG.fallback;
  const Icon = cfg.icon;
  const c = COLOR_CLASSES[cfg.color] || COLOR_CLASSES.slate;

  const isUp = trendDir === "up";
  const isDown = trendDir === "down";
  const hasGrowth = growthRate != null && !isNaN(Number(growthRate));

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/50"
    >
      {/* Decorative background circle */}
      <div className={`absolute -right-6 -top-6 size-24 rounded-full opacity-10 blur-2xl ${c.bg}`} />

      <div className="relative z-10">
        <div className="mb-6 flex items-start justify-between">
          <div className={`rounded-2xl p-3 ring-1 ${c.bg} ${c.ring} shadow-sm`}>
            <Icon className={`size-6 ${c.text}`} />
          </div>
          {hasGrowth && (
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider
              ${isUp ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100" : isDown ? "bg-rose-50 text-rose-600 ring-1 ring-rose-100" : "bg-slate-50 text-slate-500"}`}>
              {isUp ? <TrendingUp className="size-3" /> : isDown ? <TrendingDown className="size-3" /> : null}
              {Math.abs(Number(growthRate)).toFixed(1)}%
            </div>
          )}
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{title}</p>
          <div className="mt-1 flex items-baseline gap-1">
            <p className="text-3xl font-black text-slate-900 tracking-tight">{fmtValue(value, unit)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Department Overview Row ────────────────────────────────────────────────
function DeptOverview({ items }) {
  if (!items?.length) return null;
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((d, i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.02 }}
          className={`relative overflow-hidden rounded-3xl border p-5 transition-all
            ${d.status === "warning"
              ? "border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-lg shadow-amber-100/50"
              : "border-slate-100 bg-white shadow-sm hover:shadow-md"}`}
        >
          {d.status === "warning" && (
            <div className="absolute -right-4 -top-4 size-16 rounded-full bg-amber-200/20 blur-xl" />
          )}

          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.department}</p>
            {d.status === "warning" && (
              <div className="flex size-6 items-center justify-center rounded-lg bg-amber-500 text-white shadow-lg shadow-amber-200">
                <AlertTriangle className="size-3.5" />
              </div>
            )}
          </div>

          <p className="text-2xl font-black text-slate-900">{fmtNum(d.value)}</p>

          {d.status === "warning" ? (
            <p className="mt-2 text-[10px] font-extrabold uppercase text-amber-600 flex items-center gap-1">
              <Clock className="size-3" /> Cần xử lý ngay
            </p>
          ) : (
            <p className="mt-2 text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <CheckCircle className="size-3 text-emerald-500" /> Hoạt động tốt
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ─── Room Pie Chart ──────────────────────────────────────────────────────────
function RoomStatusOverview({ roomsSummary, role }) {
  if (!roomsSummary) return null;

  const occupancyData = [
    { name: "Trống", value: roomsSummary.availableRooms || 0, color: "#10b981" },
    { name: "Đang ở", value: roomsSummary.occupiedRooms || 0, color: "#0ea5e9" },
    { name: "Đang dọn", value: roomsSummary.cleaningRooms || 0, color: "#f59e0b" },
    { name: "Bảo trì", value: roomsSummary.maintenanceRooms || 0, color: "#ef4444" },
    { name: "Ngừng hoạt động", value: roomsSummary.outOfOrderRooms || 0, color: "#64748b" },
  ].filter(d => d.value > 0);

  const housekeepingData = [
    { name: "Clean", value: roomsSummary.cleanRooms || 0, color: "#10b981" }, // Xanh lá
    { name: "Pickup", value: roomsSummary.pickupRooms || 0, color: "#f97316" }, // Cam
    { name: "Dirty", value: roomsSummary.dirtyRooms || 0, color: "#7c2d12" }, // Nâu (Warm Brown)
    { name: "In Progress", value: roomsSummary.cleaningRooms || 0, color: "#3b82f6" }, // Xanh biển
  ];

  const isReceptionist = role === "Receptionist";

  return (
    <div className="rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-800 tracking-tight">Tình trạng phòng</h3>
        <div className="flex size-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 ring-1 ring-indigo-100">
          <BedDouble className="size-5" />
        </div>
      </div>

      <div className={`flex-1 grid gap-8 ${isReceptionist ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
        <div className="flex flex-col">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Trạng thái lưu trú</p>
          <div className="flex-1 min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={occupancyData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                  {occupancyData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => [v + " phòng"]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                  formatter={(value, entry) => (
                    <span className="text-[10px] font-bold text-slate-500">
                      {value}: <span className="text-slate-900">{entry.payload.value}</span>
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {!isReceptionist && (
          <div className="flex flex-col">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Tình trạng vệ sinh</p>
            <div className="flex-1 min-h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={housekeepingData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                    {housekeepingData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [v + " phòng"]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                    formatter={(value, entry) => (
                      <span className="text-[10px] font-bold text-slate-500">
                        {value}: <span className="text-slate-900">{entry.payload.value}</span>
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

// ─── Warehouse Status Pie Chart ─────────────────────────────────────────────
function WarehouseStatusChart({ summary }) {
  if (!summary) return null;

  const data = [
    { name: "Tồn kho", value: summary.inStockQuantity || 0, color: "#22c55e" }, // green
    { name: "Đang sử dụng", value: summary.inUseQuantity || 0, color: "#eab308" }, // yellow
    { name: "Hư hỏng", value: summary.currentDamagedQuantity || 0, color: "#ef4444" }, // red
    { name: "Thanh lý", value: summary.liquidatedQuantity || 0, color: "#3b82f6" }, // blue
  ].filter(d => d.value > 0);

  if (data.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm h-full">
      <h3 className="mb-4 text-base font-bold text-gray-900">Phân bổ vật tư</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
            paddingAngle={3} dataKey="value">
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip formatter={(v, name) => [v + " món", name]} />
          <Legend iconType="circle" iconSize={10}
            formatter={(value) => <span className="text-xs font-medium text-gray-600">{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 text-center text-xs text-gray-400">
        Tổng: {fmtNum((summary.inStockQuantity || 0) + (summary.inUseQuantity || 0) + (summary.currentDamagedQuantity || 0))} sản phẩm
      </div>
    </div>
  );
}

// ─── Booking Summary Table ───────────────────────────────────────────────────
function BookingSummary({ bookingSummary }) {
  if (!bookingSummary) return null;
  const rows = [
    { label: "Tổng đặt phòng", val: bookingSummary.totalBookings },
    { label: "Đang chờ duyệt", val: bookingSummary.pendingBookings, alert: true },
    { label: "Đang lưu trú", val: bookingSummary.inProgressBookings, info: true },
    { label: "Hoàn tất", val: bookingSummary.completedBookings },
    { label: "Đã hủy", val: bookingSummary.cancelledBookings },
    { label: "Check-in kỳ này", val: bookingSummary.checkIns },
    { label: "Check-out kỳ này", val: bookingSummary.checkOuts },
  ].filter(r => r.val != null);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm h-full">
      <h3 className="mb-4 text-base font-bold text-gray-900">Thống kê đặt phòng</h3>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{r.label}</span>
            <span className={`text-sm font-bold
              ${r.alert && r.val > 0 ? "text-amber-600" : r.info && r.val > 0 ? "text-blue-600" : "text-gray-800"}`}>
              {fmtNum(r.val)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Revenue Summary ─────────────────────────────────────────────────────────
function RevenueSummary({ revenueSummary }) {
  if (!revenueSummary) return null;
  const rows = [
    { label: "Tổng doanh thu", val: revenueSummary.totalRevenue, vnd: true, highlight: true, icon: DollarSign },
    { label: "Doanh thu phòng", val: revenueSummary.roomRevenue, vnd: true, icon: BedDouble },
    { label: "Doanh thu DV", val: revenueSummary.serviceRevenue, vnd: true, icon: Activity },
    { label: "Chưa thanh toán", val: revenueSummary.pendingPaymentAmount, vnd: true, alert: true, icon: AlertTriangle },
    { label: "HĐ đã thanh toán", val: revenueSummary.paidInvoices, icon: CheckCircle },
    { label: "HĐ chưa thanh toán", val: revenueSummary.unpaidInvoices, alert: true, icon: Clock },
  ].filter(r => r.val != null);

  return (
    <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 ring-1 ring-emerald-100">
          <Receipt className="size-5" />
        </div>
        <h3 className="text-base font-black text-slate-800 tracking-tight">Tài chính kỳ này</h3>
      </div>

      <div className="space-y-1">
        {rows.map((r, i) => {
          const Icon = r.icon;
          return (
            <div key={i} className={`flex items-center justify-between p-3 rounded-2xl transition-all ${r.highlight ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" : "hover:bg-slate-50"}`}>
              <div className="flex items-center gap-3">
                <div className={`flex size-8 items-center justify-center rounded-xl ${r.highlight ? "bg-white/20 text-white" : r.alert && r.val > 0 ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-400"}`}>
                  <Icon className="size-4" />
                </div>
                <span className={`text-[11px] font-black uppercase tracking-wider ${r.highlight ? "text-white" : "text-slate-500"}`}>{r.label}</span>
              </div>
              <span className={`text-sm font-black
                ${r.highlight ? "text-white" : r.alert && r.val > 0 ? "text-rose-600" : "text-slate-800"}`}>
                {r.vnd ? fmtVND(r.val) : fmtNum(r.val)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Revenue Line Chart ────────────────────────────────────────────────────────
function RevenueChart({ revenueSummary, role, periodType }) {
  const [showMonthly, setShowMonthly] = useState(false);

  useEffect(() => {
    setShowMonthly(false);
  }, [periodType]);

  if (!revenueSummary || (role !== "Admin" && role !== "Manager" && role !== "Accountant")) return null;

  const isYearly = periodType === "YEARLY";
  const rawTrends = revenueSummary.revenueTrends || revenueSummary.RevenueTrends || [];
  const monthlyTrends = revenueSummary.monthlyTrends || revenueSummary.MonthlyTrends || [];

  const dataToUse = (isYearly && showMonthly && monthlyTrends.length > 0) ? monthlyTrends : rawTrends;

  const data = dataToUse.map(x => ({
    name: x.date || x.Date || "—",
    value: Number(x.value ?? x.Value ?? 0),
    room: Number(x.roomValue ?? x.RoomValue ?? 0),
    service: Number(x.serviceValue ?? x.ServiceValue ?? 0)
  }));

  const handleBarClick = (entry) => {
    if (isYearly) {
      setShowMonthly(prev => !prev);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm h-full w-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">
            {isYearly
              ? (showMonthly ? "Chi tiết doanh thu năm (Tháng)" : "Doanh thu năm (Quý)")
              : "Biểu đồ doanh thu"}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isYearly && showMonthly ? (
              <button onClick={() => setShowMonthly(false)} className="text-blue-500 font-bold hover:underline flex items-center gap-1">
                ← Quay lại xem Quý
              </button>
            ) : "Thống kê thực tế từ hệ thống"}
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-[300px] outline-none">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            style={{ outline: 'none', border: 'none' }}
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }}
              dy={10}
              interval="preserveStartEnd"
              minTickGap={20}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }}
              tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(0)}M` : fmtNum(val)}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
              formatter={(val, name) => [fmtVND(val), name === "room" ? "Booking (Phòng)" : name === "service" ? "Dịch vụ" : "Tổng doanh thu"]}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingBottom: 25, fontSize: 10, fontWeight: 700, color: '#475569' }}
              formatter={(value) => {
                if (value === "room") return <span className="text-blue-600">Phòng</span>;
                if (value === "service") return <span className="text-amber-500">Dịch vụ</span>;
                if (value === "value") return <span className="text-emerald-600">Tổng</span>;
                return value;
              }}
            />
            <Bar
              dataKey="room"
              stackId="revenue"
              fill="#3b82f6"
              radius={[0, 0, 0, 0]}
              barSize={data.length > 20 ? 6 : 12}
              name="room"
              onClick={handleBarClick}
              style={{ cursor: isYearly && !showMonthly ? 'pointer' : 'default' }}
            />
            <Bar
              dataKey="service"
              stackId="revenue"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
              barSize={data.length > 20 ? 6 : 12}
              name="service"
              onClick={handleBarClick}
              style={{ cursor: isYearly && !showMonthly ? 'pointer' : 'default' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              fill="url(#areaGrad)"
              stroke="none"
              legendType="none"
              tooltipType="none"
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: '#10b981' }}
              name="value"
              animationDuration={1000}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Warehouse Summary ────────────────────────────────────────────────────────
function WarehouseSummary({ warehouseSummary }) {
  if (!warehouseSummary) return null;
  const rows = [
    { label: "Tổng loại vật tư", val: warehouseSummary.totalEquipmentTypes },
    { label: "Tồn kho", val: warehouseSummary.inStockQuantity },
    { label: "Đang sử dụng", val: warehouseSummary.inUseQuantity },
    { label: "Hư hỏng hiện tại", val: warehouseSummary.currentDamagedQuantity, alert: true },
    { label: "Thanh lý", val: warehouseSummary.liquidatedQuantity, info: true },
    { label: "Vật tư sắp hết (<30)", val: warehouseSummary.lowStockItems, alert: true },
    { label: "Báo cáo hư hỏng", val: warehouseSummary.damageReports, alert: true },
    { label: "Tiền đền bù", val: warehouseSummary.penaltyAmount, vnd: true },
  ].filter(r => r.val != null);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm h-full">
      <h3 className="mb-4 text-base font-bold text-gray-900">Tình trạng kho</h3>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{r.label}</span>
            <span className={`text-sm font-bold
              ${r.alert && r.val > 0 ? "text-rose-600" : r.info ? "text-blue-600" : "text-gray-800"}`}>
              {r.vnd ? fmtVND(r.val) : fmtNum(r.val)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Low Stock List ──────────────────────────────────────────────────────────
function LowStockList({ items = [] }) {
  const limit = 30;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm h-full flex flex-col"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 ring-1 ring-amber-100 shadow-sm shadow-amber-50">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800 tracking-tight">Vật tư sắp hết</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ngưỡng cảnh báo: {limit}</p>
          </div>
        </div>
        <span className="rounded-full bg-rose-50 px-3 py-1 text-[10px] font-black text-rose-600 uppercase tracking-wider">
          {items.length} mặt hàng
        </span>
      </div>

      <div className="space-y-4 overflow-y-auto pr-1 no-scrollbar max-h-[300px]">
        {items.length > 0 ? items.map((item, i) => {
          const percentage = Math.min(100, (item.quantity / limit) * 100);
          const isCritical = item.quantity <= 5;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative flex flex-col gap-2 rounded-2xl border border-transparent bg-slate-50/50 p-4 transition-all hover:border-amber-200 hover:bg-white hover:shadow-md hover:shadow-amber-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`size-2 rounded-full shadow-[0_0_8px] ${isCritical ? 'bg-rose-500 shadow-rose-200 animate-pulse' : 'bg-amber-400 shadow-amber-200'}`} />
                  <p className="text-sm font-extrabold text-slate-700 truncate">{item.name}</p>
                </div>
                <div className="text-right ml-4">
                  <span className={`text-xs font-black px-2 py-1 rounded-lg ${isCritical ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                    {item.quantity} tồn
                  </span>
                </div>
              </div>

              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-200/50 mt-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: 0.2 + i * 0.05 }}
                  className={`absolute inset-y-0 left-0 rounded-full ${isCritical ? 'bg-gradient-to-r from-rose-400 to-rose-600' : 'bg-gradient-to-r from-amber-400 to-amber-600'}`}
                />
              </div>
            </motion.div>
          );
        }) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-500 shadow-inner">
              <CheckCircle className="size-8" />
            </div>
            <p className="text-sm font-black text-slate-800">Kho hàng an toàn</p>
            <p className="mt-1 text-xs font-bold text-slate-400 uppercase tracking-widest">Mọi vật tư đều trên ngưỡng 30</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Warehouse History ────────────────────────────────────────────────────────
function WarehouseHistory({ audits = [] }) {
  // Filter for equipment-related audits or custom messages
  const history = audits.filter(a =>
    a.entityType === "Equipment" ||
    a.message?.includes("sản phẩm") ||
    a.message?.includes("Tồn kho hiện tại")
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm h-full"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          <Clock className="size-4" />
        </div>
        <h3 className="font-black text-slate-800">Lịch sử nhập/xuất</h3>
      </div>

      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 no-scrollbar">
        {history.length > 0 ? history.map((h, i) => (
          <div key={i} className="flex flex-col gap-1 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
            <p className="text-sm font-bold text-slate-700 leading-snug">{h.message}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h.userName}</span>
              <span className="text-[10px] font-bold text-slate-400">
                {new Date(h.timestamp).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
              </span>
            </div>
          </div>
        )) : (
          <div className="py-8 text-center">
            <p className="text-sm font-bold text-slate-400 italic">Chưa có lịch sử</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Damage Report List ──────────────────────────────────────────────────────
function DamageReportList({ reports = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm h-full"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <Hammer className="size-4" />
          </div>
          <h3 className="font-black text-slate-800">Danh sách báo cáo hư hỏng</h3>
        </div>
        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
          Gần đây
        </span>
      </div>

      <div className="overflow-auto no-scrollbar max-h-[520px]">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-50">
              <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Vật tư / Phòng</th>
              <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">SL</th>
              <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Phạt (VND)</th>
              <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {reports.length > 0 ? reports.map((r, i) => (
              <tr key={i} className="group">
                <td className="py-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">{r.itemName}</span>
                    <span className="text-xs font-medium text-slate-400">Phòng {r.roomNumber}</span>
                  </div>
                </td>
                <td className="py-3 text-sm font-black text-rose-600">{r.quantity}</td>
                <td className="py-3 text-sm font-black text-slate-700">{fmtVND(r.penalty)}</td>
                <td className="py-3 text-[11px] font-bold text-slate-400 italic">
                  {new Date(r.time).toLocaleDateString('vi-VN')}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="py-8 text-center">
                  <p className="text-sm font-bold text-slate-400 italic">Không có báo cáo hư hỏng</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ─── Recent Audits ────────────────────────────────────────────────────────────
function RecentAudits({ audits }) {
  if (!audits?.length) return null;
  return (
    <div className="rounded-[2rem] border border-slate-100 bg-white p-7 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-100">
            <Activity className="size-5" />
          </div>
          <h3 className="text-base font-black text-slate-800 tracking-tight">Nhật ký hoạt động</h3>
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Gần đây</span>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-2 no-scrollbar">
        {audits.slice(0, 10).map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group flex items-start gap-4 rounded-2xl border border-transparent bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-md hover:shadow-slate-100"
          >
            <div className="mt-1 size-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-slate-700 leading-snug group-hover:text-blue-600 transition-colors">{a.message || a.action}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{a.userName}</span>
                <span className="text-[10px] font-bold text-slate-300 italic">
                  {a.timestamp ? new Date(a.timestamp).toLocaleString("vi-VN", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : ""}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── User Growth Chart ───────────────────────────────────────────────────────
function UserGrowthChart({ data = [] }) {
  if (!data?.length) return null;

  return (
    <div className="rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight">Tăng trưởng Người dùng & Khách hàng</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Xu hướng đăng ký</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-500 ring-1 ring-violet-100">
          <Users className="size-5" />
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="guestGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
            <Tooltip
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
              formatter={(v, name) => [v, name === "userCount" ? "Người dùng (User)" : "Khách hàng (Guest)"]}
            />
            <Legend verticalAlign="top" align="right" iconType="circle" iconSize={8} wrapperStyle={{ paddingBottom: 20, fontSize: 11, fontWeight: 700 }}
              formatter={(value) => value === "userCount" ? "User" : "Guest"}
            />
            <Area type="monotone" dataKey="userCount" stroke="#3b82f6" strokeWidth={3} fill="url(#userGrad)" />
            <Area type="monotone" dataKey="guestCount" stroke="#f97316" strokeWidth={3} fill="url(#guestGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Role Distribution Chart ────────────────────────────────────────────────
function RoleDistributionChart({ data = [], totalPermissions = 0 }) {
  const chartData = data.map(d => ({
    name: d.roleName,
    value: d.userCount,
    color: d.roleName === "Admin" ? "#6366f1" : d.roleName === "Manager" ? "#8b5cf6" : "#94a3b8"
  })).filter(d => d.value > 0);

  return (
    <div className="rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight">Cơ cấu vai trò & Quyền</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Phân bổ hệ thống</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 ring-1 ring-amber-100">
          <UserCircle className="size-5" />
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            {chartData.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-xs font-bold text-slate-600">{d.name}</span>
                </div>
                <span className="text-xs font-black text-slate-900">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


function SystemSummary({ systemSummary }) {
  if (!systemSummary) return null;
  const rows = [
    { label: "Tổng tài khoản", val: systemSummary.totalUsers },
    { label: "Nhân viên", val: systemSummary.staffCount, info: true },
    { label: "Đang hoạt động", val: systemSummary.activeUsers },
    { label: "Bị khóa", val: systemSummary.lockedUsers, alert: true },
    { label: "Số khách hàng", val: systemSummary.totalGuests },
    { label: "Số người dùng", val: systemSummary.userRoleCount },
  ].filter(r => r.val != null);

  return (
    <div className="rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm h-full flex flex-col">
      <h3 className="text-lg font-black text-slate-800 tracking-tight mb-6">Hệ thống</h3>
      <div className="flex-1 space-y-4">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className={`text-sm font-bold ${row.alert ? "text-rose-500" : row.info ? "text-blue-500" : "text-slate-500"}`}>
              {row.label}
            </span>
            <span className="text-base font-black text-slate-900">{fmtNum(row.val)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Top Services ─────────────────────────────────────────────────────────────
function TopServices({ services }) {
  if (!services?.length) return null;
  return (
    <div className="rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight">Dịch vụ phổ biến</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Top 5 doanh thu</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 ring-1 ring-indigo-100">
          <Activity className="size-5" />
        </div>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
        {services.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group flex items-center gap-4 rounded-2xl border border-transparent p-2 transition-all hover:bg-slate-50"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-50 text-xs font-black text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              0{i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-slate-800 truncate">{s.name}</p>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{s.count} lượt dùng</span>
                <div className="size-1 rounded-full bg-slate-200" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase">Tăng trưởng</span>
              </div>
            </div>
            <p className="text-sm font-black text-slate-900">{fmtVND(s.totalAmount)}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Recent Bookings ──────────────────────────────────────────────────────────
function RecentBookings({ bookings }) {
  if (!bookings?.length) return null;
  return (
    <div className="rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight">Đơn đặt phòng mới</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Thời gian thực</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 ring-1 ring-blue-100">
          <CalendarRange className="size-5" />
        </div>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
        {bookings.map((b, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group flex items-center gap-4 rounded-2xl border border-transparent p-2 transition-all hover:bg-slate-50"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-50 text-blue-500">
              <Users className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-extrabold text-slate-800 truncate">{b.customerName}</p>
                <p className="text-sm font-black text-slate-900">{fmtVND(b.amount)}</p>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{b.code} · {new Date(b.createdAt).toLocaleDateString("vi-VN")}</p>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ring-1 ${b.status === "Completed" ? "bg-emerald-50 text-emerald-600 ring-emerald-100" :
                  b.status === "Pending" ? "bg-amber-50 text-amber-600 ring-amber-100" :
                    b.status === "Cancelled" ? "bg-rose-50 text-rose-600 ring-rose-100" :
                      "bg-slate-50 text-slate-500 ring-slate-100"
                  }`}>
                  {b.status === "Completed" ? "Hoàn tất" : b.status === "Pending" ? "Chờ duyệt" : b.status === "Cancelled" ? "Đã hủy" : b.status}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────────────────
function QuickActions({ role }) {
  let actions = [];
  if (role === "Admin") {
    actions = [
      { label: "Thêm nhân viên", icon: Plus, color: "bg-indigo-50 text-indigo-600 ring-indigo-100" },
      { label: "Quản lý Role", icon: Users, color: "bg-blue-50 text-blue-600 ring-blue-100" },
      { label: "Backup dữ liệu", icon: Package, color: "bg-slate-50 text-slate-600 ring-slate-100" },
      { label: "Cảnh báo hệ thống", icon: AlertTriangle, color: "bg-rose-50 text-rose-600 ring-rose-100" },
      { label: "Yêu cầu cần duyệt", icon: CheckSquare, color: "bg-amber-50 text-amber-600 ring-amber-100" }
    ];
  } else if (role === "Manager") {
    actions = [
      { label: "Lịch đặt phòng", icon: CalendarRange, color: "bg-indigo-50 text-indigo-600 ring-indigo-100" },
      { label: "Dịch vụ bán chạy", icon: Activity, color: "bg-emerald-50 text-emerald-600 ring-emerald-100" },
      { label: "Tỷ lệ lấp đầy", icon: BedDouble, color: "bg-sky-50 text-sky-600 ring-sky-100" }
    ];
  } else if (role === "Receptionist") {
    actions = [
      { label: "Check-in nhanh", icon: LogIn, color: "bg-emerald-50 text-emerald-600 ring-emerald-100" },
      { label: "Check-out nhanh", icon: LogOut, color: "bg-rose-50 text-rose-600 ring-rose-100" },
      { label: "Tạo booking", icon: CalendarRange, color: "bg-blue-50 text-blue-600 ring-blue-100" },
      { label: "Tìm phòng trống", icon: BedDouble, color: "bg-teal-50 text-teal-600 ring-teal-100" },
      { label: "In hóa đơn", icon: Receipt, color: "bg-slate-50 text-slate-600 ring-slate-100" }
    ];
  } else if (role === "Housekeeping" || role === "HouseKeeping") {
    actions = [
      { label: "Cập nhật trạng thái", icon: RefreshCw, color: "bg-amber-50 text-amber-600 ring-amber-100" },
      { label: "Ghi chú phòng", icon: CheckSquare, color: "bg-blue-50 text-blue-600 ring-blue-100" },
      { label: "Upload ảnh lỗi", icon: AlertTriangle, color: "bg-rose-50 text-rose-600 ring-rose-100" }
    ];
  }

  if (!actions.length) return null;

  return (
    <div className="rounded-[2rem] border border-slate-100 bg-white p-7 shadow-sm mt-6 lg:mt-0">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-base font-black text-slate-800 tracking-tight">Thao tác nhanh</h3>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Phím tắt</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {actions.map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2.5 rounded-2xl px-5 py-3 text-xs font-black transition-all shadow-sm ring-1 ${a.color} hover:shadow-md`}
            >
              <Icon className="size-4" />
              <span className="uppercase tracking-wider">{a.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Real-time Action List ───────────────────────────────────────────────────
function ActionList({ title, items, type, icon: Icon, color = "blue" }) {
  if (!items?.length) return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/30 p-8 text-center">
      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      <p className="mt-2 text-xs text-gray-400">Không có mục nào</p>
    </div>
  );

  const colors = {
    green: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    red: "bg-rose-50 text-rose-600 ring-rose-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  };

  const c = colors[color] || colors.blue;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-tight flex items-center gap-2">
          <div className={`rounded-lg p-1.5 ring-1 ${c}`}>
            <Icon className="size-3.5" />
          </div>
          {title}
        </h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-500">
          {items.length}
        </span>
      </div>
      <div className="space-y-2.5 overflow-y-auto max-h-[320px] pr-1 no-scrollbar">
        {items.map((item, i) => (
          <div key={i} className="group relative flex items-center gap-3 rounded-xl border border-transparent bg-slate-50/50 p-2.5 transition-all hover:border-slate-200 hover:bg-white hover:shadow-sm">
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-base font-black text-slate-900 group-hover:text-blue-600">{item.title}</p>
                <p className="whitespace-nowrap text-sm font-bold text-slate-400">
                  {new Date(item.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="mt-0.5 flex items-center justify-between">
                <p className="truncate text-sm font-medium text-slate-500 uppercase tracking-tight">{item.subtitle}</p>
                {item.amount != null && (
                  <p className="text-sm font-black text-emerald-600">{fmtVND(item.amount)}</p>
                )}
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="rounded-lg bg-white p-1.5 text-slate-400 shadow-sm ring-1 ring-slate-100 hover:text-blue-600">
                <RefreshCw className="size-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Receptionist Operation Center ──────────────────────────────────────────
// ─── Receptionist Components ───────────────────────────────────────────────
function CheckInList({ items = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm h-full"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <LogIn className="size-4" />
          </div>
          <h3 className="font-black text-slate-800">Check-in</h3>
        </div>
        <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Ưu tiên</span>
      </div>

      <div className="space-y-3">
        {items.length > 0 ? items.map((item, i) => (
          <div key={i} className="group relative rounded-2xl border border-slate-50 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-md hover:shadow-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-base font-black text-slate-900 line-clamp-1">{item.title}</span>
              <span className="text-sm font-bold text-emerald-500">{new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{item.subtitle}</span>
              <span className={`rounded-md px-1.5 py-0.5 text-xs font-bold ${item.extra === 'Đã thanh toán' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                {item.extra}
              </span>
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-2 size-10 rounded-full bg-slate-50 flex items-center justify-center">
              <Calendar className="size-5 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-400">Không có khách đến</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function CheckOutList({ items = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm h-full"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <LogOut className="size-4" />
          </div>
          <h3 className="font-black text-slate-800">Check-out</h3>
        </div>
        <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500 uppercase">Hôm nay</span>
      </div>

      <div className="space-y-3">
        {items.length > 0 ? items.map((item, i) => (
          <div key={i} className="group relative rounded-2xl border border-slate-50 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-md hover:shadow-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-base font-black text-slate-900 line-clamp-1">{item.title}</span>
              <span className="text-sm font-bold text-rose-500">{new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{item.subtitle}</span>
              <span className="text-base font-black text-slate-800">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.amount || 0)}
              </span>
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-2 size-10 rounded-full bg-slate-50 flex items-center justify-center">
              <Package className="size-5 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-400">Không có khách đi</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function NotificationCenter({ items = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-3xl border border-white bg-white/80 backdrop-blur-2xl p-6 text-slate-800 shadow-2xl shadow-indigo-100/40 h-full flex flex-col relative overflow-hidden"
    >
      {/* Decorative background gradients */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 size-48 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-12 -mb-12 size-48 rounded-full bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 blur-3xl pointer-events-none" />

      <div className="mb-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200">
            <Activity className="size-5 text-white" />
          </div>
          <div>
            <h3 className="font-black text-base uppercase tracking-wider text-slate-900">Thông báo</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cập nhật thời gian thực</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100/50">
          <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">Trực tiếp</span>
        </div>
      </div>

      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 no-scrollbar relative z-10 flex-1">
        {items.length > 0 ? items.map((item, i) => (
          <div key={i} className="group flex gap-4 p-4 rounded-2xl transition-all duration-300 bg-white/50 hover:bg-white border border-slate-100/50 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50/50 cursor-pointer">
            <div className="mt-1.5 size-2.5 shrink-0 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)] group-hover:scale-125 transition-transform duration-300" />
            <div className="overflow-hidden flex-1">
              <p className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors duration-300">{item.title}</p>
              {item.subtitle && <p className="mt-1.5 text-sm text-slate-600 font-medium leading-relaxed group-hover:text-slate-800 transition-colors duration-300">{item.subtitle}</p>}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md uppercase tracking-widest">
                  {new Date(item.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-xs font-bold text-blue-400">·</span>
                <span className="text-xs font-bold text-slate-400">
                  {new Date(item.time).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-10 opacity-50">
            <Activity className="size-12 text-slate-300 mb-4" />
            <p className="text-sm font-medium text-slate-400 italic">Hệ thống đang yên tĩnh...</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TodayBookingsList({ items = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm h-full"
    >
      <div className="mb-4 flex items-center gap-2">
        <Layers className="size-4 text-indigo-500" />
        <h3 className="font-black text-slate-800">Booking hôm nay</h3>
      </div>
      <div className="space-y-2 overflow-y-auto max-h-[290px] no-scrollbar pr-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0">
            <div className="overflow-hidden">
              <p className="text-sm font-black text-slate-900 truncate">{item.title}</p>
              <p className="text-xs text-slate-400">{item.subtitle}</p>
            </div>
            <div className="text-right shrink-0 ml-2">
              <p className="text-xs font-bold text-slate-700">{new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <span className={`text-[10px] font-black ${item.status === 'Completed' || item.status === 'CheckedIn' ? 'text-emerald-500' : 'text-amber-500'
                }`}>{item.status}</span>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="py-4 text-center text-xs font-medium text-slate-400 italic">Không có đơn đặt phòng mới</p>
        )}
      </div>
    </motion.div>
  );
}




// ─── Skeleton ────────────────────────────────────────────────────────────────
function PopularServicesList({ items = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm h-full"
    >
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="size-4 text-emerald-500" />
        <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">Dịch vụ phổ biến</h3>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between group cursor-default py-1">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center text-sm font-black text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                #{i + 1}
              </div>
              <span className="text-base font-bold text-slate-700">{item.name}</span>
            </div>
            <span className="text-sm font-black bg-slate-100 px-3 py-1.5 rounded-lg text-slate-500">{item.count} lượt</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function PendingServicesList({ items = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-3xl border border-rose-100 bg-rose-50/30 p-6 shadow-sm h-full"
    >
      <div className="mb-4 flex items-center gap-2">
        <Clock className="size-4 text-rose-500" />
        <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">Dịch vụ chờ xử lý</h3>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col border-b border-rose-100/50 pb-3 last:border-0 last:pb-0">
            <div className="flex justify-between items-start">
              <p className="text-base font-black text-slate-900">{item.subtitle}</p>
              <span className="text-sm font-black text-rose-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.amount)}</span>
            </div>
            <p className="text-sm font-bold text-slate-500">{item.title}</p>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-[10px] text-slate-400 italic py-4">Tất cả dịch vụ đã xử lý</p>}
      </div>
    </motion.div>
  );
}

function ServiceHistoryList({ items = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm h-full"
    >
      <div className="mb-4 flex items-center gap-2">
        <Activity className="size-4 text-blue-500" />
        <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">Lịch sử dịch vụ</h3>
      </div>
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0">
            <div className="overflow-hidden">
              <p className="text-base font-bold text-slate-800 truncate">{item.subtitle}</p>
              <p className="text-sm text-slate-400">{item.title}</p>
            </div>
            <div className="text-right ml-2 shrink-0">
              <p className="text-base font-black text-slate-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.amount)}</p>
              <p className="text-sm font-bold text-slate-400">{new Date(item.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-[10px] text-slate-400 italic py-4">Chưa có lịch sử dịch vụ</p>}
      </div>
    </motion.div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-28 rounded-2xl bg-slate-100" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-slate-100" />)}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => <div key={i} className="h-56 rounded-2xl bg-slate-100" />)}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const auth = useStoredAuth();
  const queryClient = useQueryClient();
  const [periodType, setPeriodType] = useState("MONTHLY");
  const role = auth?.role || auth?.Role || "Admin";

  const { data: resp, isLoading, error, refetch } = useQuery({
    queryKey: ["role-dashboard", role, periodType],
    queryFn: () => dashboardApi.getCurrentDashboard(role, periodType),
    staleTime: 2 * 60_000,
    retry: 1,
  });

  const rebuildMutation = useMutation({
    mutationFn: () => dashboardApi.rebuildCurrentDashboards(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-dashboard"] });
      setTimeout(() => refetch(), 1500);
    },
  });

  const dash = resp?.dashboard || resp?.Dashboard || null;
  const cmp = resp?.comparison || resp?.Comparison || null;

  const { data: personalNotifications } = useQuery({
    queryKey: ["personal-notifications", auth?.id || auth?.userId],
    queryFn: () => getNotifications(10),
    enabled: !!auth,
    refetchInterval: 30000,
  });

  const { kpiCards, summary, departmentOverview, tables } = useMemo(() => {
    if (!dash) return { kpiCards: [], summary: {}, departmentOverview: [], tables: {} };
    return {
      kpiCards: dash.kpiCards || [],
      summary: dash.summary || {},
      departmentOverview: dash.departmentOverview || [],
      tables: dash.tables || {},
    };
  }, [dash]);

  // Build enriched KPI cards with growthRate from comparison
  const enrichedCards = useMemo(() => {
    if (!kpiCards.length) return [];
    const cmpMetrics = cmp?.metrics || {};
    return kpiCards.map(card => {
      const metric = cmpMetrics[card.code] || {};
      return {
        ...card,
        growthRate: metric.growthRate ?? null,
        trendDir: metric.trend ?? null,
      };
    });
  }, [kpiCards, cmp]);

  const mergedNotifications = useMemo(() => {
    const global = summary.tasks?.notifications || [];
    const personal = (personalNotifications || [])
      .filter(n => n.userId != null) // Avoid duplicating global ones if they are returned
      .map(n => ({
        id: n.id?.toString(),
        title: n.title,
        subtitle: n.content,
        time: n.createdAt,
        type: n.type || "Info"
      }));

    return [...global, ...personal].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);
  }, [summary.tasks?.notifications, personalNotifications]);

  const hasRooms = !!(summary.rooms);
  const hasRev = !!(summary.revenue);
  const hasBk = !!(summary.booking);
  const hasWh = !!(summary.warehouse);
  const hasSys = !!(summary.system);

  return (
    <div className="space-y-6 pt-4">
      {/* ── Period Selector ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-800 tracking-tight">
          Bảng điều khiển <span className="text-slate-400 font-medium">/ {ROLE_LABEL[role] || role}</span>
        </h1>
        <div className="flex items-center gap-1 rounded-2xl bg-slate-100 p-1">
          {[
            { id: "DAILY", label: "Ngày" },
            { id: "WEEKLY", label: "Tuần" },
            { id: "MONTHLY", label: "Tháng" },
            { id: "YEARLY", label: "Năm" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriodType(p.id)}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${periodType === p.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
                }`}
            >
              {p.label}
            </button>
          ))}
          <div className="mx-1 h-4 w-px bg-slate-200" />
          <button
            onClick={() => rebuildMutation.mutate()}
            disabled={rebuildMutation.isPending}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-white hover:text-emerald-500 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${rebuildMutation.isPending ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Error / No data ── */}
      {error && !isLoading && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-sm font-semibold text-amber-800">
            Có lỗi xảy ra khi tải dữ liệu dashboard. Vui lòng thử lại sau.
          </p>
        </div>
      )}

      {isLoading ? (
        <Skeleton />
      ) : !dash ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-3xl bg-slate-50 p-8">
            <Activity className="size-12 text-slate-200" />
          </div>
          <p className="text-xl font-black text-slate-800">Bảng điều khiển trống</p>
          <p className="mt-2 text-sm text-slate-500 max-w-xs">Hệ thống chưa ghi nhận dữ liệu cho vai trò {role} trong kỳ này.</p>
        </div>
      ) : (
        <>
          {/* ── Main Layout Engine by Role ── */}
          {role === "Admin" && (
            <div className="flex flex-col gap-6">
              {/* Admin Row 1: KPI Cards */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {enrichedCards.map((card, i) => <StatCard key={i} {...card} />)}
              </div>

              {/* Admin Row 2: Structure & Summary */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1">
                  <RoleDistributionChart data={tables.usersByRole} totalPermissions={summary.system?.totalPermissions} />
                </div>
                <div className="lg:col-span-2">
                  <SystemSummary systemSummary={summary.system} />
                </div>
              </div>
              {/* Admin Row 3: Revenue & Booking */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  {hasRev && <RevenueChart revenueSummary={summary.revenue} role={role} periodType={periodType} />}
                </div>
                <div className="lg:col-span-1">
                  {hasBk && <BookingSummary bookingSummary={summary.booking} />}
                </div>
              </div>

              {/* Admin Row 4: Activity Logs */}
              <div className="grid grid-cols-1 gap-6">
                {summary.audit?.recentAudits?.length > 0 && (
                  <RecentAudits audits={summary.audit.recentAudits} />
                )}
              </div>

            </div>
          )}

          {role === "Manager" && (
            <div className="flex flex-col gap-6">
              {/* Row 1: KPI Cards */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {enrichedCards.map((card, i) => <StatCard key={i} {...card} />)}
              </div>

              {/* Row 2: Chart & Rooms */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  {hasRev && <RevenueChart revenueSummary={summary.revenue} role={role} periodType={periodType} />}
                </div>
                <div className="lg:col-span-1 space-y-6">
                  {hasRooms && <RoomStatusOverview roomsSummary={summary.rooms} role={role} />}
                </div>
              </div>

              {/* Stats Row (Dòng 3) */}
              <div className={`grid grid-cols-1 gap-6 items-start lg:grid-cols-2`}>
                <BookingSummary bookingSummary={summary.booking} />
                {hasWh && <WarehouseSummary warehouseSummary={summary.warehouse} />}
              </div>

              {/* Detailed Lists (Dòng 4) */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-start">
                <RecentBookings bookings={summary.booking?.recentBookings} />
                <TopServices services={summary.revenue?.topServices} />
              </div>
            </div>
          )}

          {role === "Receptionist" && (
            <div className="space-y-6">
              {/* Row 1: KPI Cards */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {enrichedCards.map((card, i) => <StatCard key={i} {...card} />)}
              </div>

              {/* Row 2: Today Bookings */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <TodayBookingsList items={summary.tasks?.todayBookings} />
                </div>
                <div className="space-y-6">
                  {hasRooms && <RoomStatusOverview roomsSummary={summary.rooms} role={role} />}
                </div>
              </div>

              {/* Row 3: Operational Center & Notifications */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <CheckInList items={summary.tasks?.upcomingCheckIns} />
                <CheckOutList items={summary.tasks?.upcomingCheckOuts} />
                <NotificationCenter items={mergedNotifications} />
              </div>

              {/* Row 4: Service Management Center */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <PopularServicesList items={summary.services?.topServices} />
                <PendingServicesList items={summary.services?.pendingServices} />
                <ServiceHistoryList items={summary.services?.recentHistory} />
              </div>
            </div>
          )}


          {(role === "Housekeeping" || role === "HouseKeeping") && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {enrichedCards.map((card, i) => <StatCard key={i} {...card} />)}
              </div>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  {hasRooms && <RoomStatusOverview roomsSummary={summary.rooms} role={role} />}
                </div>
              </div>
            </div>
          )}

          {(role === "WarehouseStaff" || role === "Warehouse") && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {enrichedCards.map((card, i) => <StatCard key={i} {...card} />)}
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <LowStockList items={summary.warehouse?.lowStockItemsList} />
                  {hasWh && <WarehouseStatusChart summary={summary.warehouse} />}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <WarehouseHistory audits={summary.warehouse?.recentEquipmentAudits || []} />
                  {hasWh && <WarehouseSummary warehouseSummary={summary.warehouse} />}
                </div>

                {/* Row 3: Damage Reports at bottom */}
                <div className="w-full">
                  <DamageReportList reports={summary.warehouse?.recentDamageReports} />
                </div>
              </div>
            </div>
          )}

          {/* Fallback cho các Role khác (Kế toán, ...) */}
          {!["Admin", "Manager", "Receptionist", "Housekeeping", "HouseKeeping", "WarehouseStaff", "Warehouse"].includes(role) && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {enrichedCards.map((card, i) => <StatCard key={i} {...card} />)}
              </div>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  {hasRev && <RevenueChart revenueSummary={summary.revenue} role={role} periodType={periodType} />}
                  {hasBk && <BookingSummary bookingSummary={summary.booking} />}
                  {hasRev && <RevenueSummary revenueSummary={summary.revenue} />}
                </div>
                <div className="space-y-6">
                  {hasSys && <SystemSummary systemSummary={summary.system} />}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
