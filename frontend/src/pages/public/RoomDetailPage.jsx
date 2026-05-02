import React, { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, BedDouble, CalendarRange, Check, DoorClosed, Heart, Users, Star, Search, Wifi, Wind, Tv, Refrigerator, Waves, Utensils, Bath, ShieldCheck, Coffee, Smartphone, Car, Languages, ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";
import { roomsApi } from "../../api/admin/roomsApi";
import { roomTypesApi } from "../../api/admin/roomTypesApi";
import HorizontalSearchFilter from "../../components/public/bookings/HorizontalSearchFilter";
import { userBookingsApi } from "../../api/user/bookingsApi";
import { userReviewsApi } from "../../api/user/reviewsApi";
import { getStoredAuth } from "../../utils/authStorage";
import { isFavoriteRoomType, toggleFavoriteRoomType } from "../../utils/userFavorites";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import vi from "date-fns/locale/vi";
import { format } from "date-fns";

registerLocale("vi", vi);

const CustomDateInput = React.forwardRef(({ value, onClick, startDate, endDate }, ref) => (
  <div
    className="flex w-full cursor-pointer items-center justify-between gap-4 px-4"
    onClick={onClick}
    ref={ref}
  >
    <div className="flex items-center gap-6">
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nhận phòng</span>
        <span className="text-sm font-black text-slate-800">
          {startDate ? format(startDate, "dd/MM/yyyy") : "Chọn ngày"}
        </span>
      </div>
      <div className="h-8 w-px bg-slate-200" />
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trả phòng</span>
        <span className="text-sm font-black text-slate-800">
          {endDate ? format(endDate, "dd/MM/yyyy") : "Chọn ngày"}
        </span>
      </div>
    </div>
    <CalendarRange size={20} className="text-slate-400" />
  </div>
));

const fallbackImage =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";

const DEFAULT_CHECK_IN_HOUR = 14;
const DEFAULT_CHECK_OUT_HOUR = 12;

const getAmenityIcon = (name, iconUrl) => {
  const n = (name || "").toLowerCase();
  if (n.includes("wifi")) return <Wifi size={18} />;
  if (n.includes("điều hòa") || n.includes("không khí") || n.includes("ac")) return <Wind size={18} />;
  if (n.includes("tv") || n.includes("truyền hình")) return <Tv size={18} />;
  if (n.includes("minibar") || n.includes("tủ lạnh")) return <Refrigerator size={18} />;
  if (n.includes("hồ bơi") || n.includes("pool")) return <Waves size={18} />;
  if (n.includes("ăn") || n.includes("bữa sáng") || n.includes("nhà hàng")) return <Utensils size={18} />;
  if (n.includes("tắm") || n.includes("vòi sen") || n.includes("bath")) return <Bath size={18} />;
  if (n.includes("bảo vệ") || n.includes("an toàn")) return <ShieldCheck size={18} />;
  if (n.includes("cà phê") || n.includes("trà")) return <Coffee size={18} />;
  if (n.includes("điện thoại")) return <Smartphone size={18} />;
  if (n.includes("đỗ xe") || n.includes("parking")) return <Car size={18} />;
  if (n.includes("ngôn ngữ") || n.includes("phiên dịch")) return <Languages size={18} />;
  
  // New mappings based on user feedback and Image 2
  if (n.includes("bàn làm việc") || n.includes("văn phòng") || n.includes("doanh nhân")) return <Smartphone size={18} />;
  if (n.includes("giường") || n.includes("phòng ngủ")) return <BedDouble size={18} />;
  if (n.includes("ban công") || n.includes("view") || n.includes("hướng") || n.includes("ngoài trời")) return <Search size={18} />;
  if (n.includes("xe") || n.includes("đưa đón") || n.includes("shuttle") || n.includes("đi lại")) return <Car size={18} />;
  if (n.includes("cách âm") || n.includes("yên tĩnh") || n.includes("an ninh") || n.includes("bảo vệ")) return <ShieldCheck size={18} />;
  if (n.includes("lễ tân") || n.includes("phục vụ") || n.includes("dịch vụ")) return <Users size={18} />;
  if (n.includes("lau dọn") || n.includes("giặt") || n.includes("ủi") || n.includes("vệ sinh")) return <Check size={18} />;
  if (n.includes("sức khỏe") || n.includes("spa") || n.includes("gym") || n.includes("thể dục")) return <Heart size={18} />;
  if (n.includes("bếp") || n.includes("nấu") || n.includes("ấm đun")) return <Utensils size={18} />;
  if (n.includes("khuyết tật") || n.includes("xe lăn")) return <Users size={18} />;
  if (n.includes("hoạt động") || n.includes("tour") || n.includes("xe đạp")) return <CalendarRange size={18} />;

  if (iconUrl && iconUrl.startsWith('http')) {
    return (
      <img 
        src={iconUrl} 
        alt={name} 
        className="size-[18px] object-contain" 
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'block';
        }}
      />
    );
  }
  
  return <Check size={18} />;
};

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

  // Thu thập tất cả ảnh từ tất cả các phòng có sẵn của loại này
  const allImages = rooms.reduce((acc, room) => {
    (room.imageUrls || []).forEach(url => {
      if (!acc.includes(url)) acc.push(url);
    });
    return acc;
  }, []);

  return {
    roomTypeId: firstRoom?.roomTypeId ?? fallbackRoomType?.roomTypeId ?? Number(id),
    roomTypeName: firstRoom?.roomTypeName ?? fallbackRoomType?.roomTypeName ?? "Loại phòng",
    basePrice: firstRoom?.basePrice ?? fallbackRoomType?.basePrice ?? 0,
    capacityAdults: firstRoom?.capacityAdults ?? fallbackRoomType?.capacityAdults ?? 0,
    capacityChildren: firstRoom?.capacityChildren ?? fallbackRoomType?.capacityChildren ?? 0,
    bedType: firstRoom?.bedType ?? fallbackRoomType?.bedType ?? "",
    size: firstRoom?.size ?? fallbackRoomType?.size ?? null,
    amenities: firstRoom?.amenities ?? fallbackRoomType?.amenities ?? [],
    imageUrls: normalizeImageUrls(allImages.length > 0 ? allImages : (fallbackRoomType?.imageUrls ?? [])),
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
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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

  const { data: otherRoomTypesData } = useQuery({
    queryKey: ["other-room-types"],
    queryFn: () => roomTypesApi.getPublicRoomTypes({ page: 1, pageSize: 8 }),
  });

  const otherRooms = useMemo(() => {
    return (otherRoomTypesData?.items ?? []).filter(rt => rt.id !== Number(id));
  }, [otherRoomTypesData, id]);

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

  const reviews = reviewsQuery.data || [];

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return roomType.rating || 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  }, [reviews, roomType.rating]);

  const stayDays = useMemo(
    () => calculateStayDays(appliedFilters.checkIn, appliedFilters.checkOut),
    [appliedFilters.checkIn, appliedFilters.checkOut],
  );

  const totalPrice = (roomType.basePrice || 0) * stayDays;
  const imageUrls = roomType.imageUrls.length ? roomType.imageUrls : [fallbackImage];

  useEffect(() => {
    if (isGalleryOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isGalleryOpen]);

  const thumbnailRef = useRef(null);

  useEffect(() => {
    if (thumbnailRef.current && isGalleryOpen) {
      const container = thumbnailRef.current;
      const activeThumbnail = container.children[currentImageIndex + 1]; 
      
      if (activeThumbnail) {
        const containerWidth = container.offsetWidth;
        const thumbnailOffsetLeft = activeThumbnail.offsetLeft;
        const thumbnailWidth = activeThumbnail.offsetWidth;

        container.scrollTo({
          left: thumbnailOffsetLeft - containerWidth / 2 + thumbnailWidth / 2,
          behavior: "smooth",
        });
      }
    }
  }, [currentImageIndex, isGalleryOpen]);

  useEffect(() => {
    if (availableRooms.length === 0) {
      setSelectedRoomId(null);
      return;
    }

    setSelectedRoomId((current) =>
      availableRooms.some((room) => room.id === current) ? current : availableRooms[0].id,
    );
  }, [availableRooms]);

  const selectedRoom =
    availableRooms.find((room) => room.id === selectedRoomId) ?? availableRooms[0] ?? null;

  const allAmenities = useMemo(() => {
    const baseList = selectedRoom
      ? [...(selectedRoom.roomSpecificAmenities || []), ...(selectedRoom.roomTypeAmenities || [])]
      : (availableRooms[0]?.roomTypeAmenities || []);

    const grouped = baseList.reduce((acc, current) => {
      const key = current.name;
      if (!acc[key]) {
        acc[key] = { ...current, details: [...(current.details || [])] };
      } else {
        const existingDetails = acc[key].details;
        const newDetails = current.details || [];
        newDetails.forEach(detail => {
          if (!existingDetails.some(d => d.content === detail.content)) {
            existingDetails.push(detail);
          }
        });
      }
      return acc;
    }, {});

    return Object.values(grouped);
  }, [selectedRoom, availableRooms]);

  useEffect(() => {
    if (!roomType.roomTypeId) return;
    setIsFavorite(isFavoriteRoomType(roomType.roomTypeId));
  }, [roomType.roomTypeId]);

  // Track recently viewed
  useEffect(() => {
    if (roomType && roomType.roomTypeId && roomType.roomTypeName !== "Loại phòng") {
      const recentlyViewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
      const newItem = {
        id: roomType.roomTypeId,
        name: roomType.roomTypeName,
        primaryImageUrl: roomType.imageUrls[0] || fallbackImage,
        basePrice: roomType.basePrice,
        rating: avgRating || 0,
        reviewCount: reviews.length || 0
      };

      const updated = [newItem, ...recentlyViewed.filter(item => item.id !== newItem.id)].slice(0, 10);
      localStorage.setItem("recentlyViewed", JSON.stringify(updated));
    }
  }, [roomType, avgRating, reviews.length]);

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSearchSubmit = () => {
    // Navigate is no longer used for search button, it's now a booking button
    handleCreateBooking();
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
      const headerOffset = 140; 
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
      <div className="rounded-2xl bg-white p-10 text-center text-sm font-semibold text-slate-500 shadow-sm">
        Đang tải chi tiết loại phòng...
      </div>
    );
  }

  if (!roomType.roomTypeId) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Không tìm thấy loại phòng</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Loại phòng này hiện không còn dữ liệu để hiển thị.
        </p>
        <button
          type="button"
          onClick={() => navigate("/booking")}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }


  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 pb-20 relative pt-4">
      {/* Top Header / Back Action */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/booking")}
          className="group inline-flex h-11 items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md active:scale-95"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          <span>Quay lại danh sách</span>
        </button>
      </div>

      {/* Sticky Tabs */}
      <div className="sticky top-[80px] z-30 bg-white/90 backdrop-blur-xl shadow-sm border border-slate-200 rounded-2xl px-6 pt-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex gap-10 overflow-x-auto no-scrollbar flex-1">
            {[
              { id: "overview", label: "Tổng quan" },
              { id: "availability", label: "Tình trạng phòng trống" },
              { id: "amenities", label: "Tiện nghi" },
              { id: "reviews", label: "Đánh giá" },
              { id: "other-rooms", label: "Phòng khác" },
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

      <div className="flex flex-col gap-12">
        <section className="space-y-12">
          
          {/* OVERVIEW SECTION */}
          <div id="overview" className="scroll-mt-40 space-y-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={16} fill={star <= Math.round(avgRating) ? "#fbbf24" : "none"} className={star <= Math.round(avgRating) ? "text-amber-400" : "text-slate-300"} />
                    ))}
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                  {roomType.roomTypeName || "Loại phòng"}
                </h1>
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

            <div className="mb-8 space-y-2">
              <div 
                className="grid grid-cols-3 gap-2 overflow-hidden rounded-2xl cursor-pointer group" 
                onClick={() => { setIsGalleryOpen(true); setCurrentImageIndex(0); }}
              >
                <div className="col-span-2 h-[460px] overflow-hidden">
                  <img src={imageUrls[0]} alt="Phòng chính" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="flex flex-col gap-2 h-[460px]">
                  <div className="h-1/2 overflow-hidden">
                    <img src={imageUrls[1] || fallbackImage} alt="Góc khác" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="h-1/2 overflow-hidden">
                    <img src={imageUrls[2] || fallbackImage} alt="Tiện ích" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                </div>
              </div>

              {imageUrls.length > 3 && (
                <div className="grid grid-cols-5 gap-2 h-32">
                  {imageUrls.slice(3, 8).map((url, idx) => {
                    const isLast = idx === 4;
                    const remaining = imageUrls.length - 8;
                    return (
                      <div 
                        key={idx} 
                        className="relative h-full overflow-hidden rounded-xl cursor-pointer group"
                        onClick={() => { setIsGalleryOpen(true); setCurrentImageIndex(idx + 3); }}
                      >
                        <img src={url} alt={`Ảnh ${idx + 4}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        {isLast && remaining > 0 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-black text-xl backdrop-blur-[2px]">
                            +{remaining} ảnh
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="py-2">
              <div className="text-slate-600 leading-relaxed whitespace-pre-wrap prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: roomType.description }} />
            </div>
          </div>

          {/* AVAILABILITY SECTION */}
          <div id="availability" className="scroll-mt-40 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
              <h2 className="text-3xl font-black tracking-tight text-slate-900">Tình trạng phòng trống</h2>
              
              <div className="flex-1 max-w-2xl">
                <div className="relative flex items-center gap-2 rounded-[2rem] border border-slate-200 bg-white p-2 shadow-2xl transition-all hover:border-blue-200">
                  <div className="flex-1">
                    <DatePicker
                      selectsRange={true}
                      startDate={new Date(filters.checkIn)}
                      endDate={new Date(filters.checkOut)}
                      onChange={(update) => {
                        const [start, end] = update;
                        const toDateStr = (d) => {
                          if (!d) return "";
                          const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
                          return local.toISOString().split("T")[0];
                        };
                        if (start) handleFilterChange("checkIn", `${toDateStr(start)}T14:00`);
                        if (end) handleFilterChange("checkOut", `${toDateStr(end)}T12:00`);
                        
                        // Immediately apply dates for room fetching
                        if (start && end) {
                          setAppliedFilters(prev => ({
                            ...prev,
                            checkIn: `${toDateStr(start)}T14:00`,
                            checkOut: `${toDateStr(end)}T12:00`
                          }));
                        }
                      }}
                      monthsShown={2}
                      minDate={new Date()}
                      customInput={<CustomDateInput startDate={new Date(filters.checkIn)} endDate={new Date(filters.checkOut)} />}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex items-center gap-4 border-l border-slate-100 pl-4 pr-2">
                    {selectedRoom && (
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black uppercase text-slate-400">Tổng cộng ({stayDays} đêm)</p>
                        <p className="text-lg font-black text-blue-600 leading-none">{formatCurrency(totalPrice)}</p>
                      </div>
                    )}
                    <button
                      type="button"
                      disabled={!selectedRoom || createBookingMutation.isPending}
                      onClick={handleCreateBooking}
                      className="flex h-14 min-w-[140px] items-center justify-center rounded-2xl bg-blue-600 px-8 text-base font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                    >
                      {createBookingMutation.isPending ? "..." : "Đặt ngay"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {submitMessage && (
              <div
                className={`rounded-2xl px-6 py-4 text-sm font-bold shadow-sm ${
                  submitMessage.type === "error"
                    ? "bg-rose-50 text-rose-600 border border-rose-100"
                    : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                }`}
              >
                {submitMessage.text}
              </div>
            )}

            {availableRooms.length ? (
              <div className="space-y-6">
                <div className="rounded-t-xl rounded-b border border-slate-300 shadow-sm overflow-hidden">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead className="bg-[#003b95] text-white">
                      <tr>
                        <th className="px-4 py-3 font-bold border-r border-[#00224f] w-[35%]">Số phòng cụ thể</th>
                        <th className="px-3 py-3 font-bold border-r border-[#00224f] text-center w-[15%]">Số lượng</th>
                        <th className="px-4 py-3 font-bold border-r border-[#00224f] bg-[#00224f] w-[25%]">Giá cho {stayDays} đêm</th>
                        <th className="px-4 py-3 font-bold w-[25%]">Tùy chọn cho bạn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300 bg-white">
                      {availableRooms.map((room) => {
                        const isSelected = room.id === selectedRoomId;

                        return (
                          <tr key={room.id} className={isSelected ? "bg-blue-50/50" : "hover:bg-slate-50"}>
                            <td className="px-4 py-4 border-r border-slate-300 align-top">
                              <div className="text-lg font-bold text-blue-700 hover:underline cursor-pointer">
                                Phòng {room.roomNumber}
                              </div>
                              <div className="mt-2 text-xs text-slate-700 space-y-1">
                                <div>Giường: <span className="font-semibold">{roomType.bedType || "1 giường đôi lớn"}</span></div>
                                <div>Diện tích: <span className="font-semibold">{roomType.size || 25} m²</span></div>
                              </div>
                              <div className="mt-4 flex flex-wrap gap-2">
                                {[...(room.roomSpecificAmenities || []), ...(room.roomTypeAmenities || [])].slice(0, 8).map(amenity => (
                                  <span key={amenity.id || amenity.name} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-50/50 shadow-sm transition hover:bg-white hover:shadow-md">
                                    <span className="text-blue-500">
                                      {getAmenityIcon(amenity.name, amenity.iconUrl)}
                                    </span>
                                    {amenity.name}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-4 border-r border-slate-300 align-top text-center">
                              <div className="flex flex-col items-center justify-center gap-1 text-slate-700 mt-1">
                                <div className="flex items-center gap-1.5">
                                  <Users size={18} className="text-slate-600" />
                                  <span className="font-bold text-sm">{roomType.capacityAdults} Người lớn</span>
                                </div>
                                {roomType.capacityChildren > 0 && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-xs text-slate-500">+{roomType.capacityChildren} Trẻ em</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 border-r border-slate-300 align-middle">
                              <div className="text-xl font-bold text-slate-900">{formatCurrency(totalPrice)}</div>
                            </td>
                            <td className="px-4 py-4 align-middle">
                              {isSelected ? (
                                <button 
                                  type="button"
                                  className="w-full rounded bg-emerald-600 py-2.5 font-bold text-white shadow-sm flex justify-center items-center gap-2 ring-2 ring-emerald-600 ring-offset-2 transition"
                                >
                                  <Check size={18} /> Đang chọn
                                </button>
                              ) : (
                                <button 
                                  type="button"
                                  onClick={() => setSelectedRoomId(room.id)}
                                  className="w-full rounded border border-blue-600 bg-white py-2.5 font-bold text-blue-600 shadow-sm hover:bg-blue-50 transition"
                                >
                                  Chọn phòng này
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 mb-4">
                  <DoorClosed size={24} className="text-slate-400" />
                </div>
                <p className="text-base font-bold text-slate-900">
                  Không có phòng trống trên trang web chúng tôi vào những ngày bạn chọn
                </p>
                <p className="mt-1 text-sm font-medium text-slate-500 max-w-md mx-auto">
                  Vui lòng thay đổi ngày nhận/trả phòng hoặc số lượng khách để tìm kiếm các lựa chọn khác.
                </p>
              </div>
            )}
          </div>

          {/* AMENITIES SECTION */}
          <div id="amenities" className="scroll-mt-40 space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Tiện nghi của chỗ nghỉ</h2>
                <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">Mọi thứ bạn cần cho một kỳ nghỉ hoàn hảo</p>
              </div>
            </div>

            {/* Amenity Summary Grid matching user's reference */}
            <div className="flex flex-wrap items-center gap-x-10 gap-y-6 pb-6">
               {allAmenities.length > 0 ? (
                 allAmenities.slice(0, 15).map((amenity) => (
                   <div key={amenity.id || amenity.name} className="flex items-center gap-3 text-slate-700 hover:text-emerald-600 transition-colors cursor-default">
                      <div className="text-emerald-600 flex-shrink-0 scale-110">
                         {getAmenityIcon(amenity.name, amenity.iconUrl)}
                      </div>
                      <span className="text-[15px] font-semibold leading-none">{amenity.name}</span>
                   </div>
                 ))
               ) : null}
            </div>
            
            <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {allAmenities.length > 0 ? (
                allAmenities.map((amenity) => (
                  <div key={amenity.id || amenity.name} className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-6 items-center justify-center text-slate-900">
                        {getAmenityIcon(amenity.name, amenity.iconUrl)}
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{amenity.name}</h3>
                    </div>
                    
                    <ul className="space-y-2.5">
                      {(amenity.details && amenity.details.length > 0) ? (
                        amenity.details.map((detail) => (
                          <li key={detail.id || detail.content} className="flex items-start gap-2 text-sm text-slate-600">
                            <Check size={14} className="mt-1 shrink-0 text-slate-400" />
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="leading-tight">{detail.content}</span>
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-start gap-2 text-sm text-slate-400 italic">
                          <Check size={14} className="mt-1 shrink-0 opacity-20" />
                          <span>Thông tin chi tiết đang cập nhật</span>
                        </li>
                      )}
                    </ul>
                  </div>
                )
              )) : (
                <div className="col-span-full py-16 text-center text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-[2rem]">
                   Đang tải thông tin tiện nghi...
                </div>
              )}
            </div>
          </div>

          {/* REVIEWS SECTION */}
          <div id="reviews" className="scroll-mt-40 space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Đánh giá của khách</h2>
            <div>
              <div className="flex items-center gap-5 pb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-blue-600 text-3xl font-black text-white shadow-lg shadow-blue-200">
                  {avgRating.toFixed(1)}
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{avgRating >= 4.5 ? "Tuyệt hảo" : avgRating >= 4 ? "Rất tốt" : avgRating > 0 ? "Tốt" : "Chưa có đánh giá"}</p>
                  <p className="mt-1 text-base font-medium text-slate-500">{reviews.length} đánh giá đã được xác thực</p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {review.avatarUrl ? (
                          <img 
                            src={review.avatarUrl.startsWith('http') ? review.avatarUrl : `http://localhost:5000${review.avatarUrl}`} 
                            alt={review.user} 
                            className="h-12 w-12 rounded-full object-cover border border-slate-200" 
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-600">
                            {review.user.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-base font-bold text-slate-900">{review.user}</p>
                          <p className="text-xs font-medium text-slate-500">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={16} 
                            fill={star <= review.rating ? "#fbbf24" : "none"} 
                            className={star <= review.rating ? "text-amber-400" : "text-slate-200"} 
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-slate-700 leading-relaxed">"{review.comment}"</p>
                    )}
                  </div>
                ))}
                {reviews.length === 0 && (
                  <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-medium text-slate-500">
                    Chưa có đánh giá nào cho loại phòng này.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* OTHER ROOMS SECTION */}
          <div id="other-rooms" className="scroll-mt-40 space-y-10 pt-12 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Chỗ nghỉ khác bạn có thể xem</h2>
                <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">Khám phá các không gian nghỉ dưỡng tuyệt vời khác</p>
              </div>
              <button 
                onClick={() => navigate("/booking")}
                className="group flex items-center gap-2 text-sm font-bold text-blue-600 transition-colors hover:text-blue-700"
              >
                Xem tất cả
                <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {otherRooms.slice(0, 4).map((rt) => (
                <article 
                  key={rt.id} 
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    navigate(`/room-types/${rt.id}`);
                  }}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={rt.primaryImageUrl || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80"}
                      alt={rt.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute right-3 top-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleFavoriteRoomType(rt.id); }}
                        className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-all hover:bg-white active:scale-90 ${isFavoriteRoomType(rt.id) ? 'text-red-500' : 'text-slate-400'}`}
                      >
                        <Heart size={20} fill={isFavoriteRoomType(rt.id) ? "currentColor" : "none"} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Khách sạn</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} fill={i < Math.round(rt.rating || 0) ? "#fbbf24" : "none"} className={i < Math.round(rt.rating || 0) ? "text-amber-400" : "text-slate-200"} />
                        ))}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-black text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{rt.name}</h3>
                    
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-black text-white shadow-md shadow-blue-100">
                        {rt.rating ? Number(rt.rating).toFixed(1).replace('.', ',') : "0,0"}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-900 leading-none">
                          {rt.rating >= 4.5 ? "Tuyệt hảo" : rt.rating >= 4 ? "Rất tốt" : rt.rating > 0 ? "Tốt" : "Chưa có đánh giá"}
                        </p>
                        <p className="mt-0.5 text-[11px] font-bold text-slate-400">{rt.reviewCount || 0} đánh giá</p>
                      </div>
                    </div>

                    <div className="mt-6 flex items-end justify-between border-t border-slate-50 pt-4">
                      <p className="text-[10px] font-black uppercase text-slate-400">Bắt đầu từ</p>
                      <div className="text-right">
                        <span className="text-lg font-black text-blue-600">VND {new Intl.NumberFormat("vi-VN").format(rt.basePrice || 0)}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

        </section>
      </div>

      {/* GALLERY MODAL OVERLAY */}
      {isGalleryOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-sm p-1 sm:p-2 md:p-4 animate-in fade-in duration-300"
          onClick={() => setIsGalleryOpen(false)}
        >
          <div 
            className="relative flex flex-col w-full h-full max-w-[98%] max-h-[96%] bg-white rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Cleaned up */}
            <div className="flex h-16 items-center justify-end border-b bg-white px-6">
              <button
                onClick={() => setIsGalleryOpen(false)}
                className="flex items-center gap-2 text-slate-900 font-bold hover:text-red-500 transition-colors"
              >
                <span>Đóng</span>
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
              {/* Main Area - Centered Image */}
              <div className="relative flex flex-1 flex-col items-center justify-center bg-white p-4 group">
                <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
                  {/* Floating Arrows */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : imageUrls.length - 1)); }}
                    className="absolute left-6 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-slate-200/40 text-slate-800 backdrop-blur-md transition hover:bg-slate-200/80 active:scale-90"
                  >
                    <ChevronLeft size={32} />
                  </button>

                  <img
                    src={imageUrls[currentImageIndex]}
                    alt=""
                    className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-sm"
                  />

                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev < imageUrls.length - 1 ? prev + 1 : 0)); }}
                    className="absolute right-6 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-slate-200/40 text-slate-800 backdrop-blur-md transition hover:bg-slate-200/80 active:scale-90"
                  >
                    <ChevronRight size={32} />
                  </button>
                </div>

                {/* Counter at bottom of image */}
                <div className="py-3 text-sm font-black text-slate-500">
                  {currentImageIndex + 1} / {imageUrls.length}
                </div>
              </div>

              {/* Sidebar matching Reference Image */}
              <div 
                className="w-[440px] border-l bg-white p-8 hidden lg:block overflow-y-auto no-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="flex items-start gap-4 mb-10 pb-8 border-b border-slate-100">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 font-black text-sm text-white shadow-lg shadow-blue-100">
                    {avgRating > 0 ? avgRating.toFixed(1).replace('.', ',') : "0,0"}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 leading-tight">
                      {avgRating >= 4.5 ? "Xuất sắc" : avgRating >= 4 ? "Rất tốt" : avgRating >= 3 ? "Tốt" : avgRating > 0 ? "Hài lòng" : "Chưa có đánh giá"}
                    </h2>
                    <p className="text-xs font-bold text-slate-400 mt-1">{reviews.length.toLocaleString()} đánh giá</p>
                  </div>
                </div>

                <div className="space-y-12">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-900">Đọc xem khách yêu thích điều gì nhất:</h3>
                  {reviews.length > 0 ? (
                    reviews.slice(0, 10).map((review, i) => (
                      <div key={i} className="space-y-5 pb-10 border-b border-slate-50 last:border-0">
                        <p className="text-[15px] font-medium leading-relaxed text-slate-700">
                          “{review.comment}”
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-slate-100 border border-slate-100">
                             {review.avatarUrl ? (
                               <img src={review.avatarUrl} alt={review.user} className="h-full w-full object-cover" />
                             ) : (
                               <div className="flex h-full w-full items-center justify-center bg-green-600 text-[11px] font-black text-white uppercase">
                                 {review.user?.[0] || 'U'}
                               </div>
                             )}
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[13px] font-bold text-slate-900">{review.user}</span>
                             <div className="flex items-center gap-1.5 opacity-70">
                                <span className="text-[12px]">🇻🇳</span>
                                <span className="text-[11px] font-bold text-slate-500">Việt Nam</span>
                             </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm italic text-slate-400">Chưa có đánh giá chi tiết cho loại phòng này.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Thumbnail Strip - Fixed centering and hidden scrollbar */}
            <div className="h-24 border-t bg-slate-50/30 p-2">
              <div 
                ref={thumbnailRef}
                className="relative flex h-full items-center gap-2 overflow-x-auto no-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* Spacer to allow centering first/last items */}
                <div className="flex-shrink-0 w-[45%]" /> 
                {imageUrls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`relative h-full aspect-[4/3] flex-shrink-0 overflow-hidden rounded-md transition-all duration-300 ${
                      i === currentImageIndex ? "ring-2 ring-blue-600 scale-105 z-10 shadow-lg" : "opacity-40 hover:opacity-100"
                    }`}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
                <div className="flex-shrink-0 w-[45%]" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetailPage;
