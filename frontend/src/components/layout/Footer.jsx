import React from "react";
import { Share2, Globe, Mail, Rocket } from "lucide-react";
import { Link } from "react-router-dom";

const FooterColumn = ({ title, links }) => (
  <div className="flex flex-col gap-3">
    <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
    {links.map((link, index) => (
      <Link
        key={index}
        to={link.to}
        className="text-slate-500 hover:text-blue-500 text-sm transition-colors"
      >
        {link.label}
      </Link>
    ))}
  </div>
);

const Footer = () => {
  return (
    <footer className="footer-container bg-white pt-16 pb-8 border-t border-slate-100 mt-20">
      <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Section */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Rocket className="text-blue-500 w-6 h-6 rotate-45" />
            <span className="text-xl font-bold text-blue-500">Traveloka</span>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Making travel accessible and delightful for everyone since 2012.
            Your journey starts here.
          </p>
          <div className="flex gap-4">
            <div className="p-2 bg-slate-50 rounded-full text-slate-600 hover:bg-blue-50 hover:text-blue-500 cursor-pointer transition-all">
              <Share2 size={18} />
            </div>
            <div className="p-2 bg-slate-50 rounded-full text-slate-600 hover:bg-blue-50 hover:text-blue-500 cursor-pointer transition-all">
              <Globe size={18} />
            </div>
            <div className="p-2 bg-slate-50 rounded-full text-slate-600 hover:bg-blue-50 hover:text-blue-500 cursor-pointer transition-all">
              <Mail size={18} />
            </div>
          </div>
        </div>

        {/* Links Sections */}
        <FooterColumn
          title="Khám phá"
          links={[
            { label: "Khách sạn", to: "/" },
            { label: "Tìm phòng", to: "/booking" },
            { label: "Ẩm thực", to: "/food" },
            { label: "Hoạt động", to: "/articles" },
          ]}
        />
        <FooterColumn
          title="Hỗ trợ"
          links={[
            { label: "Trung tâm trợ giúp", to: "/support/help-center" },
            { label: "Liên hệ", to: "/support/contact-us" },
            { label: "Chính sách bảo mật", to: "/support/privacy-policy" },
            { label: "Điều khoản sử dụng", to: "/support/terms" },
            { label: "Chính sách hoàn tiền", to: "/support/refund-policy" },
          ]}
        />

        {/* Download Section */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-slate-800">Download Our App</h3>
          <div className="flex flex-col gap-3">
            <button className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="text-left">
                <p className="text-[10px] uppercase">Download on the</p>
                <p className="text-sm font-semibold">App Store</p>
              </div>
            </button>
            <button className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="text-left">
                <p className="text-[10px] uppercase">Get it on</p>
                <p className="text-sm font-semibold">Google Play</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-10 mt-16 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-slate-400 text-xs">
          © 2024 Traveloka. All rights reserved.
        </p>
        <div className="flex gap-4 grayscale opacity-50">
          {/* Mockup logos for partners */}
          <div className="w-8 h-8 bg-slate-200 rounded"></div>
          <div className="w-8 h-8 bg-slate-200 rounded"></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
