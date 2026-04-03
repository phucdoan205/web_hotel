import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/admin/layout/Sidebar";
import Navbar from "../components/admin/layout/Navbar";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-950 font-sans">
      {/* 1. Sidebar cố định bên trái */}
      <Sidebar />

      {/* 2. Phần nội dung chính nằm bên phải */}
      {/* ml-64 (margin left) để bù cho độ rộng Sidebar */}
      <div className="ml-64 flex flex-col">
        {/* 2.1. Navbar cố định trên cùng */}
        <Navbar />

        {/* 2.2. Khu vực hiển thị nội dung trang cụ thể (Outlet) */}
        {/* mt-20 (margin top) để bù cho chiều cao Navbar, p-10 để tạo khoảng cách */}
        <main className="mt-20 p-10 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
