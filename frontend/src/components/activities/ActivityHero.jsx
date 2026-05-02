import React, { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ActivityHero = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/articles/search?q=${encodeURIComponent(keyword)}`);
    } else {
      navigate(`/articles/search`);
    }
  };

  return (
    <div className="relative h-[480px] w-full flex items-center justify-center overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?q=80&w=2000"
        className="absolute inset-0 w-full h-full object-cover"
        alt="Activities Hero"
      />
      {/* Premium dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/40 to-transparent"></div>
      
      {/* Bottom gradient fade into page */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F8FAFC] to-transparent"></div>

      <div className="relative z-10 text-center text-white px-4 mb-4 mt-8 w-full max-w-4xl mx-auto flex flex-col items-center">
        <h1 className="text-4xl md:text-[3.5rem] leading-tight font-bold mb-6 tracking-tight drop-shadow-md">
          Khám Phá Trải Nghiệm <br className="hidden md:block" />
          <span className="text-yellow-400">Tuyệt Vời Nhất</span>
        </h1>
        <p className="text-lg md:text-xl font-medium text-white/90 drop-shadow mb-8">
          Từ những địa danh nổi tiếng đến các hoạt động văn hóa đặc sắc, chúng tôi đồng hành cùng chuyến đi của bạn.
        </p>

        {/* Premium Search Bar */}
        <form 
          onSubmit={handleSearch}
          className="w-full max-w-2xl bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-2 ring-1 ring-white/20"
        >
          <div className="flex-1 relative flex items-center w-full">
            <Search className="absolute left-4 text-slate-400 size-5" />
            <input 
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Bạn muốn đi đâu, làm gì?"
              className="w-full bg-transparent pl-12 pr-4 py-3 text-slate-800 font-semibold placeholder:font-medium outline-none placeholder:text-slate-500"
            />
          </div>
          <button 
            type="submit"
            className="w-full sm:w-auto bg-[#01539d] hover:bg-[#014380] text-white px-8 py-3 rounded-xl font-bold transition-all whitespace-nowrap shadow-md hover:shadow-lg"
          >
            Tìm kiếm
          </button>
        </form>
      </div>
    </div>
  );
};

export default ActivityHero;
