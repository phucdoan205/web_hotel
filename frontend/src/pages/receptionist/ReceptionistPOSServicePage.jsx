import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, History, Layers, MoreVertical, Pencil, Plus, Search, Trash2, Wrench, X, CheckCircle2, AlertCircle } from "lucide-react";
import { servicesApi } from "../../api/admin/servicesApi";
import { hasPermission } from "../../utils/permissions";
import { formatVietnamDate, formatVietnamDateTime } from "../../utils/vietnamTime";

const currencyFormatter = new Intl.NumberFormat("vi-VN");

const formatCurrency = (value) => `${currencyFormatter.format(Number(value || 0))} đ`;

const tabs = [
  { id: "apply", label: "Áp dụng", icon: ClipboardList },
  { id: "services", label: "Dịch vụ", icon: Wrench },
  { id: "categories", label: "Nhóm dịch vụ", icon: Layers },
  { id: "history", label: "Lịch sử", icon: History },
];

const emptyServiceForm = {
  id: null,
  categoryId: "",
  name: "",
  price: "",
  unit: "",
  status: true,
};

const emptyCategoryForm = {
  id: null,
  name: "",
  status: true,
};

const ServiceFormOverlay = ({
  serviceForm,
  setServiceForm,
  categories = [],
  onClose,
  onSubmit,
  canSubmit,
  isSubmitting,
}) => (
  <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
    <div className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Quản lý dịch vụ</p>
          <h2 className="mt-2 text-2xl font-black text-slate-900">
            {serviceForm.id ? "Chỉnh sửa dịch vụ" : "Tạo dịch vụ mới"}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl bg-slate-100 p-3 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
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
          <span className="text-sm font-bold text-slate-700">Nhóm dịch vụ</span>
          <select
            value={serviceForm.categoryId || ""}
            onChange={(event) => setServiceForm((current) => ({ ...current, categoryId: event.target.value }))}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400"
          >
            <option value="">Chọn nhóm dịch vụ (nếu có)</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
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

        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm font-bold text-slate-700">Đơn vị</span>
          <input
            value={serviceForm.unit}
            onChange={(event) => setServiceForm((current) => ({ ...current, unit: event.target.value }))}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400"
            placeholder="suất, lần, kg..."
          />
        </label>

        <div className="flex gap-3 md:col-span-2">
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-black text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
          >
            <Plus size={16} />
            {isSubmitting ? "Đang lưu..." : serviceForm.id ? "Lưu thay đổi" : "Tạo dịch vụ"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  </div>
);

const StatusToggle = ({ status, onToggle, isPending }) => (
  <button
    type="button"
    onClick={onToggle}
    disabled={isPending}
    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
      status ? "bg-sky-600" : "bg-slate-200"
    } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
        status ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);

const Notice = ({ type, message, onBlur }) => {
  useEffect(() => {
    const timer = setTimeout(onBlur, 3000);
    return () => clearTimeout(timer);
  }, [message, onBlur]);

  return (
    <div
      className={`fixed top-8 left-1/2 -translate-x-1/2 z-[200] min-w-[320px] max-w-md rounded-[1.5rem] px-6 py-4 text-center text-sm font-bold shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-8 duration-500 ${
        type === "success" 
          ? "bg-white/95 text-emerald-600 ring-1 ring-emerald-100" 
          : "bg-white/95 text-rose-600 ring-1 ring-rose-100"
      }`}
    >
      <div className="flex items-center justify-center gap-3">
        {type === "success" ? (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <AlertCircle className="h-4 w-4" />
          </div>
        )}
        <span className="flex-1 text-left">{message}</span>
      </div>
    </div>
  );
};

