import React, { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Check, CheckCircle, ChevronRight, Minus, Plus, ArrowLeft, Info, CalendarDays, Users, User, QrCode, CreditCard, Hotel, Receipt, AlertCircle, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { roomsApi } from "../../api/public/roomsApi";
import { userBookingsApi } from "../../api/user/bookingsApi";
import { getMyVouchers } from "../../api/user/userVouchersApi";
import { getMyProfile } from "../../api/admin/profileApi";
import { getMemberships } from "../../api/admin/membershipApi";
import { getStoredAuth } from "../../utils/authStorage";
import { getBookingTotalAmount, getBookingDetailNights } from "../../utils/bookingPricing";

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

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const buildQuickChartQrUrl = (value) => {
  if (!value) return "";
  return `https://quickchart.io/qr?size=320&margin=2&text=${encodeURIComponent(value)}`;
};

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

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const auth = getStoredAuth();

  const initialFilters = useMemo(() => {
    if (location.state?.resumeBooking) {
      const b = location.state.resumeBooking;
      const firstDetail = b.bookingDetails?.[0];
      if (firstDetail) {
        return {
          checkIn: toDateTimeInputValue(new Date(firstDetail.checkInDate)),
          checkOut: toDateTimeInputValue(new Date(firstDetail.checkOutDate)),
          adults: 1,
          children: 0,
        };
      }
    }
    if (location.state) return { ...location.state };
    return {
      checkIn: toDateTimeInputValue(createDefaultDateTime(0, DEFAULT_CHECK_IN_HOUR)),
      checkOut: toDateTimeInputValue(createDefaultDateTime(1, DEFAULT_CHECK_OUT_HOUR)),
      adults: 1,
      children: 0,
    };
  }, [location.state]);

  const [info, setInfo] = useState({
    fullName: auth?.fullName || "",
    phone: "",
    email: auth?.email || "",
    ...initialFilters
  });

  const [selectedRooms, setSelectedRooms] = useState(() => {
    if (location.state?.resumeBooking) {
      const b = location.state.resumeBooking;
      const rooms = {};
      b.bookingDetails?.forEach(d => {
        if (!rooms[d.roomTypeId]) rooms[d.roomTypeId] = [];
        rooms[d.roomTypeId].push(d.roomId);
      });
      return rooms;
    }
    if (location.state?.preselectedRooms) {
      return location.state.preselectedRooms;
    }
    return {};
  }); // { roomTypeId: array_of_room_ids }

  const [createdBooking, setCreatedBooking] = useState(() => location.state?.resumeBooking || null);
  const [step, setStep] = useState(() => location.state?.resumeBooking ? 3 : 1);
  const [depositPercentage, setDepositPercentage] = useState(30);
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [errorPopupMessage, setErrorPopupMessage] = useState(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  const [selectedVoucherId, setSelectedVoucherId] = useState("");

  const profileQuery = useQuery({
    queryKey: ["user-profile"],
    queryFn: getMyProfile,
    enabled: !!auth?.token,
  });

  const membershipsQuery = useQuery({
    queryKey: ["memberships-list"],
    queryFn: getMemberships,
    enabled: !!auth?.token,
  });

  const userVouchersQuery = useQuery({
    queryKey: ["my-vouchers"],
    queryFn: async () => {
      const res = await getMyVouchers();
      return res.data;
    },
    enabled: !!auth?.token && step === 3,
  });

  useEffect(() => {
    if (profileQuery.data && !info.phone) {
      setInfo(prev => {
        if (prev.phone) return prev; // check again to prevent infinite loop
        return {
          ...prev,
          fullName: prev.fullName || profileQuery.data.fullName || "",
          phone: profileQuery.data.phone || "",
          email: prev.email || profileQuery.data.email || "",
        };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileQuery.data]);



  const availableRoomsQuery = useQuery({
    queryKey: ["user-available-room-types", info.checkIn, info.checkOut, info.adults, info.children],
    queryFn: () => roomsApi.getAvailableRooms({
      checkIn: toApiDate(info.checkIn),
      checkOut: toApiDate(info.checkOut),
      adults: info.adults,
      children: info.children,
      page: 1,
      pageSize: 100,
    }),
    enabled: !!info.checkIn && !!info.checkOut && new Date(info.checkIn) < new Date(info.checkOut),
    refetchInterval: 5000,
  });

  const roomTypes = useMemo(() => groupRoomsByType(availableRoomsQuery.data?.items ?? []), [availableRoomsQuery.data?.items]);

  const createBookingMutation = useMutation({
    mutationFn: (payload) => userBookingsApi.createBooking(payload),
    onSuccess: (data) => {
      setCreatedBooking(data);
      setStep(3);
    },
    onError: (error) => {
      setErrorPopupMessage(error.response?.data?.message || error.message);

      // Auto refetch available rooms so the user sees the updated availability
      availableRoomsQuery.refetch();
    }
  });

  const applyVoucherMutation = useMutation({
    mutationFn: ({ bookingId, voucherId }) => userBookingsApi.applyVoucher(bookingId, voucherId),
    onSuccess: (data) => {
      setCreatedBooking(data);
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Lỗi khi áp dụng voucher");
      setSelectedVoucherId("");
    }
  });

  const cancelBookingMutation = useMutation({
    mutationFn: (id) => userBookingsApi.cancelBooking(id),
    onSuccess: () => {
      setCreatedBooking(null);
      availableRoomsQuery.refetch();
    }
  });

  const unlockBookingMutation = useMutation({
    mutationFn: (id) => userBookingsApi.unlockBooking(id),
    onSuccess: () => {
      setCreatedBooking(null);
      availableRoomsQuery.refetch();
    }
  });
  
  useEffect(() => {
    if (createdBooking?.voucherId) {
      setSelectedVoucherId(createdBooking.voucherId.toString());
    } else {
      setSelectedVoucherId("");
    }
  }, [createdBooking]);

  // Calculate totals
  const selectedTotalRooms = Object.values(selectedRooms).reduce((acc, ids) => acc + (ids?.length || 0), 0);

  const stayDays = useMemo(() => {
    if (createdBooking?.bookingDetails?.[0]) {
      return getBookingDetailNights(createdBooking.bookingDetails[0]);
    }
    return calculateStayDays(info.checkIn, info.checkOut);
  }, [info.checkIn, info.checkOut, createdBooking]);

  const estimatedTotal = useMemo(() => {
    if (createdBooking) {
      return getBookingTotalAmount(createdBooking.bookingDetails || []);
    }

    let total = 0;
    Object.entries(selectedRooms).forEach(([typeId, ids]) => {
      const count = ids?.length || 0;
      const type = roomTypes.find(rt => rt.roomTypeId.toString() === typeId.toString());
      if (type) {
        total += (type.basePrice * count * stayDays);
      }
    });
    return total;
  }, [selectedRooms, roomTypes, stayDays, createdBooking]);

  const discountPercent = useMemo(() => {
    if (!profileQuery.data?.membershipName || !membershipsQuery.data) return 0;
    const currentTier = membershipsQuery.data.find(m => m.tierName === profileQuery.data.membershipName);
    return currentTier?.discountPercent || 0;
  }, [profileQuery.data, membershipsQuery.data]);

  const discountAmount = useMemo(() => {
    return (estimatedTotal * discountPercent) / 100;
  }, [estimatedTotal, discountPercent]);

  const voucherDiscountAmount = useMemo(() => {
    let voucherObj = null;
    if (createdBooking?.voucher) {
      voucherObj = createdBooking.voucher;
    } else if (selectedVoucherId && userVouchersQuery.data) {
      const uv = userVouchersQuery.data.find(v => v.voucherId.toString() === selectedVoucherId.toString());
      if (uv) voucherObj = uv.voucher;
    }

    if (!voucherObj || !voucherObj.isActive) return 0;
    
    // Check min booking value
    if (voucherObj.minBookingValue && estimatedTotal < voucherObj.minBookingValue) return 0;

     let vAmount = 0;
    if (voucherObj.discountType === "Fixed" || voucherObj.discountType === "AMOUNT") {
      vAmount = voucherObj.discountValue || 0;
    } else if (voucherObj.discountType === "Percent" || voucherObj.discountType === "PERCENT") {
      vAmount = (estimatedTotal * (voucherObj.discountValue || 0)) / 100;
      if (voucherObj.maxDiscountAmount && vAmount > voucherObj.maxDiscountAmount) {
        vAmount = voucherObj.maxDiscountAmount;
      }
    }
    return vAmount;
  }, [createdBooking, selectedVoucherId, userVouchersQuery.data, estimatedTotal]);

  const finalTotal = Math.max(0, estimatedTotal - discountAmount - voucherDiscountAmount);

  const summaryRooms = useMemo(() => {
    if (createdBooking) {
      const groups = {};
      createdBooking.bookingDetails?.forEach(d => {
        if (!groups[d.roomTypeId]) {
          groups[d.roomTypeId] = {
            roomTypeName: d.roomType?.name || d.roomTypeName || `Phòng ${d.roomTypeId}`,
            count: 0,
            roomNumbers: [],
            pricePerNight: d.pricePerNight || d.price || 0
          };
        }
        groups[d.roomTypeId].count++;
        const rn = d.room?.roomNumber || d.roomNumber;
        if (rn) {
          groups[d.roomTypeId].roomNumbers.push(rn);
        }
      });
      return Object.values(groups).map((g, i) => ({
        id: i,
        roomTypeName: g.roomTypeName,
        count: g.count,
        roomNumbers: g.roomNumbers.join(', '),
        totalPrice: g.pricePerNight * g.count * stayDays
      }));
    }

    const result = [];
    Object.entries(selectedRooms).forEach(([typeId, ids]) => {
      const count = ids?.length || 0;
      if (count === 0) return;
      const type = roomTypes.find(rt => rt.roomTypeId.toString() === typeId.toString());
      if (!type) return;

      const selectedRoomNumbers = type.availableRooms
        .filter(r => ids.includes(r.id))
        .map(r => r.roomNumber)
        .join(', ');

      result.push({
        id: typeId,
        roomTypeName: type.roomTypeName,
        count,
        roomNumbers: selectedRoomNumbers,
        totalPrice: type.basePrice * count * stayDays
      });
    });
    return result;
  }, [createdBooking, selectedRooms, roomTypes, stayDays]);

  const momoPaymentQuery = useQuery({
    queryKey: ["momo-payment", createdBooking?.id, depositPercentage],
    queryFn: () => {
      const depositAmount = Math.round((finalTotal * depositPercentage) / 100);
      return userBookingsApi.createMomoPayment(createdBooking.id, {
        amount: depositAmount,
      });
    },
    enabled: step === 4 && paymentMethod === "momo" && !!createdBooking?.id && depositPercentage > 0,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const sepayAmount = Math.round((finalTotal * depositPercentage) / 100);
  const vnpayQrUrl = `https://qr.sepay.vn/img?acc=96247GXSXM&bank=BIDV&amount=${sepayAmount}&des=DH${createdBooking?.bookingCode}`;

  const handleTestWebhook = async () => {
    if (!createdBooking) return;
    try {
      const response = await fetch("http://localhost:5291/api/payment/sepay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Apikey whsec_2uYfh1iEIpF8ByKdmPpl87uYYlf5LCOC"
        },
        body: JSON.stringify({
          gateway: "SePay",
          transactionDate: new Date().toISOString(),
          accountNumber: "96247GXSXM",
          subAccount: null,
          transferType: "in",
          transferAmount: sepayAmount,
          accumulated: 0,
          code: null,
          content: `DH${createdBooking.bookingCode}`,
          referenceCode: "TEST-" + Math.floor(Math.random() * 1000000),
          id: Math.floor(Math.random() * 100000)
        })
      });
      
      if (response.ok) {
        setShowPaymentSuccess(true);
      } else {
        alert("❌ Lỗi: " + response.statusText);
      }
    } catch (error) {
      alert("❌ Lỗi gọi API: " + error.message);
    }
  };

  const handleAddRoom = (rt) => {
    setSelectedRooms(prev => {
      const currentSelected = prev[rt.roomTypeId] || [];
      if (currentSelected.length >= rt.availableRooms.length) return prev;
      const nextAvailable = rt.availableRooms.find(r => !currentSelected.includes(r.id));
      if (nextAvailable) {
        return { ...prev, [rt.roomTypeId]: [...currentSelected, nextAvailable.id] };
      }
      return prev;
    });
  };

  const handleRemoveRoom = (rt) => {
    setSelectedRooms(prev => {
      const currentSelected = prev[rt.roomTypeId] || [];
      if (currentSelected.length === 0) return prev;
      return { ...prev, [rt.roomTypeId]: currentSelected.slice(0, -1) };
    });
  };

  const handleToggleRoom = (rt, roomId) => {
    setSelectedRooms(prev => {
      const currentSelected = prev[rt.roomTypeId] || [];
      if (currentSelected.includes(roomId)) {
        return { ...prev, [rt.roomTypeId]: currentSelected.filter(id => id !== roomId) };
      } else {
        return { ...prev, [rt.roomTypeId]: [...currentSelected, roomId] };
      }
    });
  };

  const handleNextStep1 = () => {
    if (!info.fullName || !info.phone || !info.email) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (selectedTotalRooms === 0) {
      alert("Vui lòng chọn ít nhất 1 phòng.");
      return;
    }

    if (!auth?.token) {
      alert("Vui lòng đăng nhập để đặt phòng.");
      navigate("/login", { state: { returnUrl: "/booking" } });
      return;
    }

    // Build booking details payload
    const bookingDetails = [];
    Object.entries(selectedRooms).forEach(([typeId, ids]) => {
      const type = roomTypes.find(rt => rt.roomTypeId.toString() === typeId.toString());
      if (type && ids && ids.length > 0) {
        ids.forEach(roomId => {
          bookingDetails.push({
            roomId: roomId,
            roomTypeId: type.roomTypeId,
            checkInDate: toApiDate(info.checkIn),
            checkOutDate: toApiDate(info.checkOut),
          });
        });
      }
    });

    createBookingMutation.mutate({
      guestName: info.fullName,
      guestPhone: info.phone,
      guestEmail: info.email,
      bookingDetails
    });
  };

  const handleBackStep2 = () => setStep(1);

  const handleBackStep3 = () => {
    if (createdBooking) {
      unlockBookingMutation.mutate(createdBooking.id, {
        onSuccess: () => {
          setCreatedBooking(null);
          setStep(2);
        }
      });
    } else {
      setStep(2);
    }
  };

  const handleNextStep3 = () => {
    if (selectedVoucherId && createdBooking?.voucherId?.toString() !== selectedVoucherId.toString()) {
      applyVoucherMutation.mutate(
        { bookingId: createdBooking.id, voucherId: selectedVoucherId },
        { onSuccess: () => setStep(4) }
      );
    } else {
      setStep(4);
    }
  };
  const handleBackStep4 = () => setStep(3);

  const steps = [
    { num: 1, label: "Thông tin" },
    { num: 2, label: "Chọn phòng" },
    { num: 3, label: "Hóa đơn" },
    { num: 4, label: "Thanh toán" },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FA] pb-20 pt-10">
      <div className="mx-auto max-w-5xl px-4 lg:px-8">

        {/* Header Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-slate-200 -z-10"></div>
            <div className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-[#0194f3] transition-all duration-500 ease-in-out -z-10" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>

            {steps.map((s) => {
              const isActive = step >= s.num;
              const isCurrent = step === s.num;
              return (
                <div key={s.num} className="flex flex-col items-center gap-2 bg-[#F4F7FA] px-2">
                  <div className={`flex size-10 items-center justify-center rounded-full text-sm font-black transition-all ${isActive ? "bg-[#0194f3] text-white shadow-md shadow-blue-500/30" : "bg-white text-slate-400 border-2 border-slate-200"}`}>
                    {isActive && !isCurrent ? <Check size={18} /> : s.num}
                  </div>
                  <span className={`text-xs font-bold ${isActive ? "text-[#0194f3]" : "text-slate-400"}`}>{s.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <div key="step1" className="rounded-2xl bg-white p-6 md:p-8 shadow-sm ring-1 ring-slate-100">
                <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2"><User className="text-[#0194f3]" /> Chi tiết về bạn</h2>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Họ và Tên</label>
                    <input type="text" value={info.fullName} onChange={(e) => setInfo({ ...info, fullName: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 focus:border-[#0194f3] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0194f3]/10 transition-all" placeholder="Nhập họ và tên" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Số điện thoại</label>
                      <input type="text" value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 focus:border-[#0194f3] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0194f3]/10 transition-all" placeholder="Nhập số điện thoại" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
                      <input type="email" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 focus:border-[#0194f3] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0194f3]/10 transition-all" placeholder="Nhập địa chỉ email" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-black uppercase text-slate-500 mb-4 tracking-wider">Thời gian lưu trú</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Nhận phòng</label>
                        <input type="datetime-local" value={info.checkIn} onChange={(e) => setInfo({ ...info, checkIn: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 focus:border-[#0194f3] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0194f3]/10 transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Trả phòng</label>
                        <input type="datetime-local" value={info.checkOut} onChange={(e) => setInfo({ ...info, checkOut: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 focus:border-[#0194f3] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0194f3]/10 transition-all" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button onClick={handleNextStep1} className="inline-flex items-center gap-2 rounded-xl bg-[#0194f3] px-8 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-500/30 transition hover:bg-[#0070bc] hover:shadow-blue-500/40">
                    Tiếp theo <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div key="step2" className="space-y-4">
                <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm ring-1 ring-slate-100">
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><Hotel className="text-[#0194f3]" /> Chọn phòng</h2>
                  {availableRoomsQuery.isFetching && <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md animate-pulse">Đang cập nhật...</span>}
                </div>

                {roomTypes.map((rt) => {
                  const availableCount = rt.availableRooms.length;
                  const rawSelected = selectedRooms[rt.roomTypeId];
                  const selectedIds = Array.isArray(rawSelected) ? rawSelected : [];
                  const selectedCount = selectedIds.length;
                  const isSoldOut = availableCount === 0;

                  return (
                    <div key={rt.roomTypeId} className={`flex flex-col bg-white p-4 rounded-2xl shadow-sm ring-1 transition-all ${isSoldOut ? "opacity-60 ring-slate-100 grayscale-[0.5]" : "ring-slate-100 hover:shadow-md"}`}>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <img src={rt.imageUrls[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945"} alt={rt.roomTypeName} className="w-full sm:w-32 h-24 object-cover rounded-xl shrink-0" />

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-black text-slate-900 text-lg leading-tight">{rt.roomTypeName}</h3>
                            <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-2">
                              <Users size={14} /> Tối đa {rt.capacityAdults} NL {rt.capacityChildren > 0 ? `, ${rt.capacityChildren} TE` : ''}
                            </p>
                          </div>
                          <div className="mt-2 text-[#0194f3] font-black text-lg">
                            {formatCurrency(rt.basePrice)} <span className="text-xs font-bold text-slate-400">/ đêm</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-between border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-4">
                          <div className="text-xs font-bold mb-2">
                            {isSoldOut ? (
                              <span className="text-rose-500 bg-rose-50 px-2 py-1 rounded-md">Đã hết phòng</span>
                            ) : (
                              <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Còn {availableCount} phòng</span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              disabled={isSoldOut || selectedCount <= 0}
                              onClick={() => handleRemoveRoom(rt)}
                              className="size-8 flex items-center justify-center rounded-full border border-slate-200 text-[#0194f3] disabled:opacity-30 disabled:bg-slate-50 hover:bg-blue-50 transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-6 text-center font-black text-lg text-slate-900">{selectedCount}</span>
                            <button
                              disabled={isSoldOut || selectedCount >= availableCount}
                              onClick={() => handleAddRoom(rt)}
                              className="size-8 flex items-center justify-center rounded-full border border-slate-200 text-[#0194f3] disabled:opacity-30 disabled:bg-slate-50 hover:bg-blue-50 transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Room Numbers Selection */}
                      {!isSoldOut && (
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <p className="text-xs font-bold text-slate-500 mb-2">Chọn phòng cụ thể:</p>
                          <div className="flex flex-wrap gap-2">
                            {rt.availableRooms.map(room => {
                              const isSelected = selectedIds.includes(room.id);
                              return (
                                <button
                                  key={room.id}
                                  onClick={() => handleToggleRoom(rt, room.id)}
                                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${isSelected ? "bg-[#0194f3] border-[#0194f3] text-white shadow-md shadow-blue-500/20" : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50"}`}
                                >
                                  {room.roomNumber}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

                <div className="mt-8 flex justify-between">
                  <button onClick={handleBackStep2} className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50">
                    <ArrowLeft size={18} /> Quay lại
                  </button>
                  <button disabled={selectedTotalRooms === 0 || createBookingMutation.isPending} onClick={handleNextStep2} className="inline-flex items-center gap-2 rounded-xl bg-[#0194f3] px-8 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-500/30 transition hover:bg-[#0070bc] disabled:opacity-50 disabled:cursor-not-allowed">
                    {createBookingMutation.isPending ? "Đang khóa phòng..." : "Tiếp theo"} <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div key="step3" className="rounded-2xl bg-white p-6 md:p-8 shadow-sm ring-1 ring-slate-100">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><Receipt className="text-[#0194f3]" /> Chi tiết hóa đơn</h2>
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">
                    Mã: {createdBooking?.bookingCode}
                  </span>
                </div>

                <div className="space-y-6">
                  
                  {/* Voucher Selection */}
                  {auth?.token && (
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 ring-1 ring-slate-100 shadow-sm">
                      <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
                         Mã ưu đãi của bạn
                      </h3>
                      {userVouchersQuery.isLoading ? (
                        <p className="text-sm font-medium text-slate-500 animate-pulse">Đang tải mã ưu đãi...</p>
                      ) : userVouchersQuery.data?.length > 0 ? (
                        <select 
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 focus:border-[#0194f3] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0194f3]/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                          value={selectedVoucherId}
                          disabled={applyVoucherMutation.isPending}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedVoucherId(val);
                            if (createdBooking?.id) {
                              applyVoucherMutation.mutate({
                                bookingId: createdBooking.id,
                                voucherId: val ? Number(val) : null
                              });
                            }
                          }}
                        >
                          <option value="">-- Không sử dụng ưu đãi --</option>
                          {userVouchersQuery.data.filter(uv => uv.voucher?.isActive && (!uv.voucher?.voucherType || ["Booking", "Birthday"].includes(uv.voucher.voucherType)) && (!uv.voucher.validTo || new Date(uv.voucher.validTo) >= new Date())).map(uv => {
                            const isEligible = !uv.voucher.minBookingValue || estimatedTotal >= uv.voucher.minBookingValue;
                            return (
                              <option key={uv.voucherId} value={uv.voucherId} disabled={!isEligible}>
                                {uv.voucher.code} - Giảm {uv.voucher.discountType === "Fixed" || uv.voucher.discountType === "AMOUNT" ? formatCurrency(uv.voucher.discountValue) : `${uv.voucher.discountValue}%`} 
                                {!isEligible ? ` (Đơn tối thiểu ${formatCurrency(uv.voucher.minBookingValue)})` : ""}
                              </option>
                            );
                          })}
                        </select>
                      ) : (
                        <p className="text-sm font-medium text-slate-500 italic">Bạn chưa lưu mã ưu đãi nào trong kho.</p>
                      )}
                    </div>
                  )}

                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 border-dashed">
                      <span className="text-sm font-bold text-slate-600">Tổng tiền phòng ({stayDays} đêm)</span>
                      <span className="text-lg font-black text-slate-900">{formatCurrency(estimatedTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 border-dashed">
                      <span className="text-sm font-bold text-slate-600 flex items-center gap-1.5">Ưu đãi / Membership {discountPercent > 0 && <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-700 font-black">-{discountPercent}%</span>} <Info size={14} className="text-slate-400" /></span>
                      <span className="text-base font-bold text-emerald-600">- {formatCurrency(discountAmount)}</span>
                    </div>
                    {voucherDiscountAmount > 0 && (
                      <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 border-dashed">
                        <span className="text-sm font-bold text-slate-600 flex items-center gap-1.5">Mã ưu đãi / Voucher</span>
                        <span className="text-base font-bold text-emerald-600">- {formatCurrency(voucherDiscountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-black text-slate-900 uppercase tracking-wider">Tổng thanh toán</span>
                      <span className="text-2xl font-black text-[#0194f3]">{formatCurrency(finalTotal)}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900 mb-4">Tùy chọn đặt cọc</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[30, 40, 50, 100].map(pct => (
                        <button
                          key={pct}
                          onClick={() => setDepositPercentage(pct)}
                          className={`relative overflow-hidden rounded-xl border-2 p-3 text-center transition-all ${depositPercentage === pct ? "border-[#0194f3] bg-blue-50" : "border-slate-100 bg-white hover:border-blue-200"}`}
                        >
                          <span className={`block text-lg font-black ${depositPercentage === pct ? "text-[#0194f3]" : "text-slate-700"}`}>{pct}%</span>
                          <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                            {pct === 100 ? "Thanh toán đủ" : "Đặt cọc"}
                          </span>
                          {depositPercentage === pct && (
                            <div className="absolute top-0 right-0 bg-[#0194f3] text-white p-0.5 rounded-bl-lg">
                              <Check size={12} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between bg-orange-50 rounded-xl p-4 border border-orange-100">
                      <span className="text-sm font-bold text-orange-800">Số tiền cần thanh toán ngay:</span>
                      <span className="text-xl font-black text-orange-600">{formatCurrency(finalTotal * (depositPercentage / 100))}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button onClick={handleBackStep3} disabled={cancelBookingMutation.isPending} className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50">
                    <ArrowLeft size={18} /> {cancelBookingMutation.isPending ? "Đang mở khóa..." : "Quay lại"}
                  </button>
                  <button onClick={handleNextStep3} className="inline-flex items-center gap-2 rounded-xl bg-[#0194f3] px-8 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-500/30 transition hover:bg-[#0070bc]">
                    Thanh toán <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div key="step4" className="rounded-2xl bg-white p-6 md:p-8 shadow-sm ring-1 ring-slate-100 text-center">

                <div className="flex justify-center gap-4 mb-8">
                  <button
                    onClick={() => setPaymentMethod("vnpay")}
                    className={`flex-1 max-w-[200px] py-3 px-4 rounded-xl font-bold border-2 transition-all ${paymentMethod === "vnpay" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-100 text-slate-500 hover:border-blue-200"}`}
                  >
                    Thanh toán VNPay
                  </button>
                  <button
                    onClick={() => setPaymentMethod("momo")}
                    className={`flex-1 max-w-[200px] py-3 px-4 rounded-xl font-bold border-2 transition-all ${paymentMethod === "momo" ? "border-pink-500 bg-pink-50 text-pink-700" : "border-slate-100 text-slate-500 hover:border-pink-200"}`}
                  >
                    Thanh toán MoMo
                  </button>
                </div>

                {paymentMethod === "vnpay" ? (
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Thanh toán qua VNPay</h2>
                    <p className="text-sm font-medium text-slate-500 mb-8 max-w-md mx-auto">Vui lòng quét mã QR bên dưới để thanh toán. Hệ thống sẽ tự động xác nhận khi nhận được tiền.</p>

                    <div className="max-w-sm mx-auto">
                      <div className="bg-white p-4 rounded-[2rem] border-[12px] border-blue-50 shadow-xl inline-block mb-6 relative group">
                        <img src={vnpayQrUrl} alt="VNPay QR Code" className="size-56 rounded-xl" />
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left mb-8">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold uppercase text-slate-400">Số tiền</span>
                          <span className="text-lg font-black text-blue-600">{formatCurrency(sepayAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold uppercase text-slate-400">Nội dung</span>
                          <span className="text-sm font-bold text-slate-900">{createdBooking?.bookingCode}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Thanh toán qua MoMo</h2>
                    <p className="text-sm font-medium text-slate-500 mb-8 max-w-md mx-auto">Vui lòng quét mã QR bên dưới bằng ứng dụng MoMo để hoàn tất việc đặt phòng của bạn. Phòng của bạn sẽ được giữ trong 10 phút.</p>

                    {momoPaymentQuery.isLoading ? (
                      <div className="h-64 flex flex-col items-center justify-center space-y-4">
                        <div className="size-10 border-4 border-slate-100 border-t-pink-500 rounded-full animate-spin"></div>
                        <p className="text-sm font-bold text-slate-500">Đang tạo mã QR...</p>
                      </div>
                    ) : momoPaymentQuery.isError ? (
                      <div className="p-6 bg-rose-50 text-rose-600 rounded-2xl font-bold border border-rose-100">
                        Có lỗi xảy ra khi tạo thanh toán MoMo.
                        <p className="text-xs font-medium mt-2">{momoPaymentQuery.error?.message}</p>
                      </div>
                    ) : momoPaymentQuery.data ? (
                      <div className="max-w-sm mx-auto">
                        <div className="bg-white p-4 rounded-[2rem] border-[12px] border-pink-50 shadow-xl inline-block mb-6">
                          <img src={buildQuickChartQrUrl(momoPaymentQuery.data.qrCodeUrl)} alt="QR Code" className="size-56 rounded-xl" />
                        </div>

                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left mb-8">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold uppercase text-slate-400">Số tiền</span>
                            <span className="text-lg font-black text-pink-600">{formatCurrency(momoPaymentQuery.data.amount)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold uppercase text-slate-400">Mã đơn hàng</span>
                            <span className="text-sm font-bold text-slate-900">{momoPaymentQuery.data.orderId}</span>
                          </div>
                        </div>

                        <button onClick={() => window.open(momoPaymentQuery.data.payUrl, "_blank")} className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-pink-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-pink-500/30 transition hover:bg-pink-700 mb-4">
                          <CreditCard size={18} /> Mở ứng dụng MoMo
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
                <div className="mt-4 flex justify-between border-t border-slate-100 pt-6">
                  <button onClick={handleBackStep4} className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50">
                    <ArrowLeft size={18} /> Quay lại
                  </button>
                  <button onClick={handleTestWebhook} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700">
                    Xác nhận thanh toán
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Summary */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <h3 className="text-lg font-black text-slate-900 mb-4">Tóm tắt đặt phòng</h3>

              <div className="space-y-4">
                <div className="flex gap-3 pb-4 border-b border-slate-100">
                  <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0194f3] shrink-0">
                    <CalendarDays size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400 mb-1">Thời gian</p>
                    <p className="text-sm font-bold text-slate-900">{new Date(info.checkIn).toLocaleDateString("vi-VN")} - {new Date(info.checkOut).toLocaleDateString("vi-VN")}</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{stayDays} đêm</p>
                  </div>
                </div>

                <div className="flex gap-3 pb-4 border-b border-slate-100">
                  <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0194f3] shrink-0">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400 mb-1">Khách</p>
                    <p className="text-sm font-bold text-slate-900">{info.adults} Người lớn{info.children > 0 ? `, ${info.children} Trẻ em` : ""}</p>
                  </div>
                </div>

                {selectedTotalRooms > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-bold uppercase text-slate-400 mb-3">Phòng đã chọn</p>
                    <div className="space-y-3">
                      {summaryRooms.map((sr) => (
                        <div key={sr.id} className="flex justify-between items-start text-sm">
                          <div>
                            <p className="font-bold text-slate-900">{sr.count}x {sr.roomTypeName}</p>
                            <p className="text-[10px] font-bold text-slate-500 mt-0.5">Phòng: {sr.roomNumbers}</p>
                          </div>
                          <p className="font-bold text-slate-700">{formatCurrency(sr.totalPrice)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100">
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-500">Membership (-{discountPercent}%)</span>
                    <span className="text-sm font-bold text-emerald-600">- {formatCurrency(discountAmount)}</span>
                  </div>
                )}
                {voucherDiscountAmount > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-500">Voucher</span>
                    <span className="text-sm font-bold text-emerald-600">- {formatCurrency(voucherDiscountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-black text-slate-900">Tổng cộng</span>
                  <span className="text-xl font-black text-[#0194f3]">{formatCurrency(finalTotal)}</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 text-right mt-1 uppercase">Đã bao gồm thuế và phí</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Error Popup Modal */}
      {errorPopupMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-rose-50 p-6 flex flex-col items-center text-center border-b border-rose-100">
              <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Không thể đặt phòng</h3>
              <p className="text-sm font-medium text-slate-600">{errorPopupMessage}</p>
            </div>
            <div className="p-6 bg-white">
              <button
                onClick={() => setErrorPopupMessage(null)}
                className="w-full py-3.5 px-6 rounded-xl bg-slate-900 text-white font-black hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
              >
                Đã hiểu và chọn phòng khác
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Success Modal */}
      {showPaymentSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-emerald-50 p-8 flex flex-col items-center text-center border-b border-emerald-100">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Đã thanh toán thành công</h3>
              <p className="text-sm font-medium text-slate-600">Đơn đặt phòng của bạn đã được xác nhận. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
            </div>
            <div className="p-6 bg-white space-y-3">
              <button
                onClick={() => navigate("/booking-history")}
                className="w-full py-4 px-6 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
              >
                Trở về Lịch sử đặt phòng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
