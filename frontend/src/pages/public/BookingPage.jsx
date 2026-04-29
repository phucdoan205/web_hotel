import React, { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownWideNarrow, MapPin } from "lucide-react";
import { useLocation } from "react-router-dom";
import HorizontalSearchFilter from "../../components/public/bookings/HorizontalSearchFilter";
import BookingCard from "../../components/public/bookings/BookingCard";
import { roomsApi } from "../../api/admin/roomsApi";

const DEFAULT_CHECK_IN_HOUR = 14;
const DEFAULT_CHECK_OUT_HOUR = 12;

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

  const diffInMs = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diffInMs / (1000 * 60 * 60 * 24)));
};

const createDefaultFilters = () => ({
  destination: "",
  checkIn: toDateTimeInputValue(createDefaultDateTime(0, DEFAULT_CHECK_IN_HOUR)),
  checkOut: toDateTimeInputValue(createDefaultDateTime(1, DEFAULT_CHECK_OUT_HOUR)),
  adults: 2,
  children: 0,
});

const buildQueryParams = (filters) => ({
  checkIn: toApiDate(filters.checkIn),
  checkOut: toApiDate(filters.checkOut),
  adults: filters.adults,
  children: filters.children,
  page: 1,
  pageSize: 100,
});

const groupRoomsByType = (rooms) => {
  const map = new Map();

  rooms.forEach((room) => {
    if (room.status !== "Available") {
      return;
    }

    const key = room.roomTypeId || room.roomTypeName || room.id;
    const current = map.get(key);

    if (current) {
      current.availableRooms.push({
        id: room.id,
        roomNumber: room.roomNumber,
        status: room.status,
      });
      return;
    }

    map.set(key, {
      roomTypeId: room.roomTypeId || room.id,
      roomTypeName: room.roomTypeName,
      basePrice: room.basePrice,
      capacityAdults: room.capacityAdults,
      capacityChildren: room.capacityChildren,
      bedType: room.bedType,
      size: room.size,
      amenities: room.amenities ?? [],
      imageUrls: room.imageUrls ?? [],
      availableRooms: [
        {
          id: room.id,
          roomNumber: room.roomNumber,
          status: room.status,
        },
      ],
    });
  });

  return Array.from(map.values());
};

const sortRoomTypes = (roomTypes, sortBy, numberOfNights) => {
  const nextRoomTypes = [...roomTypes];

  nextRoomTypes.sort((left, right) => {
    const leftTotal = (left.basePrice || 0) * Math.max(1, numberOfNights);
    const rightTotal = (right.basePrice || 0) * Math.max(1, numberOfNights);

    if (sortBy === "price-asc") return leftTotal - rightTotal;
    if (sortBy === "price-desc") return rightTotal - leftTotal;
    return (left.roomTypeName || "").localeCompare(right.roomTypeName || "", "vi");
  });

  return nextRoomTypes;
};

const BookingPage = () => {
  const location = useLocation();

  const [filters, setFilters] = useState(() => {
    if (location.state) {
      return { ...createDefaultFilters(), ...location.state };
    }
    return createDefaultFilters();
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [sortBy, setSortBy] = useState("price-asc");

  useEffect(() => {
    if (location.state) {
      const newState = { ...createDefaultFilters(), ...location.state };
      setFilters(newState);
      setAppliedFilters(newState);
    }
  }, [location.state]);

  const stayDays = useMemo(
    () => calculateStayDays(appliedFilters.checkIn, appliedFilters.checkOut),
    [appliedFilters.checkIn, appliedFilters.checkOut],
  );

  const availableRoomsQuery = useQuery({
    queryKey: ["user-available-room-types", appliedFilters],
    queryFn: () => roomsApi.getAvailableRooms(buildQueryParams(appliedFilters)),
  });

  const roomTypes = useMemo(
    () => groupRoomsByType(availableRoomsQuery.data?.items ?? []),
    [availableRoomsQuery.data?.items],
  );

  const sortedRoomTypes = useMemo(
    () => sortRoomTypes(roomTypes, sortBy, stayDays),
    [roomTypes, sortBy, stayDays],
  );

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSearch = (event) => {
    if (event) event.preventDefault();
    setAppliedFilters(filters);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#01539d] pb-24 pt-10 text-white relative">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h1 className="text-3xl font-black md:text-4xl">Tìm phòng trống</h1>
          <p className="mt-2 text-lg font-medium text-white/80">
            Xem phòng trống ngay hôm nay và lên lịch cho chuyến đi của bạn.
          </p>
        </div>
      </div>

      <div className="mx-auto -mt-12 max-w-7xl px-5 lg:px-8 relative z-10 mb-10">
        <HorizontalSearchFilter
          filters={filters}
          onChange={handleFilterChange}
          onSubmit={handleSearch}
          isSearching={availableRoomsQuery.isFetching}
        />
      </div>

      <div className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Kết quả tìm kiếm
            </h2>
            <p className="text-sm font-medium text-slate-500">
              Tìm thấy <span className="font-bold text-slate-900">{sortedRoomTypes.length}</span> loại phòng phù hợp
              {appliedFilters.destination && (
                <>
                  {" "}tại <span className="font-bold text-[#0194f3]">{appliedFilters.destination}</span>
                </>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <ArrowDownWideNarrow size={16} className="text-slate-400" />
            <label className="text-sm font-semibold text-slate-500">Giá theo:</label>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="bg-transparent text-sm font-bold text-slate-700 outline-none"
            >
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
              <option value="room-number">Tên phòng</option>
            </select>
          </div>
        </div>

        <div className="space-y-5">
          {availableRoomsQuery.isLoading ? (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-sm font-semibold text-slate-500">
              <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#0194f3]"></div>
              Đang tìm phòng trống tốt nhất cho bạn...
            </div>
          ) : null}

          {availableRoomsQuery.isError ? (
            <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-10 text-center text-sm font-semibold text-rose-600">
              Đã xảy ra lỗi khi tải danh sách phòng. Vui lòng thử lại sau.
            </div>
          ) : null}

          {!availableRoomsQuery.isLoading && !availableRoomsQuery.isError && sortedRoomTypes.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">Không tìm thấy phòng phù hợp</h3>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Thử thay đổi ngày, hoặc số lượng khách để xem thêm các lựa chọn khác.
              </p>
              <button 
                onClick={() => {
                  setFilters(createDefaultFilters());
                  setAppliedFilters(createDefaultFilters());
                }}
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#0194f3] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#017bc0]"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : null}

          {sortedRoomTypes.map((roomType) => (
            <BookingCard
              key={roomType.roomTypeId}
              roomType={roomType}
              availableCount={roomType.availableRooms.length}
              numberOfNights={stayDays}
              detailLinkState={{
                roomType,
                filters: appliedFilters,
                numberOfNights: stayDays,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
