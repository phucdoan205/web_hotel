import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import { ExternalLink, ImagePlus, MapPin, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import PermissionGate from "../../components/shared/PermissionGate";
import {
  createAttraction,
  deleteAttraction,
  getAttractions,
  updateAttraction,
} from "../../api/admin/attractionsApi";
import { hasPermission } from "../../utils/permissions";

const emptyForm = {
  name: "",
  category: "",
  address: "",
  latitude: "",
  longitude: "",
  distanceKm: "",
  imageUrl: "",
  mapEmbedLink: "",
  description: "",
  isActive: true,
};

const readMessage = (error, fallback) => {
  const raw = error?.response?.data?.message || error?.response?.data;
  return typeof raw === "string" && raw.trim() ? raw : fallback;
};

const mapToForm = (item) => ({
  name: item?.name ?? "",
  category: item?.category ?? "",
  address: item?.address ?? "",
  latitude: item?.latitude ?? "",
  longitude: item?.longitude ?? "",
  distanceKm: item?.distanceKm ?? "",
  imageUrl: item?.imageUrl ?? "",
  mapEmbedLink: item?.mapEmbedLink ?? "",
  description: item?.description ?? "",
  isActive: item?.isActive ?? true,
});

const normalizePayload = (form) => ({
  name: form.name.trim(),
  category: form.category.trim() || null,
  address: form.address.trim() || null,
  latitude: form.latitude === "" ? null : Number(form.latitude),
  longitude: form.longitude === "" ? null : Number(form.longitude),
  distanceKm: form.distanceKm === "" ? null : Number(form.distanceKm),
  imageUrl: form.imageUrl || null,
  mapEmbedLink: form.mapEmbedLink.trim() || null,
  description: form.description.trim() || null,
  isActive: Boolean(form.isActive),
});

const extractMapSrc = (value) => {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  const match = trimmed.match(/src=["']([^"']+)["']/i);
  return match?.[1] || trimmed;
};

const getGoogleMapsLink = (item) => {
  if (item?.latitude != null && item?.longitude != null) {
    return `https://www.google.com/maps?q=${item.latitude},${item.longitude}`;
  }

  if (item?.address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address)}`;
  }

  return extractMapSrc(item?.mapEmbedLink) || "https://www.google.com/maps";
};

const formatDistance = (value) => (value === null || value === undefined || value === "" ? "Chưa cập nhật" : `${value} km`);
const formatCoord = (value) => (value === null || value === undefined || value === "" ? "--" : String(value));

function AttractionModal({
  mode,
  formData,
  previewImage,
  isSubmitting,
  error,
  canDelete,
  onClose,
  onChange,
  onSubmit,
  onImageSelect,
  onDelete,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-950">
              {mode === "create" ? "Tạo địa điểm" : "Cập nhật địa điểm"}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Quản lý điểm đến, bản đồ và trạng thái hiển thị trên site map.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="size-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 p-6">
          {error ? (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
              {error}
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Tên địa điểm</span>
              <input
                name="name"
                value={formData.name}
                onChange={onChange}
                required
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Danh mục</span>
              <input
                name="category"
                value={formData.category}
                onChange={onChange}
                placeholder="Thiên nhiên, Ẩm thực, Giải trí..."
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50"
              />
            </label>

            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Địa chỉ</span>
              <input
                name="address"
                value={formData.address}
                onChange={onChange}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Latitude</span>
              <input type="number" step="any" name="latitude" value={formData.latitude} onChange={onChange} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50" />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Longitude</span>
              <input type="number" step="any" name="longitude" value={formData.longitude} onChange={onChange} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50" />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Khoảng cách (km)</span>
              <input type="number" step="0.1" name="distanceKm" value={formData.distanceKm} onChange={onChange} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50" />
            </label>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Ảnh địa điểm</span>
              <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
                <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-800">
                  <ImagePlus className="size-4" />
                  Chọn ảnh địa điểm
                  <input type="file" accept="image/*" onChange={onImageSelect} className="hidden" />
                </label>

                {previewImage ? (
                  <img src={previewImage} alt="preview" className="h-40 w-full rounded-2xl object-cover ring-1 ring-slate-200" />
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-slate-400 ring-1 ring-slate-200">
                    Chưa có ảnh
                  </div>
                )}
              </div>
            </div>

            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Map embed link</span>
              <input
                name="mapEmbedLink"
                value={formData.mapEmbedLink}
                onChange={onChange}
                placeholder="Dán link Google Maps embed hoặc iframe"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50"
              />
            </label>

            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Mô tả</span>
              <textarea
                name="description"
                value={formData.description}
                onChange={onChange}
                rows={5}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50"
              />
            </label>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <label className="inline-flex items-center gap-3 text-sm font-bold text-slate-700">
              <button
                type="button"
                role="switch"
                aria-checked={formData.isActive}
                onClick={() =>
                  onChange({
                    target: { name: "isActive", type: "checkbox", checked: !formData.isActive },
                  })
                }
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${formData.isActive ? "bg-emerald-700" : "bg-slate-300"}`}
              >
                <span className={`inline-block size-6 rounded-full bg-white transition ${formData.isActive ? "translate-x-7" : "translate-x-1"}`} />
              </button>
              {formData.isActive ? "Đang bật hiển thị" : "Đang ẩn khỏi site map"}
            </label>

            <div className="flex items-center gap-3">
              {mode === "edit" && canDelete ? (
                <button type="button" onClick={onDelete} className="inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-100">
                  <Trash2 className="size-4" />
                  Xóa địa điểm
                </button>
              ) : null}

              <button type="button" onClick={onClose} className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200">
                Đóng
              </button>

              <button type="submit" disabled={isSubmitting} className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting ? "Đang lưu..." : "Lưu địa điểm"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function AttractionCard({ item, canEdit, isPending, onToggle, onEdit, onOpenMap }) {
  return (
    <div className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-sm shadow-slate-100">
      <div className="h-56 bg-slate-100">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">
            Chưa có ảnh
          </div>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <button type="button" onClick={onOpenMap} className="text-left text-2xl font-black tracking-tight text-slate-950 transition hover:text-emerald-700">
              {item.name}
            </button>
            <p className="mt-1 text-sm font-semibold text-slate-500">{item.category || "Chưa phân loại"}</p>
          </div>

          <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-black ${item.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
            {item.isActive ? "Đang bật" : "Đang ẩn"}
          </span>
        </div>

        <div className="space-y-2 text-sm font-medium text-slate-500">
          <p>{item.address || "Chưa có địa chỉ"}</p>
          <p>Tọa độ: {formatCoord(item.latitude)}, {formatCoord(item.longitude)}</p>
          <p>Khoảng cách: {formatDistance(item.distanceKm)}</p>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <PermissionGate permission="EDIT_ATTRACTIONS">
            <button type="button" role="switch" aria-checked={item.isActive} onClick={onToggle} disabled={isPending} className="inline-flex items-center gap-3 disabled:cursor-not-allowed disabled:opacity-60">
              <span className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${item.isActive ? "bg-emerald-700" : "bg-slate-300"}`}>
                <span className={`inline-block size-6 rounded-full bg-white transition ${item.isActive ? "translate-x-7" : "translate-x-1"}`} />
              </span>
              <span className="text-sm font-bold text-emerald-700">{item.isActive ? "Đang bật" : "Đang ẩn"}</span>
            </button>
          </PermissionGate>

          {canEdit ? (
            <button type="button" onClick={onEdit} className="rounded-2xl border border-slate-200 p-3 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
              <Pencil className="size-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function AdminAttractionsPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [modalState, setModalState] = useState({ open: false, mode: "create", item: null });
  const [formData, setFormData] = useState(emptyForm);
  const [previewImage, setPreviewImage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingToggleId, setPendingToggleId] = useState(null);
  const [message, setMessage] = useState("");
  const [modalError, setModalError] = useState("");
  const deferredSearch = useDeferredValue(searchKeyword);

  const canEdit = hasPermission("EDIT_ATTRACTIONS");
  const canDelete = hasPermission("DELETE_ATTRACTIONS");

  const loadItems = async (keyword = "") => {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await getAttractions({
        activeOnly: false,
        search: keyword.trim() || undefined,
        page: 1,
        pageSize: 100,
      });

      const nextItems = response?.items ?? [];
      setItems(nextItems);
      setSelectedId((current) => (nextItems.some((item) => item.id === current) ? current : nextItems[0]?.id ?? null));
    } catch (error) {
      setMessage(readMessage(error, "Không thể tải danh sách địa điểm."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems(deferredSearch);
  }, [deferredSearch]);

  const selectedItem = useMemo(() => items.find((item) => item.id === selectedId) ?? null, [items, selectedId]);

  const openCreateModal = () => {
    setModalError("");
    setFormData(emptyForm);
    setPreviewImage("");
    setModalState({ open: true, mode: "create", item: null });
  };

  const openEditModal = (item) => {
    setModalError("");
    setFormData(mapToForm(item));
    setPreviewImage(item.imageUrl || "");
    setModalState({ open: true, mode: "edit", item });
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setModalError("");
    setModalState({ open: false, mode: "create", item: null });
    setFormData(emptyForm);
    setPreviewImage("");
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setPreviewImage(result);
      setFormData((current) => ({ ...current, imageUrl: result }));
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setModalError("");

    try {
      const payload = normalizePayload(formData);

      if (!payload.name) {
        setModalError("Tên địa điểm là bắt buộc.");
        setIsSubmitting(false);
        return;
      }

      if (modalState.mode === "create") {
        const created = await createAttraction(payload);
        setSelectedId(created?.id ?? null);
      } else if (modalState.item?.id) {
        await updateAttraction(modalState.item.id, payload);
        setSelectedId(modalState.item.id);
      }

      closeModal();
      await loadItems(searchKeyword);
    } catch (error) {
      setModalError(readMessage(error, "Không thể lưu địa điểm."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (item) => {
    setPendingToggleId(item.id);
    setMessage("");

    try {
      await updateAttraction(item.id, { isActive: !item.isActive });
      setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, isActive: !entry.isActive } : entry)));
    } catch (error) {
      setMessage(readMessage(error, "Không thể cập nhật trạng thái địa điểm."));
    } finally {
      setPendingToggleId(null);
    }
  };

  const handleDelete = async () => {
    if (!modalState.item?.id) return;
    const shouldDelete = window.confirm(`Xóa địa điểm "${modalState.item.name}"? Hành động này không thể hoàn tác.`);
    if (!shouldDelete) return;

    setIsSubmitting(true);
    setModalError("");

    try {
      await deleteAttraction(modalState.item.id);
      closeModal();
      await loadItems(searchKeyword);
    } catch (error) {
      setModalError(readMessage(error, "Không thể xóa địa điểm."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCount = items.filter((item) => item.isActive).length;
  const mapSrc = selectedItem ? extractMapSrc(selectedItem.mapEmbedLink) : "";
  const mapLink = selectedItem ? getGoogleMapsLink(selectedItem) : "https://www.google.com/maps";

  return (
    <>
      <div className="mx-auto max-w-[1680px] space-y-8 pb-12">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950">Quản lý địa điểm</h1>
            <p className="mt-2 max-w-3xl text-sm font-medium text-slate-500">
              Quản lý điểm đến, tọa độ thực tế và dữ liệu dùng cho site map.
            </p>
          </div>

          <PermissionGate permission="CREATE_ATTRACTIONS">
            <button type="button" onClick={openCreateModal} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-800">
              <Plus className="size-4" />
              Thêm địa điểm
            </button>
          </PermissionGate>
        </div>

        {message ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-600">
            {message}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm shadow-slate-100">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex rounded-[1.2rem] border border-slate-200 bg-slate-50 p-1">
                {[
                  { id: "list", label: "Danh sách địa điểm" },
                  { id: "map", label: "Site Map" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-[1rem] px-4 py-3 text-sm font-black transition ${activeTab === tab.id ? "bg-emerald-700 text-white shadow" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                  placeholder="Tìm theo tên, địa chỉ, danh mục..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                />
              </div>
            </div>
          </div>

          {activeTab === "list" ? (
            <div className="space-y-6 p-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-slate-950">Danh sách địa điểm</h2>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Tổng cộng {items.length} địa điểm, {activeCount} địa điểm đang hiển thị.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">Đang bật: {activeCount}</div>
                  <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-600">Tổng: {items.length}</div>
                </div>
              </div>

              {isLoading ? (
                <div className="rounded-[1.6rem] border border-dashed border-slate-200 px-6 py-16 text-center text-sm font-semibold text-slate-400">
                  Đang tải danh sách địa điểm...
                </div>
              ) : items.length === 0 ? (
                <div className="rounded-[1.6rem] border border-dashed border-slate-200 px-6 py-16 text-center text-sm font-semibold text-slate-400">
                  Không có địa điểm phù hợp.
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((item) => (
                    <AttractionCard
                      key={item.id}
                      item={item}
                      canEdit={canEdit}
                      isPending={pendingToggleId === item.id}
                      onToggle={() => handleToggle(item)}
                      onEdit={() => openEditModal(item)}
                      onOpenMap={() => {
                        setSelectedId(item.id);
                        setActiveTab("map");
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-6 p-5 xl:grid-cols-[360px,minmax(0,1fr)]">
              <div className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-5 py-5">
                  <h2 className="text-3xl font-black tracking-tight text-slate-950">Danh sách điểm đến</h2>
                </div>

                <div className="max-h-[720px] overflow-y-auto">
                  {isLoading ? (
                    <div className="px-5 py-10 text-sm font-semibold text-slate-400">Đang tải địa điểm...</div>
                  ) : items.length === 0 ? (
                    <div className="px-5 py-10 text-sm font-semibold text-slate-400">Không có dữ liệu địa điểm.</div>
                  ) : (
                    items.map((item) => {
                      const isSelected = selectedId === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedId(item.id)}
                          className={`flex w-full flex-col gap-1 border-b border-slate-100 px-5 py-4 text-left transition ${isSelected ? "bg-emerald-50" : "hover:bg-slate-50"}`}
                        >
                          <span className="text-lg font-black text-slate-900">{item.name}</span>
                          <span className="text-sm font-semibold text-slate-500">{(item.category || "Chưa phân loại") + " • " + formatDistance(item.distanceKm)}</span>
                          <span className="text-sm font-medium text-slate-400">{item.address || "Chưa có địa chỉ"}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white p-5">
                {selectedItem ? (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-4xl font-black tracking-tight text-slate-950">{selectedItem.name}</h2>
                        <p className="mt-2 text-sm font-semibold text-slate-500">{selectedItem.address || "Chưa có địa chỉ"}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <a href={mapLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800">
                          <ExternalLink className="size-4" />
                          Mở Google Maps
                        </a>

                        {canEdit ? (
                          <button type="button" onClick={() => openEditModal(selectedItem)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                            <Pencil className="size-4" />
                            Chỉnh sửa
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      {[
                        { label: "Latitude", value: formatCoord(selectedItem.latitude) },
                        { label: "Longitude", value: formatCoord(selectedItem.longitude) },
                        { label: "Khoảng cách", value: formatDistance(selectedItem.distanceKm) },
                      ].map((stat) => (
                        <div key={stat.label} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-slate-50">
                      {mapSrc ? (
                        <iframe title={`map-${selectedItem.id}`} src={mapSrc} className="h-[460px] w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                      ) : (
                        <div className="flex h-[460px] flex-col items-center justify-center gap-3 px-6 text-center">
                          <MapPin className="size-10 text-slate-300" />
                          <p className="text-lg font-bold text-slate-600">Địa điểm này chưa có map embed link.</p>
                        </div>
                      )}
                    </div>

                    <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Thông tin chi tiết</p>
                      <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">{selectedItem.description || "Chưa có mô tả cho địa điểm này."}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[520px] items-center justify-center rounded-[1.8rem] border border-dashed border-slate-200 text-sm font-semibold text-slate-400">
                    Chọn một địa điểm để xem bản đồ và thông tin chi tiết.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {modalState.open ? (
        <AttractionModal
          mode={modalState.mode}
          formData={formData}
          previewImage={previewImage}
          isSubmitting={isSubmitting}
          error={modalError}
          canDelete={canDelete}
          onClose={closeModal}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onImageSelect={handleImageSelect}
          onDelete={handleDelete}
        />
      ) : null}
    </>
  );
}
