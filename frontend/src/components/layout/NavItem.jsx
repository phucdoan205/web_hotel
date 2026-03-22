import React from "react";
import { NavLink } from "react-router-dom";

const NavItem = ({ label, to }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-4 py-2 text-sm font-medium transition-all duration-200 ${
          isActive
            ? "text-[#0194f3] font-bold border-b-2 border-[#0194f3]" // Khi active: Chữ xanh, gạch chân xanh, đậm
            : "text-slate-900 hover:text-[#0194f3]" // Mặc định: Chữ đen, hover chữ xanh
        }`
      }
    >
      {label}
    </NavLink>
  );
};

export default NavItem;
