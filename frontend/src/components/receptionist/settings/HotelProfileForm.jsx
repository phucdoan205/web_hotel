import React from "react";
import ProfileUploader from "./ProfileUploader";

const HotelProfileForm = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
            Thông tin chi tiết
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">
                Tên khách sạn
              </label>
              <input
                type="text"
                className="w-full bg-gray-50 border-transparent rounded-xl p-4 text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all"
                defaultValue="Khách sạn Sunshine Luxury"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">
                Email liên hệ
              </label>
              <input
                type="email"
                className="w-full bg-gray-50 border-transparent rounded-xl p-4 text-sm font-bold"
                defaultValue="contact@sunshinehotel.vn"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">
                Địa chỉ
              </label>
              <input
                type="text"
                className="w-full bg-gray-50 border-transparent rounded-xl p-4 text-sm font-bold"
                defaultValue="123 Đường Ven Biển, Đà Nẵng"
              />
            </div>
          </div>
          <button className="bg-[#0085FF] text-white px-8 py-3 rounded-xl text-xs font-black shadow-lg shadow-blue-100">
            Lưu thay đổi
          </button>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] font-black text-gray-900 uppercase">
              Độ hoàn thiện hồ sơ
            </p>
            <span className="text-[#0085FF] font-black text-sm">85%</span>
          </div>
          <div className="h-2 bg-gray-50 rounded-full overflow-hidden mb-6">
            <div className="h-full bg-[#0085FF]" style={{ width: "85%" }} />
          </div>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-[11px] font-bold text-emerald-500">
              ✓ Thông tin liên hệ cơ bản
            </li>
            <li className="flex items-center gap-3 text-[11px] font-bold text-gray-300">
              ○ Xác thực vị trí Google Maps
            </li>
          </ul>
        </div>
      </div>
      {/* Hình ảnh đại diện */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mt-8">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">
          Hình ảnh đại diện
        </h3>
        <ProfileUploader
          type="hotel"
          initialImage="/path-to-your-logo.png"
          onImageChange={(file) => console.log("New logo:", file)}
        />
      </div>
    </div>
  );
};

export default HotelProfileForm;
