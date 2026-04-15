import React, { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, CircleHelp, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { bookingsApi } from "../../../api/admin/bookingsApi";
import { roomTypesApi } from "../../../api/admin/roomTypesApi";
import { roomsApi } from "../../../api/admin/roomsApi";
import { getVietnamDateKey, getVietnamDateOffsetKey } from "../../../utils/vietnamTime";

const initialGuestInfo = { name: "", phone: "", email: "" };

const BookingCreateModal = ({ open, onClose, onNotice }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [guestInfo, setGuestInfo] = useState(initialGuestInfo);
  const [checkInDate, setCheckInDate] = useState(getVietnamDateKey());
  const [checkOutDate, setCheckOutDate] = useState(getVietnamDateOffsetKey(1));
  const [inlineNotice, setInlineNotice] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { data: roomTypes = [], isLoading: loadingTypes } = useQuery({
    queryKey: ["roomTypes"],
    queryFn: async () => {
      const res = await roomTypesApi.getRoomTypes({ pageSize: 50 });
      return res.items || [];
    },
    enabled: open,
  });

  const { data: allRooms = [], isLoading: loadingRooms } = useQuery({
    queryKey: ["rooms", "for-booking"],
    queryFn: async () => {
      const res = await roomsApi.getRooms({
        status: "",
        pageSize: 200,
      });

      return (res.items || []).filter(
        (room) => room.status === "Available" || room.status === "Occupied",
      );
    },
    enabled: open,
  });

  const isLoading = loadingTypes || loadingRooms;

  const resetForm = () => {
    setSelectedRooms([]);
    setGuestInfo(initialGuestInfo);
    setCheckInDate(getVietnamDateKey());
    setCheckOutDate(getVietnamDateOffsetKey(1));
    setInlineNotice(null);
    setShowConfirmation(false);
  };

  const buildPayload = () => ({
    guestName: guestInfo.name.trim(),
    guestPhone: guestInfo.phone.trim(),
    guestEmail: guestInfo.email.trim(),
    bookingDetails: selectedRooms.map((room) => ({
      roomTypeId: room.roomTypeId || room.roomType?.id,
      roomId: room.id,
      checkInDate,
      checkOutDate,
    })),
  });

  const confirmationRooms = useMemo(
    () =>
      selectedRooms.map((room) => {
        const roomType = roomTypes.find((item) => item.id === (room.roomTypeId || room.roomType?.id));

        return {
          id: room.id,
          roomNumber: room.roomNumber,
          floor: room.floor,
          roomTypeName: room.roomType?.name || roomType?.name || "Phòng",
          pricePerNight: roomType?.basePrice || room.roomType?.basePrice || 0,
        };
      }),
    [roomTypes, selectedRooms],
  );

  const createMutation = useMutation({
    mutationFn: (payload) => bookingsApi.createBooking(payload),
    onSuccess: async (createdBooking) => {
      try {
        for (const room of selectedRooms) {
          await roomsApi.updateRoomStatus(room.id, "Occupied");
        }
      } catch {
        onNotice?.({
          type: "warning",
          title: "Booking đã tạo nhưng còn thiếu cập nhật",
          message: "Đặt phòng thành công nhưng có lỗi khi cập nhật trạng thái phòng.",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["confirmed-check-ins"] });
      queryClient.invalidateQueries({ queryKey: ["arrivals"] });
      queryClient.invalidateQueries({ queryKey: ["in-house"] });
      queryClient.invalidateQueries({ queryKey: ["departures"] });
      setShowConfirmation(false);
      onClose();
      resetForm();
      navigate(`/admin/check-in?tab=in&date=${checkInDate}`);
      onNotice?.({
        type: "success",
        title: "Đã tạo booking mới",
        message: `Mã booking ${createdBooking.bookingCode} đã được tạo thành công.`,
      });
    },
    onError: (err) => {
      setInlineNotice({
        type: "warning",
        message: err.response?.data?.message || "Có lỗi khi tạo booking.",
      });
      setShowConfirmation(false);
    },
  });

  const showMessage = (type, message) => {
    setInlineNotice({ type, message });
  };

  const validateForm = () => {
    if (selectedRooms.length === 0) {
      showMessage("warning", "Vui lòng chọn ít nhất một phòng.");
      return false;
    }

    if (!guestInfo.name.trim()) {
      showMessage("warning", "Vui lòng nhập tên khách hàng.");
      return false;
    }

    if (!checkInDate || !checkOutDate) {
      showMessage("warning", "Vui lòng chọn ngày check-in và check-out.");
      return false;
    }

    if (checkInDate >= checkOutDate) {
      showMessage("warning", "Ngày check-out phải sau ngày check-in.");
      return false;
    }

    return true;
  };

  const toggleRoomSelection = (room) => {
    if (room.status === "Occupied") {
      showMessage("warning", "Phòng này đang có khách lưu trú, không thể chọn.");
      return;
    }

    setInlineNotice(null);
    setShowConfirmation(false);
    setSelectedRooms((prev) => {
      const exists = prev.some((item) => item.id === room.id);
      return exists ? prev.filter((item) => item.id !== room.id) : [...prev, room];
    });
  };

  const handlePrepareConfirmation = () => {
    if (!validateForm()) return;

    setInlineNotice({
      type: "question",
      message: "Xác nhận đặt booking này?",
    });
    setShowConfirmation(true);
  };

  const handleConfirmCreate = () => {
    createMutation.mutate(buildPayload());
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b bg-gray-50 px-8 py-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Tạo Booking Mới</h2>
            <p className="text-sm text-gray-500">Chọn phòng và nhập thông tin khách hàng</p>
          </div>
          <button onClick={handleClose} className="rounded-2xl p-3 transition hover:bg-gray-200">
            <X size={26} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          {(inlineNotice || showConfirmation) && (
            <div className="border-b bg-white px-8 py-4">
              {inlineNotice ? (
                <div
                  className={`rounded-3xl border px-5 py-4 ${
                    inlineNotice.type === "warning"
                      ? "border-amber-200 bg-amber-50 text-amber-900"
                      : inlineNotice.type === "question"
                        ? "border-sky-200 bg-sky-50 text-sky-900"
                        : "border-emerald-200 bg-emerald-50 text-emerald-900"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {inlineNotice.type === "warning" ? (
                      <AlertTriangle className="mt-0.5 text-amber-600" size={20} />
                    ) : inlineNotice.type === "question" ? (
                      <CircleHelp className="mt-0.5 text-sky-600" size={20} />
                    ) : (
                      <CheckCircle2 className="mt-0.5 text-emerald-600" size={20} />
                    )}
                    <div className="flex-1">
                      <p className="font-bold">
                        {inlineNotice.type === "question"
                          ? "Xác nhận đặt phòng"
                          : inlineNotice.type === "warning"
                            ? "Cần kiểm tra lại"
                            : "Hoàn tất"}
                      </p>
                      <p className="text-sm">{inlineNotice.message}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {showConfirmation ? (
                <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-black text-slate-900">Danh sách phòng sẽ đặt</p>
                      <p className="text-sm text-slate-500">
                        {guestInfo.name || "Khách hàng"} sẽ đặt {confirmationRooms.length} phòng.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowConfirmation(false)}
                        className="rounded-2xl bg-white px-4 py-2 font-bold text-slate-600 transition hover:bg-slate-100"
                      >
                        Không
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmCreate}
                        disabled={createMutation.isPending}
                        className="rounded-2xl bg-orange-600 px-4 py-2 font-black text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-300"
                      >
                        {createMutation.isPending ? "Đang tạo..." : "Có, xác nhận đặt"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {confirmationRooms.map((room) => (
                      <div
                        key={room.id}
                        className="rounded-2xl border border-white bg-white px-4 py-4 shadow-sm"
                      >
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                          Phòng {room.roomNumber}
                        </p>
                        <p className="mt-1 text-lg font-black text-slate-900">{room.roomTypeName}</p>
                        <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                          <span>Tầng {room.floor}</span>
                          <span className="font-bold text-orange-600">
                            {room.pricePerNight.toLocaleString("vi-VN")} đ/đêm
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          <div className="flex h-full min-h-0 overflow-hidden">
            <div className="flex w-96 min-h-0 flex-col overflow-y-auto border-r bg-gray-50 px-6 py-4">
              <h3 className="mb-2 text-lg font-bold">Thông tin đặt phòng</h3>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-bold text-gray-600">Họ và tên *</label>
                  <input
                    type="text"
                    value={guestInfo.name}
                    onChange={(e) => {
                      setGuestInfo({ ...guestInfo, name: e.target.value });
                      setInlineNotice(null);
                    }}
                    className="w-full rounded-2xl border border-gray-300 px-4 py-2 outline-none focus:border-orange-500"
                    placeholder="Nhập họ tên khách hàng"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-gray-600">Số điện thoại</label>
                  <input
                    type="tel"
                    value={guestInfo.phone}
                    onChange={(e) => {
                      setGuestInfo({ ...guestInfo, phone: e.target.value });
                      setInlineNotice(null);
                    }}
                    className="w-full rounded-2xl border border-gray-300 px-4 py-2 outline-none focus:border-orange-500"
                    placeholder="Số điện thoại"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-gray-600">Email</label>
                  <input
                    type="email"
                    value={guestInfo.email}
                    onChange={(e) => {
                      setGuestInfo({ ...guestInfo, email: e.target.value });
                      setInlineNotice(null);
                    }}
                    className="w-full rounded-2xl border border-gray-300 px-4 py-2 outline-none focus:border-orange-500"
                    placeholder="Email (tùy chọn)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-bold text-gray-600">Ngày check-in *</label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => {
                        setCheckInDate(e.target.value);
                        setInlineNotice(null);
                        setShowConfirmation(false);
                      }}
                      min={getVietnamDateKey()}
                      className="w-full rounded-2xl border border-gray-300 px-4 py-2 outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-bold text-gray-600">Ngày check-out *</label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => {
                        setCheckOutDate(e.target.value);
                        setInlineNotice(null);
                        setShowConfirmation(false);
                      }}
                      min={checkInDate || getVietnamDateKey()}
                      className="w-full rounded-2xl border border-gray-300 px-4 py-2 outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-orange-200 bg-white px-5 py-4 text-center">
                <p className="text-sm text-gray-500">Đã chọn</p>
                <p className="text-3xl font-black text-orange-600">{selectedRooms.length}</p>
                <p className="text-sm font-semibold text-gray-700">phòng</p>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-8 py-4">
              <h3 className="mb-3 text-xl font-bold">Chọn phòng</h3>

              {isLoading ? (
                <div className="py-12 text-center text-gray-500">Đang tải danh sách phòng...</div>
              ) : (
                <div className="space-y-5 pb-4">
                  {roomTypes.map((roomType) => {
                    const roomsOfType = allRooms.filter((room) => room.roomTypeId === roomType.id);

                    if (roomsOfType.length === 0) return null;

                    return (
                      <div key={roomType.id}>
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="text-lg font-bold">{roomType.name}</h4>
                          <p className="font-semibold text-orange-600">
                            {(roomType.basePrice || 0).toLocaleString("vi-VN")} đ/đêm
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                          {roomsOfType.map((room) => {
                            const isSelected = selectedRooms.some((item) => item.id === room.id);
                            const isOccupied = room.status === "Occupied";

                            return (
                              <button
                                key={room.id}
                                type="button"
                                onClick={() => toggleRoomSelection(room)}
                                className={`relative rounded-3xl border-2 px-5 py-4 text-left transition-all ${
                                  isOccupied
                                    ? "cursor-not-allowed border-gray-300 bg-gray-50 opacity-75"
                                    : isSelected
                                      ? "border-orange-500 bg-orange-50 shadow-sm"
                                      : "border-gray-200 hover:border-orange-300 hover:shadow-md"
                                }`}
                              >
                                {isOccupied ? (
                                  <div className="absolute -right-2 -top-2 flex items-center gap-1 rounded-full bg-rose-500 px-3 py-1 text-[10px] font-bold text-white shadow">
                                    <AlertTriangle size={14} />
                                    OCCUPIED
                                  </div>
                                ) : null}

                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="text-2xl font-black text-gray-900">{room.roomNumber}</p>
                                    <p className="text-xs text-gray-500">Tầng {room.floor}</p>
                                  </div>
                                  {isSelected && !isOccupied ? (
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                                      ✓
                                    </div>
                                  ) : null}
                                </div>

                                <div className="mt-4 space-y-1 text-sm">
                                  <p>
                                    Sức chứa: {roomType.capacityAdults} NL, {roomType.capacityChildren} TE
                                  </p>
                                  <p className="font-semibold text-orange-600">
                                    {(roomType.basePrice || 0).toLocaleString("vi-VN")} đ/đêm
                                  </p>
                                </div>

                                {isOccupied ? (
                                  <div className="mt-3 flex items-center gap-1 text-xs font-medium text-rose-600">
                                    <AlertTriangle size={16} />
                                    Phòng này đang có khách lưu trú
                                  </div>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 border-t bg-gray-50 px-8 py-4">
          <button
            onClick={handleClose}
            className="rounded-2xl bg-gray-100 px-5 py-3 font-bold text-gray-600 transition hover:bg-gray-200"
          >
            Hủy
          </button>
          <button
            onClick={handlePrepareConfirmation}
            disabled={selectedRooms.length === 0 || createMutation.isPending}
            className="rounded-2xl bg-orange-600 px-5 py-3 font-black text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Xác nhận đặt {selectedRooms.length} phòng
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingCreateModal;
