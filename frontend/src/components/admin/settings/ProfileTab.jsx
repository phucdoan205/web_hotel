import React from "react";
import { Camera } from "lucide-react";

const ProfileTab = () => {
  return (
    <div className="space-y-8">
      {/* Profile Picture Section */}
      <div className="flex items-center gap-6">
        <div className="relative group">
          <img
            src="https://ui-avatars.com/api/?name=Alexander+Wright&background=random"
            alt="Profile"
            className="size-24 rounded-full object-cover border-4 border-white shadow-sm"
          />
          <button className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white border-2 border-white hover:bg-blue-700 transition-all shadow-md">
            <Camera className="size-4" />
          </button>
        </div>
        <div>
          <h4 className="font-bold text-gray-900">Profile Picture</h4>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
            JPG, GIF or PNG. Max size of 800K
          </p>
          <button className="mt-2 text-xs font-black text-blue-600 hover:underline">
            Upload new photo
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
            Full Name
          </label>
          <input
            type="text"
            defaultValue="Alexander Wright"
            className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-blue-100 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
            Email Address
          </label>
          <input
            type="email"
            defaultValue="alexander.w@grandblue.com"
            className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-blue-100 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
            Role
          </label>
          <input
            type="text"
            readOnly
            defaultValue="Super Admin"
            className="w-full px-5 py-3.5 bg-gray-100 border border-transparent rounded-2xl text-sm font-bold text-gray-400 cursor-not-allowed outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
            Language
          </label>
          <select className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold text-gray-900 outline-none">
            <option>English (US)</option>
            <option>Vietnamese (VN)</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button className="px-8 py-3.5 bg-blue-600 rounded-2xl text-xs font-black text-white shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ProfileTab;
