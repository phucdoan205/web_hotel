import { useEffect, useMemo, useState } from "react";
import { Autocomplete, Checkbox, TextField } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Copy,
  LoaderCircle,
  Package2,
  Plus,
  Trash,
  Trash2,
  X,
} from "lucide-react";
import { roomInventoriesApi } from "../../../api/admin/roomInventoriesApi";
import { getEquipmentList } from "../../../api/admin/equipmentApi";
import { roomsApi } from "../../../api/admin/roomsApi";

const getApiMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data ||
  error?.message ||
  fallback;

const inputSx = {
  "& .MuiInputLabel-root": {
    color: "#94a3b8",
    fontSize: "0.72rem",
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#ea580c",
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: "18px",
    backgroundColor: "#f8fafc",
    fontWeight: 600,
    minHeight: "56px",
    "& fieldset": {
      borderColor: "#e2e8f0",
    },
    "&:hover fieldset": {
      borderColor: "#cbd5e1",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#fdba74",
      borderWidth: 1,
    },
  },
  "& .MuiInputBase-input": {
    color: "#0f172a",
    fontSize: "0.95rem",
  },
};

const autocompleteSx = {
  ...inputSx,
  "& .MuiAutocomplete-popupIndicator, & .MuiAutocomplete-clearIndicator": {
    color: "#94a3b8",
  },
};

const formatCurrency = (value) => `${Number(value ?? 0).toLocaleString("vi-VN")} đ`;

