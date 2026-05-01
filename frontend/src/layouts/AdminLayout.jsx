import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Sidebar from "../components/admin/layout/Sidebar";
import Navbar from "../components/admin/layout/Navbar";
import PageTransition from "../components/layout/PageTransition";

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="admin-layout min-h-screen bg-gray-50 text-gray-950 font-sans">
      {/* 1. Sidebar cố định bên trái */}
      <Sidebar />

      {/* 2. Phần nội dung chính nằm bên phải */}
      <div className="ml-64 flex flex-col">
        {/* 2.1. Navbar cố định trên cùng */}
        <Navbar />

        {/* 2.2. Khu vực hiển thị nội dung trang cụ thể (Outlet) */}
        <main className="mt-20 p-10 flex-1">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

