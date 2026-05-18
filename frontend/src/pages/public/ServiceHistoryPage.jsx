import React, { useEffect, useState, useMemo } from "react";
import { userServicesApi } from "../../api/user/servicesApi";
import { getStoredAuth } from "../../utils/authStorage";
import { useNavigate } from "react-router-dom";
import { 
  History, 
  Search, 
  Filter, 
  CreditCard, 
  QrCode, 
  X, 
  Check, 
  AlertCircle, 
  Loader2, 
  Coffee, 
  DollarSign
} from "lucide-react";

const ServiceHistoryPage = () => {
  const navigate = useNavigate();
  const auth = getStoredAuth();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, Paid, Unpaid
  
  // Payment Modal States
  const [selectedUsage, setSelectedUsage] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await userServicesApi.getUsageHistory();
      setHistory(data);
    } catch (err) {
      console.error("Failed to load service usage history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth) {
      navigate("/login");
      return;
    }
    fetchHistory();
  }, []);

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const matchesSearch = !search || item.serviceName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.paymentStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [history, search, statusFilter]);

  const stats = useMemo(() => {
    const totalOrdered = history.length;
    const totalAmount = history.reduce((sum, item) => sum + item.lineTotal, 0);
    const unpaidCount = history.filter(item => item.paymentStatus === "Unpaid").length;
    const paidCount = history.filter(item => item.paymentStatus === "Paid").length;
    return { totalOrdered, totalAmount, unpaidCount, paidCount };
  }, [history]);

  const handleSimulatePayment = async () => {
    setIsConfirmingPayment(true);
    setTimeout(() => {
      setIsConfirmingPayment(false);
      setPaymentSuccess(true);
      setHistory(prev => prev.map(item => {
        if (item.id === selectedUsage.id) {
          return { ...item, paymentStatus: "Paid" };
        }
        return item;
      }));
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10 pb-24 pt-24 animate-in fade-in duration-300">
      <div className="mx-auto max-w-7xl">
        
        {/* Breadcrumb & Header */}
        <div className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">User / Theo dõi dịch vụ</p>
          <h1 className="mt-3 text-3xl font-black text-slate-900">Lịch sử đặt dịch vụ</h1>
          <p className="mt-2 text-[13px] font-bold text-slate-400">
            Theo dõi tất cả các yêu cầu dịch vụ của bạn tại khách sạn, chi phí phát sinh và tình trạng thanh toán.
          </p>
        </div>



        {/* Filter Toolbar */}
        <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên dịch vụ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 outline-none focus:border-[#0194f3] focus:ring-4 focus:ring-[#0194f3]/10 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <Filter className="size-4 text-slate-400 animate-pulse" />
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded-xl px-4 py-2 text-xs font-black transition ${
                statusFilter === "all" ? "bg-[#0194f3] text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setStatusFilter("Paid")}
              className={`rounded-xl px-4 py-2 text-xs font-black transition ${
                statusFilter === "Paid" ? "bg-[#0194f3] text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Đã thanh toán
            </button>
            <button
              onClick={() => setStatusFilter("Unpaid")}
              className={`rounded-xl px-4 py-2 text-xs font-black transition ${
                statusFilter === "Unpaid" ? "bg-[#0194f3] text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Chưa thanh toán
            </button>
          </div>
        </div>

        {/* History List */}
        {loading ? (
          <div className="rounded-3xl bg-white border border-slate-100 p-20 flex flex-col items-center justify-center shadow-sm">
            <Loader2 className="size-8 animate-spin text-[#0194f3] mb-4" />
            <p className="text-sm font-bold text-slate-400">Đang tải lịch sử dịch vụ...</p>
          </div>
        ) : filteredHistory.length > 0 ? (
          <div className="overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-sm">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[900px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6 bg-slate-50/50">Dịch vụ</th>
                    <th className="py-4 px-6 bg-slate-50/50">Ngày đặt</th>
                    <th className="py-4 px-6 bg-slate-50/50">Địa điểm (Phòng)</th>
                    <th className="py-4 px-6 bg-slate-50/50">Đơn giá</th>
                    <th className="py-4 px-6 bg-slate-50/50">Số lượng</th>
                    <th className="py-4 px-6 bg-slate-50/50">Thành tiền</th>
                    <th className="py-4 px-6 bg-slate-50/50">Tình trạng</th>
                    <th className="py-4 px-6 bg-slate-50/50 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-bold text-slate-700">
                  {filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6">
                        <span className="text-slate-900 font-extrabold">{item.serviceName}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-semibold">
                        {item.usedAt ? new Date(item.usedAt).toLocaleString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "--"}
                      </td>
                      <td className="py-4 px-6">
                        {item.roomNumber && item.roomNumber !== "--" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700">
                            Phòng {item.roomNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium italic">Mua lẻ</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        {new Intl.NumberFormat("vi-VN").format(item.unitPrice)}đ
                      </td>
                      <td className="py-4 px-6 text-slate-800">
                        {item.quantity}
                      </td>
                      <td className="py-4 px-6 text-slate-900 font-black">
                        {new Intl.NumberFormat("vi-VN").format(item.lineTotal)}đ
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-wider ${
                          item.paymentStatus === "Paid" 
                            ? "bg-emerald-50 text-emerald-700" 
                            : "bg-rose-50 text-rose-700"
                        }`}>
                          {item.paymentStatus === "Paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {item.paymentStatus === "Unpaid" && (
                          <button
                            onClick={() => {
                              setSelectedUsage(item);
                              setPaymentSuccess(false);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0194f3] px-4 py-2 text-xs font-black text-white hover:bg-[#017bc0] transition active:scale-95 shadow-sm"
                          >
                            <QrCode size={13} />
                            Thanh toán ngay
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards List View */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredHistory.map((item) => (
                <div key={item.id} className="p-5 hover:bg-slate-50/30 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1 min-w-0">
                      <h4 className="font-extrabold text-slate-900 text-sm break-words">{item.serviceName}</h4>
                      <p className="text-[11px] text-slate-400 font-bold">
                        {item.usedAt ? new Date(item.usedAt).toLocaleString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "--"}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.roomNumber && item.roomNumber !== "--" ? (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-black text-blue-700">
                            Phòng {item.roomNumber}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-50 border border-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-400 italic">
                            Mua lẻ
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100/60 px-2.5 py-0.5 rounded-full">
                          SL: {item.quantity}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-slate-400 font-bold">{new Intl.NumberFormat("vi-VN").format(item.unitPrice)}đ</p>
                      <p className="text-sm font-black text-slate-900 mt-0.5">{new Intl.NumberFormat("vi-VN").format(item.lineTotal)}đ</p>
                      <div className="mt-2">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                          item.paymentStatus === "Paid" 
                            ? "bg-emerald-50 text-emerald-700" 
                            : "bg-rose-50 text-rose-700"
                        }`}>
                          {item.paymentStatus === "Paid" ? "Đã trả" : "Chưa trả"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {item.paymentStatus === "Unpaid" && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setSelectedUsage(item);
                          setPaymentSuccess(false);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#0194f3] py-2.5 text-xs font-black text-white hover:bg-[#017bc0] transition active:scale-95 shadow-sm"
                      >
                        <QrCode size={13} />
                        Thanh toán ngay
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-white border border-slate-100 p-20 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="flex size-16 items-center justify-center rounded-full bg-slate-50 text-slate-300 mb-4">
              <Coffee size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-900">Không tìm thấy yêu cầu dịch vụ nào</h3>
            <p className="mt-2 text-sm font-bold text-slate-400 max-w-xs">
              Bạn chưa sử dụng hoặc đặt dịch vụ nào của khách sạn trên tài khoản này.
            </p>
          </div>
        )}

      </div>

      {/* Standalone payment QR modal */}
      {selectedUsage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 md:p-8 shadow-2xl ring-1 ring-slate-100 flex flex-col items-center text-center my-8 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedUsage(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            >
              <X size={20} />
            </button>

            {paymentSuccess ? (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4 animate-bounce">
                  <Check size={28} strokeWidth={3} />
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-2">Thanh toán hoàn tất!</h4>
                <p className="text-xs font-bold text-slate-400 max-w-xs mb-6">
                  Cảm ơn bạn đã thực hiện thanh toán trực tuyến. Hoá đơn dịch vụ này đã được cập nhật thành Đã thanh toán.
                </p>
                <button
                  onClick={() => setSelectedUsage(null)}
                  className="rounded-2xl bg-[#0194f3] px-8 py-3 text-sm font-black text-white hover:bg-[#017bc0] active:scale-95 transition"
                >
                  Tuyệt vời
                </button>
              </div>
            ) : (
              <div className="space-y-6 w-full">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Quét mã thanh toán</h3>
                  <p className="text-xs font-bold text-slate-400 mt-1">Dịch vụ: <span className="text-slate-800">{selectedUsage.serviceName}</span></p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0194f3]/5 border border-[#0194f3]/10 flex flex-col items-center text-center">
                  <p className="text-xs font-black text-slate-800 uppercase tracking-wider">Thanh toán qua VietQR</p>
                  
                  <div className="relative mt-4 size-48 rounded-2xl bg-white p-2 border border-slate-100 shadow-md overflow-hidden flex items-center justify-center">
                    <img 
                      src={`https://qr.sepay.vn/img?acc=96247GXSXM&bank=BIDV&amount=${selectedUsage.lineTotal}&des=${encodeURIComponent('THANHTOANDV' + selectedUsage.id)}`}
                      alt="SePay QR Code" 
                      className="h-full w-full object-contain"
                    />
                  </div>
                  
                  <div className="mt-4 flex flex-col items-center gap-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                      <Loader2 className="size-3.5 animate-spin text-[#0194f3]" />
                      <span>Đang chờ chuyển khoản...</span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">Số tiền: {new Intl.NumberFormat("vi-VN").format(selectedUsage.lineTotal)}đ</span>
                  </div>
                </div>

                <button
                  onClick={handleSimulatePayment}
                  disabled={isConfirmingPayment}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#0194f3] py-4 text-sm font-black text-white shadow-lg shadow-[#0194f3]/25 hover:bg-[#017bc0] active:scale-95 transition-all"
                >
                  {isConfirmingPayment ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Đang xác nhận...</span>
                    </>
                  ) : (
                    <span>Tôi đã chuyển khoản thành công</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceHistoryPage;
