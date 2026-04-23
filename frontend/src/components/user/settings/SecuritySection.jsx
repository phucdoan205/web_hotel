import React, { useState } from "react";
import { ShieldCheck, Lock, Smartphone, RefreshCw } from "lucide-react";

const SecuritySection = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Đổi mật khẩu */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="size-5 bg-orange-500 rounded text-white flex items-center justify-center text-[10px]">
            <Lock size={12} />
          </div>
          <h3 className="text-sm font-black text-gray-900 uppercase">
            Thay đổi mật khẩu
          </h3>
        </div>

        <div className="max-w-md space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
                Mật khẩu mới
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>

          <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-[10px] font-black rounded-xl uppercase hover:bg-black transition-all shadow-md">
            <RefreshCw size={14} /> Cập nhật mật khẩu
          </button>
        </div>
      </div>

      {/* Xác thực 2 lớp (2FA) */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="size-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
              <Smartphone size={24} />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase">
                Xác thực hai yếu tố (2FA)
              </h3>
              <p className="text-[10px] font-bold text-gray-400 max-w-sm mt-1 leading-relaxed">
                Thêm một lớp bảo mật bổ sung cho tài khoản của bạn bằng cách yêu
                cầu mã xác nhận từ điện thoại khi đăng nhập.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={is2FAEnabled}
              onChange={() => setIs2FAEnabled(!is2FAEnabled)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>
      </div>

      {/* Lịch sử đăng nhập */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="size-5 bg-emerald-500 rounded text-white flex items-center justify-center text-[10px]">
            <ShieldCheck size={12} />
          </div>
          <h3 className="text-sm font-black text-gray-900 uppercase">
            Thiết bị đang đăng nhập
          </h3>
        </div>

        <div className="space-y-4">
          {[
            {
              device: "MacBook Pro - Chrome",
              location: "Đà Nẵng, Việt Nam",
              status: "Thiết bị hiện tại",
              time: "Đang hoạt động",
              isCurrent: true,
            },
            {
              device: "iPhone 15 Pro",
              location: "Đà Nẵng, Việt Nam",
              status: "Mobile App",
              time: "2 giờ trước",
              isCurrent: false,
            },
          ].map((session, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 bg-gray-50/30"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`size-2 rounded-full ${session.isCurrent ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`}
                />
                <div>
                  <p className="text-xs font-black text-gray-900">
                    {session.device}
                  </p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">
                    {session.location} • {session.time}
                  </p>
                </div>
              </div>
              {!session.isCurrent && (
                <button className="text-[10px] font-black text-rose-500 hover:underline uppercase">
                  Đăng xuất
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;
