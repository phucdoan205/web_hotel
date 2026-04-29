import React from "react";
import { Quote, Star } from "lucide-react";

const reviews = [
  {
    name: "Minh Anh",
    trip: "Kỳ nghỉ gia đình tại Đà Nẵng",
    content: "Giao diện tìm khách sạn rõ ràng, xem giá và vị trí rất nhanh. Mình chọn được phòng sát biển chỉ trong vài phút.",
    avatar: "https://i.pravatar.cc/150?u=minhanh",
  },
  {
    name: "Quốc Huy",
    trip: "Công tác tại TP. Hồ Chí Minh",
    content: "Các gợi ý chỗ nghỉ nổi bật giúp mình lọc nhanh khu vực trung tâm và xem đánh giá trước khi đặt.",
    avatar: "https://i.pravatar.cc/150?u=quochuy",
  },
  {
    name: "Linh Chi",
    trip: "Du lịch cuối tuần tại Đà Lạt",
    content: "Mục điểm đến thịnh hành và loại chỗ nghỉ rất dễ dùng, nhìn giống một trang khách sạn chuyên nghiệp hơn.",
    avatar: "https://i.pravatar.cc/150?u=linhchi",
  },
];

const Testimonials = () => {
  return (
    <section className="bg-slate-50 py-12">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-950">Khách hàng nói gì</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Một vài cảm nhận từ những chuyến đi đã được lên kế hoạch trên hệ thống.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.name} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-black text-slate-950">{review.name}</h3>
                    <p className="text-xs font-semibold text-slate-500">{review.trip}</p>
                  </div>
                </div>
                <Quote size={28} className="text-blue-100" />
              </div>

              <p className="mt-5 text-sm leading-6 text-slate-600">{review.content}</p>
              <div className="mt-5 flex text-[#febb02]">
                {[1, 2, 3, 4, 5].map((item) => (
                  <Star key={item} size={15} fill="currentColor" />
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
