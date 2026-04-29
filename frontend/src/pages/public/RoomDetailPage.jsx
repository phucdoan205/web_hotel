import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, BedDouble, CalendarRange, Check, DoorClosed, Heart, Users, Star } from "lucide-react";
import { roomsApi } from "../../api/admin/roomsApi";
import { userBookingsApi } from "../../api/user/bookingsApi";
import userReviewsApi from "../../api/user/reviewsApi";
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
    description: firstRoom?.description ?? fallbackRoomType?.description ?? "Chưa có mô tả cho loại phòng này.",
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
  const [activeTab, setActiveTab] = useState("overview");

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

  const reviewsQuery = useQuery({
    queryKey: ["user-room-type-reviews", id],
    queryFn: () => userReviewsApi.getRoomTypeReviews(Number(id)),
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

  const scrollToSection = (sectionId) => {
    setActiveTab(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 140; // account for fixed header + some padding
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
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

  const reviews = reviewsQuery.data || [];
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 pb-20 relative pt-4">
      {/* Sticky Tabs */}
      <div className="sticky top-[80px] z-30 bg-white/90 backdrop-blur-xl shadow-sm border border-slate-200 rounded-2xl px-4 sm:px-6 pt-4 mb-8">
        <div className="flex items-center gap-4 pb-4">
           <button
            type="button"
            onClick={() => navigate("/booking")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex gap-8 overflow-x-auto no-scrollbar flex-1">
            {[
              { id: "overview", label: "Tổng quan" },
              { id: "availability", label: "Tình trạng phòng trống" },
              { id: "amenities", label: "Tiện nghi" },
              { id: "reviews", label: "Đánh giá" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`whitespace-nowrap pb-4 text-sm font-bold transition-all border-b-2 -mb-[1px] ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-12">
          
          {/* OVERVIEW SECTION */}
          <div id="overview" className="scroll-mt-40 space-y-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded bg-blue-600 px-2 py-1 text-xs font-bold text-white">Genius</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={16} fill={star <= Math.round(avgRating) ? "#fbbf24" : "none"} className={star <= Math.round(avgRating) ? "text-amber-400" : "text-slate-300"} />
                    ))}
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                  {roomType.roomTypeName || "Loại phòng"}
                </h1>
                <p className="mt-2 text-sm font-medium text-blue-600 hover:underline cursor-pointer">
                  Vị trí xuất sắc - hiển thị bản đồ
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleFavorite}
                className={`flex h-12 w-12 items-center justify-center rounded-full border transition ${
                  isFavorite
                    ? "border-rose-500 bg-rose-50 text-rose-500"
                    : "border-slate-200 bg-white text-slate-400 hover:text-rose-500 hover:border-rose-200"
                }`}
                aria-label={isFavorite ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
              >
                <Heart size={22} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </div>

            <div className="relative">
              {imageUrls.length >= 3 ? (
                <div className="grid h-[460px] grid-cols-3 gap-2 overflow-hidden rounded-[32px]">
                  <div className="col-span-2 h-full">
                    <img src={imageUrls[0]} alt="Phòng chính" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-col gap-2 h-full">
                    <img src={imageUrls[1]} alt="Góc khác" className="h-1/2 w-full object-cover" />
                    <img src={imageUrls[2]} alt="Tiện ích" className="h-1/2 w-full object-cover" />
                  </div>
                </div>
              ) : imageUrls.length === 2 ? (
                <div className="grid h-[460px] grid-cols-2 gap-2 overflow-hidden rounded-[32px]">
                  <img src={imageUrls[0]} alt="Phòng" className="h-full w-full object-cover" />
                  <img src={imageUrls[1]} alt="Góc khác" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-[460px] overflow-hidden rounded-[32px]">
                  <img src={imageUrls[0]} alt="Phòng" className="h-full w-full object-cover" />
                </div>
              )}
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Mô tả phòng</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {roomType.description}
              </p>
              
              <div className="mt-8 grid gap-4 sm:grid-cols-3 pt-6 border-t border-slate-100">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <Users size={20} className="text-blue-600" />
                  <p className="mt-3 text-sm font-semibold text-slate-500">Sức chứa</p>
                  <p className="mt-1 text-base font-bold text-slate-900">
                    {roomType.capacityAdults} người lớn, {roomType.capacityChildren} trẻ em
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <BedDouble size={20} className="text-blue-600" />
                  <p className="mt-3 text-sm font-semibold text-slate-500">Loại giường</p>
                  <p className="mt-1 text-base font-bold text-slate-900">
                    {roomType.bedType || "Đang cập nhật"}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <DoorClosed size={20} className="text-blue-600" />
                  <p className="mt-3 text-sm font-semibold text-slate-500">Diện tích</p>
                  <p className="mt-1 text-base font-bold text-slate-900">
                    {roomType.size ? `${roomType.size} m2` : "Đang cập nhật"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AVAILABILITY SECTION */}
          <div id="availability" className="scroll-mt-40 space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Tình trạng phòng trống</h2>
            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Chọn phòng cụ thể</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Chỉ hiển thị các phòng đang ở trạng thái Available trong khoảng ngày bạn chọn.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-600">
                  Còn {availableRooms.length} phòng Available
                </span>
              </div>

              {availableRooms.length ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {availableRooms.map((room) => {
                    const isSelected = room.id === selectedRoom?.id;

                    return (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => setSelectedRoomId(room.id)}
                        className={`rounded-2xl border px-5 py-4 text-left transition ${
                          isSelected
                            ? "border-blue-600 bg-blue-50 shadow-sm ring-1 ring-blue-600"
                            : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                        }`}
                      >
                        <p className="text-sm font-semibold text-slate-500">Phòng</p>
                        <p className="mt-1 text-2xl font-black text-slate-900">{room.roomNumber}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Available</p>
                          {isSelected && <Check size={18} className="text-blue-600" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                  <p className="text-base font-bold text-slate-900">Hết phòng trống</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Không có phòng Available trong khoảng ngày đã chọn. Vui lòng thử ngày khác.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* AMENITIES SECTION */}
          <div id="amenities" className="scroll-mt-40 space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Tiện nghi</h2>
            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(roomType.amenities.length ? roomType.amenities : ["Phòng sạch sẽ", "Không gian riêng tư", "Wifi miễn phí", "Điều hòa nhiệt độ"]).map(
                  (amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                        <Check size={16} />
                      </span>
                      <span>{amenity}</span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* REVIEWS SECTION */}
          <div id="reviews" className="scroll-mt-40 space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Đánh giá của khách</h2>
            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-5 pb-8 border-b border-slate-100">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600 text-3xl font-black text-white shadow-lg shadow-blue-200">
                  {avgRating.toFixed(1)}
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{avgRating >= 4.5 ? "Tuyệt hảo" : avgRating >= 4 ? "Rất tốt" : avgRating > 0 ? "Tốt" : "Chưa có đánh giá"}</p>
                  <p className="mt-1 text-base font-medium text-slate-500">{reviews.length} đánh giá đã được xác thực</p>
                </div>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-600">
                          {review.user.charAt(0)}
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-900">{review.user}</p>
                          <p className="text-xs font-medium text-slate-500">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1 text-sm font-bold text-white shadow-sm">
                        {review.rating}.0
                      </div>
                    </div>
                    {review.comment && (
                      <p className="mt-4 text-sm text-slate-700 leading-relaxed">"{review.comment}"</p>
                    )}
                  </div>
                ))}
                {reviews.length === 0 && (
                  <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-medium text-slate-500">
                    Chưa có đánh giá nào cho loại phòng này.
                  </div>
                )}
              </div>
            </div>
          </div>

        </section>

        {/* RIGHT SIDEBAR (Booking Form) */}
        <aside className="relative">
          <div className="sticky top-[160px] rounded-[32px] border border-slate-200 bg-white p-7 shadow-lg shadow-slate-100/50">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tổng giá lưu trú</p>
            <p className="mt-2 text-4xl font-black tracking-tight text-blue-600">
              {formatCurrency(totalPrice)}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {formatCurrency(roomType.basePrice)} / đêm
            </p>

            <div className="mt-8 space-y-5 rounded-3xl bg-slate-50 p-6 border border-slate-100">
              <div className="flex items-start gap-3 pb-4 border-b border-slate-200">
                <CalendarRange size={20} className="mt-0.5 text-blue-600" />
                <div>
                  <p className="text-base font-bold text-slate-900">Chi tiết lưu trú</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Người lớn: {appliedFilters.adults} | Trẻ em: {appliedFilters.children}
                  </p>
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Nhận phòng</span>
                <input
                  type="datetime-local"
                  value={filters.checkIn}
                  onChange={(event) => handleFilterChange("checkIn", event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Trả phòng</span>
                <input
                  type="datetime-local"
                  value={filters.checkOut}
                  onChange={(event) => handleFilterChange("checkOut", event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white"
                />
              </label>

              <div className="rounded-2xl bg-blue-100 px-4 py-3 text-center text-sm font-bold text-blue-800">
                Thời gian: {stayDays} ngày
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50/50 p-6">
              <p className="text-sm font-bold text-slate-500">Phòng bạn chọn</p>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {selectedRoom ? `Phòng ${selectedRoom.roomNumber}` : "Chưa chọn"}
              </p>
              {selectedRoom && (
                <div className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg w-max">
                  <Check size={16} /> Đã sẵn sàng
                </div>
              )}
            </div>

            <div className="mt-8 space-y-4">
              {submitMessage ? (
                <div
                  className={`rounded-2xl px-5 py-4 text-sm font-bold ${
                    submitMessage.type === "error"
                      ? "bg-rose-50 text-rose-600 border border-rose-100"
                      : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  }`}
                >
                  {submitMessage.text}
                </div>
              ) : null}

              <button
                type="button"
                disabled={!selectedRoom || createBookingMutation.isPending}
                onClick={handleCreateBooking}
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-blue-600 text-base font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 hover:shadow-blue-300 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {selectedRoom
                  ? createBookingMutation.isPending
                    ? "Đang xử lý..."
                    : `Đặt ngay`
                  : "Chưa có phòng để chọn"}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default RoomDetailPage;
