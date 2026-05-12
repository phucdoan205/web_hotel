import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Shield,
  Star,
  Award,
  ChevronRight,
  TrendingUp,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
import { getMyProfile } from "../../../api/admin/profileApi";
import { getMemberships } from "../../../api/admin/membershipApi";
import FAQSection from "../../../components/public/FAQSection";

const MembershipPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState(null);

  const isDark = document.documentElement.classList.contains('dark-theme');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [profileData, membershipsData] = await Promise.all([
          getMyProfile(),
          getMemberships()
        ]);
        setProfile(profileData);
        const sorted = membershipsData.sort((a, b) => (a.minPoints || 0) - (b.minPoints || 0));
        setMemberships(sorted);

        // Mặc định chọn hạng hiện tại của user
        const current = sorted.find(m => m.tierName === profileData.membershipName);
        setSelectedTier(current || sorted[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className={`p-20 text-center font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
        Đang tải...
      </div>
    );
  }

  const {
    points = 0,
    membershipName = "Bronze",
  } = profile || {};

  const getTierColor = (name) => {
    switch (name?.toLowerCase()) {
      case 'gold': return 'from-yellow-400 to-amber-600';
      case 'silver': return 'from-slate-300 to-slate-500';
      case 'platinum': return 'from-cyan-400 to-blue-600';
      case 'diamond': return 'from-purple-400 to-indigo-600';
      case 'kim cương': return 'from-purple-400 to-indigo-600';
      case 'iron': return 'from-slate-400 to-slate-600';
      default: return 'from-orange-400 to-orange-700'; // Bronze
    }
  };

  const getTierBadgeColor = (name) => {
    switch (name?.toLowerCase()) {
      case 'gold': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'silver': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'platinum': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'kim cương': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-orange-100 text-orange-700 border-orange-200';
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[#006ce4] text-sm font-medium mb-8">
          <Link to="/profile" className="hover:underline transition-all">Tài khoản</Link>
          <ChevronRight className="size-3 text-slate-400" />
          <span className={`font-bold transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>Thành viên</span>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-end gap-4">
            <div className="text-center sm:text-left">
              <h1 className={`text-4xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Chương trình Thành viên
              </h1>
              <p className="text-slate-500 text-lg">
                Khám phá các đặc quyền và theo dõi tiến trình của bạn.
              </p>
            </div>
            <div className={`px-6 py-3 rounded-2xl border flex items-center gap-3 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-black">
                <Star className="size-5 fill-current" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">Điểm hiện tại</p>
                <p className={`text-lg font-black leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>{points.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Tier Navigation Tabs */}
          <div className="mb-8 overflow-x-auto pt-4 pb-2 scrollbar-hide">
            <div className="flex gap-4 min-w-max px-2">
              {memberships.map((m) => {
                const isActive = selectedTier?.id === m.id;
                const isUserTier = m.tierName === membershipName;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedTier(m)}
                    className={`relative px-6 py-4 rounded-2xl font-black text-sm transition-all border-2 ${isActive
                        ? `border-blue-500 ${isDark ? 'bg-blue-500/20 text-white shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'bg-blue-50 text-blue-600 shadow-lg shadow-blue-100'}`
                        : `${isDark ? 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 shadow-sm'}`
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`size-3 rounded-full bg-gradient-to-br ${getTierColor(m.tierName)} shadow-sm`} />
                      {m.tierName}
                      {isUserTier && (
                        <div className="absolute -top-3 -right-2 bg-[#006ce4] text-white text-[10px] px-2 py-0.5 rounded-full uppercase shadow-md font-black z-10 border-2 border-white dark:border-slate-900 animate-bounce-subtle">
                          Bạn
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Tier Preview Card */}
          <div className={`relative overflow-hidden rounded-3xl p-8 sm:p-12 mb-12 text-white shadow-2xl transition-all duration-700 bg-gradient-to-br ${getTierColor(selectedTier?.tierName)}`}>
            <div className="absolute top-0 right-0 p-8 opacity-10 hidden sm:block pointer-events-none">
              <Shield size={240} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                    <Award className="size-7" />
                  </div>
                  <span className="text-sm font-bold tracking-widest uppercase opacity-80">Thông tin hạng</span>
                </div>
                {selectedTier?.tierName === membershipName && (
                  <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase border border-white/20">
                    Hạng hiện tại của bạn
                  </span>
                )}
              </div>

              <h2 className="text-6xl sm:text-7xl font-black mb-4 tracking-tight italic uppercase">
                {selectedTier?.tierName}
              </h2>

              <div className="flex items-center gap-4 mb-12">
                <div className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                  <Star className="size-5 fill-white" />
                  <span className="text-xl font-bold">{selectedTier?.minPoints?.toLocaleString() || 0} điểm</span>
                </div>
                <div className="flex items-center gap-2 bg-emerald-500/20 px-4 py-2 rounded-xl backdrop-blur-sm border border-emerald-500/20">
                  <TrendingUp className="size-5" />
                  <span className="text-xl font-bold">-{selectedTier?.discountPercent}% Ưu đãi</span>
                </div>
              </div>

              {/* Progress Bar (Only shown if viewing current or higher tier) */}
              {profile && (
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/20 shadow-inner">
                  <div className="flex justify-between items-end mb-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase opacity-60 mb-1">
                        {selectedTier?.tierName === membershipName ? 'Duy trì hạng này' : `Tiến tới hạng ${selectedTier?.tierName}`}
                      </span>
                      <span className="text-lg font-bold">
                        {points >= (selectedTier?.minPoints || 0)
                          ? 'Bạn đã đủ điều kiện cho hạng này'
                          : `Cần thêm ${(selectedTier?.minPoints - points).toLocaleString()} điểm`}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black">
                        {Math.min(100, Math.round((points / (selectedTier?.minPoints || 1)) * 100))}%
                      </span>
                    </div>
                  </div>

                  <div className="h-4 bg-white/20 rounded-full overflow-hidden shadow-sm">
                    <div
                      className="h-full bg-white transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                      style={{ width: `${Math.min(100, (points / (selectedTier?.minPoints || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tier Benefits Details */}
          <div className={`rounded-3xl border p-8 sm:p-12 mb-12 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'
            }`}>
            <h3 className={`text-2xl font-bold mb-8 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <ChevronRight className="size-5 text-blue-500" />
              </div>
              Chi tiết đặc quyền {selectedTier?.tierName}
            </h3>

            <div className={`prose prose-slate max-w-none ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <p className="text-xl leading-relaxed italic border-l-4 border-blue-500 pl-6 py-2 mb-12">
                "{selectedTier?.description || "Chào mừng bạn đến với chương trình khách hàng thân thiết."}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className={`p-8 rounded-2xl border ${isDark ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
                  <TrendingUp className="size-6" />
                </div>
                <h4 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Giảm giá {selectedTier?.discountPercent}%</h4>
                <p className="text-sm text-slate-500 leading-relaxed">Giảm giá trực tiếp trên tổng hóa đơn cho mọi dịch vụ phòng.</p>
              </div>

              <div className={`p-8 rounded-2xl border ${isDark ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6">
                  <Award className="size-6" />
                </div>
                <h4 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Ưu tiên Check-in</h4>
                <p className="text-sm text-slate-500 leading-relaxed">Được phục vụ ưu tiên tại quầy lễ tân khi làm thủ tục nhận phòng.</p>
              </div>

              <div className={`p-8 rounded-2xl border ${isDark ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <div className="size-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-6">
                  <Shield className="size-6" />
                </div>
                <h4 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Hỗ trợ 24/7</h4>
                <p className="text-sm text-slate-500 leading-relaxed">Đường dây nóng hỗ trợ riêng biệt cho khách hàng hạng cao.</p>
              </div>
            </div>
          </div>

          <FAQSection isDark={isDark} />

          {/* Bottom Back Button */}
          <div className="flex justify-center sm:justify-start mt-12">
            <button
              onClick={() => navigate("/profile")}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm transition-all group ${isDark
                  ? 'bg-slate-800 text-white hover:bg-slate-700'
                  : 'bg-white text-[#006ce4] border border-slate-200 hover:border-[#006ce4] shadow-sm hover:shadow-md'
                }`}
            >
              <ArrowLeft className="size-5 group-hover:-translate-x-1 transition-transform" />
              Quay lại trang tài khoản
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipPage;
