import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, History, Layers, MoreVertical, Pencil, Plus, Minus, Search, Trash2, Wrench, X, CheckCircle2, AlertCircle, Image as ImageIcon, ImagePlus, ShoppingCart, Percent, CreditCard, Wallet, QrCode } from "lucide-react";
import { servicesApi } from "../../api/admin/servicesApi";
import { listVouchers } from "../../api/admin/vouchersApi";
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

const emptyCategoryForm = {
  id: null,
  name: "",
  iconUrl: "",
  status: true,
};


const StatusToggle = ({ status, onToggle, isPending }) => (
  <button
    type="button"
    onClick={onToggle}
    disabled={isPending}
    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${status ? "bg-sky-600" : "bg-slate-200"
      } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${status ? "translate-x-5" : "translate-x-0"
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
      className={`fixed top-8 left-1/2 -translate-x-1/2 z-[200] min-w-[320px] max-w-md rounded-[1.5rem] px-6 py-4 text-center text-sm font-bold shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-8 duration-500 ${type === "success"
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
            className="rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400"
            placeholder="Ví dụ: Chuyển phát, Ăn uống..."
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold text-slate-700">Icon (FontAwesome hoặc URL)</span>
          <div className="relative">
            {categoryForm.iconUrl && !categoryForm.iconUrl.startsWith("http") ? (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-600">
                <i className={`${categoryForm.iconUrl.includes("fa-") ? categoryForm.iconUrl : `fa-solid fa-${categoryForm.iconUrl}`} text-sm`} />
              </div>
            ) : (
              <ImageIcon className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            )}
            <input
              value={categoryForm.iconUrl}
              onChange={(event) => setCategoryForm((current) => ({ ...current, iconUrl: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-400"
              placeholder="Ví dụ: coffee, fa-solid fa-utensils..."
            />
          </div>
          <p className="text-[10px] text-slate-400 font-medium ml-1">
            Nhập tên icon từ FontAwesome (vd: utensils) hoặc URL ảnh.
          </p>
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
    <div className="relative ml-auto w-fit">
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
          <div className="absolute right-0 top-full z-50 mt-2 min-w-[140px] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const canCreateService = hasPermission("CREATE_SERVICES");
  const canEditService = hasPermission("EDIT_SERVICES");
  const canDeleteService = hasPermission("DELETE_SERVICES");

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "apply";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [notice, setNotice] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [applyForm, setApplyForm] = useState({
    bookingDetailId: "",
    serviceId: "",
    quantity: 1,
    isPaid: false,
  });
  const [cart, setCart] = useState([]);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);
  const [checkoutIsPaid, setCheckoutIsPaid] = useState(false);
  const [catalogueSearch, setCatalogueSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
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
      setApplyForm((current) => ({ ...current, serviceId: "", quantity: 1, isPaid: false }));
      setCart([]);
      setSelectedVoucherId(null);
      setShowCheckoutModal(false);
      setNotice({ type: "success", message: "Đã áp dụng dịch vụ cho phòng đang lưu trú." });
      setActiveTab("history");
      setSearchParams({ tab: "history" });
    },
    onError: (error) => {
      setNotice({ type: "error", message: error?.response?.data || "Không thể áp dụng dịch vụ." });
    },
  });


  const updateServiceMutation = useMutation({
    mutationFn: ({ id, payload }) => servicesApi.updateService(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      if (!variables.isToggle) {
        setNotice({ type: "success", message: "Đã cập nhật dịch vụ." });
      }
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

  // Cart Helper Actions
  const addToCart = (service) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.serviceId === service.id);
      if (existing) {
        return prev.map((item) =>
          item.serviceId === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          serviceId: service.id,
          name: service.name,
          price: service.price,
          unit: service.unit,
          thumbnailUrl: service.thumbnailUrl,
          quantity: 1,
        },
      ];
    });
  };

  const updateCartQuantity = (serviceId, quantity) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.serviceId !== serviceId));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.serviceId === serviceId ? { ...item, quantity: Number(quantity) } : item
        )
      );
    }
  };

  const removeFromCart = (serviceId) => {
    setCart((prev) => prev.filter((item) => item.serviceId !== serviceId));
  };

  // Catalogue Filters
  const filteredCatalogueServices = useMemo(() => {
    const searchVal = catalogueSearch.trim().toLowerCase();
    return activeServices.filter((s) => {
      const matchesSearch = !searchVal || s.name.toLowerCase().includes(searchVal);
      const matchesCategory =
        selectedCategoryFilter === "all" ||
        Number(s.categoryId) === Number(selectedCategoryFilter);
      return matchesSearch && matchesCategory;
    });
  }, [activeServices, catalogueSearch, selectedCategoryFilter]);

  // Vouchers Query for Service Discounts
  const serviceVouchersQuery = useQuery({
    queryKey: ["vouchers", "service-discount"],
    queryFn: async () => {
      const res = await listVouchers({ includeDeleted: false });
      const raw = Array.isArray(res.data) ? res.data : [];
      const today = new Date();
      return raw.map(v => ({
        id: v.id ?? v.Id,
        code: v.code ?? v.Code,
        name: v.name ?? v.Name,
        discountType: v.discountType ?? v.DiscountType,
        discountValue: Number(v.discountValue ?? v.DiscountValue ?? 0),
        minBookingValue: v.minBookingValue ?? v.MinBookingValue,
        validTo: v.validTo ?? v.ValidTo,
        isActive: v.isActive ?? v.IsActive,
        isDeleted: v.isDeleted ?? v.IsDeleted,
        voucherType: v.voucherType ?? v.VoucherType,
      })).filter(
        (v) =>
          v.isActive &&
          !v.isDeleted &&
          String(v.voucherType || "").toLowerCase() === "service" &&
          (!v.validTo || new Date(v.validTo) >= today)
      );
    },
  });
  const serviceVouchers = serviceVouchersQuery.data || [];

  // Checkout Calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const selectedVoucher = useMemo(() => {
    if (!selectedVoucherId) return null;
    return serviceVouchers.find((v) => Number(v.id) === Number(selectedVoucherId));
  }, [selectedVoucherId, serviceVouchers]);

  const isVoucherValid = useMemo(() => {
    if (!selectedVoucher) return true;
    if (selectedVoucher.minBookingValue && cartSubtotal < selectedVoucher.minBookingValue) {
      return false;
    }
    return true;
  }, [selectedVoucher, cartSubtotal]);

  const cartDiscount = useMemo(() => {
    if (!selectedVoucher || !isVoucherValid) return 0;
    if (String(selectedVoucher.discountType).toUpperCase() === "PERCENT") {
      return cartSubtotal * (selectedVoucher.discountValue / 100);
    }
    return selectedVoucher.discountValue;
  }, [selectedVoucher, isVoucherValid, cartSubtotal]);

  const cartTotal = useMemo(() => {
    const total = cartSubtotal - cartDiscount;
    return total < 0 ? 0 : total;
  }, [cartSubtotal, cartDiscount]);

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
      isPaid: applyForm.isPaid,
    });
  };


  const handleOpenCreateForm = () => {
    navigate("/admin/pos/new");
  };

  const handleOpenEditForm = (service) => {
    navigate(`/admin/pos/${service.id}/edit`);
  };

  const handleCategorySubmit = (event) => {
    event.preventDefault();

    if (!categoryForm.name.trim()) {
      setNotice({ type: "error", message: "Tên nhóm dịch vụ là bắt buộc." });
      return;
    }

    const payload = {
      name: categoryForm.name.trim(),
      iconUrl: categoryForm.iconUrl?.trim() || null,
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
      iconUrl: cat.iconUrl || "",
      status: cat.status,
    });
    setShowCategoryForm(true);
  };


  return (
    <>
      <div className="space-y-6 px-2 py-6">
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
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchParams({ tab: tab.id });
                  }}
                  className={`inline-flex items-center gap-2 rounded-[1.25rem] px-4 py-3 text-sm font-bold transition ${active ? "bg-sky-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-sky-50 hover:text-sky-700"
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
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            {/* Left side: Room selection & Service catalog */}
            <section className="space-y-6">
              <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-slate-700">Chọn phòng đang lưu trú</span>
                    <select
                      value={applyForm.bookingDetailId}
                      onChange={(event) => setApplyForm((current) => ({ ...current, bookingDetailId: event.target.value }))}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 font-bold"
                    >
                      <option value="">-- Danh sách phòng đang lưu trú --</option>
                      {inHouseRooms.map((room) => (
                        <option key={room.bookingDetailId} value={room.bookingDetailId}>
                          Phòng {room.roomNumber} - {room.guestName} ({room.bookingCode})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-slate-700">Tìm kiếm dịch vụ</span>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={catalogueSearch}
                        onChange={(e) => setCatalogueSearch(e.target.value)}
                        placeholder="Tìm tên dịch vụ..."
                        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-400"
                      />
                    </div>
                  </label>
                </div>

                {/* Category tabs */}
                <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-50 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryFilter("all")}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                      selectedCategoryFilter === "all"
                        ? "bg-sky-600 text-white shadow-md shadow-sky-100/60"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Tất cả nhóm
                  </button>
                  {categories.filter(c => c.status).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryFilter(cat.id)}
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                        Number(selectedCategoryFilter) === Number(cat.id)
                          ? "bg-sky-600 text-white shadow-md shadow-sky-100/60"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Catalog Grid */}
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Danh mục dịch vụ</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredCatalogueServices.length === 0 ? (
                    <div className="col-span-full rounded-3xl bg-slate-50 py-12 text-center text-slate-500 font-semibold">
                      Không tìm thấy dịch vụ nào phù hợp.
                    </div>
                  ) : (
                    filteredCatalogueServices.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => addToCart(service)}
                        className="group flex items-center justify-between overflow-hidden rounded-3xl bg-white border border-slate-100 p-5 shadow-sm transition hover:shadow-md hover:border-sky-200 cursor-pointer"
                      >
                        <div className="flex-1 min-w-0 pr-3">
                          <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block mb-1">
                            {service.categoryName || "Khác"}
                          </span>
                          <h4 className="font-black text-slate-800 text-sm group-hover:text-sky-600 transition truncate">
                            {service.name}
                          </h4>
                          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400 font-semibold">
                            <span>ĐVT: {service.unit || "Lần"}</span>
                            <span>•</span>
                            <span className="text-slate-900 font-black">{formatCurrency(service.price)}</span>
                          </div>
                        </div>

                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition">
                          <Plus size={16} />
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* Right side: Shopping Cart */}
            <aside className="rounded-[2rem] bg-sky-50/70 border border-sky-100/80 p-6 text-slate-800 shadow-xl shadow-sky-100/30 self-start sticky top-6">
              <div className="flex items-center justify-between border-b border-sky-100 pb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={18} className="text-sky-600" />
                  <h3 className="font-black text-base text-slate-950">Giỏ dịch vụ</h3>
                </div>
                <span className="rounded-full bg-sky-600/10 text-sky-700 px-2.5 py-0.5 text-xs font-black">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} món
                </span>
              </div>

              <div className="mt-4 space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                    <ShoppingCart size={40} className="text-sky-200" />
                    <p className="text-xs font-semibold leading-relaxed">
                      Chưa chọn dịch vụ nào.<br />Vui lòng nhấp vào các thẻ dịch vụ ở bên trái.
                    </p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.serviceId} className="flex items-center gap-3 rounded-2xl bg-white border border-sky-100/50 p-3.5 shadow-sm">
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="truncate text-xs font-black text-slate-800">{item.name}</h4>
                        <p className="text-[10px] text-slate-500 font-bold mt-0.5">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-sky-50 rounded-xl p-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.serviceId, item.quantity - 1)}
                          className="h-7 w-7 flex items-center justify-center text-sky-700 hover:bg-sky-100 rounded-lg transition"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="text-sm font-black text-slate-800 w-5 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.serviceId, item.quantity + 1)}
                          className="h-7 w-7 flex items-center justify-center text-sky-700 hover:bg-sky-100 rounded-lg transition"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.serviceId)}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg p-1.5 shrink-0 transition"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="mt-6 border-t border-sky-100 pt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500">Tạm tính:</span>
                    <span className="text-lg font-black text-slate-900">{formatCurrency(cartSubtotal)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!applyForm.bookingDetailId) {
                        setNotice({ type: "error", message: "Vui lòng chọn phòng để áp dụng dịch vụ." });
                        return;
                      }
                      setShowCheckoutModal(true);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 py-3.5 text-sm font-black text-white hover:bg-sky-600 transition shadow-lg shadow-sky-500/20"
                  >
                    Tiến hành thanh toán
                  </button>
                </div>
              )}
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
                  <tr className="text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    <th className="px-5 py-4 w-16"></th>
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
                          <div className="size-10 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200 shadow-sm">
                            {service.thumbnailUrl ? (
                              <img src={service.thumbnailUrl} alt={service.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-400">
                                <ImageIcon size={16} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900">{service.name}</p>
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
                        <td className="px-5 py-4 text-right">
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
                  <tr className="text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    <th className="px-5 py-4 w-16"></th>
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
                        <td className="px-5 py-4">
                          <div className="flex size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                            {(() => {
                              const url = cat.iconUrl || "";
                              if (!url) return <Layers size={18} />;

                              if (url.includes("fontawesome.com/icons/")) {
                                const iconName = url.split("/").pop().split("?")[0];
                                return <i className={`fa-solid fa-${iconName} text-lg`} />;
                              }

                              if (url.startsWith("http")) {
                                return (
                                  <img
                                    src={url}
                                    alt=""
                                    className="size-6 object-contain"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "https://ui-avatars.com/api/?name=?&background=f0f9ff&color=0284c7";
                                    }}
                                  />
                                );
                              }

                              return (
                                <i className={`${url.includes("fa-") ? url : `fa-solid fa-${url}`} text-lg`} />
                              );
                            })()}
                          </div>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-900">{cat.name}</td>
                        <td className="px-5 py-4">
                          <StatusToggle
                            status={cat.status}
                            isPending={updateCategoryMutation.isPending}
                            onToggle={() => {
                              const payload = {
                                name: cat.name,
                                iconUrl: cat.iconUrl,
                                status: !cat.status,
                              };
                              updateCategoryMutation.mutate({ id: cat.id, payload, isToggle: true });
                            }}
                          />
                        </td>
                        <td className="px-5 py-4 text-right">
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
                          {!item.bookingDetailId || item.roomNumber === "--" ? (
                            <p className="font-black text-slate-900">{item.guestName || "Khách đặt lẻ"}</p>
                          ) : (
                            <>
                              <p className="font-black text-slate-900">Phòng {item.roomNumber}</p>
                              <p className="mt-1 text-sm text-slate-500">
                                {item.guestName} • {item.bookingCode}
                              </p>
                            </>
                          )}
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
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${item.paymentStatus === "Paid"
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

      {showCheckoutModal ? (() => {
        const activeRoom = inHouseRooms.find(r => Number(r.bookingDetailId) === Number(applyForm.bookingDetailId));
        const roomNumber = activeRoom?.roomNumber || "--";
        const guestName = activeRoom?.guestName || "Khách lẻ";

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
            <style dangerouslySetInnerHTML={{__html: `
              .no-scrollbar::-webkit-scrollbar {
                display: none !important;
              }
              .no-scrollbar {
                -ms-overflow-style: none !important;
                scrollbar-width: none !important;
              }
            `}} />
            <div
              className={`w-full transition-all duration-350 rounded-[2.5rem] bg-white p-8 shadow-2xl overflow-y-auto max-h-[90vh] ring-1 ring-slate-100 animate-in fade-in zoom-in-95 duration-200 no-scrollbar ${
                checkoutIsPaid ? "max-w-5xl" : "max-w-2xl"
              }`}
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Thanh toán & Áp dụng</p>
                  <h2 className="mt-2 text-2xl font-black text-slate-900">Chi tiết hóa đơn dịch vụ</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="rounded-2xl bg-slate-100 p-3 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              <div className={`mt-6 flex flex-col ${checkoutIsPaid ? "lg:flex-row gap-8" : "gap-4"}`}>
                {/* Left Column (Details) */}
                <div className="flex-1 min-w-0">
                  {/* Room Info */}
                  <div className="rounded-3xl bg-sky-50/70 p-5 border border-sky-100/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">Phòng áp dụng</span>
                      <h3 className="text-xl font-black text-slate-800 mt-0.5">
                        Phòng {roomNumber}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Khách hàng</span>
                      <span className="font-extrabold text-slate-700 block mt-0.5">
                        {guestName}
                      </span>
                    </div>
                  </div>

                  {/* Itemized List */}
                  <div className="mt-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Danh sách dịch vụ đã chọn</h4>
                    <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                      <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50">
                          <tr className="text-left text-[10px] font-bold text-slate-400 uppercase">
                            <th className="px-5 py-3.5">Dịch vụ</th>
                            <th className="px-5 py-3.5 text-center">Số lượng</th>
                            <th className="px-5 py-3.5 text-right">Đơn giá</th>
                            <th className="px-5 py-3.5 text-right">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {cart.map((item) => (
                            <tr key={item.serviceId} className="text-sm">
                              <td className="px-5 py-4 font-bold text-slate-800">{item.name}</td>
                              <td className="px-5 py-4 text-center text-slate-600 font-semibold">{item.quantity}</td>
                              <td className="px-5 py-4 text-right text-slate-600 font-medium">{formatCurrency(item.price)}</td>
                              <td className="px-5 py-4 text-right font-black text-slate-800">{formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Voucher Section */}
                  <div className="mt-6 space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Áp dụng Voucher dịch vụ
                    </label>
                    <select
                      value={selectedVoucherId || ""}
                      onChange={(e) => setSelectedVoucherId(e.target.value ? Number(e.target.value) : null)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 font-bold"
                    >
                      <option value="">-- Không áp dụng voucher --</option>
                      {serviceVouchers.map((v) => (
                        <option key={v.id} value={v.id}>
                          [{v.code}] - {v.name} (Giảm {v.discountType === "PERCENT" ? `${v.discountValue}%` : `${formatCurrency(v.discountValue)}`})
                        </option>
                      ))}
                    </select>
                    {selectedVoucher && !isVoucherValid && (
                      <div className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600 font-bold flex items-center gap-1.5 border border-rose-100/50">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>Cần đạt giá trị đơn tối thiểu {formatCurrency(selectedVoucher.minBookingValue)} để dùng voucher này.</span>
                      </div>
                    )}
                    {selectedVoucher && isVoucherValid && (
                      <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700 font-bold flex items-center gap-1.5 border border-emerald-100/50">
                        <CheckCircle2 size={14} className="shrink-0" />
                        <span>Đã áp dụng thành công voucher giảm giá!</span>
                      </div>
                    )}
                  </div>

                  {/* Payment Method Selector */}
                  <div className="mt-6 space-y-3">
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Hình thức ghi nhận</span>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Ghi nợ */}
                      <button
                        type="button"
                        onClick={() => setCheckoutIsPaid(false)}
                        className={`flex flex-col items-start gap-2.5 rounded-3xl p-5 border text-left transition ${
                          !checkoutIsPaid
                            ? "border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/10 shadow-sm"
                            : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className={`p-2 rounded-xl transition ${!checkoutIsPaid ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                            <CreditCard size={18} />
                          </div>
                          <div className={`h-4 w-4 rounded-full border flex items-center justify-center transition ${!checkoutIsPaid ? "border-sky-500 bg-sky-500" : "border-slate-300 bg-white"}`}>
                            {!checkoutIsPaid && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-black text-slate-800 text-sm">Ghi nợ vào phòng</h5>
                          <p className="text-[11px] font-semibold text-slate-400 mt-1 leading-normal">
                            Hóa đơn dịch vụ được ghi nợ vào phòng, thanh toán chung khi Checkout phòng.
                          </p>
                        </div>
                      </button>

                      {/* Thanh toán ngay */}
                      <button
                        type="button"
                        onClick={() => setCheckoutIsPaid(true)}
                        className={`flex flex-col items-start gap-2.5 rounded-3xl p-5 border text-left transition ${
                          checkoutIsPaid
                            ? "border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/10 shadow-sm"
                            : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className={`p-2 rounded-xl transition ${checkoutIsPaid ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                            <Wallet size={18} />
                          </div>
                          <div className={`h-4 w-4 rounded-full border flex items-center justify-center transition ${checkoutIsPaid ? "border-sky-500 bg-sky-500" : "border-slate-300 bg-white"}`}>
                            {checkoutIsPaid && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-black text-slate-800 text-sm">Thanh toán ngay</h5>
                          <p className="text-[11px] font-semibold text-slate-400 mt-1 leading-normal">
                            Khách trả trực tiếp (Tiền mặt / Chuyển khoản), xuất hóa đơn hoàn tất lập tức.
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="mt-8 rounded-3xl bg-slate-50 p-6 space-y-3.5">
                    <div className="flex justify-between text-sm text-slate-500 font-semibold">
                      <span>Tạm tính:</span>
                      <span>{formatCurrency(cartSubtotal)}</span>
                    </div>
                    {cartDiscount > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600 font-bold">
                        <span>Giảm giá Voucher:</span>
                        <span>-{formatCurrency(cartDiscount)}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-200 pt-3.5 flex justify-between items-center">
                      <span className="text-base font-black text-slate-700">Tổng cộng:</span>
                      <span className="text-2xl font-black text-sky-600">{formatCurrency(cartTotal)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-8 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (!applyForm.bookingDetailId) {
                          setNotice({ type: "error", message: "Vui lòng chọn phòng để áp dụng dịch vụ." });
                          return;
                        }
                        if (cart.length === 0) {
                          setNotice({ type: "error", message: "Giỏ dịch vụ đang trống." });
                          return;
                        }
                        if (selectedVoucher && !isVoucherValid) {
                          setNotice({ type: "error", message: "Voucher đã chọn không hợp lệ cho giá trị đơn hàng hiện tại." });
                          return;
                        }

                        applyServiceMutation.mutate({
                          bookingDetailId: Number(applyForm.bookingDetailId),
                          isPaid: checkoutIsPaid,
                          voucherId: selectedVoucherId ? Number(selectedVoucherId) : null,
                          items: cart.map(item => ({
                            serviceId: Number(item.serviceId),
                            quantity: Number(item.quantity)
                          }))
                        });
                      }}
                      disabled={applyServiceMutation.isPending}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 py-4 text-base font-black text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300 shadow-lg shadow-sky-600/10"
                    >
                      {applyServiceMutation.isPending ? "Đang xử lý..." : "Xác nhận & Áp dụng"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCheckoutModal(false)}
                      className="rounded-2xl bg-slate-100 px-6 py-4 text-base font-bold text-slate-600 transition hover:bg-slate-200"
                    >
                      Hủy
                    </button>
                  </div>
                </div>

                {/* Right Column (VietQR Code Panel) */}
                {checkoutIsPaid && (
                  <div className="w-full lg:w-[420px] shrink-0 flex flex-col justify-between rounded-[2rem] border border-sky-100 bg-sky-50/50 p-6 text-center shadow-inner animate-in fade-in slide-in-from-right-8 duration-300">
                    <div>
                      <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                        <div className="text-left">
                          <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">Ngân hàng thụ hưởng</span>
                          <h4 className="font-black text-slate-800 text-sm mt-0.5">BIDV - HPT HOTEL</h4>
                        </div>
                        <div className="rounded-xl bg-sky-100 p-2.5 text-sky-700">
                          <QrCode size={18} />
                        </div>
                      </div>

                      <div className="mt-8 flex justify-center">
                        <div className="relative flex h-[340px] w-[340px] items-center justify-center rounded-[2.5rem] border-[12px] border-white bg-white p-4 shadow-lg shadow-sky-100/60 transition hover:scale-[1.02] duration-350">
                          <img
                            src={`https://img.vietqr.io/image/BIDV-96247GXSXM-compact2.jpg?amount=${cartTotal}&addInfo=TT%20DV%20Phong%20${roomNumber}&accountName=HPT%20HOTEL`}
                            alt="QR thanh toán chuyển khoản"
                            className="h-full w-full object-contain rounded-2xl"
                          />
                        </div>
                      </div>

                      <div className="mt-8 space-y-2 text-center">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Số tiền chuyển khoản</p>
                        <p className="text-3xl font-black text-sky-600">{formatCurrency(cartTotal)}</p>
                      </div>
                    </div>

                    <div className="mt-8 rounded-3xl bg-white border border-sky-100/40 p-5 text-left space-y-3 shadow-sm">
                      <div className="flex justify-between items-center text-sm font-semibold">
                        <span className="text-slate-400">Số tài khoản:</span>
                        <span className="text-slate-800 font-extrabold text-base bg-slate-50 px-2.5 py-1 rounded-xl">96247GXSXM</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-semibold">
                        <span className="text-slate-400">Nội dung chuyển:</span>
                        <span className="text-sky-600 font-black text-sm bg-sky-50 px-2.5 py-1 rounded-xl">TT DV Phong {roomNumber}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })() : null}
    </>
  );
};

export default ReceptionistPOSServicePage;
