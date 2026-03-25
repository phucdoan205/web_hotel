import React from "react";
import {
  Search,
  Plus,
  Utensils,
  Sparkles,
  ConciergeBell,
  Brush,
} from "lucide-react";
import RoomStats from "../../components/admin/rooms/RoomStats";
import RoomCard from "../../components/admin/rooms/RoomCard";
import ServiceCard from "../../components/admin/rooms/ServiceCard";

const AdminRoomInventoryPage = () => {
  const categories = ["All Rooms", "Standard", "Deluxe", "Suite", "Penthouse"];

  const rooms = [
    {
      id: 1,
      name: "Deluxe King 204",
      price: 145,
      floor: 2,
      type: "King",
      status: "AVAILABLE",
      image:
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: 2,
      name: "Standard Twin 105",
      price: 95,
      floor: 1,
      type: "Twin",
      status: "OCCUPIED",
      image:
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: 3,
      name: "Penthouse Suite 801",
      price: 450,
      floor: 8,
      type: "King",
      status: "MAINTENANCE",
      image:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Room Inventory</h1>
          <p className="text-sm font-medium text-gray-500">
            Manage your hotel rooms, types, and real-time availability.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-300" />
            <input
              type="text"
              placeholder="Search room numbers..."
              className="pl-11 pr-4 py-2.5 bg-gray-100/50 rounded-xl text-sm outline-none w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 rounded-xl text-sm font-bold text-white hover:bg-orange-700 shadow-lg shadow-orange-100 transition-all">
            <Plus className="size-4" /> New Room
          </button>
        </div>
      </div>

      <RoomStats />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat, idx) => (
          <button
            key={idx}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap
            ${idx === 0 ? "bg-orange-600 text-white shadow-md" : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}

        {/* Add New Room Placeholder (như trong ảnh) */}
        <button className="border-2 border-dashed border-gray-200 rounded-4xl flex flex-col items-center justify-center gap-3 text-gray-400 hover:bg-gray-50 transition-all min-h-87.5">
          <div className="size-12 rounded-full bg-sky-50 flex items-center justify-center text-sky-500 font-bold text-xl">
            +
          </div>
          <div className="text-center px-6">
            <p className="font-bold text-gray-900 text-sm">Add New Room</p>
            <p className="text-[10px] font-medium text-gray-400 mt-1">
              Add a new unit to inventory
            </p>
          </div>
        </button>
      </div>
      {/* Hotel Services Management Section */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-gray-900">
            Hotel Services Management
          </h3>
          <button className="text-orange-600 text-xs font-bold hover:underline">
            View All Services →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ServiceCard
            title="Room Service"
            description="24/7 in-room dining management"
            status="Active"
            icon={Utensils}
            colorClass="bg-orange-50 text-orange-600"
          />
          <ServiceCard
            title="Spa & Wellness"
            description="Treatment schedules and booking"
            status="Active"
            icon={Sparkles}
            colorClass="bg-blue-50 text-blue-600"
          />
          <ServiceCard
            title="Concierge"
            description="Guest requests and luggage"
            status="Active"
            icon={ConciergeBell}
            colorClass="bg-amber-50 text-amber-600"
          />
          <ServiceCard
            title="Housekeeping"
            description="Cleaning logs and assignments"
            status="Active"
            icon={Brush}
            colorClass="bg-slate-50 text-slate-600"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminRoomInventoryPage;
