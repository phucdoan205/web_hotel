import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Camera,
  User,
  Mail,
  Phone,
  CalendarDays,
  X,
  Lock,
  ShieldCheck,
  ChevronRight,
  Bell,
  ArrowLeft,
  Pencil,
  Wallet,
  CreditCard,
  History,
  Globe,
  Moon,
  Sun
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
  const [editingField, setEditingField] = useState(null); // null, 'name', 'phone', 'dob'
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const data = await getMyProfile();
        setProfile(data);
        
        // Split full name into first and last name for editing
        // Assuming Vietnamese style: LastName + Middle + FirstName
        // Or just split by last space
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
      window.alert("Đã thay đổi giao diện thành công.");
    } catch (err) {
      window.alert("Lỗi khi tải ảnh.");
    }
  };

  if (isLoading) return <div className="p-20 text-center font-bold">Đang tải...</div>;

  const sidebarItems = [
    { label: "Thông tin cá nhân", icon: User, active: true, path: "/profile/personal-info" },
    { label: "Cài đặt bảo mật", icon: Lock, active: false, path: "/profile/security" },
    { label: "Cài đặt chung", icon: Pencil, active: false, path: "/profile/settings" },
    { label: "Phương thức thanh toán", icon: CreditCard, active: false, path: "#" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Booking-style Header/Breadcrumb */}
      <div className="py-6 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 flex items-center gap-2 text-[#006ce4] text-sm font-medium">
          <Link to="/profile" className="hover:underline">Tài khoản</Link>
          <ChevronRight className="size-3 text-slate-400" />
          <span className="font-bold text-slate-900">Thông tin cá nhân</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-white">
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
            <div className="flex justify-between items-start mb-2">
              <div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">Thông tin cá nhân</h1>
                <p className="text-slate-500">Cập nhật thông tin của bạn và tìm hiểu các thông tin này được sử dụng ra sao.</p>
              </div>
              <div className="relative group">
                <img 
                  src={getAvatarPreview({ fullName: profile.fullName, avatarUrl: profile.avatarUrl })} 
                  alt="Avatar" 
                  className="size-20 rounded-full object-cover border-2 border-slate-100"
                />
                <label className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Camera className="size-5 text-white" />
                  <input type="file" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>
            </div>

            <div className="mt-12 space-y-0 border-t border-slate-100">
              {/* Name Row */}
              <div className="py-8 border-b border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-sm font-bold text-slate-900 w-1/3">Tên</p>
                  <div className="flex-1">
                    {editingField === 'name' ? (
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-bold mb-1">Tên *</label>
                          <input 
                            type="text" 
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            className="w-full p-3 border border-slate-300 rounded-md focus:border-[#006ce4] outline-none text-slate-900" 
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-bold mb-1">Họ *</label>
                          <input 
                            type="text" 
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            className="w-full p-3 border border-slate-300 rounded-md focus:border-[#006ce4] outline-none text-slate-900" 
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-600">{profile.fullName}</p>
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
                      className="bg-[#006ce4] text-white px-8 py-2 rounded-md font-bold text-sm shadow-md hover:bg-[#005bb8]"
                    >
                      Lưu
                    </button>
                  </div>
                )}
              </div>

              {/* Display Name Row */}
              <div className="py-8 border-b border-slate-100 flex justify-between items-center">
                <p className="text-sm font-bold text-slate-900 w-1/3">Tên hiển thị</p>
                <p className="flex-1 text-sm text-slate-400 italic">Chọn tên hiển thị</p>
                <button className="text-sm font-bold text-[#006ce4] hover:underline">Chỉnh sửa</button>
              </div>

              {/* Email Row */}
              <div className="py-8 border-b border-slate-100 flex justify-between items-start">
                <p className="text-sm font-bold text-slate-900 w-1/3">Địa chỉ email</p>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm text-slate-600">{profile.email}</p>
                    <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Xác thực</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-md">Đây là địa chỉ email bạn dùng để đăng nhập. Chúng tôi cũng sẽ gửi các xác nhận đặt chỗ tới địa chỉ này.</p>
                </div>
                <button className="text-sm font-bold text-slate-300 cursor-not-allowed">Chỉnh sửa</button>
              </div>

              {/* Phone Row */}
              <div className="py-8 border-b border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-sm font-bold text-slate-900 w-1/3">Số điện thoại</p>
                  <div className="flex-1">
                    {editingField === 'phone' ? (
                      <input 
                        type="text" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full max-w-sm p-3 border border-slate-300 rounded-md focus:border-[#006ce4] outline-none text-slate-900" 
                        placeholder="Số điện thoại của bạn"
                      />
                    ) : (
                      <p className="text-sm text-slate-600">{profile.phone || "Thêm số điện thoại của bạn"}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-2">Chỗ nghỉ hoặc địa điểm tham quan bạn đặt sẽ liên lạc with bạn qua số này nếu cần.</p>
                  </div>
                  {editingField !== 'phone' ? (
                    <button onClick={() => setEditingField('phone')} className="text-sm font-bold text-[#006ce4] hover:underline">Chỉnh sửa</button>
                  ) : (
                    <button onClick={() => setEditingField(null)} className="text-sm font-bold text-[#006ce4] hover:underline">Hủy</button>
                  )}
                </div>
                {editingField === 'phone' && (
                  <div className="flex justify-end mt-4">
                    <button onClick={() => handleSave('phone')} className="bg-[#006ce4] text-white px-8 py-2 rounded-md font-bold text-sm shadow-md">Lưu</button>
                  </div>
                )}
              </div>

              {/* DOB Row */}
              <div className="py-8 border-b border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-sm font-bold text-slate-900 w-1/3">Ngày sinh</p>
                  <div className="flex-1">
                    {editingField === 'dob' ? (
                      <input 
                        type="date" 
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                        className="w-full max-w-sm p-3 border border-slate-300 rounded-md focus:border-[#006ce4] outline-none text-slate-900" 
                      />
                    ) : (
                      <p className="text-sm text-slate-600">{formatDateForDisplay(profile.dateOfBirth)}</p>
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
                    <button onClick={() => handleSave('dob')} className="bg-[#006ce4] text-white px-8 py-2 rounded-md font-bold text-sm shadow-md">Lưu</button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Back Button */}
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

export default PersonalDetailsPage;
