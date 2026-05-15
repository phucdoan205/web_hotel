import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Rocket, User, Hotel, Calendar, Utensils, Ticket, FileText, HelpCircle, BadgePercent, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NavItem from "./NavItem";
import { getStoredAuth } from "../../utils/authStorage";
import UserMenu from "../shared/UserMenu";

const Navbar = () => {
  const auth = getStoredAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isTransparentNav = location.pathname === "/" || location.pathname === "/hotels" || location.pathname === "/offers" || location.pathname === "/articles" || location.pathname === "/support/help-center";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when location changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navBgClass = isTransparentNav
    ? (isScrolled || isMenuOpen)
      ? "bg-[#1F649C] shadow-md"
      : "bg-transparent"
    : "bg-[#1F649C] shadow-md";

  const navLinks = [
    { label: "Khách sạn", to: "/", icon: Hotel },
    { label: "Tìm phòng", to: "/booking", icon: Calendar },
    { label: "Hoạt động", to: "/services", icon: Utensils },
    { label: "Khám phá", to: "/articles", icon: FileText },
    { label: "Ưu đãi", to: "/offers", icon: BadgePercent },
    { label: "Trợ giúp", to: "/support/help-center", icon: HelpCircle },
  ];

  return (
    <nav
      className={`navbar-container fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-6 py-4 transition-all duration-300 lg:px-10 ${navBgClass}`}
    >
      <div className="flex flex-1 items-center gap-8">
        <Link to="/" className="flex cursor-pointer items-center gap-2">
          <div className="rounded-xl bg-white p-1.5 shadow-sm">
            <Rocket className="h-5 w-5 rotate-45 text-[#1F649C]" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            HPT
          </span>
        </Link>
        <div className="hidden items-center gap-1 xl:flex">
          {navLinks.map((link) => (
            <NavItem key={link.to} {...link} />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:block">
          {auth ? (
            <UserMenu logoutRedirect="/" showRole={false} variant="dark" />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-xl border border-white/50 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-white/10"
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
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/10 xl:hidden"
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 top-16 z-40 bg-black/60 backdrop-blur-sm xl:hidden"
            />

            {/* Side Menu */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 right-0 top-16 z-50 flex w-[310px] flex-col bg-[#f8fafc] shadow-2xl xl:hidden"
            >
              {/* Profile Header Section with Gradient */}
              <div className="bg-gradient-to-br from-[#1F649C] to-[#154b75] p-7 text-white shadow-lg">
                {auth ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200/80">Thành viên HPT</span>
                      <div className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                    </div>
                    <UserMenu logoutRedirect="/" showRole={true} variant="dark" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold">Chào mừng bạn!</h3>
                      <p className="text-xs text-blue-100">Đăng nhập để nhận ưu đãi đặc biệt.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        to="/login"
                        className="flex items-center justify-center rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20"
                      >
                        Đăng nhập
                      </Link>
                      <Link
                        to="/register"
                        className="flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#1F649C] transition-colors hover:bg-blue-50"
                      >
                        Đăng ký
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto p-4 pt-6">
                <div className="flex flex-col gap-y-1">
                  <p className="mb-2 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Danh mục</p>
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`group flex items-center gap-4 rounded-2xl border px-4 py-4 text-[15px] font-black transition-all ${
                        location.pathname === link.to
                          ? "border-blue-100 bg-white text-blue-600 shadow-xl shadow-blue-100/50"
                          : "border-transparent text-slate-600 hover:bg-white hover:text-blue-600 hover:shadow-md"
                      }`}
                    >
                      <div className={`flex size-10 items-center justify-center rounded-2xl transition-all duration-300 ${
                        location.pathname === link.to 
                          ? "bg-blue-600 text-white rotate-3" 
                          : "bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:-rotate-3"
                      }`}>
                        <link.icon size={22} />
                      </div>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Footer Section */}
              <div className="mt-auto border-t border-slate-100 bg-white/50 p-6 backdrop-blur-md">
                <div className="flex items-center justify-between opacity-60">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">© 2026 HPT Hotel</span>
                  <span className="text-[10px] font-black text-slate-300">v1.0.4</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
