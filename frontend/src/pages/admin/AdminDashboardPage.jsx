import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  TrendingUp, TrendingDown, RefreshCw, LayoutDashboard,
  BedDouble, DollarSign, Users, Activity, Package, AlertTriangle,
  BatteryWarning, Brush, CheckSquare, CheckCircle, CreditCard, Clock,
  Receipt, LogIn, LogOut, CalendarRange, Layers, Hammer, BarChart3,
  Calendar
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
  newCustomers: { icon: Users, color: "sky" },
  totalEquipmentTypes: { icon: Layers, color: "blue" },
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
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className={`rounded-xl p-2.5 ring-1 ${c.bg} ${c.ring}`}>
          <Icon className={`size-5 ${c.text}`} />
        </div>
        {hasGrowth && (
          <div className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold
            ${isUp ? "bg-emerald-50 text-emerald-600" : isDown ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-500"}`}>
            {isUp ? <TrendingUp className="size-3" /> : isDown ? <TrendingDown className="size-3" /> : null}
            {Math.abs(Number(growthRate)).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</p>
      <p className="mt-1 text-2xl font-black text-gray-900">{fmtValue(value, unit)}</p>
      {hasGrowth && (
        <p className={`mt-1 text-xs font-medium ${isUp ? "text-emerald-500" : isDown ? "text-rose-500" : "text-slate-400"}`}>
          {isUp ? "↑" : isDown ? "↓" : "→"} so với kỳ trước
        </p>
      )}
    </div>
  );
}

// ─── Department Overview Row ────────────────────────────────────────────────
function DeptOverview({ items }) {
  if (!items?.length) return null;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((d, i) => (
        <div key={i} className={`rounded-2xl border p-4
          ${d.status === "warning" ? "border-amber-200 bg-amber-50" : "border-gray-100 bg-white shadow-sm"}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{d.department}</p>
          <p className="mt-1 text-xl font-black text-gray-900">{fmtNum(d.value)}</p>
          {d.status === "warning" && (
            <p className="mt-1 text-xs font-semibold text-amber-600">⚠ Cần xử lý</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Room Pie Chart ──────────────────────────────────────────────────────────
function RoomPieChart({ roomsSummary, role }) {
  if (!roomsSummary) return null;

  let data = [];
  if (role === "Housekeeping" || role === "HouseKeeping") {
    data = [
      { name: "Phòng trống (Sạch)", value: roomsSummary.availableRooms || 0, color: "#22c55e" }, // green
      { name: "Cần dọn (Dirty)", value: roomsSummary.dirtyRooms || 0, color: "#ef4444" }, // red
      { name: "Đang dọn", value: roomsSummary.cleaningRooms || 0, color: "#eab308" }, // yellow
      { name: "Bảo trì", value: roomsSummary.maintenanceRooms || 0, color: "#94a3b8" }, // gray
    ].filter(d => d.value > 0);
  } else {
    data = [
      { name: "Trống", value: roomsSummary.availableRooms || 0, color: "#10b981" },
      { name: "Đang ở", value: roomsSummary.occupiedRooms || 0, color: "#0ea5e9" },
      { name: "Đang dọn", value: roomsSummary.cleaningRooms || 0, color: "#f59e0b" },
      { name: "Bảo trì", value: roomsSummary.maintenanceRooms || 0, color: "#ef4444" },
    ].filter(d => d.value > 0);
  }

  if (data.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-bold text-gray-900">Trạng thái phòng</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
            paddingAngle={3} dataKey="value">
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip formatter={(v, name) => [v + " phòng", name]} />
          <Legend iconType="circle" iconSize={10}
            formatter={(value) => <span className="text-xs font-medium text-gray-600">{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 text-center text-xs text-gray-400">
        Tổng: {roomsSummary.totalRooms || 0} phòng · Lấp đầy: {roomsSummary.occupancyRate || 0}%
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
    { label: "Đã xác nhận", val: bookingSummary.confirmedBookings },
    { label: "Đang lưu trú", val: bookingSummary.inProgressBookings },
    { label: "Hoàn tất", val: bookingSummary.completedBookings },
    { label: "Đã hủy", val: bookingSummary.cancelledBookings },
    { label: "Check-in kỳ này", val: bookingSummary.checkIns },
    { label: "Check-out kỳ này", val: bookingSummary.checkOuts },
  ].filter(r => r.val != null);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-bold text-gray-900">Thống kê đặt phòng</h3>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{r.label}</span>
            <span className={`text-sm font-bold ${r.alert && r.val > 0 ? "text-amber-600" : "text-gray-800"}`}>
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
    { label: "Tổng doanh thu", val: revenueSummary.totalRevenue, vnd: true, highlight: true },
    { label: "Doanh thu phòng", val: revenueSummary.roomRevenue, vnd: true },
    { label: "Doanh thu DV", val: revenueSummary.serviceRevenue, vnd: true },
    { label: "Chưa thanh toán", val: revenueSummary.pendingPaymentAmount, vnd: true, alert: true },
    { label: "HĐ đã thanh toán", val: revenueSummary.paidInvoices },
    { label: "HĐ chưa thanh toán", val: revenueSummary.unpaidInvoices, alert: true },
  ].filter(r => r.val != null);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-bold text-gray-900">Tài chính kỳ này</h3>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className={`flex items-center justify-between ${r.highlight ? "rounded-xl bg-emerald-50 px-3 py-2" : ""}`}>
            <span className={`text-sm ${r.highlight ? "font-semibold text-emerald-700" : "text-gray-500"}`}>{r.label}</span>
            <span className={`text-sm font-bold
              ${r.highlight ? "text-emerald-700" : r.alert && r.val > 0 ? "text-rose-600" : "text-gray-800"}`}>
              {r.vnd ? fmtVND(r.val) : fmtNum(r.val)}
            </span>
          </div>
        ))}
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
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm h-full"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          <AlertTriangle className="size-4" />
        </div>
        <h3 className="font-black text-slate-800">Vật tư sắp hết {"(<30)"}</h3>
      </div>
      
      <div className="space-y-3">
        {items.length > 0 ? items.map((item, i) => (
          <div key={i} className="flex items-center justify-between group py-1">
             <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-slate-700 truncate">{item.name}</p>
             </div>
             <div className="text-right ml-4">
                <span className="text-sm font-black bg-rose-50 px-3 py-1 rounded-lg text-rose-600">
                  {item.quantity} tồn
                </span>
             </div>
          </div>
        )) : (
          <div className="py-8 text-center">
            <p className="text-sm font-bold text-slate-400 italic">Kho hàng đầy đủ</p>
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
      
      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 no-scrollbar">
        {history.length > 0 ? history.map((h, i) => (
          <div key={i} className="flex flex-col gap-1 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
             <p className="text-sm font-bold text-slate-700 leading-snug">{h.message}</p>
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h.userName}</span>
                <span className="text-[10px] font-bold text-slate-400">
                   {new Date(h.timestamp).toLocaleString('vi-VN', {hour:'2-digit', minute:'2-digit', day:'2-digit', month:'2-digit'})}
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
      
      <div className="overflow-x-auto no-scrollbar">
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
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-bold text-gray-900">Nhật ký hoạt động gần đây</h3>
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {audits.slice(0, 10).map((a, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
            <div className="size-2 mt-1.5 rounded-full bg-slate-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">{a.message || a.action}</p>
              <p className="text-xs text-slate-400">{a.userName} · {a.timestamp ? new Date(a.timestamp).toLocaleString("vi-VN") : ""}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Role-specific system info ────────────────────────────────────────────────
function SystemSummary({ systemSummary }) {
  if (!systemSummary) return null;
  const rows = [
    { label: "Tổng tài khoản", val: systemSummary.totalUsers },
    { label: "Nhân viên mới", val: systemSummary.newStaffAccounts, highlight: true },
    { label: "Đang hoạt động", val: systemSummary.activeUsers },
    { label: "Bị khóa", val: systemSummary.lockedUsers, alert: true },
    { label: "Thông báo chưa đọc", val: systemSummary.unreadNotifications, alert: true },
    { label: "Sự kiện audit", val: systemSummary.auditEvents },
  ].filter(r => r.val != null);

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-bold text-slate-800">Hệ thống</h3>
      <div className="space-y-3">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-tight">{r.label}</span>
            <span className={`text-sm font-black ${r.alert && r.val > 0 ? "text-rose-600" : r.highlight && r.val > 0 ? "text-blue-600" : "text-slate-800"}`}>
              {fmtNum(r.val)}
            </span>
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
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-bold text-slate-800">Dịch vụ phổ biến</h3>
      <div className="space-y-3">
        {services.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-[10px] font-bold text-slate-400">
              #{i+1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{s.name}</p>
              <p className="text-[10px] text-slate-400 uppercase font-medium">{s.count} lượt dùng</p>
            </div>
            <p className="text-xs font-black text-emerald-600">{fmtVND(s.totalAmount)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Recent Bookings ──────────────────────────────────────────────────────────
function RecentBookings({ bookings }) {
  if (!bookings?.length) return null;
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-bold text-slate-800">Đơn đặt phòng mới</h3>
      <div className="space-y-3">
        {bookings.map((b, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-slate-50 pb-2 last:border-0 last:pb-0">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{b.customerName}</p>
              <p className="text-[10px] text-slate-400 font-medium">{b.code} · {new Date(b.createdAt).toLocaleDateString("vi-VN")}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-slate-800">{fmtVND(b.amount)}</p>
              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                b.status === "Completed" ? "bg-emerald-50 text-emerald-600" :
                b.status === "Pending" ? "bg-amber-50 text-amber-600" :
                b.status === "Cancelled" ? "bg-rose-50 text-rose-600" :
                "bg-slate-50 text-slate-500"
              }`}>
                {b.status}
              </span>
            </div>
          </div>
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
      { label: "Quản lý Role", icon: Users, color: "bg-blue-100 text-blue-700" },
      { label: "Backup dữ liệu", icon: Package, color: "bg-slate-100 text-slate-700" },
      { label: "Cảnh báo hệ thống", icon: AlertTriangle, color: "bg-rose-100 text-rose-700" },
      { label: "Yêu cầu cần duyệt", icon: CheckSquare, color: "bg-amber-100 text-amber-700" }
    ];
  } else if (role === "Manager") {
    actions = [
      { label: "Calendar Booking", icon: CalendarRange, color: "bg-indigo-100 text-indigo-700" },
      { label: "Dịch vụ bán chạy", icon: Activity, color: "bg-emerald-100 text-emerald-700" },
      { label: "Occupancy Rate", icon: BedDouble, color: "bg-sky-100 text-sky-700" }
    ];
  } else if (role === "Receptionist") {
    actions = [
      { label: "Check-in nhanh", icon: LogIn, color: "bg-emerald-100 text-emerald-700" },
      { label: "Check-out nhanh", icon: LogOut, color: "bg-rose-100 text-rose-700" },
      { label: "Tạo booking", icon: CalendarRange, color: "bg-blue-100 text-blue-700" },
      { label: "Tìm phòng trống", icon: BedDouble, color: "bg-teal-100 text-teal-700" },
      { label: "In hóa đơn", icon: Receipt, color: "bg-slate-100 text-slate-700" }
    ];
  } else if (role === "Housekeeping" || role === "HouseKeeping") {
    actions = [
      { label: "Cập nhật trạng thái", icon: RefreshCw, color: "bg-amber-100 text-amber-700" },
      { label: "Ghi chú phòng", icon: CheckSquare, color: "bg-blue-100 text-blue-700" },
      { label: "Upload ảnh lỗi", icon: AlertTriangle, color: "bg-rose-100 text-rose-700" }
    ];
  }

  if (!actions.length) return null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm mt-4 lg:mt-0">
      <h3 className="mb-4 text-base font-bold text-gray-900">Thao tác nhanh</h3>
      <div className="flex flex-wrap gap-3">
        {actions.map((a, i) => {
          const Icon = a.icon;
          return (
            <button key={i} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-80 ${a.color}`}>
              <Icon className="size-4" />
              {a.label}
            </button>
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
              <span className={`rounded-md px-1.5 py-0.5 text-xs font-bold ${
                item.extra === 'Đã thanh toán' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
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
      <div className="space-y-2">
        {items.slice(0, 4).map((item, i) => (
          <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0">
            <div className="overflow-hidden">
              <p className="text-sm font-black text-slate-900 truncate">{item.title}</p>
              <p className="text-xs text-slate-400">{item.subtitle}</p>
            </div>
            <div className="text-right shrink-0 ml-2">
              <p className="text-xs font-bold text-slate-700">{new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <span className={`text-[10px] font-black ${
                item.status === 'Completed' || item.status === 'CheckedIn' ? 'text-emerald-500' : 'text-amber-500'
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
                #{i+1}
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
                <p className="text-sm font-bold text-slate-400">{new Date(item.time).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</p>
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
              className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                periodType === p.id
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
              {/* KPI Cards */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {enrichedCards.map((card, i) => <StatCard key={i} {...card} />)}
              </div>

              {/* Chart & Rooms */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  {hasRev && <RevenueChart revenueSummary={summary.revenue} role={role} periodType={periodType} />}
                </div>
                <div>
                  {hasRooms && <RoomPieChart roomsSummary={summary.rooms} role={role} />}
                  <div className="mt-6">
                    {hasWh && <WarehouseStatusChart summary={summary.warehouse} />}
                  </div>
                </div>
              </div>

              {/* Detailed Lists */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Bookings & Services */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                   <RecentBookings bookings={summary.booking?.recentBookings} />
                   <TopServices services={summary.revenue?.topServices} />
                </div>

                {/* System & Stats */}
                <div className="space-y-6">
                   <SystemSummary systemSummary={summary.system} />
                   <BookingSummary bookingSummary={summary.booking} />
                </div>
              </div>

              {/* Audits */}
              {tables.recentAudits?.length > 0 && (
                <div>
                  <RecentAudits audits={tables.recentAudits} />
                </div>
              )}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                   <DamageReportList reports={summary.warehouse?.recentDamageReports} />
                </div>
                <div className="space-y-6">
                   <PendingServicesList items={summary.services?.pendingServices} />
                </div>
              </div>

               <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <PopularServicesList items={summary.services?.topServices} />
                  <ServiceHistoryList items={summary.services?.recentHistory} />
               </div>
            </div>
          )}

          {role === "Manager" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {enrichedCards.map((card, i) => <StatCard key={i} {...card} />)}
              </div>
              {departmentOverview.length > 0 && (
                <div>
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Tổng quan bộ phận</h2>
                  <DeptOverview items={departmentOverview} />
                </div>
              )}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  {hasRev && <RevenueChart revenueSummary={summary.revenue} role={role} periodType={periodType} />}
                  {hasBk && <BookingSummary bookingSummary={summary.booking} />}
                </div>
                <div className="space-y-6">
                  {hasRev && <RevenueSummary revenueSummary={summary.revenue} />}
                </div>
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
                    {hasRooms && <RoomPieChart roomsSummary={summary.rooms} role={role} />}
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
                  {hasRooms && <RoomPieChart roomsSummary={summary.rooms} role={role} />}
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
                  <WarehouseHistory audits={tables.recentAudits} />
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
