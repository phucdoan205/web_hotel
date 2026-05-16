import React, { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownWideNarrow, MapPin, ShieldCheck, Star } from "lucide-react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import HorizontalSearchFilter from "../../components/public/bookings/HorizontalSearchFilter";
import BookingCard from "../../components/public/bookings/BookingCard";
import BookingSidebarFilter from "../../components/public/bookings/BookingSidebarFilter";
import { roomsApi } from "../../api/public/roomsApi";
import { roomAmenitiesApi } from "../../api/admin/roomAmenitiesApi";

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
  adults: 1,
  children: 0,
});

const buildQueryParams = (filters) => ({
  checkIn: toApiDate(filters.checkIn),
  checkOut: toApiDate(filters.checkOut),
  adults: filters.adults,
  children: filters.children,
  page: 1,
  pageSize: 20,
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
      rating: room.rating ? Number(room.rating).toFixed(1) : "0.0",
      reviewCount: room.reviewCount || 0,

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

  const [sidebarFilters, setSidebarFilters] = useState({
    maxPrice: 2000000,
    bedTypes: [],
    amenities: [],
    minRating: 0
  });

  const handleSidebarFilterChange = (field, value) => {
    setSidebarFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearSidebarFilters = () => {
    setSidebarFilters({
      maxPrice: 2000000,
      bedTypes: [],
      amenities: [],
      minRating: 0
    });
  };

  const stayDays = useMemo(
    () => calculateStayDays(appliedFilters.checkIn, appliedFilters.checkOut),
    [appliedFilters.checkIn, appliedFilters.checkOut],
  );

  const availableRoomsQuery = useQuery({
    queryKey: ["user-available-room-types", appliedFilters],
    queryFn: () => roomsApi.getAvailableRooms(buildQueryParams(appliedFilters)),
  });

  const allAmenitiesQuery = useQuery({
    queryKey: ["all-amenities"],
    queryFn: () => roomAmenitiesApi.getAmenities(false), // only active
  });

  const roomTypes = useMemo(
    () => groupRoomsByType(availableRoomsQuery.data?.items ?? []),
    [availableRoomsQuery.data?.items],
  );

  const availableAmenities = useMemo(() => {
    if (!allAmenitiesQuery.data || !Array.isArray(allAmenitiesQuery.data)) return [];
    return allAmenitiesQuery.data
      .map(a => a.name)
      .filter(Boolean)
      .sort();
  }, [allAmenitiesQuery.data]);

  const filteredRoomTypes = useMemo(() => {
    return roomTypes.filter(rt => {
      // 1. Price
      if (rt.basePrice > sidebarFilters.maxPrice) return false;

      // 2. Bed Types
      if (sidebarFilters.bedTypes.length > 0) {
        if (!rt.bedType) return false;
        // Check if any selected bed type matches the room's bed type
        const hasBedType = sidebarFilters.bedTypes.some(bed =>
          rt.bedType.toLowerCase().includes(bed.toLowerCase())
        );
        if (!hasBedType) return false;
      }

      // 3. Amenities
      if (sidebarFilters.amenities.length > 0) {
        if (!rt.amenities) return false;
        // Need to have ALL selected amenities
        const hasAllAmenities = sidebarFilters.amenities.every(amenity =>
          rt.amenities.some(a => a && a.toLowerCase() === amenity.toLowerCase())
        );
        if (!hasAllAmenities) return false;
      }

      // 4. Rating
      if (sidebarFilters.minRating > 0) {
        if (Number(rt.rating || 0) < sidebarFilters.minRating) return false;
      }

      return true;
    });
  }, [roomTypes, sidebarFilters]);

  const sortedRoomTypes = useMemo(
    () => sortRoomTypes(filteredRoomTypes, sortBy, stayDays),
    [filteredRoomTypes, sortBy, stayDays],
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
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header section with Background Image */}
      <div className="relative overflow-hidden pb-40 pt-28 text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80"
            alt="Resort pool"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#003B95]/95 via-[#003B95]/80 to-transparent"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl font-black tracking-tight md:text-5xl lg:text-6xl text-white leading-tight">
              Tìm phòng trống<br />dễ dàng, giá tốt nhất
            </h1>
            <p className="mt-4 text-lg font-bold text-white/90 md:text-xl leading-relaxed">
              Hơn 120+ với hàng ngàn phòng trống<br />đang chờ bạn khám phá
            </p>

          </motion.div>
        </div>
      </div>

      <div className="mx-auto -mt-16 max-w-7xl px-5 lg:px-8 relative z-10 mb-10">
        <HorizontalSearchFilter
          filters={filters}
          onChange={handleFilterChange}
          onSubmit={handleSearch}
          isSearching={availableRoomsQuery.isFetching}
        />
      </div>

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-[280px] shrink-0">
            <BookingSidebarFilter
              filters={sidebarFilters}
              onChange={handleSidebarFilterChange}
              onClear={handleClearSidebarFilters}
              availableAmenities={availableAmenities}
              isAmenitiesLoading={allAmenitiesQuery.isLoading}
            />
          </aside>

          {/* Main Results */}
          <main className="flex-1 min-w-0">
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

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <label className="text-sm font-semibold text-slate-500">Sắp xếp:</label>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="bg-transparent text-sm font-bold text-slate-700 outline-none"
                >
                  <option value="price-asc">Giá thấp đến cao</option>
                  <option value="price-desc">Giá cao đến thấp</option>
                  <option value="room-number">Tên phòng</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              {availableRoomsQuery.isLoading ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-24 shadow-sm">
                  <div className="relative mb-6 size-12">
                    <div className="absolute inset-0 animate-ping rounded-full bg-blue-100"></div>
                    <div className="relative size-12 animate-spin rounded-full border-4 border-slate-100 border-t-[#0194f3]"></div>
                  </div>
                  <p className="text-base font-bold text-slate-600">Đang tìm phòng trống tốt nhất cho bạn...</p>
                </div>
              ) : null}

              {availableRoomsQuery.isError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-12 text-center shadow-sm">
                  <p className="text-base font-bold text-rose-600">Đã xảy ra lỗi khi tải danh sách phòng. Vui lòng thử lại sau.</p>
                </div>
              ) : null}

              {!availableRoomsQuery.isLoading && !availableRoomsQuery.isError && sortedRoomTypes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
                  <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-slate-50">
                    <svg className="size-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Không tìm thấy phòng phù hợp</h3>
                  <p className="mt-3 text-base font-medium text-slate-500">
                    Thử thay đổi ngày, hoặc số lượng khách để xem thêm các lựa chọn khác.
                  </p>
                  <button
                    onClick={() => {
                      setFilters(createDefaultFilters());
                      setAppliedFilters(createDefaultFilters());
                    }}
                    className="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-slate-900 px-8 text-sm font-bold text-white shadow-lg transition-all hover:bg-slate-800 hover:shadow-xl active:scale-[0.98]"
                  >
                    Xóa bộ lọc tìm kiếm
                  </button>
                </div>
              ) : null}

              {sortedRoomTypes.map((roomType, index) => (
                <motion.div
                  key={roomType.roomTypeId}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <BookingCard
                    roomType={roomType}
                    availableCount={roomType.availableRooms.length}
                    numberOfNights={stayDays}
                    detailLinkState={{
                      roomType,
                      filters: appliedFilters,
                      numberOfNights: stayDays,
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