function FeedbackBanner({ message, tone = "success", onClose }) {
  if (!message) return null;

  const toneClass =
    tone === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-emerald-200 bg-emerald-50 text-emerald-800";

  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${toneClass}`}
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="rounded-xl p-1 text-current/60 transition hover:bg-white/60 hover:text-current"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

function SectionCard({ children }) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      {children}
    </section>
  );
}

const normalizeDraftItem = (item, fallbackId) => ({
  ...item,
  id: fallbackId,
  persistedId: item.id ?? null,
  equipmentName: item.equipmentName || item.itemType,
  itemType: item.itemType || item.equipmentName || "",
  quantity: Number(item.quantity) || 1,
  priceIfLost: Number(item.priceIfLost) || 0,
});

export default function RoomInventoryModal({
  open,
  onClose,
  roomId,
  roomNumber,
}) {
  const queryClient = useQueryClient();
  const [selectedToDelete, setSelectedToDelete] = useState([]);
  const [createFeedback, setCreateFeedback] = useState("");
  const [cloneFeedback, setCloneFeedback] = useState("");
  const [cloneFeedbackTone, setCloneFeedbackTone] = useState("success");
  const [inventoryForm, setInventoryForm] = useState({
    equipmentId: null,
    itemType: "",
    quantity: 1,
    priceIfLost: 0,
  });
  const [draftInventoryItems, setDraftInventoryItems] = useState([]);
  const [nextDraftId, setNextDraftId] = useState(-1);
  const [cloneRoomId, setCloneRoomId] = useState(null);

  const { data: inventoryItems = [] } = useQuery({
    queryKey: ["roomInventory", roomId],
    queryFn: () => roomInventoriesApi.getInventoryByRoom(roomId),
    enabled: open && !!roomId,
  });

  const { data: equipmentSuggestions = [] } = useQuery({
    queryKey: ["equipmentSuggestions"],
    queryFn: async () => {
      const data = await getEquipmentList({ isActive: true, page: 1, pageSize: 100 });
      return data?.items ?? [];
    },
    enabled: open,
  });

  const { data: roomsResponse } = useQuery({
    queryKey: ["roomInventoryCloneSources"],
    queryFn: () => roomsApi.getRooms({ page: 1, pageSize: 300 }),
    enabled: open,
  });

  const availableCloneRooms = useMemo(
    () => (roomsResponse?.items ?? []).filter((room) => room.id !== roomId),
    [roomId, roomsResponse?.items],
  );

  const selectedCloneRoom =
    availableCloneRooms.find((room) => room.id === cloneRoomId) ?? null;

  const { data: cloneSourceInventory = [], isLoading: isCloneSourceInventoryLoading } = useQuery({
    queryKey: ["roomInventoryClonePreview", cloneRoomId],
    queryFn: () => roomInventoriesApi.getInventoryByRoom(cloneRoomId),
    enabled: open && !!cloneRoomId,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setDraftInventoryItems(
      inventoryItems.map((item, index) => normalizeDraftItem(item, -(index + 1))),
    );
    setSelectedToDelete([]);
    setCreateFeedback("");
    setCloneFeedback("");
    setCloneFeedbackTone("success");
    setCloneRoomId(null);
    setInventoryForm({
      equipmentId: null,
      itemType: "",
      quantity: 1,
      priceIfLost: 0,
    });
    setNextDraftId(-(inventoryItems.length + 1));
  }, [inventoryItems, open]);

  const draftSummary = useMemo(
    () => ({
      totalItems: draftInventoryItems.length,
      totalQuantity: draftInventoryItems.reduce(
        (sum, item) => sum + Number(item.quantity ?? 0),
        0,
      ),
      totalPenalty: draftInventoryItems.reduce(
        (sum, item) => sum + Number(item.priceIfLost ?? 0) * Number(item.quantity ?? 0),
        0,
      ),
    }),
    [draftInventoryItems],
  );

  const pendingNewItems = useMemo(
    () => draftInventoryItems.filter((item) => !item.persistedId),
    [draftInventoryItems],
  );

  const pendingUpdatedItems = useMemo(
    () =>
      draftInventoryItems.filter((item) => {
        if (!item.persistedId) {
          return false;
        }

        const originalItem = inventoryItems.find((source) => source.id === item.persistedId);
        if (!originalItem) {
          return false;
        }

        return Number(item.quantity ?? 0) !== Number(originalItem.quantity ?? 0);
      }),
    [draftInventoryItems, inventoryItems],
  );

  const pendingDeletedIds = useMemo(() => {
    const draftPersistedIds = new Set(
      draftInventoryItems
        .map((item) => item.persistedId)
        .filter((value) => Number(value) > 0),
    );

    return inventoryItems
      .map((item) => item.id)
      .filter((id) => !draftPersistedIds.has(id));
  }, [draftInventoryItems, inventoryItems]);

  const hasPendingChanges =
    pendingNewItems.length > 0 || pendingDeletedIds.length > 0 || pendingUpdatedItems.length > 0;

  const saveMutation = useMutation({
    mutationFn: async () => {
      await Promise.all([
        ...pendingDeletedIds.map((id) => roomInventoriesApi.deleteInventory(id)),
        ...pendingUpdatedItems.map((item) =>
          roomInventoriesApi.updateInventory(item.persistedId, {
            quantity: Number(item.quantity) || 1,
          }),
        ),
        ...pendingNewItems.map((item) =>
          roomInventoriesApi.createInventory({
            roomId,
            equipmentId: item.equipmentId,
            itemType: item.itemType,
            quantity: Number(item.quantity) || 1,
            priceIfLost: Number(item.priceIfLost) || 0,
            isActive: true,
          }),
        ),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomInventory", roomId] });
      queryClient.invalidateQueries({ queryKey: ["equipmentSuggestions"] });
      window.dispatchEvent(new CustomEvent("equipment-usage-changed"));
      onClose();
    },
    onError: (error) => {
      setCreateFeedback(getApiMessage(error, "Không lưu được vật tư trong phòng."));
    },
  });

  const handleAddInventory = () => {
    setCreateFeedback("");

    if (!roomId || !inventoryForm.itemType.trim()) {
      setCreateFeedback("Vui lòng nhập tên vật tư trước khi thêm.");
      return;
    }

    const selectedEquipment = equipmentSuggestions.find(
      (item) => item.id === inventoryForm.equipmentId,
    );

    setDraftInventoryItems((current) => [
      ...current,
      {
        id: nextDraftId,
        persistedId: null,
        equipmentId: inventoryForm.equipmentId,
        equipmentCode: selectedEquipment?.itemCode ?? null,
        equipmentName: inventoryForm.itemType.trim(),
        itemType: inventoryForm.itemType.trim(),
        quantity: Number(inventoryForm.quantity) || 1,
        priceIfLost: Number(inventoryForm.priceIfLost) || 0,
      },
    ]);
    setNextDraftId((current) => current - 1);
    setInventoryForm({
      equipmentId: null,
      itemType: "",
      quantity: 1,
      priceIfLost: 0,
    });
    setCreateFeedback("Đã thêm vật tư vào bản nháp. Bấm Lưu để áp dụng.");
  };

  const handleCloneRoom = () => {
    setCloneFeedback("");
    setCloneFeedbackTone("success");

    if (!cloneRoomId) {
      setCloneFeedback("Vui lòng chọn phòng nguồn để clone vật tư.");
      setCloneFeedbackTone("warning");
      return;
    }

    if (!cloneSourceInventory.length) {
      setCloneFeedback("Phòng nguồn hiện chưa có vật tư để clone.");
      setCloneFeedbackTone("warning");
      return;
    }

    setDraftInventoryItems(
      cloneSourceInventory.map((item, index) => ({
        ...normalizeDraftItem(item, -(index + 1)),
        persistedId: null,
      })),
    );
    setNextDraftId(-(cloneSourceInventory.length + 1));
    setSelectedToDelete([]);
    setCloneFeedback(
      `Đã clone ${cloneSourceInventory.length} vật tư từ phòng ${selectedCloneRoom?.roomNumber} vào bản nháp. Bấm Lưu để áp dụng.`,
    );
  };

  const handleBulkDelete = (ids) => {
    setDraftInventoryItems((current) =>
      current.filter((item) => !ids.includes(item.persistedId ?? item.id)),
    );
    setSelectedToDelete([]);
  };

  const handleDraftQuantityChange = (itemId, nextValue) => {
    const normalizedQuantity = Math.max(1, Number.parseInt(nextValue, 10) || 1);

    setDraftInventoryItems((current) =>
      current.map((item) =>
        (item.persistedId ?? item.id) === itemId
          ? { ...item, quantity: normalizedQuantity }
          : item,
      ),
    );
  };

  const handleClose = () => {
    setDraftInventoryItems(
      inventoryItems.map((item, index) => normalizeDraftItem(item, -(index + 1))),
    );
    setSelectedToDelete([]);
    setCreateFeedback("");
    setCloneFeedback("");
    setCloneFeedbackTone("success");
    setCloneRoomId(null);
    setInventoryForm({
      equipmentId: null,
      itemType: "",
      quantity: 1,
      priceIfLost: 0,
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 md:px-8">
          <div className="flex items-start gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 shadow-inner">
              <Package2 className="size-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Vật tư phòng {roomNumber}
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Thêm nhanh vật tư cho phòng này và bấm Lưu để áp dụng thay đổi.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-2xl p-3 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto bg-slate-50/70 px-4 py-5 md:px-6 md:py-6">
          <SectionCard>
            <div className="space-y-5 p-5 md:p-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Thêm vật tư và clone từ phòng khác
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Bạn có thể thêm thủ công hoặc clone từ phòng khác vào bản nháp, sau đó bấm Lưu để xác nhận.
                </p>
              </div>

              <FeedbackBanner
                message={cloneFeedback}
                tone={cloneFeedbackTone}
                onClose={() => setCloneFeedback("")}
              />

              <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Phòng nguồn để clone
                  </span>
                  <Autocomplete
                    fullWidth
                    options={availableCloneRooms}
                    value={selectedCloneRoom}
                    disablePortal
                    ListboxProps={{ style: { maxHeight: 240 } }}
                    getOptionLabel={(option) =>
                      `Phòng ${option.roomNumber} - ${option.roomTypeName || "Không rõ loại"}`
                    }
                    onChange={(_, value) => setCloneRoomId(value?.id ?? null)}
                    sx={autocompleteSx}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Chọn phòng cần clone vật tư"
                      />
                    )}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCloneRoom}
                  disabled={!cloneRoomId || isCloneSourceInventoryLoading || saveMutation.isPending}
                  className="inline-flex h-14 items-center justify-center gap-2 self-start rounded-2xl bg-sky-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-sky-100 transition-all hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60 xl:mt-7"
                >
                  {isCloneSourceInventoryLoading ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  {isCloneSourceInventoryLoading ? "Đang tải..." : "Clone vật tư"}
                </button>
              </div>

              {cloneRoomId ? (
                <p className="text-xs font-semibold text-slate-400">
                  {isCloneSourceInventoryLoading
                    ? "Đang tải danh sách vật tư phòng nguồn..."
                    : `${cloneSourceInventory.length} vật tư sẽ được đưa vào bản nháp.`}
                </p>
              ) : null}

              <FeedbackBanner
                message={createFeedback}
                tone={
                  createFeedback.toLowerCase().includes("không đủ") ||
                  createFeedback.toLowerCase().includes("thiếu")
                    ? "warning"
                    : "success"
                }
                onClose={() => setCreateFeedback("")}
              />

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_140px_170px_180px]">
                <div className="space-y-2 xl:col-span-1">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Thiết bị có sẵn
                  </span>
                  <Autocomplete
                    fullWidth
                    options={equipmentSuggestions}
                    getOptionLabel={(option) => option.name ?? ""}
                    sx={autocompleteSx}
                    onChange={(_, value) =>
                      setInventoryForm((prev) => ({
                        ...prev,
                        equipmentId: value?.id ?? null,
                        itemType: value?.name ?? "",
                        priceIfLost: Number(
                          value?.defaultPriceIfLost ?? value?.basePrice ?? 0,
                        ),
                      }))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Tìm thiết bị có sẵn"
                      />
                    )}
                  />
                </div>

                <div className="space-y-2 xl:col-span-1">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Tên vật tư
                  </span>
                  <TextField
                    fullWidth
                    placeholder="Nhập tên vật tư"
                    value={inventoryForm.itemType}
                    sx={inputSx}
                    onChange={(event) =>
                      setInventoryForm((prev) => ({
                        ...prev,
                        itemType: event.target.value,
                        equipmentId: null,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Số lượng
                  </span>
                  <TextField
                    fullWidth
                    type="number"
                    placeholder="1"
                    sx={inputSx}
                    value={inventoryForm.quantity}
                    onChange={(event) =>
                      setInventoryForm((prev) => ({
                        ...prev,
                        quantity: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Giá đền bù
                  </span>
                  <TextField
                    fullWidth
                    type="number"
                    placeholder="0"
                    sx={inputSx}
                    value={inventoryForm.priceIfLost}
                    onChange={(event) =>
                      setInventoryForm((prev) => ({
                        ...prev,
                        priceIfLost: event.target.value,
                      }))
                    }
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddInventory}
                  disabled={saveMutation.isPending}
                  className="inline-flex min-h-14 items-center justify-center gap-2 self-end rounded-2xl bg-orange-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-orange-100 transition-all hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus className="size-4" />
                  Thêm vật tư
                </button>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Danh sách vật tư hiện có
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {`${draftSummary.totalItems} vật tư - ${draftSummary.totalQuantity} đơn vị - tổng đền bù ${formatCurrency(draftSummary.totalPenalty)}`}
                </p>
              </div>

              {selectedToDelete.length > 0 ? (
                <button
                  type="button"
                  onClick={() => handleBulkDelete(selectedToDelete)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-rose-100 transition-all hover:bg-rose-700"
                >
                  <Trash className="size-4" />
                  Xóa đã chọn
                </button>
              ) : null}
            </div>

            {draftInventoryItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <AlertTriangle className="size-6" />
                </div>
                <p className="text-lg font-black text-slate-900">
                  Phòng này chưa có vật tư nào.
                </p>
                <p className="max-w-lg text-sm font-medium text-slate-500">
                  Bạn có thể thêm thủ công hoặc clone từ phòng khác rồi bấm Lưu để cập nhật.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-100 text-left text-xs font-black uppercase tracking-widest text-slate-400">
                      <th className="w-14 px-5 py-4 text-center">Chọn</th>
                      <th className="px-5 py-4">Vật tư</th>
                      <th className="px-5 py-4 text-center">Số lượng</th>
                      <th className="px-5 py-4 text-right">Giá đền bù</th>
                      <th className="w-24 px-5 py-4 text-center">Xóa</th>
                    </tr>
                  </thead>

                  <tbody>
                    {draftInventoryItems.map((item) => (
                      <tr
                        key={`inventory-${item.persistedId ?? item.id}`}
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <td className="px-5 py-4 text-center">
                          <Checkbox
                            checked={selectedToDelete.includes(item.persistedId ?? item.id)}
                            onChange={() => {
                              const itemId = item.persistedId ?? item.id;
                              setSelectedToDelete((prev) =>
                                prev.includes(itemId)
                                  ? prev.filter((value) => value !== itemId)
                                  : [...prev, itemId],
                              );
                            }}
                          />
                        </td>

                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <div className="font-black text-slate-900">
                              {item.equipmentName || item.itemType}
                            </div>
                            {item.equipmentCode ? (
                              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Mã: {item.equipmentCode}
                              </div>
                            ) : null}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(event) =>
                              handleDraftQuantityChange(
                                item.persistedId ?? item.id,
                                event.target.value,
                              )
                            }
                            className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-bold text-slate-700 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                          />
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-slate-700">
                          {formatCurrency(item.priceIfLost)}
                        </td>

                        <td className="px-5 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleBulkDelete([item.persistedId ?? item.id])}
                            className="inline-flex rounded-2xl p-2.5 text-rose-500 transition-all hover:bg-rose-50 hover:text-rose-700"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4 md:px-8">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-2xl px-5 py-3 text-sm font-black uppercase tracking-wide text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={!hasPendingChanges || saveMutation.isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-orange-100 transition-all hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saveMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {saveMutation.isPending ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}
