import React from "react";
import { Link } from "react-router-dom";
import { User, Rocket } from "lucide-react";
import NavItem from "./NavItem";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-10 py-4 bg-white shadow-sm sticky top-0 z-50 h-16">
      {/* Logo Section - Bấm vào quay về Home */}
      <Link to="/" className="flex items-center gap-2 cursor-pointer">
        <div className="bg-[#0194f3] p-1.5 rounded-lg">
          <Rocket className="text-white w-5 h-5 rotate-45" />
        </div>
        <span className="text-2xl font-bold text-[#0194f3] tracking-tight">
          Traveloka
        </span>
      </Link>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-1">
        <NavItem label="Khách sạn" to="/hotels" />
        <NavItem label="Ẩm thực" to="/food" />
        <NavItem label="Hoạt động" to="/activities" />
        <NavItem label="Bài viết" to="/articles" />
      </div>

      {/* Auth Actions */}
      <div className="flex items-center gap-2">
        {/* Nút Đăng nhập - Link tới trang /login */}
        <Link
          to="/login"
          className="flex items-center gap-2 px-4 py-2 text-slate-900 font-bold hover:bg-slate-100 rounded-md transition-all text-sm"
        >
          <User size={18} className="text-slate-900" />
          <span>Đăng nhập</span>
        </Link>

        {/* Nút Đăng ký - Link tới trang /register */}
        <Link
          to="/register"
          className="px-5 py-2 bg-[#0194f3] text-white font-bold rounded-md hover:bg-[#0183d7] transition-all text-sm shadow-sm"
        >
          Đăng ký
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
