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
      window.alert("Đã thay đổi giao diện thành công.");
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
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-6xl px-5 lg:px-8 relative z-10">
        <div className="flex flex-col gap-8 lg:flex-row">
          
          {/* Left Column: Sidebar Profile */}
          <div className="w-full lg:w-[350px] shrink-0">
            <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50">
              {/* Square Avatar */}
              <div className="relative group mx-auto mb-6 aspect-square w-full max-w-[240px]">
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
                  className="size-full rounded-3xl object-cover shadow-md border-4 border-slate-50"
                  onError={() => setAvatarLoadFailed(true)}
                />
                <label className="absolute bottom-3 right-3 flex size-10 cursor-pointer items-center justify-center rounded-xl bg-white text-[#1F649C] shadow-lg transition-all hover:scale-110 hover:bg-[#1F649C] hover:text-white border border-slate-100">
                  <Camera className="size-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>

              {/* Name Only */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 leading-tight">
                  {displayProfile.fullName || "Người dùng"}
                </h2>
              </div>

              {/* Membership Progress (Dynamic from SQL) */}
              <div className="space-y-4 border-t border-slate-100 pt-8">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-900">Hạng thẻ hiện tại</span>
                  <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black uppercase text-amber-600 border border-amber-100">
                    <Star className="size-3 fill-current" />
                    {displayProfile.membershipName || "Bronze"}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                    <span className="text-slate-400">{displayProfile.membershipName || "Bronze"}</span>
                    <span className="text-[#1F649C]">{displayProfile.nextMembershipName || "Max Level"}</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    {displayProfile.nextMembershipMinPoints ? (
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-[#1F649C] to-[#3a8bd0] transition-all duration-1000 shadow-sm"
                        style={{ width: `${Math.min(100, (displayProfile.points / displayProfile.nextMembershipMinPoints) * 100)}%` }}
                      ></div>
                    ) : (
                      <div className="h-full w-full rounded-full bg-[#1F649C]"></div>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500">Tiến trình nâng cấp</span>
                    <span className="font-black text-[#1F649C]">
                      {displayProfile.points} / {displayProfile.nextMembershipMinPoints || displayProfile.points} điểm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Information Details */}
          <div className="flex-1 space-y-6">
            {/* Feedback Message */}
            {feedback.text && (
              <div
                className={`flex items-center gap-3 rounded-2xl px-6 py-4 text-sm font-semibold shadow-sm ${
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

            {/* Content Area - No Tabs, Combined View */}
            <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50 md:p-10">
              <div className="animate-in slide-in-from-right-4 duration-500">
                <div className="mb-8 flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-sky-50 flex items-center justify-center text-[#1F649C]">
                    <User className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Chi tiết tài khoản</h3>
                    <p className="text-sm font-medium text-slate-500">Thông tin cá nhân và định danh của bạn.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      label: "Họ và tên",
                      value: displayProfile.fullName || "Chưa cập nhật",
                      icon: User,
                    },
                    {
                      label: "Địa chỉ Email",
                      value: displayProfile.email || "Chưa cập nhật",
                      icon: Mail,
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
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-3xl border border-slate-50 bg-slate-50/50 p-6 transition-all hover:bg-white hover:border-sky-100 hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 group-hover:text-[#1F649C] group-hover:shadow-sm transition-all">
                          <item.icon className="size-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {item.label}
                          </p>
                          <p className="mt-0.5 text-base font-bold text-slate-800">
                            {item.value}
                          </p>
                          {item.note && (
                            <p className="mt-1 text-[10px] font-medium text-slate-400">
                              {item.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
                    className="size-28 rounded-2xl border-4 border-white object-cover shadow-lg"
                  />
                  <label className="absolute -bottom-2 -right-2 flex size-10 cursor-pointer items-center justify-center rounded-xl border-2 border-white bg-[#1F649C] text-white shadow-md transition hover:bg-[#164e7a]">
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
