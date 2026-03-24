import React from "react";
import { Bed, Users, LogIn, LogOut, Search, Bell, Plus } from "lucide-react";
import StatCard from "../../components/receptionist/dashboard/StatCard";
import QuickPOS from "../../components/receptionist/dashboard/QuickPOS";
import CheckInTable from "../../components/receptionist/dashboard/CheckInTable";
import CheckOutList from "../../components/receptionist/dashboard/CheckOutList";
import Availability from "../../components/receptionist/dashboard/Availability";

const Dashboard = () => {
  const statsData = [
    {
      title: "Total Rooms Today",
      value: "120",
      change: "+2%",
      icon: Bed,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      title: "Current Guests",
      value: "85",
      change: "+5.2%",
      icon: Users,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
    {
      title: "Today's Check-ins",
      value: "12",
      change: "-10%",
      icon: LogIn,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      title: "Today's Check-outs",
      value: "8",
      change: "Steady",
      icon: LogOut,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="p-8 bg-gray-50/30 min-h-screen space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Receptionist Dashboard
          </h1>
          <p className="text-sm font-bold text-gray-400 mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-xs outline-none focus:border-blue-500 transition-all w-64 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
            <Plus size={16} strokeWidth={3} />
            New Booking
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((data, index) => (
          <StatCard key={index} {...data} />
        ))}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left: Lists */}
        <div className="xl:col-span-2 space-y-8">
          {/* Bạn sẽ đặt CheckInTable và CheckOutList ở đây */}
          <CheckInTable /> {/* <-- Thêm vào đây */}
          <CheckOutList /> {/* <-- Thêm vào đây */}
        </div>

        {/* Right: Sidebar widgets */}
        <div className="space-y-8">
          <QuickPOS />
          <Availability />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
