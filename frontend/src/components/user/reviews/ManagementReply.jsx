const ManagementReply = ({ reply }) => (
  <div className="bg-blue-50/50 rounded-2xl p-6 border-l-4 border-blue-200">
    <div className="flex items-center gap-2 mb-2">
      <div className="text-[#0085FF]">
        <svg
          size={14}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">
        Hotel Management Response
      </span>
    </div>
    <p className="text-[11px] font-bold text-gray-400 leading-relaxed">
      {reply}
    </p>
  </div>
);

export default ManagementReply;
