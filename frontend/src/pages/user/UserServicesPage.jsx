import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ClipboardList, History, Plus, Search, ShoppingBag, XCircle } from "lucide-react";
import userServicesApi from "../../api/user/servicesApi";
import { formatVietnamDate, formatVietnamDateTime } from "../../utils/vietnamTime";
import { getUserBookingStatusClassName, getUserBookingStatusLabel } from "../../utils/userBookingStatus";

const currencyFormatter = new Intl.NumberFormat("vi-VN");

const formatCurrency = (value) => `${currencyFormatter.format(Number(value || 0))} đ`;

const getErrorMessage = (error, fallbackMessage) => {
  const responseData = error?.response?.data;
  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }
  if (typeof responseData?.message === "string" && responseData.message.trim()) {
    return responseData.message;
  }
  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }
  return fallbackMessage;
};

const tabs = [
  { id: "apply", label: "Đặt dịch vụ", icon: ClipboardList },
  { id: "history", label: "Lịch sử dịch vụ", icon: History },
];

const UserServicesPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("apply");
  const [notice, setNotice] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [applyForm, setApplyForm] = useState({
    serviceId: "",
    quantity: 1,
  });
  const [historyFilter, setHistoryFilter] = useState({
    paymentStatus: "all",
    search: "",
  });

  useEffect(() => {
    if (!notice) return undefined;

    const timer = window.setTimeout(() => {
      setNotice(null);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [notice]);

  const bookedRoomsQuery = useQuery({
    queryKey: ["user-service-booked-rooms"],
    queryFn: () => userServicesApi.getBookedRooms(),
  });

  const servicesQuery = useQuery({
    queryKey: ["user-service-catalog"],
    queryFn: () => userServicesApi.getServices(),
  });

  const historyQuery = useQuery({
    queryKey: ["user-service-history", historyFilter.paymentStatus, historyFilter.search, selectedRoomId],
    queryFn: () =>
      userServicesApi.getUsageHistory({
        bookingDetailId: selectedRoomId || undefined,
        paymentStatus: historyFilter.paymentStatus === "all" ? undefined : historyFilter.paymentStatus,
        search: historyFilter.search.trim() || undefined,
      }),
  });

  const applyServiceMutation = useMutation({
    mutationFn: (payload) => userServicesApi.applyService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-service-history"] });
      setApplyForm({ serviceId: "", quantity: 1 });
      setNotice({ type: "success", message: "Đã áp dụng dịch vụ thành công." });
      setActiveTab("history");
    },
    onError: (error) => {
      setNotice({
        type: "error",
        message: getErrorMessage(error, "Không thể áp dụng dịch vụ."),
      });
    },
  });

  const bookedRooms = useMemo(() => bookedRoomsQuery.data || [], [bookedRoomsQuery.data]);
  const services = useMemo(() => servicesQuery.data || [], [servicesQuery.data]);
  const historyItems = useMemo(() => historyQuery.data || [], [historyQuery.data]);

  const selectedRoom = useMemo(
    () => bookedRooms.find((room) => room.bookingDetailId === selectedRoomId) || bookedRooms[0] || null,
    [bookedRooms, selectedRoomId],
  );

  const canApplyService = selectedRoom?.detailStatus === "CheckedIn";

  const filteredHistoryItems = useMemo(() => historyItems, [historyItems]);

  const handleApplySubmit = (event) => {
    event.preventDefault();

    const targetRoom = selectedRoom;
    if (!targetRoom?.bookingDetailId) {
      setNotice({ type: "error", message: "Vui lòng chọn phòng cần áp dụng dịch vụ." });
      return;
    }

    if (!canApplyService) {
      setNotice({ type: "error", message: "Chỉ có thể đặt dịch vụ khi phòng đã nhận phòng." });
      return;
    }

    if (!applyForm.serviceId || Number(applyForm.quantity) <= 0) {
      setNotice({ type: "error", message: "Vui lòng chọn dịch vụ và số lượng hợp lệ." });
      return;
    }

    applyServiceMutation.mutate({
      bookingDetailId: targetRoom.bookingDetailId,
      serviceId: Number(applyForm.serviceId),
      quantity: Number(applyForm.quantity),
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10">
      <div className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">User / Dịch vụ</p>
        <h1 className="mt-3 text-3xl font-black text-gray-900">Dịch vụ của tôi</h1>
        <p className="mt-2 text-[13px] font-bold text-gray-400">
          Chọn phòng bạn đã đặt để áp dụng dịch vụ, đồng thời theo dõi lịch sử sử dụng dịch vụ.
        </p>
      </div>

      {notice ? (
        <div className="fixed left-1/2 top-24 z-50 w-full max-w-sm -translate-x-1/2 px-4">
          <div
            className={`flex items-start gap-3 rounded-[1.5rem] px-4 py-4 text-sm font-semibold shadow-xl ${
              notice.type === "error"
                ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
            }`}
          >
            {notice.type === "error" ? (
              <XCircle size={18} className="mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            )}
            <div>{notice.message}</div>
          </div>
        </div>
      ) : null}

      <div className="rounded-[2rem] bg-white p-3 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-[1.25rem] px-4 py-3 text-sm font-bold transition ${
                  active ? "bg-sky-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-sky-50 hover:text-sky-700"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "apply" ? (
        <div className="mt-6">
          <section className="space-y-6">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                  <ShoppingBag size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Phòng đã đặt</h2>
                  <p className="text-sm font-medium text-slate-500">Chọn phòng để dùng dịch vụ</p>
                </div>
              </div>

              {bookedRoomsQuery.isLoading ? (
                <div className="rounded-[1.5rem] bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                  Đang tải danh sách phòng...
                </div>
              ) : bookedRooms.length === 0 ? (
                <div className="rounded-[1.5rem] bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                  Bạn chưa có phòng nào để sử dụng dịch vụ.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {bookedRooms.map((room) => {
                    const isSelected =
                      room.bookingDetailId === (selectedRoomId || selectedRoom?.bookingDetailId);

                    return (
                      <button
                        key={room.bookingDetailId}
                        type="button"
                        onClick={() => setSelectedRoomId(room.bookingDetailId)}
                        className={`rounded-[1.5rem] border px-5 py-5 text-left transition ${
                          isSelected
                            ? "border-sky-400 bg-sky-50 shadow-sm"
                            : "border-slate-200 bg-white hover:border-sky-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-lg font-black text-slate-900">Phòng {room.roomNumber}</p>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${getUserBookingStatusClassName(
                              room.detailStatus || room.bookingStatus || "Pending",
                            )}`}
                          >
                            {getUserBookingStatusLabel(room.detailStatus || room.bookingStatus || "Pending")}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-bold text-slate-700">{room.roomName}</p>
                        <p className="mt-1 text-xs text-slate-500">{room.bookingCode}</p>
                        <p className="mt-3 text-sm text-slate-500">
                          {formatVietnamDate(room.checkInDate)} - {formatVietnamDate(room.checkOutDate)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Áp dụng dịch vụ</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">
                {selectedRoom ? `Áp dụng cho phòng ${selectedRoom.roomNumber}` : "Chọn phòng trước"}
              </h2>

              <form onSubmit={handleApplySubmit} className="mt-6 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-slate-700">Chọn dịch vụ</span>
                  <select
                    value={applyForm.serviceId}
                    onChange={(event) => setApplyForm((current) => ({ ...current, serviceId: event.target.value }))}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400"
                  >
                    <option value="">Danh sách dịch vụ đang hoạt động</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - {formatCurrency(service.price)}
                        {service.unit ? ` / ${service.unit}` : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-bold text-slate-700">Số lượng</span>
                  <input
                    type="number"
                    min="1"
                    value={applyForm.quantity}
                    onChange={(event) => setApplyForm((current) => ({ ...current, quantity: event.target.value }))}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400"
                  />
                </label>

                {!canApplyService && selectedRoom ? (
                  <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                    Phòng này chưa ở trạng thái đã nhận phòng nên chưa thể áp dụng dịch vụ.
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={applyServiceMutation.isPending || !selectedRoom || !canApplyService}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-black text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
                >
                  <Plus size={16} />
                  {applyServiceMutation.isPending ? "Đang áp dụng..." : "Áp dụng dịch vụ"}
                </button>
              </form>
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === "history" ? (
        <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Lịch sử dịch vụ</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">Lịch sử</h2>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={historyFilter.search}
                  onChange={(event) =>
                    setHistoryFilter((current) => ({
                      ...current,
                      search: event.target.value,
                    }))
                  }
                  placeholder="Tìm phòng, booking, dịch vụ..."
                  className="w-72 rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-400"
                />
              </div>

              <select
                value={historyFilter.paymentStatus}
                onChange={(event) =>
                  setHistoryFilter((current) => ({
                    ...current,
                    paymentStatus: event.target.value,
                  }))
                }
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-sky-400"
              >
                <option value="all">Tất cả</option>
                <option value="unpaid">Chưa thanh toán</option>
                <option value="paid">Đã thanh toán</option>
              </select>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-4 py-4">Phòng</th>
                  <th className="px-4 py-4">Dịch vụ</th>
                  <th className="px-4 py-4">Số lượng</th>
                  <th className="px-4 py-4">Giá</th>
                  <th className="px-4 py-4">Thời gian</th>
                  <th className="px-4 py-4">Thanh toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {historyQuery.isLoading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-10 text-center text-sm text-slate-500">
                      Đang tải lịch sử dịch vụ...
                    </td>
                  </tr>
                ) : filteredHistoryItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-10 text-center text-sm text-slate-500">
                      Chưa có lịch sử dịch vụ nào.
                    </td>
                  </tr>
                ) : (
                  filteredHistoryItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4">
                        <p className="font-black text-slate-900">Phòng {item.roomNumber}</p>
                        <p className="mt-1 text-sm text-slate-500">{item.bookingCode}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-900">{item.serviceName}</p>
                        <p className="mt-1 text-sm text-slate-500">{item.roomName}</p>
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-slate-900">{item.quantity}</td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-bold text-slate-900">{formatCurrency(item.unitPrice)}</p>
                        <p className="mt-1 text-xs text-slate-500">Thành tiền: {formatCurrency(item.lineTotal)}</p>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-600">
                        {formatVietnamDateTime(item.usedAt)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                            item.paymentStatus === "Paid"
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                              : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                          }`}
                        >
                          {item.paymentStatus === "Paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default UserServicesPage;
