import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Camera,
  Mail,
  Pencil,
  Phone,
  User,
  X,
  Lock,
  ShieldCheck,
  Star,
  Ticket,
  Bell,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  CreditCard,
  History,
  Briefcase,
  Heart,
  MessageSquare
} from "lucide-react";
import {
  getMyProfile,
  updateMyProfile,
  uploadMyAvatar,
  changeMyPassword,
} from "../../api/admin/profileApi";
import { updateStoredAuth } from "../../utils/authStorage";
import { getAvatarPreview } from "../../utils/avatar";

const formatDateForInput = (value) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const formatDateForDisplay = (value) => {
  const normalizedValue = formatDateForInput(value);
  if (!normalizedValue) return "Chưa cập nhật";
  const [year, month, day] = normalizedValue.split("-");
  return `${day}/${month}/${year}`;
};

const AccountProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const profileData = await getMyProfile();
        setProfile(profileData);
      } catch {
        setFeedback({ type: "error", text: "Không thể tải hồ sơ." });
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (isLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-lg font-bold text-slate-400">Đang tải hồ sơ...</div>
    </div>
  );

  const displayProfile = profile ?? {};

  const infoItems = [
    { label: "Họ và tên", value: displayProfile.fullName, icon: User },
    { label: "Địa chỉ Email", value: displayProfile.email, icon: Mail },
    { label: "Số điện thoại", value: displayProfile.phone || "Chưa cập nhật", icon: Phone },
    { label: "Ngày sinh", value: formatDateForDisplay(displayProfile.dateOfBirth), icon: CalendarDays },
  ];

  const dashboardCards = [
    {
      title: "Quản lý tài khoản",
      items: [
        { label: "Thông tin cá nhân", icon: User, path: "/profile/personal-info" },
        { label: "Cài đặt bảo mật", icon: Lock, path: "/profile/security" },
      ]
    },
    {
      title: "Thông tin thanh toán",
      items: [
        { label: "Phương thức thanh toán", icon: CreditCard, path: "#" },
        { label: "Giao dịch", icon: History, path: "/booking-history" },
      ]
    },
    {
      title: "Hoạt động du lịch",
      items: [
        { label: "Chuyến đi và đơn đặt", icon: Briefcase, path: "/booking-history" },
        { label: "Danh sách đã lưu", icon: Heart, path: "#" },
        { label: "Đánh giá của tôi", icon: MessageSquare, path: "#" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 relative z-10">
        {/* Top Section */}
        <div className="flex flex-col gap-12 lg:flex-row mb-16">
          {/* Left Column: Sidebar Profile */}
          <div className="w-full lg:w-[320px] shrink-0">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40">
              <div className="relative group mx-auto mb-6 aspect-square w-full max-w-[200px]">
                <img
                  src={avatarLoadFailed ? "/default-avatar.png" : displayProfile.avatarUrl || "/default-avatar.png"}
                  alt="Avatar"
                  className="size-full rounded-2xl object-cover shadow-md border-4 border-slate-50"
                  onError={() => setAvatarLoadFailed(true)}
                />
              </div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 leading-tight">{displayProfile.fullName || "Người dùng"}</h2>
              </div>
              <div className="space-y-4 border-t border-slate-100 pt-8">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-900">Hạng thẻ hiện tại</span>
                  <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black uppercase text-amber-600 border border-amber-200">
                    <Star className="size-3 fill-current" />
                    {displayProfile.membershipName || "Bronze"}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                    <span className="text-slate-400">{displayProfile.membershipName}</span>
                    <span className="text-[#1F649C]">{displayProfile.nextMembershipName || "MAX"}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-[#1F649C] to-blue-400"
                      style={{ width: `${Math.min(100, (displayProfile.points / (displayProfile.nextMembershipMinPoints || 100)) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-400">Tiến trình nâng cấp</span>
                    <span className="text-slate-900">{displayProfile.points} / {displayProfile.nextMembershipMinPoints || "MAX"} điểm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Account Summary */}
          <div className="flex-1">
             <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 md:p-10">
                <div className="mb-8 flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-sky-50 flex items-center justify-center text-[#1F649C] border border-sky-100">
                    <User className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Chi tiết tài khoản</h3>
                    <p className="text-sm font-medium text-slate-500">Thông tin cá nhân và định danh của bạn.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {infoItems.map((item) => (
                    <div
                      key={item.label}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-3xl border border-slate-100 bg-slate-50/50 p-6 transition-all hover:bg-white hover:border-sky-200 hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 group-hover:text-[#1F649C] group-hover:shadow-sm transition-all border border-slate-100">
                          <item.icon className="size-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                          <p className="mt-0.5 text-base font-bold text-slate-800">{item.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>

        {/* Bottom Section: Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dashboardCards.map((card) => (
            <div key={card.title} className="w-full rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/30">
               <h3 className="text-xl font-black text-slate-900 mb-8">{card.title}</h3>
               <div className="space-y-2">
                 {card.items.map((item) => (
                   <Link 
                     key={item.label}
                     to={item.path}
                     className="w-full flex items-center justify-between p-5 rounded-2xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-200"
                   >
                     <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-500 group-hover:text-[#1F649C] transition-colors border border-slate-100">
                          <item.icon className="size-6" />
                        </div>
                        <span className="text-base font-bold text-slate-800">{item.label}</span>
                     </div>
                     <ChevronRight className="size-6 text-slate-400 group-hover:text-[#1F649C] transition-all group-hover:translate-x-1" />
                   </Link>
                 ))}
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountProfilePage;
