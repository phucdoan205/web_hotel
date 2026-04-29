import React from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, Heart, Star, Ticket, UserCircle } from "lucide-react";

const pageConfig = {
  profile: {
    title: "Hồ sơ cá nhân",
    description: "Quản lý thông tin cá nhân, email, số điện thoại và ảnh đại diện của bạn.",
    icon: UserCircle,
  },
  favorites: {
    title: "Yêu thích",
    description: "Danh sách khách sạn và loại phòng bạn đã lưu để xem lại nhanh hơn.",
    icon: Heart,
  },
  reviews: {
    title: "Đánh giá",
    description: "Xem và quản lý các đánh giá bạn đã gửi sau mỗi kỳ nghỉ.",
    icon: Star,
  },
  vouchers: {
    title: "Voucher",
    description: "Theo dõi mã ưu đãi và voucher có thể áp dụng cho booking tiếp theo.",
    icon: Ticket,
  },
};

const AccountPlaceholderPage = ({ type = "profile" }) => {
  const config = pageConfig[type] || pageConfig.profile;
  const Icon = config.icon;

  return (
    <div className="min-h-[70vh] bg-slate-50 px-5 py-10 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-blue-50 p-4 text-[#0071c2]">
              <Icon size={28} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#0071c2]">
                Tài khoản
              </p>
              <h1 className="mt-2 text-3xl font-black text-slate-950">{config.title}</h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                {config.description}
              </p>
            </div>
          </div>

          <Link
            to="/booking-history"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0071c2] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#005fa3]"
          >
            <CalendarCheck size={16} />
            Xem đặt chỗ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccountPlaceholderPage;
