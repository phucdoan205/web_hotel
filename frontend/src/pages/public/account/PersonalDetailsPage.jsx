import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  ArrowLeft,
} from "lucide-react";
import {
  getMyProfile,
  updateMyProfile,
  uploadMyAvatar,
} from "../../../api/admin/profileApi";
import { updateStoredAuth } from "../../../utils/authStorage";
import { getAvatarPreview } from "../../../utils/avatar";

const formatDateForInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const formatDateForDisplay = (value) => {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  return date.toLocaleDateString("vi-VN");
};

const PersonalDetailsPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingField, setEditingField] = useState(null); 
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
  });

  const isDark = document.documentElement.classList.contains('dark-theme');

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const data = await getMyProfile();
        setProfile(data);
        
        const nameParts = (data.fullName || "").trim().split(" ");
        if (nameParts.length > 1) {
          setFormData({
            firstName: nameParts.slice(0, -1).join(" "),
            lastName: nameParts[nameParts.length - 1],
            phone: data.phone || "",
            dateOfBirth: formatDateForInput(data.dateOfBirth),
          });
        } else {
          setFormData({
            firstName: data.fullName || "",
            lastName: "",
            phone: data.phone || "",
            dateOfBirth: formatDateForInput(data.dateOfBirth),
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async (field) => {
    setIsSaving(true);
    try {
      const newFullName = field === 'name' 
        ? `${formData.firstName} ${formData.lastName}`.trim()
        : profile.fullName;

      await updateMyProfile({
        userId: profile.id,
        fullName: newFullName,
        phone: formData.phone || null,
        dateOfBirth: formData.dateOfBirth || null,
      });

      setProfile({
        ...profile,
        fullName: newFullName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
      });

      updateStoredAuth((curr) => ({
        ...curr,
        fullName: newFullName,
      }));

      setEditingField(null);
      window.alert("Đã chỉnh sửa thành công.");
    } catch (err) {
      window.alert("Lỗi khi cập nhật thông tin.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;
    try {
      const response = await uploadMyAvatar(profile.id, file);
      setProfile({ ...profile, avatarUrl: response.url });
      updateStoredAuth((curr) => ({ ...curr, avatarUrl: response.url }));
      window.alert("Đã thay đổi ảnh đại diện thành công.");
    } catch (err) {
      window.alert("Lỗi khi tải ảnh.");
    }
  };

  if (isLoading) return <div className={`p-20 text-center font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Đang tải...</div>;

  return (
    <div>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h1 className={`text-3xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Thông tin cá nhân</h1>
          <p className="text-slate-500">Cập nhật thông tin của bạn và tìm hiểu các thông tin này được sử dụng ra sao.</p>
        </div>
        <div className="relative group">
          <img 
            src={getAvatarPreview({ fullName: profile.fullName, avatarUrl: profile.avatarUrl })} 
            alt="Avatar" 
            className="size-20 rounded-full object-cover border-2 border-slate-100 shadow-sm"
          />
          <label className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
            <Camera className="size-5 text-white" />
            <input type="file" className="hidden" onChange={handleAvatarUpload} />
          </label>
        </div>
      </div>

      <div className={`mt-12 space-y-0 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        {/* Name Row */}
        <div className={`py-8 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex justify-between items-start mb-4">
            <p className={`text-sm font-bold w-1/3 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>Tên</p>
            <div className="flex-1">
              {editingField === 'name' ? (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : ''}`}>Tên *</label>
                    <input 
                      type="text" 
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className={`w-full p-3 border rounded-md focus:border-[#006ce4] outline-none transition-all ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`} 
                    />
                  </div>
                  <div className="flex-1">
                    <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : ''}`}>Họ *</label>
                    <input 
                      type="text" 
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className={`w-full p-3 border rounded-md focus:border-[#006ce4] outline-none transition-all ${
                        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`} 
                    />
                  </div>
                </div>
              ) : (
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{profile.fullName}</p>
              )}
            </div>
            {editingField !== 'name' ? (
              <button onClick={() => setEditingField('name')} className="text-sm font-bold text-[#006ce4] hover:underline">Chỉnh sửa</button>
            ) : (
              <button onClick={() => setEditingField(null)} className="text-sm font-bold text-[#006ce4] hover:underline">Hủy</button>
            )}
          </div>
          {editingField === 'name' && (
            <div className="flex justify-end mt-4">
              <button 
                onClick={() => handleSave('name')}
                disabled={isSaving}
                className="bg-[#006ce4] text-white px-8 py-2 rounded-md font-bold text-sm shadow-md hover:bg-[#005bb8] transition-colors"
              >
                Lưu
              </button>
            </div>
          )}
        </div>

        {/* Display Name Row */}
        <div className={`py-8 border-b flex justify-between items-center ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <p className={`text-sm font-bold w-1/3 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>Tên hiển thị</p>
          <p className="flex-1 text-sm text-slate-400 italic">Chọn tên hiển thị</p>
          <button className="text-sm font-bold text-[#006ce4] hover:underline">Chỉnh sửa</button>
        </div>

        {/* Email Row */}
        <div className={`py-8 border-b flex justify-between items-start ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <p className={`text-sm font-bold w-1/3 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>Địa chỉ email</p>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{profile.email}</p>
              <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Xác thực</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">Đây là địa chỉ email bạn dùng để đăng nhập. Chúng tôi cũng sẽ gửi các xác nhận đặt chỗ tới địa chỉ này.</p>
          </div>
          <button className="text-sm font-bold text-slate-300 cursor-not-allowed">Chỉnh sửa</button>
        </div>

        {/* Phone Row */}
        <div className={`py-8 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex justify-between items-start mb-4">
            <p className={`text-sm font-bold w-1/3 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>Số điện thoại</p>
            <div className="flex-1">
              {editingField === 'phone' ? (
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className={`w-full max-w-sm p-3 border rounded-md focus:border-[#006ce4] outline-none transition-all ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`} 
                  placeholder="Số điện thoại của bạn"
                />
              ) : (
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{profile.phone || "Thêm số điện thoại của bạn"}</p>
              )}
              <p className="text-xs text-slate-400 mt-2">Chỗ nghỉ hoặc địa điểm tham quan bạn đặt sẽ liên lạc với bạn qua số này nếu cần.</p>
            </div>
            {editingField !== 'phone' ? (
              <button onClick={() => setEditingField('phone')} className="text-sm font-bold text-[#006ce4] hover:underline">Chỉnh sửa</button>
            ) : (
              <button onClick={() => setEditingField(null)} className="text-sm font-bold text-[#006ce4] hover:underline">Hủy</button>
            )}
          </div>
          {editingField === 'phone' && (
            <div className="flex justify-end mt-4">
              <button onClick={() => handleSave('phone')} className="bg-[#006ce4] text-white px-8 py-2 rounded-md font-bold text-sm shadow-md hover:bg-[#005bb8] transition-colors">Lưu</button>
            </div>
          )}
        </div>

        {/* DOB Row */}
        <div className={`py-8 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex justify-between items-start mb-4">
            <p className={`text-sm font-bold w-1/3 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>Ngày sinh</p>
            <div className="flex-1">
              {editingField === 'dob' ? (
                <input 
                  type="date" 
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  className={`w-full max-w-sm p-3 border rounded-md focus:border-[#006ce4] outline-none transition-all ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`} 
                />
              ) : (
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{formatDateForDisplay(profile.dateOfBirth)}</p>
              )}
            </div>
            {editingField !== 'dob' ? (
              <button onClick={() => setEditingField('dob')} className="text-sm font-bold text-[#006ce4] hover:underline">Chỉnh sửa</button>
            ) : (
              <button onClick={() => setEditingField(null)} className="text-sm font-bold text-[#006ce4] hover:underline">Hủy</button>
            )}
          </div>
          {editingField === 'dob' && (
            <div className="flex justify-end mt-4">
              <button onClick={() => handleSave('dob')} className="bg-[#006ce4] text-white px-8 py-2 rounded-md font-bold text-sm shadow-md hover:bg-[#005bb8] transition-colors">Lưu</button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Back Button */}
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

export default PersonalDetailsPage;
