import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Sidebar from "../components/admin/layout/Sidebar";
import Navbar from "../components/admin/layout/Navbar";
import PageTransition from "../components/layout/PageTransition";

const AdminLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(window.innerWidth > 1024);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth <= 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="admin-layout min-h-screen bg-gray-50 text-gray-950 font-sans">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-[9998] bg-gray-900/50 backdrop-blur-sm lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 1. Sidebar cố định bên trái */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* 2. Phần nội dung chính nằm bên phải */}
      <div 
        className={`flex flex-col transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-64 ml-0" : "ml-0"
        }`}
      >
        {/* 2.1. Navbar cố định trên cùng */}
        <Navbar onToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        {/* 2.2. Khu vực hiển thị nội dung trang cụ thể (Outlet) */}
        <main className="mt-20 p-4 lg:p-10 flex-1 overflow-x-hidden">
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

