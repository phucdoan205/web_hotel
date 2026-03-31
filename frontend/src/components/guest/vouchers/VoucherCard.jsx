const VoucherCard = ({ data }) => {
  const themes = {
    blue: "bg-blue-50 text-blue-500",
    green: "bg-emerald-50 text-emerald-500",
    orange: "bg-orange-50 text-orange-500",
    purple: "bg-purple-50 text-purple-500",
  };

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 p-6 flex gap-6 items-center shadow-sm hover:shadow-md transition-all group">
      {/* Khối hiển thị % hoặc số tiền bên trái */}
      <div
        className={`size-20 min-w-[80px] rounded-2xl flex flex-col items-center justify-center font-black ${themes[data.color]}`}
      >
        <span className="text-lg">{data.discount}</span>
        <span className="text-[10px] uppercase tracking-tighter">OFF</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-[14px] font-black text-gray-900 truncate">
            {data.title}
          </h4>
        </div>
        <p className="text-[10px] font-bold text-gray-400 leading-snug mb-4 line-clamp-2">
          {data.desc}
        </p>

        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
          <div>
            <p className="text-[8px] font-black text-gray-300 uppercase">
              Expires On
            </p>
            <p className="text-[10px] font-bold text-gray-700 uppercase">
              {data.expiry}
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#0085FF] text-[10px] font-black rounded-lg hover:bg-blue-100 transition-colors">
            Copy
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoucherCard;
