import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, BedDouble, CalendarRange, Check, DoorClosed, Heart, Users } from "lucide-react";
import { roomsApi } from "../../api/admin/roomsApi";
import { userBookingsApi } from "../../api/user/bookingsApi";
import { getStoredAuth } from "../../utils/authStorage";
import { isFavoriteRoomType, toggleFavoriteRoomType } from "../../utils/userFavorites";

const fallbackImage =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";

const DEFAULT_CHECK_IN_HOUR = 14;
const DEFAULT_CHECK_OUT_HOUR = 12;

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const createDefaultDateTime = (offsetDays, hour) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hour, 0, 0, 0);
  return date;
};

const toDateTimeInputValue = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const toApiDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const calculateStayDays = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return 1;
  }

  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
};

const createInitialFilters = (filters) => ({
  checkIn:
    filters?.checkIn || toDateTimeInputValue(createDefaultDateTime(0, DEFAULT_CHECK_IN_HOUR)),
  checkOut:
    filters?.checkOut || toDateTimeInputValue(createDefaultDateTime(1, DEFAULT_CHECK_OUT_HOUR)),
  adults: Math.max(1, Number(filters?.adults) || 1),
  children: Math.max(0, Number(filters?.children) || 0),
});

const normalizeImageUrls = (imageUrls) => [...new Set((imageUrls ?? []).filter(Boolean))];

const formatDateTime = (value) => {
  if (!value) return "Chưa chọn";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Chưa chọn";
  return parsed.toLocaleString("vi-VN");
};

const buildRoomTypeFromRooms = (rooms, fallbackRoomType, id) => {
  const firstRoom = rooms[0];

  return {
    roomTypeId: firstRoom?.roomTypeId ?? fallbackRoomType?.roomTypeId ?? Number(id),
    roomTypeName: firstRoom?.roomTypeName ?? fallbackRoomType?.roomTypeName ?? "Loại phòng",
    basePrice: firstRoom?.basePrice ?? fallbackRoomType?.basePrice ?? 0,
    capacityAdults: firstRoom?.capacityAdults ?? fallbackRoomType?.capacityAdults ?? 0,
    capacityChildren: firstRoom?.capacityChildren ?? fallbackRoomType?.capacityChildren ?? 0,
    bedType: firstRoom?.bedType ?? fallbackRoomType?.bedType ?? "",
    size: firstRoom?.size ?? fallbackRoomType?.size ?? null,
    amenities: firstRoom?.amenities ?? fallbackRoomType?.amenities ?? [],
    imageUrls: normalizeImageUrls(firstRoom?.imageUrls ?? fallbackRoomType?.imageUrls ?? []),
  };
};

const RoomDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const roomTypeFromState = location.state?.roomType ?? null;
  const [filters, setFilters] = useState(() => createInitialFilters(location.state?.filters));
  const [appliedFilters, setAppliedFilters] = useState(() => createInitialFilters(location.state?.filters));
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);

  const availableRoomsQuery = useQuery({
    queryKey: ["user-room-type-detail", id, appliedFilters],
    queryFn: () =>
      roomsApi.getAvailableRooms({
        roomTypeId: Number(id),
        checkIn: toApiDate(appliedFilters.checkIn),
        checkOut: toApiDate(appliedFilters.checkOut),
        adults: appliedFilters.adults,
        children: appliedFilters.children,
        page: 1,
        pageSize: 100,
      }),
    enabled: Boolean(id),
  });

  const createBookingMutation = useMutation({
    mutationFn: (payload) => userBookingsApi.createBooking(payload),
    onSuccess: (createdBooking) => {
      navigate("/booking-history", {
        state: {
          notice: {
            type: "success",
            message: `Đã tạo booking ${createdBooking.bookingCode} ở trạng thái Pending.`,
          },
        },
      });
    },
    onError: (error) => {
      setSubmitMessage({
        type: "error",
        text: error.response?.data?.message || error.message || "Không thể tạo booking.",
      });
    },
  });

  const availableRooms = useMemo(
    () => (availableRoomsQuery.data?.items ?? []).filter((room) => room.status === "Available"),
    [availableRoomsQuery.data?.items],
  );

  const roomType = useMemo(
    () => buildRoomTypeFromRooms(availableRooms, roomTypeFromState, id),
    [availableRooms, id, roomTypeFromState],
  );

  useEffect(() => {
    if (!availableRooms.length) {
      setSelectedRoomId(null);
      return;
    }

    setSelectedRoomId((current) =>
      availableRooms.some((room) => room.id === current) ? current : availableRooms[0].id,
    );
  }, [availableRooms]);

  const selectedRoom =
    availableRooms.find((room) => room.id === selectedRoomId) ?? availableRooms[0] ?? null;

  const stayDays = useMemo(
    () => calculateStayDays(appliedFilters.checkIn, appliedFilters.checkOut),
    [appliedFilters.checkIn, appliedFilters.checkOut],
  );
  const totalPrice = (roomType.basePrice || 0) * stayDays;
  const imageUrls = roomType.imageUrls.length ? roomType.imageUrls : [fallbackImage];

  useEffect(() => {
    if (!roomType.roomTypeId) return;
    setIsFavorite(isFavoriteRoomType(roomType.roomTypeId));
  }, [roomType.roomTypeId]);

  const handleFilterChange = (field, value) => {
    setFilters((current) => {
      const nextFilters = {
        ...current,
        [field]: value,
      };

      if (field === "checkIn" || field === "checkOut") {
        setAppliedFilters((currentApplied) => ({
          ...currentApplied,
          [field]: value,
        }));
      }

      return nextFilters;
    });
  };

  const handleToggleFavorite = () => {
    const result = toggleFavoriteRoomType({
      ...roomType,
      imageUrls,
    });
    setIsFavorite(result.isFavorite);
  };

  const handleCreateBooking = () => {
    const auth = getStoredAuth();
    if (!auth?.token) {
      navigate("/login");
      return;
    }

    if (!selectedRoom) {
      setSubmitMessage({ type: "error", text: "Hiện chưa có phòng khả dụng để đặt." });
      return;
    }

    const checkInDate = toApiDate(appliedFilters.checkIn);
    const checkOutDate = toApiDate(appliedFilters.checkOut);

    if (!checkInDate || !checkOutDate || new Date(checkOutDate) <= new Date(checkInDate)) {
      setSubmitMessage({ type: "error", text: "Vui lòng chọn thời gian nhận và trả phòng hợp lệ." });
      return;
    }

    setSubmitMessage(null);
    createBookingMutation.mutate({
      bookingDetails: [
        {
          roomId: selectedRoom.id,
          roomTypeId: roomType.roomTypeId,
          checkInDate,
          checkOutDate,
        },
      ],
    });
  };

  if (availableRoomsQuery.isLoading && !roomTypeFromState) {
    return (
      <div className="rounded-[32px] bg-white p-10 text-center text-sm font-semibold text-slate-500 shadow-sm">
        Đang tải chi tiết loại phòng...
      </div>
    );
  }

  if (!roomType.roomTypeId) {
    return (
      <div className="rounded-[32px] bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Không tìm thấy loại phòng</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Loại phòng này hiện không còn dữ liệu để hiển thị.
        </p>
        <button
          type="button"
          onClick={() => navigate("/booking")}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/booking")}
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-sm font-semibold text-slate-500">Chi tiết loại phòng</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            {roomType.roomTypeName || "Loại phòng"}
          </h1>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6">
          <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={handleToggleFavorite}
              className={`absolute right-6 top-6 z-10 flex h-12 w-12 items-center justify-center rounded-full border transition ${
                isFavorite
                  ? "border-rose-500 bg-rose-500 text-white shadow-lg shadow-rose-200"
                  : "border-white/70 bg-white/80 text-slate-900 backdrop-blur-md hover:bg-white"
              }`}
              aria-label={isFavorite ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
            >
              <Heart size={22} fill={isFavorite ? "currentColor" : "none"} />
            </button>
            <img src={imageUrls[0]} alt={roomType.roomTypeName} className="h-[380px] w-full object-cover" />
          </div>

          {imageUrls.length > 1 ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {imageUrls.slice(1, 4).map((imageUrl) => (
                <div
                  key={imageUrl}
                  className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm"
                >
                  <img src={imageUrl} alt={roomType.roomTypeName} className="h-40 w-full object-cover" />
                </div>
              ))}
            </div>
          ) : null}

          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Loại phòng
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">
                  {roomType.roomTypeName || "Loại phòng"}
                </h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-600">
                Còn {availableRooms.length} phòng Available
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-5">
                <Users size={18} className="text-blue-600" />
                <p className="mt-3 text-sm font-semibold text-slate-500">Sức chứa</p>
                <p className="mt-1 text-base font-bold text-slate-900">
                  {roomType.capacityAdults} người lớn, {roomType.capacityChildren} trẻ em
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <BedDouble size={18} className="text-blue-600" />
                <p className="mt-3 text-sm font-semibold text-slate-500">Loại giường</p>
                <p className="mt-1 text-base font-bold text-slate-900">
                  {roomType.bedType || "Đang cập nhật"}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <DoorClosed size={18} className="text-blue-600" />
                <p className="mt-3 text-sm font-semibold text-slate-500">Diện tích</p>
                <p className="mt-1 text-base font-bold text-slate-900">
                  {roomType.size ? `${roomType.size} m2` : "Đang cập nhật"}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-bold text-slate-900">Tiện ích loại phòng</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(roomType.amenities.length ? roomType.amenities : ["Phòng sạch sẽ", "Không gian riêng tư"]).map(
                  (amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <Check size={16} />
                      </span>
                      <span>{amenity}</span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Chọn phòng cụ thể</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Chỉ hiển thị các phòng đang ở trạng thái Available trong khoảng ngày bạn chọn.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                {availableRooms.length} phòng Available
              </span>
            </div>

            {availableRooms.length ? (
              <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {availableRooms.map((room) => {
                  const isSelected = room.id === selectedRoom?.id;

                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                      }`}
                    >
                      <p className="text-sm font-semibold text-slate-500">Phòng</p>
                      <p className="mt-1 text-xl font-black text-slate-900">{room.roomNumber}</p>
                      <p className="mt-2 text-xs font-semibold text-emerald-600">Available</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm font-semibold text-slate-500">
                Không có phòng Available trong khoảng ngày đã chọn.
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Tổng giá lưu trú</p>
            <p className="mt-3 text-4xl font-black tracking-tight text-slate-900">
              {formatCurrency(totalPrice)}
            </p>
            <p className="mt-2 text-sm font-medium text-slate-500">
              {formatCurrency(roomType.basePrice)} / đêm
            </p>

            <div className="mt-6 space-y-4 rounded-3xl bg-slate-50 p-5">
              <div className="flex items-start gap-3">
                <CalendarRange size={18} className="mt-0.5 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Thời gian lưu trú</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Người lớn: {appliedFilters.adults} | Trẻ em: {appliedFilters.children}
                  </p>
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Nhận phòng</span>
                <input
                  type="datetime-local"
                  value={filters.checkIn}
                  onChange={(event) => handleFilterChange("checkIn", event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Trả phòng</span>
                <input
                  type="datetime-local"
                  value={filters.checkOut}
                  onChange={(event) => handleFilterChange("checkOut", event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <div className="rounded-2xl bg-blue-50 px-4 py-3 text-center text-sm font-bold text-blue-700">
                {stayDays} ngày
              </div>
            </div>

            <div className="mt-6 rounded-3xl bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">Phòng đang chọn</p>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {selectedRoom ? `Phòng ${selectedRoom.roomNumber}` : "Chưa có phòng Available"}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {formatDateTime(appliedFilters.checkIn)} - {formatDateTime(appliedFilters.checkOut)}
              </p>
              <p className="mt-3 text-sm font-semibold text-rose-500">
                Còn {availableRooms.length} phòng Available để chọn
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {submitMessage ? (
                <div
                  className={`rounded-2xl px-4 py-3 text-sm font-bold ${
                    submitMessage.type === "error"
                      ? "bg-rose-50 text-rose-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {submitMessage.text}
                </div>
              ) : null}

              <button
                type="button"
                disabled={!selectedRoom || createBookingMutation.isPending}
                onClick={handleCreateBooking}
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-blue-600 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {selectedRoom
                  ? createBookingMutation.isPending
                    ? "Đang tạo booking..."
                    : `Đặt phòng ${selectedRoom.roomNumber}`
                  : "Chưa có phòng để chọn"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/booking")}
                className="flex h-12 w-full items-center justify-center rounded-2xl border border-slate-200 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Quay lại danh sách
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default RoomDetailPage;
