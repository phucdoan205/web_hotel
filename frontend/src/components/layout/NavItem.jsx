import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

const NavItem = ({ label, to, icon: Icon }) => {
  return (
    <NavLink
      to={to}
      end={to === "/"}

      className={({ isActive }) =>
        `relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-300 ${
          isActive
            ? "text-white font-bold"
            : "text-blue-50 hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {Icon && <Icon size={16} className="relative z-10" />}
          <span className="relative z-10">{label}</span>
          {isActive && (
            <motion.div
              layoutId="nav-underline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"
              initial={false}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 30
              }}
            />
          )}
        </>
      )}
    </NavLink>
  );
};

export default NavItem;

