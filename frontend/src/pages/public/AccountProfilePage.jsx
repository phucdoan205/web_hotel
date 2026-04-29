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
  AlertCircle
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
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    avatarUrl: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setFeedback({ type: "", text: "" });
      try {
        const profileData = await getMyProfile();
        setProfile(profileData);
        setAvatarLoadFailed(false);
        setFormData({
          fullName: profileData?.fullName ?? "",
          email: profileData?.email ?? "",
          phone: profileData?.phone ?? "",
          dateOfBirth: formatDateForInput(profileData?.dateOfBirth),
          avatarUrl: profileData?.avatarUrl ?? "",
        });
      } catch {
        setFeedback({
          type: "error",
          text: "Không thể tải thông tin cá nhân.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  const openEditModal = () => {
    if (!profile) return;
    setFormData({
      fullName: profile?.fullName ?? "",
      email: profile?.email ?? "",
      phone: profile?.phone ?? "",
      dateOfBirth: formatDateForInput(profile?.dateOfBirth),
      avatarUrl: profile?.avatarUrl ?? "",
    });
    setAvatarLoadFailed(false);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    setIsUploading(true);
    setFeedback({ type: "", text: "" });

    try {
      const response = await uploadMyAvatar(profile.id, file);
      const uploadedUrl = response?.url ?? "";

      setProfile((current) => ({
        ...current,
        avatarUrl: uploadedUrl,
      }));
      setFormData((current) => ({
        ...current,
        avatarUrl: uploadedUrl,
      }));
      setAvatarLoadFailed(false);
      updateStoredAuth((current) => ({
        ...current,
        avatarUrl: uploadedUrl,
      }));
      setFeedback({ type: "success", text: "Cập nhật ảnh đại diện thành công." });
    } catch {
      setFeedback({
        type: "error",
        text: "Không thể tải ảnh đại diện lên Cloudinary.",
      });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    setFeedback({ type: "", text: "" });

    try {
      const nextFullName = formData.fullName.trim();
      const nextPhone = formData.phone.trim();

      if (!nextFullName) {
        setFeedback({ type: "error", text: "Họ tên không được để trống." });
        setIsSaving(false);
        return;
      }

      await updateMyProfile({
        userId: profile.id,
        fullName: nextFullName,
        phone: nextPhone || null,
        dateOfBirth: formData.dateOfBirth || null,
      });

      const nextProfile = {
        ...profile,
        fullName: nextFullName,
        phone: nextPhone || null,
        dateOfBirth: formData.dateOfBirth || null,
        avatarUrl: formData.avatarUrl,
      };

      setProfile(nextProfile);
      updateStoredAuth((current) => ({
        ...current,
        fullName: nextFullName,
        avatarUrl: formData.avatarUrl,
      }));
      setFeedback({ type: "success", text: "Cập nhật hồ sơ thành công." });
      setIsEditOpen(false);
    } catch {
      setFeedback({ type: "error", text: "Không thể cập nhật hồ sơ." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePassword = async (event) => {
    event.preventDefault();
    setFeedback({ type: "", text: "" });

    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      setFeedback({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự." });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setFeedback({ type: "error", text: "Xác nhận mật khẩu mới không khớp." });
      return;
    }

    setIsSaving(true);

    try {
      await changeMyPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setFeedback({ type: "success", text: "Đổi mật khẩu thành công." });
    } catch (error) {
      const responseMessage = error.response?.data;
      setFeedback({
        type: "error",
        text:
          typeof responseMessage === "string" && responseMessage.trim()
            ? responseMessage
            : "Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-lg font-bold text-slate-400">Đang tải hồ sơ...</div>
      </div>
    );
  }

  const displayProfile = profile ?? {};

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header Section */}
      <div className="bg-[#01539d] pt-12 pb-[14rem] text-white">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <div className="flex flex-col items-center gap-5">
            <div className="relative">
              <img
                src={
                  avatarLoadFailed
                    ? getAvatarPreview({
                        fullName: displayProfile.fullName,
                        avatarUrl: "",
                      })
                    : getAvatarPreview({
                        fullName: displayProfile.fullName,
                        avatarUrl: displayProfile.avatarUrl,
                      })
                }
                alt="Ảnh đại diện"
                className="size-24 rounded-full border-4 border-[#ffb700] object-cover shadow-lg md:size-28"
                onError={() => setAvatarLoadFailed(true)}
              />
              <div className="absolute -bottom-2 -right-2 flex size-8 items-center justify-center rounded-full bg-[#ffb700] text-[#01539d] shadow-md">
                <Star className="size-4 fill-current" />
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-black tracking-tight">
                Chào {displayProfile.fullName || "bạn"}
              </h1>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#ffb700] px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#01539d] shadow-sm">
                Genius Cấp 1
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-[11rem] max-w-5xl px-5 lg:px-8 relative z-10">
        {feedback.text && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-semibold shadow-sm ${
              feedback.type === "error"
                ? "border border-red-100 bg-red-50 text-red-600"
                : "border border-emerald-100 bg-emerald-50 text-emerald-700"
            }`}
          >
            {feedback.type === "error" ? (
              <AlertCircle className="size-5" />
            ) : (
              <CheckCircle2 className="size-5" />
            )}
            {feedback.text}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-6 flex justify-center">
          <div className="flex w-full max-w-2xl overflow-hidden rounded-full bg-white p-1.5 shadow-md">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold transition-all ${
                activeTab === "profile"
                  ? "bg-[#0194f3] text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <User className="size-4.5" />
              Thông tin cá nhân
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold transition-all ${
                activeTab === "security"
                  ? "bg-[#0194f3] text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Lock className="size-4.5" />
              Cài đặt bảo mật
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl md:p-10">
          {activeTab === "profile" && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-950">Thông tin cá nhân</h2>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Cập nhật thông tin của bạn và tìm hiểu các thông tin này được sử dụng ra sao.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openEditModal}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0194f3] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#017bc0]"
                >
                  <Pencil className="size-4" />
                  Chỉnh sửa hồ sơ
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {[
                  {
                    label: "Họ tên",
                    value: displayProfile.fullName || "Chưa cập nhật",
                    icon: User,
                  },
                  {
                    label: "Địa chỉ email",
                    value: displayProfile.email || "Chưa cập nhật",
                    icon: Mail,
                    note: "Địa chỉ email này dùng để đăng nhập.",
                  },
                  {
                    label: "Số điện thoại",
                    value: displayProfile.phone || "Chưa cập nhật",
                    icon: Phone,
                  },
                  {
                    label: "Ngày sinh",
                    value: formatDateForDisplay(displayProfile.dateOfBirth),
                    icon: CalendarDays,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-6 transition-all hover:border-[#0194f3]/30 hover:shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-[#0194f3] shadow-sm">
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
                            {item.label}
                          </p>
                          <p className="mt-1 text-base font-bold text-slate-900">
                            {item.value}
                          </p>
                          {item.note && (
                            <p className="mt-2 text-xs font-medium text-slate-500">
                              {item.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="animate-in fade-in mx-auto max-w-3xl duration-500">
              <div className="mb-8 text-center border-b border-slate-100 pb-8">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-[#0194f3]/10 text-[#0194f3]">
                  <ShieldCheck className="size-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-950">Bảo mật tài khoản</h2>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  Điều chỉnh cài đặt bảo mật và thay đổi mật khẩu của bạn để giữ tài khoản luôn an toàn.
                </p>
              </div>

              <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6 md:p-8">
                <form onSubmit={handleSavePassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="px-1 text-[11px] font-black uppercase tracking-[0.15em] text-slate-500">
                      Mật khẩu hiện tại
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Nhập mật khẩu hiện tại"
                      className="w-full rounded-2xl border border-transparent bg-white px-5 py-4 text-sm font-semibold outline-none transition-all focus:border-[#0071c2] focus:ring-4 focus:ring-[#0071c2]/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="px-1 text-[11px] font-black uppercase tracking-[0.15em] text-slate-500">
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Nhập mật khẩu mới"
                      className="w-full rounded-2xl border border-transparent bg-white px-5 py-4 text-sm font-semibold outline-none transition-all focus:border-[#0071c2] focus:ring-4 focus:ring-[#0071c2]/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="px-1 text-[11px] font-black uppercase tracking-[0.15em] text-slate-500">
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full rounded-2xl border border-transparent bg-white px-5 py-4 text-sm font-semibold outline-none transition-all focus:border-[#0071c2] focus:ring-4 focus:ring-[#0071c2]/10"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full rounded-full bg-[#0194f3] py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-[#0194f3]/30 transition-all hover:bg-[#017bc0] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSaving ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm transition-all animate-in fade-in">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
              <div>
                <h3 className="text-xl font-black text-slate-950">Chỉnh sửa hồ sơ</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Cập nhật thông tin hiển thị và liên hệ của bạn.
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="flex size-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 md:p-8">
              <div className="mb-8 flex flex-col items-center">
                <div className="relative mb-4">
                  <img
                    src={getAvatarPreview({
                      fullName: formData.fullName,
                      avatarUrl: formData.avatarUrl,
                    })}
                    alt="Ảnh đại diện"
                    className="size-28 rounded-full border-4 border-white object-cover shadow-lg"
                  />
                  <label className="absolute bottom-0 right-0 flex size-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#0071c2] text-white shadow-md transition hover:bg-[#005fa3]">
                    <Camera className="size-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
                <label className="cursor-pointer text-sm font-bold text-[#0071c2] hover:underline">
                  {isUploading ? "Đang tải ảnh lên..." : "Đổi ảnh đại diện"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="px-1 text-[11px] font-black uppercase tracking-[0.15em] text-slate-500">
                    Họ tên
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition-all focus-within:border-[#0071c2] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#0071c2]/10">
                    <User className="size-5 text-slate-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
                      placeholder="Nhập họ tên"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="px-1 text-[11px] font-black uppercase tracking-[0.15em] text-slate-500">
                    Email
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3.5 opacity-70">
                    <Mail className="size-5 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      readOnly
                      className="w-full cursor-not-allowed bg-transparent text-sm font-semibold text-slate-600 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="px-1 text-[11px] font-black uppercase tracking-[0.15em] text-slate-500">
                    Số điện thoại
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition-all focus-within:border-[#0071c2] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#0071c2]/10">
                    <Phone className="size-5 text-slate-400" />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="px-1 text-[11px] font-black uppercase tracking-[0.15em] text-slate-500">
                    Ngày sinh
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition-all focus-within:border-[#0071c2] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#0071c2]/10">
                    <CalendarDays className="size-5 text-slate-400" />
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-2xl px-6 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="rounded-2xl bg-[#0071c2] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition hover:bg-[#005fa3] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountProfilePage;
