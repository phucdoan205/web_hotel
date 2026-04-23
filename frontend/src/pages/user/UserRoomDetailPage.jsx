import React, { useMemo } from "react";
import { useNavigate, useParams, useLocation, NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BedDouble, CalendarRange, Check, DoorClosed, Users } from "lucide-react";
import { roomsApi } from "../../api/admin/roomsApi";

const fallbackImage =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const calculateStayDays = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return 1;
  }

  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
};

const toApiDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const UserRoomDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const roomFromState = location.state?.room ?? null;
  const filters = location.state?.filters ?? null;

  const availableRoomsQuery = useQuery({
    queryKey: ["user-room-detail-fallback", id, filters],
    queryFn: () =>
      roomsApi.getAvailableRooms({
        checkIn: toApiDate(filters?.checkIn),
        checkOut: toApiDate(filters?.checkOut),
        adults: filters?.adults,
        children: filters?.children,
        page: 1,
        pageSize: 50,
      }),
    enabled: !roomFromState && Boolean(id),
  });

  const room = useMemo(() => {
    if (roomFromState) return roomFromState;
    return (availableRoomsQuery.data?.items ?? []).find((item) => String(item.id) === String(id)) ?? null;
  }, [availableRoomsQuery.data?.items, id, roomFromState]);

  const stayDays = calculateStayDays(filters?.checkIn, filters?.checkOut);
  const totalPrice = (room?.basePrice || 0) * stayDays;
  const imageUrls = room?.imageUrls?.length ? room.imageUrls : [fallbackImage];

  if (availableRoomsQuery.isLoading && !room) {
    return (
      <div className="rounded-[32px] bg-white p-10 text-center text-sm font-semibold text-slate-500 shadow-sm">
        Đang tải chi tiết phòng...
      </div>
    );
  }

  if (!room) {
    return (
      <div className="rounded-[32px] bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Không tìm thấy phòng</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Phòng này không còn trống hoặc dữ liệu chi tiết không còn khả dụng.
        </p>
        <button
          type="button"
          onClick={() => navigate("/user/bookings")}
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
          onClick={() => navigate("/user/bookings")}
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-sm font-semibold text-slate-500">Chi tiết phòng</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            {room.roomTypeName || `Phòng ${room.roomNumber}`}
          </h1>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-6">
          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
            <img
              src={imageUrls[0]}
              alt={room.roomTypeName || room.roomNumber}
              className="h-[380px] w-full object-cover"
            />
          </div>

          {imageUrls.length > 1 ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {imageUrls.slice(1, 4).map((imageUrl) => (
                <div
                  key={imageUrl}
                  className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm"
                >
                  <img src={imageUrl} alt={room.roomTypeName || room.roomNumber} className="h-40 w-full object-cover" />
                </div>
              ))}
            </div>
          ) : null}

          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Phòng {room.roomNumber}
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">
                  {room.roomTypeName || "Phòng"}
                </h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-600">
                {room.status || "Available"}
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-5">
                <Users size={18} className="text-blue-600" />
                <p className="mt-3 text-sm font-semibold text-slate-500">Sức chứa</p>
                <p className="mt-1 text-base font-bold text-slate-900">
                  {room.capacityAdults} người lớn, {room.capacityChildren} trẻ em
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <BedDouble size={18} className="text-blue-600" />
                <p className="mt-3 text-sm font-semibold text-slate-500">Loại giường</p>
                <p className="mt-1 text-base font-bold text-slate-900">
                  {room.bedType || "Đang cập nhật"}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <DoorClosed size={18} className="text-blue-600" />
                <p className="mt-3 text-sm font-semibold text-slate-500">Diện tích</p>
                <p className="mt-1 text-base font-bold text-slate-900">
                  {room.size ? `${room.size} m2` : "Đang cập nhật"}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-bold text-slate-900">Tiện ích phòng</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(room.amenities?.length ? room.amenities : ["Phòng sạch sẽ", "Không gian riêng tư"]).map(
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
        </section>

        <aside className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Tổng giá lưu trú</p>
            <p className="mt-3 text-4xl font-black tracking-tight text-slate-900">
              {formatCurrency(totalPrice)}
            </p>
            <p className="mt-2 text-sm font-medium text-slate-500">
              {formatCurrency(room.basePrice)} / đêm
            </p>

            <div className="mt-6 rounded-3xl bg-slate-50 p-5">
              <div className="flex items-start gap-3">
                <CalendarRange size={18} className="mt-0.5 text-blue-600" />
                <div className="text-sm font-medium text-slate-600">
                  <p className="font-semibold text-slate-900">Thời gian lưu trú</p>
                  <p className="mt-1">
                    {filters?.checkIn ? new Date(filters.checkIn).toLocaleString("vi-VN") : "Chưa chọn"}
                  </p>
                  <p>
                    {filters?.checkOut ? new Date(filters.checkOut).toLocaleString("vi-VN") : "Chưa chọn"}
                  </p>
                  <p className="mt-2 font-semibold text-blue-700">{stayDays} ngày</p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <NavLink
                to="/user/bookings"
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-blue-600 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Chọn phòng này
              </NavLink>
              <button
                type="button"
                onClick={() => navigate("/user/bookings")}
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

export default UserRoomDetailPage;
