import React from "react";

const ProductivityChart = () => (
  <div className="grid grid-cols-2 gap-6 mb-8">
    {/* Năng suất nhân viên */}
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-sm font-black text-gray-900 uppercase flex items-center gap-2">
          <span className="size-5 bg-blue-500 rounded text-white flex items-center justify-center text-[10px]">
            📊
          </span>
          Năng suất nhân viên
        </h3>
        <span className="text-[9px] font-black text-gray-400 uppercase">
          Số phòng / Ca
        </span>
      </div>
      <div className="h-64 flex items-end justify-between px-4">
        {/* Giả lập biểu đồ cột */}
        {["Minh Anh", "Bảo Nam", "Gia Linh", "Thanh Hà", "Công Trí"].map(
          (name, i) => (
            <div key={i} className="flex flex-col items-center gap-4 w-full">
              <div
                className="w-8 bg-blue-100 rounded-t-lg hover:bg-[#0085FF] transition-all cursor-pointer relative group"
                style={{ height: `${[80, 60, 95, 70, 85][i]}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {[12, 9, 15, 11, 13][i]} phòng
                </div>
              </div>
              <span className="text-[9px] font-bold text-gray-400 rotate-45 mt-2">
                {name}
              </span>
            </div>
          ),
        )}
      </div>
    </div>

    {/* Tỷ lệ phòng sạch */}
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-sm font-black text-gray-900 uppercase flex items-center gap-2">
          <span className="size-5 bg-[#0085FF] rounded text-white flex items-center justify-center text-[10px]">
            📈
          </span>
          Tỷ lệ phòng sạch theo thời gian
        </h3>
      </div>
      <div className="h-64 relative flex items-center justify-center border-b border-l border-gray-50">
        {/* Vẽ một đường xu hướng minh họa bằng SVG */}
        <svg className="w-full h-full px-4">
          <path
            d="M0,180 Q50,150 100,160 T200,100 T300,120 T400,50 T500,60"
            fill="none"
            stroke="#0085FF"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M0,180 Q50,150 100,160 T200,100 T300,120 T400,50 T500,60 L500,250 L0,250 Z"
            fill="url(#paint0_linear)"
            fillOpacity="0.1"
          />
          <defs>
            <linearGradient
              id="paint0_linear"
              x1="250"
              y1="50"
              x2="250"
              y2="250"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#0085FF" />
              <stop offset="1" stopColor="#0085FF" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="flex justify-between mt-4 px-4 text-[9px] font-bold text-gray-400">
        <span>Thứ 2</span>
        <span>Thứ 3</span>
        <span>Thứ 4</span>
        <span>Thứ 5</span>
        <span>Thứ 6</span>
        <span>Thứ 7</span>
        <span>Chủ Nhật</span>
      </div>
    </div>
  </div>
);

export default ProductivityChart;
