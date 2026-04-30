import React from "react";
import { NavLink } from "react-router-dom";

const NavItem = ({ label, to, icon: Icon }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
          isActive
            ? "text-white font-bold border-b-2 border-white" // Active: White text and border
            : "text-blue-50 hover:text-white" // Default: Light blue-ish white, hover pure white
        }`
      }
    >
      {Icon && <Icon size={16} />}
      <span>{label}</span>
    </NavLink>
  );
};

export default NavItem;
