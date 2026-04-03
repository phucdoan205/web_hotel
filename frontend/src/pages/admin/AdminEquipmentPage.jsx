import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Funnel,
  PackagePlus,
  Pencil,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { API_BASE_URL } from "../../api/client";
import {
  createEquipment,
  getEquipmentById,
  getEquipmentList,
  updateEquipment,
} from "../../api/admin/equipmentApi";

const CATEGORY_OPTIONS = ["Điện tử", "Đồ vải", "Minibar"];
const PAGE_SIZE = 8;

const emptyForm = {
  itemCode: "",
  name: "",
  category: CATEGORY_OPTIONS[0],
  unit: "",
  totalQuantity: "0",
  inUseQuantity: "0",
  damagedQuantity: "0",
  liquidatedQuantity: "0",
  basePrice: "0",
  defaultPriceIfLost: "0",
  supplier: "",
  imageFile: null,
  imageUrl: "",
  previewUrl: "",
};

const formatNumber = (value) =>
  new Intl.NumberFormat("vi-VN").format(Number(value) || 0);

const formatCurrency = (value) =>
  `${new Intl.NumberFormat("vi-VN").format(Number(value) || 0)} VND`;

const placeholderImage =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <rect width="96" height="96" rx="20" fill="#e2e8f0"/>
      <path d="M28 62l12-14 10 10 8-8 10 12H28z" fill="#94a3b8"/>
      <circle cx="38" cy="34" r="6" fill="#94a3b8"/>
    </svg>
  `);

const getPreviewImage = (formOrItem) =>
  formOrItem.previewUrl || formOrItem.imageUrl || placeholderImage;

const parseApiError = (error, fallbackMessage) => {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (typeof data?.title === "string" && data.title.trim()) {
    return data.title;
  }

  if (data?.errors && typeof data.errors === "object") {
    const firstError = Object.values(data.errors).flat().find(Boolean);
    if (typeof firstError === "string" && firstError.trim()) {
      return firstError;
    }
  }

  if (error?.message === "Network Error") {
    return `Không thể kết nối backend tại ${API_BASE_URL}. Bạn hãy kiểm tra backend đã chạy và đã khởi động lại sau khi thêm controller mới chưa.`;
  }

  return fallbackMessage;
};

const buildPayload = (formData) => ({
  itemCode: formData.itemCode.trim(),
  name: formData.name.trim(),
  category: formData.category.trim(),
  unit: formData.unit.trim(),
  totalQuantity: String(Number(formData.totalQuantity) || 0),
  inUseQuantity: String(Number(formData.inUseQuantity) || 0),
  damagedQuantity: String(Number(formData.damagedQuantity) || 0),
  liquidatedQuantity: String(Number(formData.liquidatedQuantity) || 0),
  basePrice: String(Number(formData.basePrice) || 0),
  defaultPriceIfLost: String(Number(formData.defaultPriceIfLost) || 0),
  supplier: formData.supplier.trim(),
  imageFile: formData.imageFile,
});

const AdminEquipmentPage = () => {
  const [equipmentItems, setEquipmentItems] = useState([]);
  const [categories, setCategories] = useState(CATEGORY_OPTIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [quantitySort, setQuantitySort] = useState("desc");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState("");
  const [modalMode, setModalMode] = useState(null);
  const [editingEquipmentId, setEditingEquipmentId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const isCreateMode = modalMode === "create";
  const isEditMode = modalMode === "edit";

  const loadEquipmentData = async ({ refreshing = false } = {}) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError("");

    try {
      const response = await getEquipmentList({
        search: deferredSearchTerm.trim() || undefined,
        category: categoryFilter,
        quantitySort,
        page,
        pageSize: PAGE_SIZE,
      });

      setEquipmentItems(response.items ?? []);
      setTotalCount(response.totalCount ?? 0);
      setCategories(
        Array.from(new Set([...(response.categories ?? []), ...CATEGORY_OPTIONS])),
      );
    } catch (fetchError) {
      setError(
        parseApiError(
          fetchError,
          "Không tải được danh sách vật tư. Nếu backend vừa được thêm API mới thì bạn cần dừng và chạy lại backend.",
        ),
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadEquipmentData();
  }, [deferredSearchTerm, categoryFilter, quantitySort, page]);

  const summary = useMemo(
    () =>
      equipmentItems.reduce(
        (accumulator, item) => ({
          total: accumulator.total + (item.totalQuantity ?? 0),
          inUse: accumulator.inUse + (item.inUseQuantity ?? 0),
          inStock: accumulator.inStock + (item.inStockQuantity ?? 0),
        }),
        { total: 0, inUse: 0, inStock: 0 },
      ),
    [equipmentItems],
  );

  const closeModal = () => {
    if (formData.previewUrl) {
      URL.revokeObjectURL(formData.previewUrl);
    }

    setModalMode(null);
    setEditingEquipmentId(null);
    setIsLoadingDetail(false);
    setFormData(emptyForm);
  };

  const openCreateModal = () => {
    setError("");
    setModalMode("create");
    setEditingEquipmentId(null);
    setFormData(emptyForm);
  };

  const openEditModal = async (item) => {
    setError("");
    setModalMode("edit");
    setEditingEquipmentId(item.id);
    setIsLoadingDetail(true);

    try {
      const detail = await getEquipmentById(item.id);
      setFormData({
        itemCode: detail.itemCode ?? "",
        name: detail.name ?? "",
        category: detail.category ?? CATEGORY_OPTIONS[0],
        unit: detail.unit ?? "",
        totalQuantity: String(detail.totalQuantity ?? 0),
        inUseQuantity: String(detail.inUseQuantity ?? 0),
        damagedQuantity: String(detail.damagedQuantity ?? 0),
        liquidatedQuantity: String(detail.liquidatedQuantity ?? 0),
        basePrice: String(detail.basePrice ?? 0),
        defaultPriceIfLost: String(detail.defaultPriceIfLost ?? 0),
        supplier: detail.supplier ?? "",
        imageFile: null,
        imageUrl: detail.imageUrl ?? "",
        previewUrl: "",
      });
    } catch (fetchError) {
      setError(parseApiError(fetchError, "Không tải được chi tiết vật tư."));
      closeModal();
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ảnh vật tư không được vượt quá 5MB.");
      event.target.value = "";
      return;
    }

    setFormData((current) => {
      if (current.previewUrl) {
        URL.revokeObjectURL(current.previewUrl);
      }

      return {
        ...current,
        imageFile: file,
        previewUrl: URL.createObjectURL(file),
      };
    });

    event.target.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const totalQuantity = Number(formData.totalQuantity) || 0;
    const inUseQuantity = Number(formData.inUseQuantity) || 0;
    const damagedQuantity = Number(formData.damagedQuantity) || 0;
    const liquidatedQuantity = Number(formData.liquidatedQuantity) || 0;

    if (
      !formData.itemCode.trim() ||
      !formData.name.trim() ||
      !formData.category.trim() ||
      !formData.unit.trim()
    ) {
      setError("Mã vật tư, tên vật tư, danh mục và đơn vị tính là bắt buộc.");
      return;
    }

    if (totalQuantity < inUseQuantity + damagedQuantity + liquidatedQuantity) {
      setError("Tổng số lượng phải lớn hơn hoặc bằng tổng đang sử dụng, hỏng và thanh lý.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildPayload(formData);

      if (isCreateMode) {
        await createEquipment(payload);
      } else if (editingEquipmentId) {
        await updateEquipment(editingEquipmentId, payload);
      }

      closeModal();
      await loadEquipmentData({ refreshing: true });
    } catch (submitError) {
      setError(parseApiError(submitError, "Không lưu được vật tư."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalInStock =
    (Number(formData.totalQuantity) || 0) -
    (Number(formData.inUseQuantity) || 0) -
    (Number(formData.damagedQuantity) || 0) -
    (Number(formData.liquidatedQuantity) || 0);

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Quản lý tồn kho vật tư</h1>
            <p className="mt-1 text-sm font-medium text-gray-500">
              Quản lý bảng vật tư, lọc tồn kho, tìm kiếm, thêm và cập nhật vật tư.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => loadEquipmentData({ refreshing: true })}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
            >
              <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Làm mới
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700"
            >
              <PackagePlus className="size-4" />
              Thêm vật tư
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <p className="text-sm font-semibold text-gray-500">Tổng vật tư trang này</p>
            <p className="mt-3 text-3xl font-black text-gray-900">{formatNumber(summary.total)}</p>
          </div>
          <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <p className="text-sm font-semibold text-gray-500">Đang sử dụng</p>
            <p className="mt-3 text-3xl font-black text-amber-600">{formatNumber(summary.inUse)}</p>
          </div>
          <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <p className="text-sm font-semibold text-gray-500">Còn trong kho</p>
            <p className="mt-3 text-3xl font-black text-emerald-600">{formatNumber(summary.inStock)}</p>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setPage(1);
                }}
                placeholder="Tìm theo mã vật tư, tên vật tư, nhà cung cấp..."
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-600">
                <Funnel className="size-4" />
                Lọc
              </div>

              <select
                value={quantitySort}
                onChange={(event) => {
                  setQuantitySort(event.target.value);
                  setPage(1);
                }}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              >
                <option value="desc">Số lượng nhiều nhất</option>
                <option value="asc">Số lượng ít nhất</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(event) => {
                  setCategoryFilter(event.target.value);
                  setPage(1);
                }}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setCategoryFilter("all");
                setPage(1);
              }}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                categoryFilter === "all"
                  ? "bg-sky-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Tất cả
            </button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setCategoryFilter(category);
                  setPage(1);
                }}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  categoryFilter === category
                    ? "bg-sky-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-600">
            {error}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Mã vật tư",
                    "Tên vật tư",
                    "Danh mục",
                    "Đơn vị",
                    "Tổng số lượng",
                    "Đang sử dụng",
                    "Giá nhập",
                    "Giá đền bù",
                    "Nhà cung cấp",
                    "Chỉnh sửa",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-4 text-xs font-black uppercase tracking-wider text-slate-500"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center text-sm font-semibold text-gray-400">
                      Đang tải danh sách vật tư...
                    </td>
                  </tr>
                ) : equipmentItems.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center text-sm font-semibold text-gray-400">
                      Chưa có vật tư nào phù hợp bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  equipmentItems.map((item) => (
                    <tr key={item.id} className="align-top">
                      <td className="px-4 py-4 text-sm font-bold text-slate-700">{item.itemCode}</td>
                      <td className="px-4 py-4">
                        <div className="flex min-w-56 items-center gap-3">
                          <img
                            src={getPreviewImage(item)}
                            alt={item.name}
                            className="size-14 rounded-2xl object-cover ring-1 ring-gray-100"
                          />
                          <div>
                            <p className="text-sm font-black text-slate-900">{item.name}</p>
                            <p className="mt-1 text-xs font-semibold text-emerald-600">
                              Còn kho: {formatNumber(item.inStockQuantity)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-600">{item.category}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-600">{item.unit}</td>
                      <td className="px-4 py-4 text-sm font-black text-slate-900">{formatNumber(item.totalQuantity)}</td>
                      <td className="px-4 py-4 text-sm font-black text-amber-600">{formatNumber(item.inUseQuantity)}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-600">{formatCurrency(item.basePrice)}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-600">{formatCurrency(item.defaultPriceIfLost)}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-600">{item.supplier || "-"}</td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                        >
                          <Pencil className="size-4" />
                          Sửa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-gray-500">
              Hiển thị {(page - 1) * PAGE_SIZE + (equipmentItems.length ? 1 : 0)}-
              {(page - 1) * PAGE_SIZE + equipmentItems.length} trên {totalCount} vật tư
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="size-4" />
                Trước
              </button>
              <span className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
                {page}/{totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sau
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {modalMode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  {isCreateMode ? "Thêm vật tư" : "Sửa thông tin vật tư"}
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Ảnh vật tư sẽ được tải lên Cloudinary theo thư mục home/equipment/category.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-6 p-6 lg:grid-cols-[1fr_260px]">
              <div className="space-y-5">
                {isLoadingDetail ? (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-600">
                    Đang tải chi tiết vật tư...
                  </div>
                ) : null}

                <div className="grid gap-5 md:grid-cols-2">
                  {[
                    ["itemCode", "Mã vật tư"],
                    ["name", "Tên vật tư"],
                    ["unit", "Đơn vị tính"],
                    ["supplier", "Nhà cung cấp"],
                  ].map(([name, label]) => (
                    <label key={name} className="flex flex-col gap-2">
                      <span className="text-sm font-bold text-slate-700">{label}</span>
                      <input
                        name={name}
                        value={formData[name]}
                        onChange={handleFormChange}
                        className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
                      />
                    </label>
                  ))}

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-bold text-slate-700">Danh mục</span>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
                    >
                      {Array.from(new Set([...CATEGORY_OPTIONS, ...categories])).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>

                  {[
                    ["totalQuantity", "Tổng số lượng"],
                    ["inUseQuantity", "Số lượng đang dùng"],
                    ["damagedQuantity", "Số lượng hỏng"],
                    ["liquidatedQuantity", "Số lượng thanh lý"],
                    ["basePrice", "Giá nhập (VND)"],
                    ["defaultPriceIfLost", "Giá đền bù (VND)"],
                  ].map(([name, label]) => (
                    <label key={name} className="flex flex-col gap-2">
                      <span className="text-sm font-bold text-slate-700">{label}</span>
                      <input
                        type="number"
                        min="0"
                        name={name}
                        value={formData[name]}
                        onChange={handleFormChange}
                        className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
                      />
                    </label>
                  ))}
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Số lượng còn trong kho
                  </p>
                  <p className={`mt-2 text-2xl font-black ${modalInStock < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    {formatNumber(modalInStock)}
                  </p>
                </div>
              </div>

              <div className="space-y-4 rounded-[1.75rem] border border-dashed border-gray-200 bg-slate-50 p-5">
                <div>
                  <p className="text-sm font-bold text-slate-700">Hình ảnh vật tư</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Cloudinary folder: home/equipment/{formData.category || "category"}
                  </p>
                </div>

                <img
                  src={getPreviewImage(formData)}
                  alt={formData.name || "Equipment preview"}
                  className="h-44 w-full rounded-[1.5rem] object-cover ring-1 ring-gray-200"
                />

                <label className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-gray-200 transition hover:bg-gray-50">
                  Chọn ảnh
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

              <div className="lg:col-span-2">
                <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-2xl bg-gray-100 px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoadingDetail}
                    className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Đang lưu..." : isEditMode ? "Lưu thay đổi" : "Thêm vật tư"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default AdminEquipmentPage;
