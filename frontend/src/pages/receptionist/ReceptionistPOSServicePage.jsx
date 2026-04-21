import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, History, Pencil, Plus, Receipt, Search, Trash2, Wrench } from "lucide-react";
import { servicesApi } from "../../api/admin/servicesApi";
import { hasPermission } from "../../utils/permissions";
import { formatVietnamDate, formatVietnamDateTime } from "../../utils/vietnamTime";

const currencyFormatter = new Intl.NumberFormat("vi-VN");

const formatCurrency = (value) => `${currencyFormatter.format(Number(value || 0))} đ`;

const tabs = [
  { id: "apply", label: "Áp dụng", icon: ClipboardList },
  { id: "services", label: "Dịch vụ", icon: Wrench },
  { id: "history", label: "Lịch sử", icon: History },
];

const emptyServiceForm = {
  id: null,
  name: "",
  price: "",
  unit: "",
  status: true,
};

const ReceptionistPOSServicePage = () => {
  const queryClient = useQueryClient();
  const canCreateService = hasPermission("CREATE_SERVICES");
  const canEditService = hasPermission("EDIT_SERVICES");
  const canDeleteService = hasPermission("DELETE_SERVICES");
  const [activeTab, setActiveTab] = useState("apply");
  const [notice, setNotice] = useState(null);
  const [applyForm, setApplyForm] = useState({
    bookingDetailId: "",
    serviceId: "",
    quantity: 1,
  });
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [historyFilter, setHistoryFilter] = useState({
    paymentStatus: "all",
    search: "",
  });

  const servicesQuery = useQuery({
    queryKey: ["services", "management"],
    queryFn: () => servicesApi.getServices({ includeInactive: true }),
  });

  const activeServicesQuery = useQuery({
    queryKey: ["services", "active"],
    queryFn: () => servicesApi.getServices({ includeInactive: false }),
  });

  const inHouseRoomsQuery = useQuery({
    queryKey: ["service-in-house"],
    queryFn: () => servicesApi.getInHouseRooms(),
  });

  const historyQuery = useQuery({
    queryKey: ["service-history", historyFilter.paymentStatus, historyFilter.search],
    queryFn: () =>
      servicesApi.getUsageHistory({
        paymentStatus: historyFilter.paymentStatus === "all" ? undefined : historyFilter.paymentStatus,
        search: historyFilter.search.trim() || undefined,
      }),
  });

  const applyServiceMutation = useMutation({
    mutationFn: (payload) => servicesApi.applyService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-history"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setApplyForm((current) => ({ ...current, serviceId: "", quantity: 1 }));
      setNotice({ type: "success", message: "Đã áp dụng dịch vụ cho phòng đang lưu trú." });
    },
    onError: (error) => {
      setNotice({ type: "error", message: error?.response?.data || "Không thể áp dụng dịch vụ." });
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: (payload) => servicesApi.createService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setServiceForm(emptyServiceForm);
      setNotice({ type: "success", message: "Đã tạo dịch vụ mới." });
    },
    onError: (error) => {
      setNotice({ type: "error", message: error?.response?.data || "Không thể tạo dịch vụ." });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, payload }) => servicesApi.updateService(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setServiceForm(emptyServiceForm);
      setNotice({ type: "success", message: "Đã cập nhật dịch vụ." });
    },
    onError: (error) => {
      setNotice({ type: "error", message: error?.response?.data || "Không thể cập nhật dịch vụ." });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id) => servicesApi.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setNotice({ type: "success", message: "Dịch vụ đã được ngừng sử dụng." });
    },
    onError: (error) => {
      setNotice({ type: "error", message: error?.response?.data || "Không thể xoá dịch vụ." });
    },
  });

  const inHouseRooms = useMemo(() => inHouseRoomsQuery.data || [], [inHouseRoomsQuery.data]);
  const activeServices = useMemo(() => activeServicesQuery.data || [], [activeServicesQuery.data]);
  const services = useMemo(() => servicesQuery.data || [], [servicesQuery.data]);
  const historyItems = useMemo(() => historyQuery.data || [], [historyQuery.data]);
  const unpaidCount = historyItems.filter((item) => item.paymentStatus === "Unpaid").length;
  const paidCount = historyItems.filter((item) => item.paymentStatus === "Paid").length;

  const handleApplySubmit = (event) => {
    event.preventDefault();

    if (!applyForm.bookingDetailId || !applyForm.serviceId || Number(applyForm.quantity) <= 0) {
      setNotice({ type: "error", message: "Vui lòng chọn phòng, dịch vụ và số lượng hợp lệ." });
      return;
    }

    applyServiceMutation.mutate({
      bookingDetailId: Number(applyForm.bookingDetailId),
      serviceId: Number(applyForm.serviceId),
      quantity: Number(applyForm.quantity),
    });
  };

  const handleServiceSubmit = (event) => {
    event.preventDefault();

    if (!serviceForm.name.trim() || Number(serviceForm.price) < 0) {
      setNotice({ type: "error", message: "Tên dịch vụ và giá tiền chưa hợp lệ." });
      return;
    }

    const payload = {
      name: serviceForm.name.trim(),
      price: Number(serviceForm.price),
      unit: serviceForm.unit.trim() || null,
      status: serviceForm.status,
    };

    if (serviceForm.id) {
      updateServiceMutation.mutate({ id: serviceForm.id, payload });
      return;
    }

    createServiceMutation.mutate(payload);
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Dịch vụ phòng</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Áp dụng dịch vụ cho phòng đang lưu trú, quản lý danh sách dịch vụ và theo dõi lịch sử sử dụng.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.5rem] bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Phòng đang lưu trú</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{inHouseRooms.length}</p>
          </div>
          <div className="rounded-[1.5rem] bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Chưa thanh toán</p>
            <p className="mt-2 text-2xl font-black text-amber-600">{unpaidCount}</p>
          </div>
          <div className="rounded-[1.5rem] bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Đã thanh toán</p>
            <p className="mt-2 text-2xl font-black text-emerald-600">{paidCount}</p>
          </div>
        </div>
      </div>

      {notice ? (
        <div
          className={`rounded-[1.5rem] px-4 py-3 text-sm font-semibold ${
            notice.type === "error"
              ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
              : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          }`}
        >
          {notice.message}
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
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_380px]">
          <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Áp dụng dịch vụ</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Chỉ áp dụng cho phòng đang lưu trú</h2>

            <form onSubmit={handleApplySubmit} className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-700">Chọn phòng</span>
                <select
                  value={applyForm.bookingDetailId}
                  onChange={(event) => setApplyForm((current) => ({ ...current, bookingDetailId: event.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400"
                >
                  <option value="">Danh sách phòng đang lưu trú</option>
                  {inHouseRooms.map((room) => (
                    <option key={room.bookingDetailId} value={room.bookingDetailId}>
                      Phòng {room.roomNumber} - {room.guestName} - {room.bookingCode}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-700">Chọn dịch vụ</span>
                <select
                  value={applyForm.serviceId}
                  onChange={(event) => setApplyForm((current) => ({ ...current, serviceId: event.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400"
                >
                  <option value="">Danh sách dịch vụ đang hoạt động</option>
                  {activeServices.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {formatCurrency(service.price)}
                      {service.unit ? ` / ${service.unit}` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-700">Nhập số lượng</span>
                <input
                  type="number"
                  min="1"
                  value={applyForm.quantity}
                  onChange={(event) => setApplyForm((current) => ({ ...current, quantity: event.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400"
                />
              </label>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-black text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
                disabled={applyServiceMutation.isPending || !canCreateService}
              >
                <Plus size={16} />
                {applyServiceMutation.isPending ? "Đang áp dụng..." : "Áp dụng dịch vụ"}
              </button>
            </form>
          </section>

          <aside className="rounded-[2rem] bg-gradient-to-br from-slate-900 via-sky-900 to-cyan-700 p-6 text-white shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">Danh sách phòng đang lưu trú</p>
            <div className="mt-4 space-y-3">
              {inHouseRoomsQuery.isLoading ? (
                <div className="rounded-[1.5rem] bg-white/10 px-4 py-5 text-sm text-white/80">Đang tải danh sách phòng...</div>
              ) : inHouseRooms.length === 0 ? (
                <div className="rounded-[1.5rem] bg-white/10 px-4 py-5 text-sm text-white/80">Hiện chưa có phòng đang lưu trú.</div>
              ) : (
                inHouseRooms.map((room) => (
                  <div key={room.bookingDetailId} className="rounded-[1.5rem] bg-white/10 px-4 py-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-lg font-black">Phòng {room.roomNumber}</p>
                      <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-100">CheckedIn</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-white/85">{room.guestName}</p>
                    <p className="mt-1 text-xs font-medium text-white/70">{room.bookingCode} • {room.roomName}</p>
                    <p className="mt-2 text-xs font-medium text-white/70">
                      {formatVietnamDate(room.checkInDate)} - {formatVietnamDate(room.checkOutDate)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      ) : null}

      {activeTab === "services" ? (
        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Quản lý dịch vụ</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">
              {serviceForm.id ? "Chỉnh sửa dịch vụ" : "Tạo dịch vụ mới"}
            </h2>

            <form onSubmit={handleServiceSubmit} className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-700">Tên dịch vụ</span>
                <input
                  value={serviceForm.name}
                  onChange={(event) => setServiceForm((current) => ({ ...current, name: event.target.value }))}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400"
                  placeholder="Ví dụ: Ăn sáng buffet"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-700">Giá</span>
                <input
                  type="number"
                  min="0"
                  value={serviceForm.price}
                  onChange={(event) => setServiceForm((current) => ({ ...current, price: event.target.value }))}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-700">Đơn vị</span>
                <input
                  value={serviceForm.unit}
                  onChange={(event) => setServiceForm((current) => ({ ...current, unit: event.target.value }))}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400"
                  placeholder="suất, lần, kg..."
                />
              </label>

              <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={serviceForm.status}
                  onChange={(event) => setServiceForm((current) => ({ ...current, status: event.target.checked }))}
                />
                <span className="text-sm font-semibold text-slate-700">Đang hoạt động</span>
              </label>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={serviceForm.id ? !canEditService : !canCreateService}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-black text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
                >
                  <Plus size={16} />
                  {serviceForm.id ? "Lưu thay đổi" : "Tạo dịch vụ"}
                </button>
                {serviceForm.id ? (
                  <button
                    type="button"
                    onClick={() => setServiceForm(emptyServiceForm)}
                    className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
                  >
                    Huỷ
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Danh sách dịch vụ</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">{services.length} dịch vụ hiện có</h2>

            <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                    <th className="px-5 py-4">Dịch vụ</th>
                    <th className="px-5 py-4">Giá</th>
                    <th className="px-5 py-4">Trạng thái</th>
                    <th className="px-5 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {services.map((service) => (
                    <tr key={service.id}>
                      <td className="px-5 py-4">
                        <p className="font-black text-slate-900">{service.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{service.unit || "Không có đơn vị"}</p>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-900">{formatCurrency(service.price)}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                            service.status
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                              : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                          }`}
                        >
                          {service.status ? "Đang hoạt động" : "Ngừng sử dụng"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {canEditService ? (
                            <button
                              type="button"
                              onClick={() =>
                                setServiceForm({
                                  id: service.id,
                                  name: service.name,
                                  price: String(service.price),
                                  unit: service.unit || "",
                                  status: service.status,
                                })
                              }
                              className="inline-flex items-center gap-2 rounded-2xl bg-sky-100 px-4 py-2.5 text-sm font-bold text-sky-700 transition hover:bg-sky-200"
                            >
                              <Pencil size={16} />
                              Sửa
                            </button>
                          ) : null}
                          {canDeleteService ? (
                            <button
                              type="button"
                              onClick={() => deleteServiceMutation.mutate(service.id)}
                              className="inline-flex items-center gap-2 rounded-2xl bg-rose-100 px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-200"
                            >
                              <Trash2 size={16} />
                              Xoá
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === "history" ? (
        <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="mt-2 text-2xl font-black text-slate-900">Lịch sử</h2>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={historyFilter.search}
                  onChange={(event) => setHistoryFilter((current) => ({ ...current, search: event.target.value }))}
                  placeholder="Tìm phòng, khách, booking, dịch vụ..."
                  className="w-72 rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-400"
                />
              </div>

              <select
                value={historyFilter.paymentStatus}
                onChange={(event) => setHistoryFilter((current) => ({ ...current, paymentStatus: event.target.value }))}
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
                  <th className="px-4 py-4">Tên dịch vụ</th>
                  <th className="px-4 py-4">Số lượng</th>
                  <th className="px-4 py-4">Giá</th>
                  <th className="px-4 py-4">Thời gian sử dụng</th>
                  <th className="px-4 py-4">Trạng thái thanh toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {historyQuery.isLoading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-10 text-center text-sm text-slate-500">
                      Đang tải lịch sử dịch vụ...
                    </td>
                  </tr>
                ) : historyItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-10 text-center text-sm text-slate-500">
                      Chưa có lịch sử dịch vụ phù hợp.
                    </td>
                  </tr>
                ) : (
                  historyItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4">
                        <p className="font-black text-slate-900">Phòng {item.roomNumber}</p>
                        <p className="mt-1 text-sm text-slate-500">{item.guestName} • {item.bookingCode}</p>
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
                      <td className="px-4 py-4 text-sm font-medium text-slate-600">{formatVietnamDateTime(item.usedAt)}</td>
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

export default ReceptionistPOSServicePage;
