import React from "react";
import { Quote, Star } from "lucide-react";

const reviews = [
  {
    name: "Lê Minh Anh",
    trip: "Kỳ nghỉ gia đình tại Amanoi",
    content: "Dịch vụ đặt phòng vô cùng chuyên nghiệp. Các gợi ý khách sạn hạng sang trên HPT thực sự giúp gia đình tôi có một kỳ nghỉ đẳng cấp và riêng tư.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
  },
  {
    name: "Trần Quốc Huy",
    trip: "Chuyến công tác tại Park Hyatt",
    content: "Hệ thống tìm kiếm nhanh, chính xác. Tôi đặc biệt ấn tượng với giao diện tinh tế và những đặc quyền dành riêng cho khách hàng VIP của HPT.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
  },
  {
    name: "Nguyễn Linh Chi",
    trip: "Nghỉ dưỡng tại Six Senses",
    content: "Chưa bao giờ việc lên kế hoạch cho một chuyến đi thượng lưu lại dễ dàng đến thế. HPT đã mang đến những trải nghiệm vượt xa sự mong đợi của tôi.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
  },
];

const Testimonials = () => {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Cảm nhận từ khách hàng</h2>
          <p className="mt-3 font-medium text-slate-500">
            HPT tự hào là người bạn đồng hành tin cậy trong mọi hành trình của bạn.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.name} className="group relative rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 overflow-hidden rounded-2xl ring-2 ring-slate-100 ring-offset-2 transition-all group-hover:ring-[#1F649C]">
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900">{review.name}</h3>
                    <p className="text-xs font-bold text-[#1F649C] uppercase tracking-wide">{review.trip}</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 text-slate-200 transition-colors group-hover:text-amber-100">
                  <Quote size={28} />
                </div>
              </div>

              <p className="mt-8 text-sm font-medium leading-relaxed italic text-slate-600">
                "{review.content}"
              </p>
              
              <div className="mt-8 flex gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((item) => (
                  <Star key={item} size={14} fill="currentColor" />
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
