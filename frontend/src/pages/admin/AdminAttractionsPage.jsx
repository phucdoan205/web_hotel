import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import { ExternalLink, MapPin, Pencil, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PermissionGate from "../../components/shared/PermissionGate";
import {
  createAttraction,
  deleteAttraction,
  getAttractions,
  updateAttraction,
} from "../../api/admin/attractionsApi";
import { hasPermission } from "../../utils/permissions";

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

const formatDistance = (value) =>
  value === null || value === undefined || value === "" ? "Chưa cập nhật" : `${value} km`;

const formatCoord = (value) =>
  value === null || value === undefined || value === "" ? "--" : String(value);



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
            <button
              type="button"
              onClick={onOpenMap}
              className="text-left text-2xl font-black tracking-tight text-slate-950 transition hover:text-sky-700"
            >
              {item.name}
            </button>
            <p className="mt-1 text-sm font-semibold text-slate-500">{item.category || "Chưa phân loại"}</p>
          </div>

          <span
            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-black ${
              item.isActive ? "bg-sky-50 text-sky-700" : "bg-slate-100 text-slate-500"
            }`}
          >
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
            <button
              type="button"
              role="switch"
              aria-checked={item.isActive}
              onClick={onToggle}
              disabled={isPending}
              className="inline-flex items-center gap-3 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                  item.isActive ? "bg-sky-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block size-6 rounded-full bg-white transition ${
                    item.isActive ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </span>
              <span className="text-sm font-bold text-sky-700">{item.isActive ? "Đang bật" : "Đang ẩn"}</span>
            </button>
          </PermissionGate>

          {canEdit ? (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-2xl border border-slate-200 p-3 text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
            >
              <Pencil className="size-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function AdminAttractionsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("list");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingToggleId, setPendingToggleId] = useState(null);
  const [message, setMessage] = useState("");
  const deferredSearch = useDeferredValue(searchKeyword);

  const canCreate = hasPermission("CREATE_ATTRACTIONS");
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
      setSelectedId((current) =>
        nextItems.some((item) => item.id === current) ? current : nextItems[0]?.id ?? null,
      );
    } catch (error) {
      setMessage(readMessage(error, "Không thể tải danh sách địa điểm."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems(deferredSearch);
  }, [deferredSearch]);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  const openCreateModal = () => {
    if (!canCreate) return;
    navigate("/admin/attractions/new");
  };

  const openEditModal = (item) => {
    if (!canEdit) return;
    navigate(`/admin/attractions/${item.id}/edit`);
  };

  const handleToggle = async (item) => {
    if (!canEdit) return;
    setPendingToggleId(item.id);
    setMessage("");

    try {
      await updateAttraction(item.id, { isActive: !item.isActive });
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id ? { ...entry, isActive: !entry.isActive } : entry,
        ),
      );
    } catch (error) {
      setMessage(readMessage(error, "Không thể cập nhật trạng thái địa điểm."));
    } finally {
      setPendingToggleId(null);
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
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700"
            >
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
                    className={`rounded-[1rem] px-4 py-3 text-sm font-black transition ${
                      activeTab === tab.id ? "bg-sky-700 text-white shadow" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === "list" ? (
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(event) => setSearchKeyword(event.target.value)}
                    placeholder="Tìm theo tên, địa chỉ, danh mục..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                </div>
              ) : null}
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
                  <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-black text-sky-700">
                    Đang bật: {activeCount}
                  </div>
                  <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-600">
                    Tổng: {items.length}
                  </div>
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
            <div className="flex flex-col gap-6 bg-slate-50/60 p-5 xl:flex-row">
              <div className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-sm xl:w-[360px] xl:min-w-[360px]">
                <div className="border-b border-slate-100 px-5 py-5">
                  <h2 className="text-3xl font-black tracking-tight text-slate-950">Danh sách điểm đến</h2>
                  <div className="relative mt-4">
                    <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchKeyword}
                      onChange={(event) => setSearchKeyword(event.target.value)}
                      placeholder="Tìm theo tên, địa chỉ, danh mục..."
                      className="w-full rounded-2xl border border-slate-200 bg-amber-50/30 py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
                    />
                  </div>
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
                          className={`flex w-full flex-col gap-1 border-b border-slate-100 px-5 py-4 text-left transition ${
                            isSelected ? "bg-sky-50" : "hover:bg-slate-50"
                          }`}
                        >
                          <span className="text-lg font-black text-slate-900">{item.name}</span>
                          <span className="text-sm font-semibold text-slate-500">
                            {(item.category || "Chưa phân loại") + " • " + formatDistance(item.distanceKm)}
                          </span>
                          <span className="text-sm font-medium text-slate-400">
                            {item.address || "Chưa có địa chỉ"}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="min-w-0 flex-1 overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
                {selectedItem ? (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-4xl font-black tracking-tight text-slate-950">{selectedItem.name}</h2>
                        <p className="mt-2 text-sm font-semibold text-slate-500">
                          {selectedItem.address || "Chưa có địa chỉ"}
                        </p>
                      </div>

                      {canEdit ? (
                        <button
                          type="button"
                          onClick={() => openEditModal(selectedItem)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                        >
                          <Pencil className="size-4" />
                          Chỉnh sửa
                        </button>
                      ) : null}
                    </div>

                    <div className="grid gap-4 xl:grid-cols-3">
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
                        <iframe
                          title={`map-${selectedItem.id}`}
                          src={mapSrc}
                          className="h-[520px] w-full"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      ) : (
                        <div className="flex h-[520px] flex-col items-center justify-center gap-3 px-6 text-center">
                          <MapPin className="size-10 text-slate-300" />
                          <p className="text-lg font-bold text-slate-600">Địa điểm này chưa có link nhúng bản đồ.</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4 text-sm font-semibold leading-7 text-slate-600">
                        {selectedItem.description || "Chưa có mô tả cho địa điểm này."}
                      </div>

                      <a
                        href={mapLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-800"
                      >
                        <ExternalLink className="size-4" />
                        Mở Google Maps
                      </a>
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
    </>
  );
}
