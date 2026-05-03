import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
} from "lucide-react";
import { getMyProfile, changeMyPassword } from "../../../api/admin/profileApi";
import { toast } from "react-hot-toast";

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

  const isDark = document.documentElement.classList.contains('dark-theme');

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
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }
    setIsSaving(true);
    try {
      await changeMyPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Đã đổi mật khẩu thành công.");
      setIsEditing(false);
    } catch {
      toast.error("Lỗi khi đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className={`p-20 text-center font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Đang tải...</div>;

  return (
    <div>
      <h1 className={`text-3xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Cài đặt bảo mật</h1>
      <p className="text-slate-500 mb-12">Thay đổi thiết lập bảo mật, cài đặt xác thực bổ sung hoặc xóa tài khoản của bạn.</p>

      <div className={`space-y-0 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        {/* Password Row */}
        <div className={`py-8 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex justify-between items-start mb-4">
            <p className={`text-sm font-bold w-1/3 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>Mật khẩu</p>
            <div className="flex-1">
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Thay đổi mật khẩu thường xuyên để tăng tính bảo mật.</p>
            </div>
            <button onClick={() => setIsEditing(!isEditing)} className="text-sm font-bold text-[#006ce4] hover:underline">
              {isEditing ? "Hủy" : "Thiết lập"}
            </button>
          </div>

          {isEditing && (
            <form onSubmit={handleSavePassword} className={`${isDark ? 'bg-slate-800/40' : 'bg-slate-50'} p-6 rounded-lg mt-6 space-y-4 animate-in slide-in-from-top-2 duration-300`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : ''}`}>Mật khẩu hiện tại</label>
                  <input 
                    type="password" 
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className={`w-full p-2 border rounded focus:border-[#006ce4] outline-none transition-all ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                    }`} 
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : ''}`}>Mật khẩu mới</label>
                  <input 
                    type="password" 
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className={`w-full p-2 border rounded focus:border-[#006ce4] outline-none transition-all ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                    }`} 
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : ''}`}>Xác nhận mật khẩu mới</label>
                  <input 
                    type="password" 
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className={`w-full p-2 border rounded focus:border-[#006ce4] outline-none transition-all ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                    }`} 
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-[#006ce4] text-white px-6 py-2 rounded font-bold text-sm shadow-sm hover:bg-[#005bb8] transition-colors"
                >
                  {isSaving ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Other placeholder rows */}
        <div className={`py-8 border-b flex justify-between items-start ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <p className={`text-sm font-bold w-1/3 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>Xác thực 2 yếu tố</p>
          <p className={`flex-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Tăng độ bảo mật cho tài khoản bằng cách thiết lập xác thực 2 yếu tố.</p>
          <button className="text-sm font-bold text-[#006ce4] hover:underline">Thiết lập</button>
        </div>

        <div className={`py-8 border-b flex justify-between items-start ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <p className={`text-sm font-bold w-1/3 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>Xóa tài khoản</p>
          <p className={`flex-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Xóa vĩnh viễn tài khoản của bạn.</p>
          <button className="text-sm font-bold text-red-500 hover:underline">Xóa tài khoản</button>
        </div>
      </div>

      <div className="mt-12">
        <button 
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 text-sm font-bold text-[#006ce4] hover:underline group"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại trang tài khoản
        </button>
      </div>
    </div>
  );
};

export default SecuritySettingsPage;
