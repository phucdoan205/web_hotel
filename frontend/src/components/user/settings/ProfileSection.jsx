import React from "react";
import { Camera } from "lucide-react";

const ProfileSection = () => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-6">
    <div className="flex items-center gap-2 mb-8">
      <div className="size-5 bg-blue-500 rounded text-white flex items-center justify-center text-[10px]">
        👤
      </div>
      <h3 className="text-sm font-black text-gray-900 uppercase">
        Hồ sơ cá nhân
      </h3>
    </div>

    <div className="flex gap-12 items-start">
      {/* Avatar Upload */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative group">
          <div className="size-32 rounded-full border-4 border-orange-100 overflow-hidden shadow-inner bg-gray-50">
            <img
              src="https://i.pravatar.cc/150?u=HK-2024-089"
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <button className="absolute bottom-1 right-1 bg-[#0085FF] text-white p-2 rounded-full border-2 border-white hover:scale-110 transition-transform shadow-lg">
            <Camera size={16} />
          </button>
        </div>
        <p className="text-[9px] font-bold text-gray-400 uppercase text-center leading-relaxed">
          Định dạng hỗ trợ: JPG, PNG.
          <br />
          Tối đa 2MB.
        </p>
      </div>

      {/* Profile Form */}
      <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
            Họ và tên
          </label>
          <input
            type="text"
            defaultValue="Nguyễn Minh Hiếu"
            className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
            Mã nhân viên
          </label>
          <input
            type="text"
            value="HK-2024-089"
            disabled
            className="w-full bg-gray-100 border border-transparent rounded-xl px-4 py-3 text-xs font-bold text-gray-400 cursor-not-allowed"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
            Số điện thoại
          </label>
          <input
            type="text"
            defaultValue="0901234567"
            className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
            Ngôn ngữ
          </label>
          <select className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none appearance-none">
            <option>Tiếng Việt</option>
            <option>English</option>
          </select>
        </div>
      </div>
    </div>
  </div>
);

export default ProfileSection;
