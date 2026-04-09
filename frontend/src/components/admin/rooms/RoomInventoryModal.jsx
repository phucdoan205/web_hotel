import { useMemo, useState } from "react";
import { Autocomplete, Checkbox, TextField } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Copy,
  LoaderCircle,
  Package2,
  Plus,
  Trash2,
  Trash,
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

const formatCurrency = (value) => `${Number(value ?? 0).toLocaleString("vi-VN")} d`;

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

function SectionCard({ accent = "slate", children }) {
  const accentClass =
    accent === "sky"
      ? "border-sky-100 bg-gradient-to-br from-sky-50 via-white to-white"
      : "border-slate-200 bg-white";

  return (
    <section
      className={`overflow-hidden rounded-[28px] border shadow-[0_18px_45px_rgba(15,23,42,0.06)] ${accentClass}`}
    >
      {children}
    </section>
  );
}

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
  const [inventoryForm, setInventoryForm] = useState({
    equipmentId: null,
    itemType: "",
    quantity: 1,
    priceIfLost: 0,
  });
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

  const clonePreviewSummary = useMemo(
    () => ({
      totalItems: cloneSourceInventory.length,
      totalQuantity: cloneSourceInventory.reduce(
        (sum, item) => sum + Number(item.quantity ?? 0),
        0,
      ),
      totalPenalty: cloneSourceInventory.reduce(
        (sum, item) => sum + Number(item.priceIfLost ?? 0) * Number(item.quantity ?? 0),
        0,
      ),
    }),
    [cloneSourceInventory],
  );

  const isPreviewingCloneRoom = Boolean(selectedCloneRoom);
  const displayedInventoryItems = isPreviewingCloneRoom ? cloneSourceInventory : inventoryItems;

  const createMutation = useMutation({
    mutationFn: (payload) => roomInventoriesApi.createInventory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomInventory", roomId] });
      setInventoryForm({
        equipmentId: null,
        itemType: "",
        quantity: 1,
        priceIfLost: 0,
      });
      setCreateFeedback("Da them vat tu vao phong.");
    },
    onError: (error) => {
      setCreateFeedback(getApiMessage(error, "Khong the them vat tu vao phong."));
    },
  });

  const cloneMutation = useMutation({
    mutationFn: (payload) => roomInventoriesApi.cloneInventory(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["roomInventory", roomId] });
      queryClient.invalidateQueries({ queryKey: ["housekeepingInventoryReports"] });
      setCloneFeedback(
        response?.message || "Da clone vat tu tu phong nguon sang phong hien tai.",
      );
    },
    onError: (error) => {
      setCloneFeedback(getApiMessage(error, "Khong the clone vat tu tu phong khac."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => roomInventoriesApi.deleteInventory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomInventory", roomId] });
    },
  });

  const handleAddInventory = () => {
    setCreateFeedback("");

    if (!roomId || !inventoryForm.itemType.trim()) {
      setCreateFeedback("Vui long nhap ten vat tu truoc khi them.");
      return;
    }

    createMutation.mutate({
      roomId,
      equipmentId: inventoryForm.equipmentId,
      itemType: inventoryForm.itemType.trim(),
      quantity: Number(inventoryForm.quantity) || 1,
      priceIfLost: Number(inventoryForm.priceIfLost) || 0,
      isActive: true,
    });
  };

  const handleCloneRoom = () => {
    setCloneFeedback("");

    if (!roomId || !cloneRoomId) {
      setCloneFeedback("Vui long chon phong nguon de clone vat tu.");
      return;
    }

    cloneMutation.mutate({
      sourceRoomId: cloneRoomId,
      targetRoomId: roomId,
    });
  };

  const handleBulkDelete = async (ids) => {
    await Promise.all(ids.map((id) => roomInventoriesApi.deleteInventory(id)));
    queryClient.invalidateQueries({ queryKey: ["roomInventory", roomId] });
    setSelectedToDelete([]);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={onClose}
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
                Vat tu phong {roomNumber}
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Them nhanh vat tu hoac clone cau hinh vat tu tu phong khac sang phong nay.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl p-3 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto bg-slate-50/70 px-4 py-5 md:px-6 md:py-6">
          <SectionCard accent="sky">
            <div className="space-y-5 p-5 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Clone tu phong khac</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Chon phong nguon va xem truoc danh sach vat tu ngay trong modal nay.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 self-start rounded-2xl border border-sky-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-sky-700">
                  <Copy className="size-4" />
                  Clone theo phong
                </div>
              </div>

              <FeedbackBanner
                message={cloneFeedback}
                tone={
                  cloneFeedback.toLowerCase().includes("thieu") ||
                  cloneFeedback.includes("Housekeeping")
                    ? "warning"
                    : "success"
                }
                onClose={() => setCloneFeedback("")}
              />

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Phong nguon
                  </span>
                  <Autocomplete
                    fullWidth
                    options={availableCloneRooms}
                    value={selectedCloneRoom}
                    disablePortal
                    ListboxProps={{ style: { maxHeight: 240 } }}
                    getOptionLabel={(option) =>
                      `Phong ${option.roomNumber} - ${option.roomTypeName || "Khong ro loai"}`
                    }
                    onChange={(_, value) => setCloneRoomId(value?.id ?? null)}
                    sx={autocompleteSx}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Chon phong can clone vat tu"
                      />
                    )}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCloneRoom}
                  disabled={cloneMutation.isPending || !cloneRoomId}
                  className="inline-flex min-h-14 items-center justify-center gap-2 self-end rounded-2xl bg-sky-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-sky-100 transition-all hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {cloneMutation.isPending ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  {cloneMutation.isPending ? "Dang clone..." : "Clone vat tu"}
                </button>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="space-y-5 p-5 md:p-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">Them vat tu thu cong</h3>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Giao dien nay da duoc canh lai de dong bo hon voi phan quan tri ben ngoai.
                </p>
              </div>

              <FeedbackBanner
                message={createFeedback}
                tone={
                  createFeedback.toLowerCase().includes("khong du") ||
                  createFeedback.toLowerCase().includes("thieu")
                    ? "warning"
                    : "success"
                }
                onClose={() => setCreateFeedback("")}
              />

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_140px_170px_180px]">
                <div className="space-y-2 xl:col-span-1">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Thiet bi co san
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
                        placeholder="Tim thiet bi co san"
                      />
                    )}
                  />
                </div>

                <div className="space-y-2 xl:col-span-1">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Ten vat tu
                  </span>
                  <TextField
                    fullWidth
                    placeholder="Nhap ten vat tu"
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
                    So luong
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
                    Gia den bu
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
                  disabled={createMutation.isPending}
                  className="inline-flex min-h-14 items-center justify-center gap-2 self-end rounded-2xl bg-orange-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-orange-100 transition-all hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {createMutation.isPending ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                  {createMutation.isPending ? "Dang them..." : "Them vat tu"}
                </button>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {isPreviewingCloneRoom
                    ? `Xem truoc vat tu phong ${selectedCloneRoom.roomNumber}`
                    : "Danh sach vat tu hien co"}
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {isPreviewingCloneRoom
                    ? `${clonePreviewSummary.totalItems} vat tu - ${clonePreviewSummary.totalQuantity} don vi - tong den bu ${formatCurrency(clonePreviewSummary.totalPenalty)}`
                    : `${inventoryItems.length} vat tu dang gan voi phong ${roomNumber}.`}
                </p>
              </div>

              {isPreviewingCloneRoom ? (
                <button
                  type="button"
                  onClick={() => setCloneRoomId(null)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black uppercase tracking-wide text-slate-600 transition-all hover:bg-slate-50"
                >
                  Quay lai phong hien tai
                </button>
              ) : selectedToDelete.length > 0 ? (
                <button
                  type="button"
                  onClick={() => handleBulkDelete(selectedToDelete)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-rose-100 transition-all hover:bg-rose-700"
                >
                  <Trash className="size-4" />
                  Xoa da chon
                </button>
              ) : null}
            </div>

            {isPreviewingCloneRoom && isCloneSourceInventoryLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                <LoaderCircle className="size-6 animate-spin text-sky-600" />
                <p className="text-sm font-semibold text-slate-500">
                  Dang tai danh sach vat tu phong nguon...
                </p>
              </div>
            ) : displayedInventoryItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <AlertTriangle className="size-6" />
                </div>
                <p className="text-lg font-black text-slate-900">
                  {isPreviewingCloneRoom
                    ? "Phong nguon chua co vat tu de clone."
                    : "Phong nay chua co vat tu nao."}
                </p>
                <p className="max-w-lg text-sm font-medium text-slate-500">
                  {isPreviewingCloneRoom
                    ? "Hay chon mot phong khac hoac quay lai danh sach phong hien tai."
                    : "Ban co the them tay hoac clone nhanh tu mot phong khac."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-100 text-left text-xs font-black uppercase tracking-widest text-slate-400">
                      {!isPreviewingCloneRoom ? (
                        <th className="w-14 px-5 py-4 text-center">Chon</th>
                      ) : null}
                      <th className="px-5 py-4">
                        {isPreviewingCloneRoom ? "Vat tu phong nguon" : "Vat tu"}
                      </th>
                      <th className="px-5 py-4 text-center">So luong</th>
                      <th className="px-5 py-4 text-right">Gia den bu</th>
                      {!isPreviewingCloneRoom ? (
                        <th className="w-24 px-5 py-4 text-center">Xoa</th>
                      ) : null}
                    </tr>
                  </thead>

                  <tbody>
                    {displayedInventoryItems.map((item) => (
                      <tr
                        key={`${isPreviewingCloneRoom ? "preview" : "current"}-${item.id}`}
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        {!isPreviewingCloneRoom ? (
                          <td className="px-5 py-4 text-center">
                            <Checkbox
                              checked={selectedToDelete.includes(item.id)}
                              onChange={() =>
                                setSelectedToDelete((prev) =>
                                  prev.includes(item.id)
                                    ? prev.filter((value) => value !== item.id)
                                    : [...prev, item.id],
                                )
                              }
                            />
                          </td>
                        ) : null}

                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <div className="font-black text-slate-900">
                              {item.equipmentName || item.itemType}
                            </div>
                            {item.equipmentCode ? (
                              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Ma: {item.equipmentCode}
                              </div>
                            ) : null}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-center font-bold text-slate-700">
                          {item.quantity}
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-slate-700">
                          {formatCurrency(item.priceIfLost)}
                        </td>

                        {!isPreviewingCloneRoom ? (
                          <td className="px-5 py-4 text-center">
                            <button
                              type="button"
                              onClick={() => deleteMutation.mutate(item.id)}
                              className="inline-flex rounded-2xl p-2.5 text-rose-500 transition-all hover:bg-rose-50 hover:text-rose-700"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>

        <div className="flex justify-end border-t border-slate-100 px-6 py-4 md:px-8">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl px-5 py-3 text-sm font-black uppercase tracking-wide text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700"
          >
            Dong
          </button>
        </div>
      </div>
    </div>
  );
}
