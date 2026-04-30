import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  User,
  Lock,
  ShieldCheck,
  Pencil,
  ArrowLeft,
  Wallet,
  CreditCard,
  History,
  X
} from "lucide-react";
import { getMyProfile, changeMyPassword } from "../../../api/admin/profileApi";

const SecuritySettingsPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getMyProfile();
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      window.alert("Mật khẩu xác nhận không khớp.");
      return;
    }
    setIsSaving(true);
    try {
      await changeMyPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      window.alert("Đã đổi mật khẩu thành công.");
      setIsEditing(false);
    } catch {
      window.alert("Lỗi khi đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-20 text-center font-bold">Đang tải...</div>;

  const sidebarItems = [
    { label: "Thông tin cá nhân", icon: User, active: false, path: "/profile/personal-info" },
    { label: "Cài đặt bảo mật", icon: Lock, active: true, path: "/profile/security" },
    { label: "Phương thức thanh toán", icon: CreditCard, active: false, path: "#" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="py-6 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 flex items-center gap-2 text-[#006ce4] text-sm font-medium">
          <Link to="/profile" className="hover:underline">Tài khoản</Link>
          <ChevronRight className="size-3 text-slate-400" />
          <span className="font-bold text-slate-900">Cài đặt bảo mật</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              {sidebarItems.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.path}
                  className={`flex items-center gap-4 px-6 py-4 transition-colors border-b border-slate-100 last:border-0 ${
                    item.active ? "text-[#006ce4] font-bold" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <item.icon className={`size-5 ${item.active ? "text-[#006ce4]" : "text-slate-500"}`} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <h1 className="text-3xl font-black text-slate-900 mb-2">Cài đặt bảo mật</h1>
            <p className="text-slate-500 mb-12">Thay đổi thiết lập bảo mật, cài đặt xác thực bổ sung hoặc xóa tài khoản của bạn.</p>

            <div className="space-y-0 border-t border-slate-100">
              {/* Password Row */}
              <div className="py-8 border-b border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-sm font-bold text-slate-900 w-1/3">Mật khẩu</p>
                  <div className="flex-1">
                    <p className="text-sm text-slate-600">Thay đổi mật khẩu thường xuyên để tăng tính bảo mật.</p>
                  </div>
                  <button onClick={() => setIsEditing(!isEditing)} className="text-sm font-bold text-[#006ce4] hover:underline">
                    {isEditing ? "Hủy" : "Thiết lập"}
                  </button>
                </div>

                {isEditing && (
                  <form onSubmit={handleSavePassword} className="bg-slate-50 p-6 rounded-lg mt-6 space-y-4 animate-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1">Mật khẩu hiện tại</label>
                        <input 
                          type="password" 
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className="w-full p-2 border border-slate-300 rounded focus:border-[#006ce4] outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Mật khẩu mới</label>
                        <input 
                          type="password" 
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="w-full p-2 border border-slate-300 rounded focus:border-[#006ce4] outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Xác nhận mật khẩu mới</label>
                        <input 
                          type="password" 
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="w-full p-2 border border-slate-300 rounded focus:border-[#006ce4] outline-none" 
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <button 
                        type="submit" 
                        disabled={isSaving}
                        className="bg-[#006ce4] text-white px-6 py-2 rounded font-bold text-sm shadow-sm"
                      >
                        {isSaving ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Other placeholder rows as in image */}
              <div className="py-8 border-b border-slate-100 flex justify-between items-start">
                <p className="text-sm font-bold text-slate-900 w-1/3">Xác thực 2 yếu tố</p>
                <p className="flex-1 text-sm text-slate-600">Tăng độ bảo mật cho tài khoản bằng cách thiết lập xác thực 2 yếu tố.</p>
                <button className="text-sm font-bold text-[#006ce4] hover:underline">Thiết lập</button>
              </div>

              <div className="py-8 border-b border-slate-100 flex justify-between items-start text-red-600">
                <p className="text-sm font-bold w-1/3 text-slate-900">Xóa tài khoản</p>
                <p className="flex-1 text-sm text-slate-600">Xóa vĩnh viễn tài khoản của bạn.</p>
                <button className="text-sm font-bold hover:underline">Xóa tài khoản</button>
              </div>
            </div>

            <div className="mt-12">
              <button 
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 text-sm font-bold text-[#006ce4] hover:underline"
              >
                <ArrowLeft className="size-4" />
                Quay lại trang tài khoản
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettingsPage;
