import React from "react";
import BlogHero from "../../components/blog/BlogHero";
import BlogCard from "../../components/blog/BlogCard";
import BlogSidebar from "../../components/blog/BlogSidebar";

const posts = [
  {
    id: 1,
    category: "Khách sạn",
    date: "21/03/2026",
    title: "Top 10 Khách sạn Sang trọng Nhất tại Đà Nẵng năm 2026",
    excerpt:
      "Khám phá danh sách những không gian nghỉ dưỡng đẳng cấp với tầm nhìn hướng biển tuyệt đẹp...",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500",
  },
  {
    id: 2,
    category: "Ẩm thực",
    date: "19/03/2026",
    title: "Bản đồ Ẩm thực Đường phố Sài Gòn Không thể Bỏ qua",
    excerpt:
      "Từ bánh mì Huỳnh Hoa đến cơm tấm bãi rác, hãy cùng chúng tôi dạo quanh các con hẻm...",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500",
  },
  {
    id: 3,
    category: "Xu hướng",
    date: "17/03/2026",
    title: "Xu hướng Du lịch Bền vững: Khám phá Vùng Cao Sapa",
    excerpt:
      "Du lịch xanh đang trở thành xu hướng mới giúp bảo tồn văn hóa và thiên nhiên tại Việt Nam...",
    image: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=500",
  },
  {
    id: 4,
    category: "Mẹo vặt",
    date: "15/03/2026",
    title: "Ưu đãi Cực sốc - Giảm đến 50% Vé máy bay Hè này",
    excerpt:
      "Cùng săn ngay những combo du lịch giá cực hời để chuẩn bị cho chuyến đi mùa hè rực rỡ...",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500",
  },
];

const BlogPage = () => {
  return (
    <div className="bg-slate-50/50 min-h-screen">
      <BlogHero />

      <div className="max-w-7xl mx-auto px-10 py-12 flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="lg:w-3/4">
          <div className="flex gap-6 border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
            {[
              "Tất cả",
              "Cẩm nang du lịch",
              "Ẩm thực",
              "Khuyến mãi",
              "Sự kiện",
            ].map((tab, i) => (
              <button
                key={i}
                className={`pb-4 text-sm font-bold whitespace-nowrap px-2 transition-all ${i === 0 ? "text-blue-500 border-b-2 border-blue-500" : "text-slate-400 hover:text-slate-600"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-12 gap-2">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                className={`w-10 h-10 rounded-lg font-bold text-sm ${n === 1 ? "bg-blue-500 text-white" : "bg-white text-slate-400 border border-slate-100 hover:bg-blue-50 transition-all"}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/4">
          <BlogSidebar />
        </div>
      </div>

      {/* Newsletter Section (Như trong ảnh) */}
      <div className="bg-blue-50 py-16 px-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Đăng ký nhận tin tức mới nhất
          </h2>
          <p className="text-slate-500 mb-8">
            Đừng bỏ lỡ các cẩm nang du lịch hữu ích và ưu đãi độc quyền dành
            riêng cho bạn.
          </p>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="email"
              placeholder="Nhập địa chỉ email của bạn"
              className="flex-grow py-4 px-6 rounded-xl outline-none shadow-sm border border-slate-100"
            />
            <button className="bg-blue-500 text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-200">
              Đăng ký ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
