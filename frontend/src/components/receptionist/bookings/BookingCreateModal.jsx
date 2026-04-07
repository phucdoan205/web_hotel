// src/components/receptionist/bookings/BookingCreateModal.jsx
import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingsApi } from "../../../api/admin/bookingsApi";
import { roomTypesApi } from "../../../api/admin/roomTypesApi";
import { roomsApi } from "../../../api/admin/roomsApi";

const BookingCreateModal = ({ open, onClose }) => {
    const queryClient = useQueryClient();

    const [selectedRooms, setSelectedRooms] = useState([]);
    const [guestInfo, setGuestInfo] = useState({ name: "", phone: "", email: "" });
    const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]); // mặc định là ngày hôm nay
    const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]); // mặc định là ngày mai

    // Lấy danh sách loại phòng
    const { data: roomTypes = [], isLoading: loadingTypes } = useQuery({
        queryKey: ["roomTypes"],
        queryFn: async () => {
            const res = await roomTypesApi.getRoomTypes({ pageSize: 50 });
            return res.items || [];
        },
        enabled: open,
    });

    // Lấy cả phòng Available và Occupied
    const { data: allRooms = [], isLoading: loadingRooms } = useQuery({
        queryKey: ["rooms", "for-booking"],
        queryFn: async () => {
            const res = await roomsApi.getRooms({
                status: "",           // không lọc status
                pageSize: 200
            });
            // Chỉ lấy Available và Occupied
            return (res.items || []).filter(room =>
                room.status === "Available" || room.status === "Occupied"
            );
        },
        enabled: open,
    });

    const resetForm = () => {
        setSelectedRooms([]);
        setGuestInfo({ name: "", phone: "", email: "" });
        setCheckInDate(new Date().toISOString().split('T')[0]);
        setCheckOutDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    }

    // Mutation tạo booking
    const createMutation = useMutation({
        mutationFn: (payload) => bookingsApi.createBooking(payload),
        onSuccess: async () => {
            try {
                for (const room of selectedRooms) {
                    await roomsApi.updateRoomStatus(room.id, "Occupied");
                }
                queryClient.invalidateQueries({ queryKey: ["rooms"] });
                queryClient.invalidateQueries({ queryKey: ["bookings"] });
                alert("✅ Tạo booking thành công!");
            } catch (err) {
                alert("Tạo booking thành công nhưng có lỗi cập nhật trạng thái phòng.");
            }
            onClose();
            resetForm();
        },
        onError: (err) => {
            alert(err.response?.data?.message || "❌ Có lỗi khi tạo booking");
        },
    });

    // Toggle chọn phòng
    const toggleRoomSelection = (room) => {
        if (room.status === "Occupied") {
            alert("Phòng này đang có khách đang lưu trú, không thể chọn!");
            return;
        }

        setSelectedRooms((prev) => {
            const exists = prev.some(r => r.id === room.id);
            if (exists) {
                return prev.filter(r => r.id !== room.id);
            } else {
                return [...prev, room];
            }
        });
    };

    const handleCreateBooking = () => {
        if (selectedRooms.length === 0) {
            alert("Vui lòng chọn ít nhất một phòng!");
            return;
        }
        if (!guestInfo.name.trim()) {
            alert("Vui lòng nhập tên khách hàng!");
            return;
        }

        if (!validateDates()) {
            return;
        }

        const payload = {
            guestName: guestInfo.name,
            guestPhone: guestInfo.phone,
            guestEmail: guestInfo.email,
            bookingDetails: selectedRooms.map((room) => ({
                roomTypeId: room.roomTypeId || room.roomType?.id,
                roomId: room.id,
                checkInDate: checkInDate,
                checkOutDate: checkOutDate,
            })),
        };

        createMutation.mutate(payload);
    };

    const validateDates = () => {
        if (!checkInDate || !checkOutDate) {
            alert("Vui lòng chọn ngày check-in và check-out!");
            return false;
        }
        if (checkInDate >= checkOutDate) {
            alert("Ngày check-out phải sau ngày check-in!");
            return false;
        }
        return true;
    }

    if (!open) return null;

    const isLoading = loadingTypes || loadingRooms;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">

                {/* Header */}
                <div className="px-8 py-2 border-b flex items-center justify-between bg-gray-50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Tạo Booking Mới</h2>
                        <p className="text-sm text-gray-500">Chọn phòng và nhập thông tin khách hàng</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-gray-200 rounded-2xl">
                        <X size={26} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar: Thông tin khách */}
                    <div className="w-96 border-r px-6 py-2 bg-gray-50 flex flex-col">
                        <h3 className="font-bold text-lg mb-1">Thông tin đặt phòng</h3>

                        <div className="space-y-2">
                            <div>
                                <label className="block text-md font-bold text-gray-600 mb-1">Họ và tên *</label>
                                <input
                                    type="text"
                                    value={guestInfo.name}
                                    onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                                    className="w-full px-4 py-1 border border-gray-300 rounded-2xl focus:border-orange-500 outline-none"
                                    placeholder="Nhập họ tên khách hàng"
                                />
                            </div>

                            <div>
                                <label className="block text-md font-bold text-gray-600 mb-1">Số điện thoại</label>
                                <input
                                    type="tel"
                                    value={guestInfo.phone}
                                    onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                                    className="w-full px-4 py-1 border border-gray-300 rounded-2xl focus:border-orange-500 outline-none"
                                    placeholder="Số điện thoại"
                                />
                            </div>

                            <div>
                                <label className="block text-md font-bold text-gray-600 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={guestInfo.email}
                                    onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                                    className="w-full px-4 py-1 border border-gray-300 rounded-2xl focus:border-orange-500 outline-none"
                                    placeholder="Email (tùy chọn)"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-md font-bold text-gray-600 mb-1">
                                        Ngày Check-in *
                                    </label>
                                    <input
                                        type="date"
                                        value={checkInDate}
                                        onChange={(e) => setCheckInDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]} // không cho chọn ngày quá khứ
                                        className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:border-orange-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-md font-bold text-gray-600 mb-1">
                                        Ngày Check-out *
                                    </label>
                                    <input
                                        type="date"
                                        value={checkOutDate}
                                        onChange={(e) => setCheckOutDate(e.target.value)}
                                        min={checkInDate || new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:border-orange-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="bg-white px-5 py-1 rounded-2xl border border-orange-200 text-center">
                                <p className="text-sm">Đã chọn <span className="font-semibold text-orange-600 text-lg">{selectedRooms.length}</span> phòng</p>
                            </div>
                        </div>
                    </div>

                    {/* Main: Danh sách phòng*/}
                    <div className="flex-1 px-8 py-2 overflow-y-auto">
                        <h3 className="font-bold text-xl mb-1">Chọn phòng</h3>

                        {isLoading ? (
                            <div className="text-center py-12">Đang tải danh sách phòng...</div>
                        ) : (
                            <div className="space-y-2">
                                {roomTypes.map((roomType) => {
                                    const roomsOfType = allRooms.filter(
                                        (room) => room.roomTypeId === roomType.id
                                    );

                                    if (roomsOfType.length === 0) return null;

                                    return (
                                        <div key={roomType.id}>
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-bold text-lg">{roomType.name}</h4>
                                                <p className="font-semibold text-orange-600">
                                                    {(roomType.basePrice || 0).toLocaleString("vi-VN")} ₫/đêm
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {roomsOfType.map((room) => {
                                                    const isSelected = selectedRooms.some(r => r.id === room.id);
                                                    const isOccupied = room.status === "Occupied";

                                                    return (
                                                        <div
                                                            key={room.id}
                                                            onClick={() => toggleRoomSelection(room)}
                                                            className={`border-2 rounded-3xl px-5 py-2 cursor-pointer transition-all hover:shadow-md relative ${isOccupied
                                                                ? "border-gray-300 bg-gray-50 opacity-75"
                                                                : isSelected
                                                                    ? "border-orange-500 bg-orange-50"
                                                                    : "border-gray-200 hover:border-orange-300"
                                                                }`}
                                                            title={isOccupied ? "Phòng này đang có khách đang lưu trú" : ""}
                                                        >
                                                            {/* Badge Occupied */}
                                                            {isOccupied && (
                                                                <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow">
                                                                    <AlertTriangle size={14} />
                                                                    OCCUPIED
                                                                </div>
                                                            )}

                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <p className="font-black font-semibold text-2xl">{room.roomNumber}</p>
                                                                    <p className="text-xs text-gray-500">Tầng {room.floor}</p>
                                                                </div>
                                                                {isSelected && !isOccupied && (
                                                                    <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                                        ✓
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="text-sm space-y-1">
                                                                <p>Sức chứa: {roomType.capacityAdults} NL, {roomType.capacityChildren} TE</p>
                                                                <p className="font-semibold text-orange-600">
                                                                    {(roomType.basePrice || 0).toLocaleString("vi-VN")} ₫/đêm
                                                                </p>
                                                            </div>

                                                            {/* Thông báo khi hover hoặc hiển thị */}
                                                            {isOccupied && (
                                                                <div className="mt-3 text-rose-600 text-xs font-medium flex items-center gap-1">
                                                                    <AlertTriangle size={16} />
                                                                    Phòng này đang có khách đang lưu trú
                                                                </div>
                                                            )}
                                                        </div>
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

                {/* Footer */}
                <div className="border-t px-8 py-2 bg-gray-50 flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-2xl"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleCreateBooking}
                        disabled={selectedRooms.length === 0 || createMutation.isPending}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-black rounded-2xl transition-all"
                    >
                        Xác nhận đặt {selectedRooms.length} phòng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingCreateModal;