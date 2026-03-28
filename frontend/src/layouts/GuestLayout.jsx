import React from "react";
import { Outlet } from "react-router-dom";
// Hãy đảm bảo đường dẫn import đúng với cấu trúc thư mục của bạn
import Sidebar from "../components/guest/layout/Sidebar";
import Navbar from "../components/guest/layout/Navbar";

const GuestLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 1. Sidebar bên trái - Cố định độ rộng và chiều cao */}
      <div className="w-64 fixed inset-y-0 left-0 z-40">
        <Sidebar />
      </div>

      {/* 2. Khối nội dung bên phải (Navbar + Main Content) */}
      {/* ml-64: tạo khoảng trống bên trái để không bị Sidebar đè lên */}
      <div className="flex flex-col flex-1 ml-64">
        {/* 2.1. Navbar bên trên */}
        {/* h-16: chiều cao cố định, sticky để luôn nằm trên cùng khi cuộn content */}
        <header className="h-16 sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
          <Navbar />
        </header>

        {/* 2.2. Nội dung trang (Outlet) */}
        {/* p-8: tạo khoảng cách đệm cho nội dung quản trị */}
        <main className="p-8 flex-1">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Bạn có thể thêm Footer ở đây nếu cần */}
      </div>
    </div>
  );
};

export default GuestLayout;
