import React from "react";

const PostSidebar = () => {
  const trending = [
    {
      title: "Kinh nghiệm săn mây đỉnh cao tại Đà Lạt",
      img: "https://images.unsplash.com/photo-1581451098417-1f48039755f1?w=100",
      date: "10/03/2026",
    },
    {
      title: "10 quán cafe view rừng thông cực chill",
      img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100",
      date: "12/03/2026",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Bài viết mới nhất */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-6">Bài viết mới nhất</h3>
        <div className="flex flex-col gap-6">
          {trending.map((item, i) => (
            <div key={i} className="flex gap-4 group cursor-pointer">
              <img
                src={item.img}
                className="w-16 h-16 rounded-xl object-cover"
                alt=""
              />
              <div>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-500 transition-colors leading-snug line-clamp-2">
                  {item.title}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ads Banner */}
      <div className="relative rounded-2xl overflow-hidden h-80 group">
        <img
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"
          className="w-full h-full object-cover"
          alt="Ads"
        />
        <div className="absolute inset-0 bg-blue-900/60 flex flex-col justify-end p-6">
          <p className="text-white font-bold text-lg mb-2">
            Giảm đến 30% khi đặt phòng khách sạn tại Đà Lạt
          </p>
          <button className="bg-blue-500 text-white font-bold py-2 rounded-lg text-xs hover:bg-blue-600 transition-all">
            Khám phá ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostSidebar;
