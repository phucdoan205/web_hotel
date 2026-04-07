import React, { useState, useMemo } from "react";
import { Search, SlidersHorizontal, MoreVertical, CheckCircle, SquareArrowRightExit } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingsApi } from "../../../api/admin/bookingsApi";

const GuestTable = ({ activeTab, data }) => {
  const [search, setSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const queryClient = useQueryClient();

  // 🎯 Filter logic
  const filteredData = useMemo(() => {
    return data.filter((booking) => {
      const matchSearch = booking.guestName
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchRoom = roomFilter
        ? booking.bookingDetails.some((d) =>
          d.roomNumber.includes(roomFilter)
        )
        : true;

      return matchSearch && matchRoom;
    });
  }, [data, search, roomFilter]);

  const checkInMutation = useMutation({
    mutationFn: (bookingId) => bookingsApi.checkIn(bookingId),
    onSuccess: (_, bookingId) => {
      queryClient.setQueryData(["arrivals"], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          items: oldData.items.filter((b) => b.id !== bookingId),
        };
      });

      // 🔥 cập nhật tab lưu trú
      queryClient.invalidateQueries({ queryKey: ["in-house"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });

      alert("Check-in successful");
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message || // backend trả về
        error?.response?.data ||         // trường hợp trả string
        error.message ||                // lỗi JS
        "Check-in failed";

      alert(message);
    }
  });

  const checkOutMutation = useMutation({
    mutationFn: (bookingId) => bookingsApi.checkOut(bookingId),
    onSuccess: (_, bookingId) => {
      queryClient.setQueryData(["in-house"], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          items: oldData.items.filter((b) => b.id !== bookingId),
        };
      });

      queryClient.invalidateQueries({ queryKey: ["departures"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });

      alert("Check-out successful");
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message || // backend trả về
        error?.response?.data ||         // trường hợp trả string
        error.message ||                // lỗi JS
        "Check-in failed";

      alert(message);
    }
  });

  const handleCheckIn = async (bookingId) => {
    await checkInMutation.mutateAsync(bookingId);
  };

  const handleCheckOut = async (bookingId) => {
    await checkOutMutation.mutateAsync(bookingId);
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden">
      {/* HEADER */}
      <div className="p-6 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* 🔍 Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search guest..."
              className="pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-xs w-64 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          {/* 🎯 Filter Room */}
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              placeholder="Filter room..."
              className="pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-xs w-40 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={() => {
            setSearch("");
            setRoomFilter("");
          }}
          className="text-xs font-bold text-gray-400 hover:text-gray-600"
        >
          Reset
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50">
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
              <th className="px-8 py-5">Guest Name</th>
              <th className="px-6 py-5">Booking Code</th>
              <th className="px-6 py-5">
                {activeTab === "in" ? "Arrival Date" : "Departure Date"}
              </th>
              <th className="px-6 py-5">Rooms</th>
              <th className="px-6 py-5 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {filteredData.length > 0 ? (
              filteredData.map((booking, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50/30 transition-colors group"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600">
                        {booking.guestName.charAt(0)}
                      </div>
                      <span className="font-bold text-gray-900 text-sm">
                        {booking.guestName}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-xs font-bold text-gray-400">
                    {booking.bookingCode}
                  </td>

                  <td className="px-6 py-5 text-xs font-medium text-gray-500">
                    {activeTab === "in"
                      ? booking.bookingDetails[0]?.checkInDate
                      : booking.bookingDetails[0]?.checkOutDate}
                  </td>

                  <td className="px-6 py-5 text-xs font-medium text-gray-600">
                    {booking.bookingDetails
                      .map((d) => d.roomNumber)
                      .join(", ")}
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      {
                        activeTab === "in" ? (
                          <button
                            onClick={() => handleCheckIn(booking.id)}
                            className="flex items-center gap-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-300 text-white text-xs font-semibold rounded-2xl transition-all shadow-sm"
                            title="Nhận phòng"
                          >
                            <CheckCircle size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCheckOut(booking.id)}
                            className="flex items-center gap-1 px-4 py-1.5 bg-rose-800 hover:bg-rose-400 text-white text-xs font-semibold rounded-2xl transition-all shadow-sm"
                            title="Trả phòng"
                          >
                            <SquareArrowRightExit size={16} />
                          </button>
                        )
                      }
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-10 text-gray-400 text-sm"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GuestTable;