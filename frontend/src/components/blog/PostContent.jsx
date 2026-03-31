import React from "react";
import { User, Calendar, Share2, Facebook, Twitter, Link } from "lucide-react";

const PostContent = ({ post }) => {
  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
      {/* Breadcrumbs */}
      <nav className="text-xs text-slate-400 mb-6 flex gap-2">
        <span>Trang chủ</span> <span>/</span> <span>Blog du lịch</span>{" "}
        <span>/</span> <span className="text-blue-500">Chi tiết</span>
      </nav>

      <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
        Cẩm nang du lịch
      </span>

      <h1 className="text-3xl font-bold text-slate-800 mt-4 mb-6 leading-tight">
        {post.title}
      </h1>

      <div className="flex items-center justify-between border-b pb-6 mb-8">
        <div className="flex items-center gap-3">
          <img
            src="https://i.pravatar.cc/150?u=author"
            alt="Author"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="text-sm font-bold text-slate-800">Nguyễn Văn A</p>
            <p className="text-[10px] text-slate-400">
              Đăng ngày 22 tháng 03, 2026
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-slate-50 text-slate-500 rounded-full hover:bg-blue-50 hover:text-blue-500 transition-all">
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Main Post Content */}
      <article className="prose prose-slate max-w-none">
        <p className="text-slate-600 leading-relaxed mb-6 italic">
          Đà Lạt luôn là điểm đến lý tưởng cho những tâm hồn lãng mạn. Với không
          khí se lạnh đặc trưng và những dãy núi sương mờ ảo, thành phố ngàn hoa
          này chưa bao giờ làm du khách thất vọng, đặc biệt là vào mùa hoa dã
          quỳ rực rỡ...
        </p>

        <img
          src={post.image}
          className="w-full h-[400px] object-cover rounded-2xl mb-8"
          alt="Dalat view"
        />

        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          1. Hồ Tuyền Lâm - Bản tình ca mặt nước
        </h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Nằm cách trung tâm thành phố khoảng 6km, Hồ Tuyền Lâm mang vẻ đẹp yên
          bình và thơ mộng tuyệt đối. Bạn có thể thuê một chiếc thuyền nhỏ, cùng
          người thương lênh đênh trên mặt nước trong xanh phẳng lặng để cảm nhận
          sự bình yên đến lạ kỳ...
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-xl italic text-slate-700">
          "Đà Lạt không chỉ là một điểm đến, nó là một cảm xúc. Hãy để trái tim
          bạn dẫn lối khi đến với vùng đất mộng mơ này."
        </div>

        <img
          src="https://images.unsplash.com/photo-1590059345003-887768e16942?w=800"
          className="w-full h-[400px] object-cover rounded-2xl mb-8"
          alt="Pine forest"
        />

        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          2. Thung lũng tình yêu
        </h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Đúng như cái tên của nó, đây là nơi hội tụ của vô vàn loài hoa rực rỡ
          và những tiểu cảnh vô cùng xinh xắn được tạo ra để dành riêng cho các
          cặp đôi...
        </p>
      </article>

      {/* Tags & Share */}
      <div className="mt-12 pt-8 border-t flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {["#Dalat", "#TravelGuide", "#CoupleTrip"].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-slate-100 text-slate-500 text-xs rounded-lg"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400">CHIA SẺ:</span>
          <Facebook
            className="text-slate-400 hover:text-blue-600 cursor-pointer"
            size={20}
          />
          <Twitter
            className="text-slate-400 hover:text-blue-400 cursor-pointer"
            size={20}
          />
          <Link
            className="text-slate-400 hover:text-slate-800 cursor-pointer"
            size={20}
          />
        </div>
      </div>
    </div>
  );
};

export default PostContent;
