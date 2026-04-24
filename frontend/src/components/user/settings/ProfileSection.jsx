import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  Camera,
  Mail,
  Pencil,
  Phone,
  User,
  X,
} from "lucide-react";
import {
  getMyProfile,
  updateMyProfile,
  uploadMyAvatar,
} from "../../../api/admin/profileApi";
import { updateStoredAuth } from "../../../utils/authStorage";
import { getAvatarPreview } from "../../../utils/avatar";

const formatDateForInput = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
};

const formatDateForDisplay = (value) => {
  const normalizedValue = formatDateForInput(value);

  if (!normalizedValue) {
    return "Chưa cập nhật";
  }

  const [year, month, day] = normalizedValue.split("-");
  return `${day}/${month}/${year}`;
};

const ProfileSection = () => {
  const [profile, setProfile] = useState(null);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    avatarUrl: "",
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
        setFeedback({ type: "error", text: "Không thể tải hồ sơ người dùng." });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const openEditModal = () => {
    if (!profile) {
      return;
    }

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

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file || !profile) {
      return;
    }

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!profile) {
      return;
    }

    setIsSaving(true);
    setFeedback({ type: "", text: "" });

    try {
      const nextFullName = formData.fullName.trim();
      const nextPhone = formData.phone.trim();

      if (!nextFullName) {
        setFeedback({ type: "error", text: "Họ và tên không được để trống." });
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

  if (isLoading) {
    return (
      <div className="rounded-[2rem] border border-gray-200 bg-white p-8 text-sm font-semibold text-slate-400 shadow-sm">
        Đang tải hồ sơ...
      </div>
    );
  }

  const displayProfile = profile ?? {};

  return (
    <>
      <div className="space-y-6">
        {feedback.text ? (
          <div
            className={`rounded-2xl px-5 py-4 text-sm font-semibold ${
              feedback.type === "error"
                ? "border border-red-100 bg-red-50 text-red-600"
                : "border border-emerald-100 bg-emerald-50 text-emerald-700"
            }`}
          >
            {feedback.text}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="rounded-[2rem] border border-gray-200 bg-white p-6 text-slate-900 shadow-sm">
            <div className="flex flex-col items-center text-center">
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
                className="size-28 rounded-full border-4 border-slate-100 object-cover shadow-md"
                onError={() => setAvatarLoadFailed(true)}
              />

              <p className="mt-5 text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                Hồ sơ cá nhân
              </p>
              <h3 className="mt-2 text-2xl font-black text-slate-950">
                {displayProfile.fullName || "Khách hàng"}
              </h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {displayProfile.email || "Chưa cập nhật email"}
              </p>

              <button
                type="button"
                onClick={openEditModal}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0085FF] px-5 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-blue-600"
              >
                <Pencil className="size-4" />
                Chỉnh sửa
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-950">Thông tin cá nhân</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Đây là thông tin hiện tại của tài khoản. Nhấn chỉnh sửa để mở cửa sổ cập nhật.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {[
                {
                  label: "Họ và tên",
                  value: displayProfile.fullName || "Chưa cập nhật",
                  icon: User,
                },
                {
                  label: "Email",
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
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-[1.6rem] border border-slate-200 bg-slate-50 px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-900">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {isEditOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
              <div>
                <h3 className="text-xl font-black text-slate-950">Chỉnh sửa hồ sơ cá nhân</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Bạn có thể cập nhật họ tên, số điện thoại, ngày sinh và ảnh đại diện.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                className="flex size-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <div className="flex flex-col items-center gap-4 rounded-[1.8rem] border border-slate-200 bg-slate-50 p-6 text-center">
                <div className="relative">
                  <img
                    src={getAvatarPreview({
                      fullName: formData.fullName,
                      avatarUrl: formData.avatarUrl,
                    })}
                    alt="Ảnh đại diện"
                    className="size-24 rounded-full border-4 border-white object-cover shadow-md"
                  />
                  <label className="absolute bottom-0 right-0 flex size-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#0085FF] text-white transition hover:bg-blue-600">
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

                <label className="inline-flex cursor-pointer items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-800 transition hover:bg-slate-100">
                  {isUploading ? "Đang tải..." : "Đổi avatar"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Họ và tên
                  </span>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <User className="size-4 text-slate-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Email
                  </span>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3">
                    <Mail className="size-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      readOnly
                      className="w-full cursor-not-allowed bg-transparent text-sm font-semibold text-slate-500 outline-none"
                    />
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Số điện thoại
                  </span>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <Phone className="size-4 text-slate-400" />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Ngày sinh
                  </span>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <CalendarDays className="size-4 text-slate-400" />
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
                    />
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-600 transition hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="rounded-2xl bg-[#0085FF] px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default ProfileSection;
