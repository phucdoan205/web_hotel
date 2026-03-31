import React from "react";
import { Link } from "react-router-dom";
import { Rocket, User } from "lucide-react";
import NavItem from "./NavItem";
import { getStoredAuth } from "../../utils/authStorage";
import UserMenu from "../shared/UserMenu";

const Navbar = () => {
  const auth = getStoredAuth();

  return (
    <nav className="sticky top-0 z-50 flex h-16 items-center justify-between bg-white px-10 py-4 shadow-sm">
      <Link to="/" className="flex cursor-pointer items-center gap-2">
        <div className="rounded-lg bg-[#0194f3] p-1.5">
          <Rocket className="h-5 w-5 rotate-45 text-white" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-[#0194f3]">
          Traveloka
        </span>
      </Link>

      <div className="hidden items-center gap-1 md:flex">
        <NavItem label="Khách sạn" to="/hotels" />
        <NavItem label="Ẩm thực" to="/food" />
        <NavItem label="Hoạt động" to="/activities" />
        <NavItem label="Bài viết" to="/articles" />
      </div>

      <div className="flex items-center gap-2">
        {auth ? (
          <UserMenu logoutRedirect="/" showRole={false} variant="dark" />
        ) : (
          <>
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold text-slate-900 transition-all hover:bg-slate-100"
            >
              <User size={18} className="text-slate-900" />
              <span>Đăng nhập</span>
            </Link>

            <Link
              to="/register"
              className="rounded-md bg-[#0194f3] px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#0183d7]"
            >
              Đăng ký
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