const CategoryFormOverlay = ({ categoryForm, setCategoryForm, onClose, onSubmit, canSubmit, isSubmitting }) => (
  <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
    <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Quản lý nhóm dịch vụ</p>
          <h2 className="mt-2 text-2xl font-black text-slate-900">
            {categoryForm.id ? "Chỉnh sửa nhóm dịch vụ" : "Tạo nhóm dịch vụ mới"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl bg-slate-100 p-3 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-bold text-slate-700">Tên nhóm dịch vụ</span>
          <input
            value={categoryForm.name}
            onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400"
            placeholder="Ví dụ: Chuyển phát, Ăn uống..."
          />
        </label>

        <div className="mt-2 flex gap-3">
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-black text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
          >
            <Plus size={16} />
            {isSubmitting ? "Đang lưu..." : categoryForm.id ? "Lưu thay đổi" : "Tạo nhóm"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  </div>
);

const ActionMenu = ({ onEdit, onDelete, canEdit, canDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex justify-end">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-xl bg-slate-50 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-full top-0 z-50 mr-2 min-w-[140px] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  onEdit();
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-slate-700 transition hover:bg-sky-50 hover:text-sky-700"
              >
                <Pencil size={14} />
                Sửa
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete();
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
              >
                <Trash2 size={14} />
                Xóa
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const ReceptionistPOSServicePage = () => {
  const queryClient = useQueryClient();
  const canCreateService = hasPermission("CREATE_SERVICES");
  const canEditService = hasPermission("EDIT_SERVICES");
  const canDeleteService = hasPermission("DELETE_SERVICES");

  const [activeTab, setActiveTab] = useState("apply");
  const [notice, setNotice] = useState(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [applyForm, setApplyForm] = useState({
    bookingDetailId: "",
    serviceId: "",
    quantity: 1,
  });
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [historyFilter, setHistoryFilter] = useState({
    paymentStatus: "all",
    search: "",
    date: "",
  });

  const servicesQuery = useQuery({
    queryKey: ["services", "management"],
    queryFn: () => servicesApi.getServices({ includeInactive: true }),
  });

  const categoriesQuery = useQuery({
    queryKey: ["service-categories"],
    queryFn: () => servicesApi.getServiceCategories(),
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
      setShowServiceForm(false);
      setNotice({ type: "success", message: "Đã tạo dịch vụ mới." });
    },
    onError: (error) => {
      setNotice({ type: "error", message: error?.response?.data || "Không thể tạo dịch vụ." });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, payload }) => servicesApi.updateService(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      if (!variables.isToggle) {
        setNotice({ type: "success", message: "Đã cập nhật dịch vụ." });
      }
      setServiceForm(emptyServiceForm);
      setShowServiceForm(false);
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
      setNotice({ type: "error", message: error?.response?.data || "Không thể xóa dịch vụ." });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (payload) => servicesApi.createServiceCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
      setCategoryForm(emptyCategoryForm);
      setShowCategoryForm(false);
      setNotice({ type: "success", message: "Đã tạo nhóm dịch vụ mới." });
    },
    onError: (error) => {
      setNotice({ type: "error", message: error?.response?.data || "Không thể tạo nhóm dịch vụ." });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, payload }) => servicesApi.updateServiceCategory(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
      if (!variables.isToggle) {
        setNotice({ type: "success", message: "Đã cập nhật nhóm dịch vụ." });
      }
      setCategoryForm(emptyCategoryForm);
      setShowCategoryForm(false);
    },
    onError: (error) => {
      setNotice({ type: "error", message: error?.response?.data || "Không thể cập nhật nhóm dịch vụ." });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => servicesApi.deleteServiceCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
      setNotice({ type: "success", message: "Nhóm dịch vụ đã được xóa." });
    },
    onError: (error) => {
      setNotice({ type: "error", message: error?.response?.data || "Không thể xóa nhóm dịch vụ." });
    },
  });

  const inHouseRooms = useMemo(() => inHouseRoomsQuery.data || [], [inHouseRoomsQuery.data]);
  const activeServices = useMemo(() => activeServicesQuery.data || [], [activeServicesQuery.data]);
  const services = useMemo(() => servicesQuery.data || [], [servicesQuery.data]);
  const categories = useMemo(() => categoriesQuery.data || [], [categoriesQuery.data]);
  const historyItems = useMemo(() => historyQuery.data || [], [historyQuery.data]);

  const filteredServices = useMemo(() => {
    const normalizedSearch = serviceSearch.trim().toLowerCase();
    let result = services;

    if (normalizedSearch) {
      result = services.filter((service) =>
        [service.name, service.unit, service.categoryName, service.status ? "đang hoạt động" : "ngừng sử dụng"]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedSearch)),
      );
    }

    return result.sort((a, b) => a.id - b.id).slice(0, 10);
  }, [serviceSearch, services]);

  const filteredCategories = useMemo(() => {
    const normalizedSearch = categorySearch.trim().toLowerCase();
    let result = categories;

    if (normalizedSearch) {
      result = categories.filter((cat) =>
        cat.name.toLowerCase().includes(normalizedSearch)
      );
    }

    return result.sort((a, b) => a.id - b.id).slice(0, 10);
  }, [categorySearch, categories]);

  const filteredHistoryItems = useMemo(() => {
    const result = historyItems.filter((item) => {
      const usedDate = item.usedAt ? String(item.usedAt).slice(0, 10) : "";

      if (historyFilter.date && usedDate !== historyFilter.date) {
        return false;
      }

      return true;
    });

    return result.sort((a, b) => new Date(b.usedAt) - new Date(a.usedAt)).slice(0, 10);
  }, [historyItems, historyFilter.date]);

  const handleClearHistoryFilter = () => {
    setHistoryFilter({
      paymentStatus: "all",
      search: "",
      date: "",
    });
  };

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
      categoryId: serviceForm.categoryId ? Number(serviceForm.categoryId) : null,
      name: serviceForm.name.trim(),
      price: Number(serviceForm.price),
      unit: serviceForm.unit.trim() || null,
      status: serviceForm.id ? serviceForm.status : true,
    };

    if (serviceForm.id) {
      updateServiceMutation.mutate({ id: serviceForm.id, payload });
      return;
    }

    createServiceMutation.mutate(payload);
  };

  const handleOpenCreateForm = () => {
    setServiceForm(emptyServiceForm);
    setShowServiceForm(true);
  };

  const handleOpenEditForm = (service) => {
    setServiceForm({
      id: service.id,
      categoryId: service.categoryId || "",
      name: service.name,
      price: String(service.price),
      unit: service.unit || "",
      status: service.status,
    });
    setShowServiceForm(true);
  };

  const handleCategorySubmit = (event) => {
    event.preventDefault();

    if (!categoryForm.name.trim()) {
      setNotice({ type: "error", message: "Tên nhóm dịch vụ là bắt buộc." });
      return;
    }

    const payload = {
      name: categoryForm.name.trim(),
      status: categoryForm.id ? categoryForm.status : true,
    };

    if (categoryForm.id) {
      updateCategoryMutation.mutate({ id: categoryForm.id, payload });
      return;
    }

    createCategoryMutation.mutate(payload);
  };

  const handleOpenCategoryCreateForm = () => {
    setCategoryForm(emptyCategoryForm);
    setShowCategoryForm(true);
  };

  const handleOpenCategoryEditForm = (cat) => {
    setCategoryForm({
      id: cat.id,
      name: cat.name,
      status: cat.status,
    });
    setShowCategoryForm(true);
  };

  const handleCloseServiceForm = () => {
    setServiceForm(emptyServiceForm);
    setShowServiceForm(false);
  };

  return (
    <>
      <div className="space-y-6 p-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Dịch vụ phòng</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Áp dụng dịch vụ cho phòng đang lưu trú, quản lý danh sách dịch vụ và theo dõi lịch sử sử dụng.
          </p>
        </div>

        {notice && <Notice type={notice.type} message={notice.message} onBlur={() => setNotice(null)} />}

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
            <section>
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
                  disabled={applyServiceMutation.isPending || !canCreateService}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-black text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
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
                        <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-100">
                          CheckedIn
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-white/85">{room.guestName}</p>
                      <p className="mt-1 text-xs font-medium text-white/70">
                        {room.bookingCode} • {room.roomName}
                      </p>
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
          <section>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Danh sách dịch vụ</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={serviceSearch}
                    onChange={(event) => setServiceSearch(event.target.value)}
                    placeholder="Tìm tên dịch vụ, đơn vị..."
                    className="w-72 rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-400"
                  />
                </div>

                {canCreateService ? (
                  <button
                    type="button"
                    onClick={handleOpenCreateForm}
                    className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-black text-white transition hover:bg-sky-700"
                  >
                    <Plus size={16} />
                    Tạo dịch vụ
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-6">
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
                  {filteredServices.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-5 py-10 text-center text-sm text-slate-500">
                        Không tìm thấy dịch vụ phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredServices.map((service) => (
                      <tr key={service.id}>
                        <td className="px-5 py-4">
                          <p className="font-black text-slate-900">{service.name}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {service.categoryName || "Không có nhóm"} • {service.unit || "Không có đơn vị"}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-slate-900">{formatCurrency(service.price)}</td>
                        <td className="px-5 py-4">
                          <StatusToggle
                            status={service.status}
                            isPending={updateServiceMutation.isPending}
                            onToggle={() => {
                              const payload = {
                                categoryId: service.categoryId,
                                name: service.name,
                                price: service.price,
                                unit: service.unit,
                                status: !service.status,
                              };
                              updateServiceMutation.mutate({ id: service.id, payload, isToggle: true });
                            }}
                          />
                        </td>
                        <td className="px-5 py-4">
                          <ActionMenu
                            canEdit={canEditService}
                            canDelete={canDeleteService}
                            onEdit={() => handleOpenEditForm(service)}
                            onDelete={() => deleteServiceMutation.mutate(service.id)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {activeTab === "categories" ? (
          <section>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Quản lý nhóm dịch vụ</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={categorySearch}
                    onChange={(event) => setCategorySearch(event.target.value)}
                    placeholder="Tìm tên nhóm..."
                    className="w-64 rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-400"
                  />
                </div>

                {canCreateService ? (
                  <button
                    type="button"
                    onClick={handleOpenCategoryCreateForm}
                    className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-black text-white transition hover:bg-sky-700"
                  >
                    <Plus size={16} />
                    Tạo nhóm mới
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-6">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                    <th className="px-5 py-4">Tên nhóm</th>
                    <th className="px-5 py-4">Trạng thái</th>
                    <th className="px-5 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {categoriesQuery.isLoading ? (
                    <tr>
                      <td colSpan="3" className="px-5 py-10 text-center text-sm text-slate-500">
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  ) : filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-5 py-10 text-center text-sm text-slate-500">
                        Không tìm thấy nhóm dịch vụ nào.
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((cat) => (
                      <tr key={cat.id}>
                        <td className="px-5 py-4 font-black text-slate-900">{cat.name}</td>
                        <td className="px-5 py-4">
                          <StatusToggle
                            status={cat.status}
                            isPending={updateCategoryMutation.isPending}
                            onToggle={() => {
                              const payload = {
                                name: cat.name,
                                status: !cat.status,
                              };
                              updateCategoryMutation.mutate({ id: cat.id, payload, isToggle: true });
                            }}
                          />
                        </td>
                        <td className="px-5 py-4">
                          <ActionMenu
                            canEdit={canEditService}
                            canDelete={canDeleteService}
                            onEdit={() => handleOpenCategoryEditForm(cat)}
                            onDelete={() => deleteCategoryMutation.mutate(cat.id)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {activeTab === "history" ? (
          <section>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Lịch sử dịch vụ</p>
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
                    placeholder="Tìm phòng, khách, booking, dịch vụ..."
                    className="w-72 rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-400"
                  />
                </div>

                <input
                  type="date"
                  value={historyFilter.date}
                  onChange={(event) =>
                    setHistoryFilter((current) => ({
                      ...current,
                      date: event.target.value,
                    }))
                  }
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-sky-400"
                />

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

                <button
                  type="button"
                  onClick={handleClearHistoryFilter}
                  className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
                >
                  Clear filter
                </button>
              </div>
            </div>

            <div className="mt-6">
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
                  ) : filteredHistoryItems.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-10 text-center text-sm text-slate-500">
                        Chưa có lịch sử dịch vụ phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredHistoryItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-4">
                          <p className="font-black text-slate-900">Phòng {item.roomNumber}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {item.guestName} • {item.bookingCode}
                          </p>
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

      {showServiceForm ? (
        <ServiceFormOverlay
          serviceForm={serviceForm}
          setServiceForm={setServiceForm}
          categories={categories}
          onClose={handleCloseServiceForm}
          onSubmit={handleServiceSubmit}
          canSubmit={serviceForm.id ? canEditService : canCreateService}
          isSubmitting={createServiceMutation.isPending || updateServiceMutation.isPending}
        />
      ) : null}

      {showCategoryForm ? (
        <CategoryFormOverlay
          categoryForm={categoryForm}
          setCategoryForm={setCategoryForm}
          onClose={() => setShowCategoryForm(false)}
          onSubmit={handleCategorySubmit}
          canSubmit={categoryForm.id ? canEditService : canCreateService}
          isSubmitting={createCategoryMutation.isPending || updateCategoryMutation.isPending}
        />
      ) : null}
    </>
  );
};

export default ReceptionistPOSServicePage;
