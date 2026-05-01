import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Rocket, User, Hotel, Calendar, Utensils, Ticket, FileText } from "lucide-react";
import NavItem from "./NavItem";
import { getStoredAuth } from "../../utils/authStorage";
import UserMenu from "../shared/UserMenu";

const Navbar = () => {
  const auth = getStoredAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = React.useState(false);

  const isHomePage = location.pathname === "/" || location.pathname === "/hotels";

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navBgClass = isHomePage
    ? isScrolled
      ? "bg-[#1F649C] shadow-md"
      : "bg-transparent"
    : "bg-[#1F649C] shadow-md";

  return (
    <nav
      className={`navbar-container fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-6 py-4 transition-all duration-300 lg:px-10 ${navBgClass}`}
    >
      <div className="flex flex-1 items-center gap-8">
        <Link to="/" className="flex cursor-pointer items-center gap-2">
          <div className="rounded-xl bg-white p-1.5">
            <Rocket className="h-5 w-5 rotate-45 text-[#1F649C]" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            HPT
          </span>
        </Link>

        <div className="hidden items-center gap-1 xl:flex">
          <NavItem label="Khách sạn" to="/" icon={Hotel} />

          <NavItem label="Tìm phòng" to="/booking" icon={Calendar} />
          <NavItem label="Ẩm thực" to="/food" icon={Utensils} />
          <NavItem label="Hoạt động" to="/activities" icon={Ticket} />
          <NavItem label="Bài viết" to="/articles" icon={FileText} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {auth ? (
          <UserMenu logoutRedirect="/" showRole={false} variant="dark" />
        ) : (
          <>
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-xl border border-white px-4 py-2 text-sm font-bold text-white transition-all hover:bg-white/10"
            >
              <User size={18} className="text-white" />
              <span>Đăng nhập</span>
            </Link>

            <Link
              to="/register"
              className="rounded-xl bg-white px-5 py-2 text-sm font-bold text-[#1F649C] shadow-sm transition-all hover:bg-slate-100"
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
