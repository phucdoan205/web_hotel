import React from "react";
import { Camera } from "lucide-react";
import ProfileUploader from "./ProfileUploader";

const PersonalAccountForm = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-2 space-y-8">
        {/* Profile Header Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="relative">
            <ProfileUploader
              type="personal"
              initialImage="https://i.pravatar.cc/150?u=alex"
              onImageChange={(file) => console.log("New avatar:", file)}
            />
            <button className="absolute bottom-0 right-0 bg-[#0085FF] text-white p-2 rounded-xl shadow-lg border-4 border-white">
              <Camera size={16} />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">Alex Johnson</h2>
            <p className="text-xs font-bold text-gray-400">
              Front Desk Manager
            </p>
            <span className="inline-block mt-2 px-3 py-1 bg-emerald-50 text-emerald-500 text-[10px] font-black rounded-lg uppercase">
              Active
            </span>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
            Bảo mật
          </h3>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Mật khẩu hiện tại"
              className="w-full bg-gray-50 border-transparent rounded-xl p-4 text-sm font-bold"
            />
            <input
              type="password"
              placeholder="Mật khẩu mới"
              className="w-full bg-gray-50 border-transparent rounded-xl p-4 text-sm font-bold"
            />
            <button className="bg-gray-900 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest">
              Cập nhật mật khẩu
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Sidebar */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-fit">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">
          Thông báo
        </h3>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-black text-gray-800">Email Alerts</p>
              <p className="text-[10px] font-bold text-gray-400">
                Nhận báo cáo qua email
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="size-5 accent-[#0085FF]"
            />
          </div>
          <div className="flex justify-between items-center opacity-50">
            <div>
              <p className="text-xs font-black text-gray-800">SMS Alerts</p>
              <p className="text-[10px] font-bold text-gray-400">
                Tin nhắn quan trọng qua SMS
              </p>
            </div>
            <input type="checkbox" className="size-5 accent-[#0085FF]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalAccountForm;
