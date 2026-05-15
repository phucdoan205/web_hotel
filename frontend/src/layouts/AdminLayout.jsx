import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Sidebar from "../components/admin/layout/Sidebar";
import Navbar from "../components/admin/layout/Navbar";
import PageTransition from "../components/layout/PageTransition";

const AdminLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="admin-layout min-h-screen bg-gray-50 text-gray-950 font-sans">
      {/* 1. Sidebar cố định bên trái */}
      <Sidebar isOpen={isSidebarOpen} />

      {/* 2. Phần nội dung chính nằm bên phải */}
      <div 
        className={`flex flex-col transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* 2.1. Navbar cố định trên cùng */}
        <Navbar onToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />

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

