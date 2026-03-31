import React from "react";

const ToggleRow = ({ label, desc, defaultChecked }) => (
  <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0 border-b border-gray-50 last:border-0">
    <div className="max-w-md">
      <h4 className="text-xs font-black text-gray-900">{label}</h4>
      <p className="text-[10px] font-bold text-gray-400 leading-tight mt-1">
        {desc}
      </p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0085FF]"></div>
    </label>
  </div>
);

const NotificationConfig = () => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-6">
    <div className="flex items-center gap-2 mb-8">
      <div className="size-5 bg-blue-500 rounded text-white flex items-center justify-center text-[10px]">
        🔔
      </div>
      <h3 className="text-sm font-black text-gray-900 uppercase">
        Cài đặt thông báo
      </h3>
    </div>

    <div className="space-y-2">
      <ToggleRow
        label="Nhiệm vụ mới"
        desc="Nhận thông báo khi có phòng mới cần dọn dẹp hoặc ưu tiên gấp."
        defaultChecked={true}
      />
      <ToggleRow
        label="Cảnh báo kho vật tư"
        desc="Thông báo khi các mặt hàng trong kho sắp hết hoặc cần nhập thêm."
        defaultChecked={true}
      />
      <ToggleRow
        label="Tin nhắn từ lễ tân"
        desc="Thông báo tin nhắn ưu tiên từ bộ phận tiền sảnh (Front Desk)."
        defaultChecked={false}
      />
    </div>
  </div>
);

export default NotificationConfig;
