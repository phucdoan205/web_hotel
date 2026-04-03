import React, { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { getMyProfile, updateMyProfile } from "../../../api/admin/profileApi";
import { uploadUserAvatar } from "../../../api/admin/staffApi";
import { getAvatarPreview } from "../../../utils/avatar";

const ProfileTab = () => {
  const [profile, setProfile] = useState(null);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    avatarUrl: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");

  const loadProfile = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const profileData = await getMyProfile();
      setProfile(profileData);
      setAvatarLoadFailed(false);
      setFormData({
        fullName: profileData?.fullName ?? "",
        email: profileData?.email ?? "",
        avatarUrl: profileData?.avatarUrl ?? "",
      });
    } catch {
      setMessage("Cannot load profile data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

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
    setMessage("");

    try {
      const response = await uploadUserAvatar(profile.id, file);
      const uploadedUrl = response?.url ?? "";

      setProfile((current) => ({
        ...current,
        avatarUrl: uploadedUrl,
      }));
      setAvatarLoadFailed(false);
      setFormData((current) => ({
        ...current,
        avatarUrl: uploadedUrl,
      }));
      setMessage("Avatar updated successfully.");
    } catch {
      setMessage("Cannot upload avatar.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!profile) {
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      await updateMyProfile({
        userId: profile.id,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
      });

      setProfile((current) => ({
        ...current,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        avatarUrl: formData.avatarUrl,
      }));
      setMessage("Profile updated successfully.");
    } catch {
      setMessage("Cannot update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-[2rem] border border-gray-100 bg-white p-8 text-sm font-bold text-gray-400">
        Loading profile...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {message ? (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-600">
          {message}
        </div>
      ) : null}

      <div className="flex items-center gap-6">
        <div className="relative group">
          <img
            src={
              avatarLoadFailed
                ? getAvatarPreview({
                    fullName: formData.fullName,
                    avatarUrl: "",
                  })
                : getAvatarPreview({
                    fullName: formData.fullName,
                    avatarUrl: formData.avatarUrl,
                  })
            }
            alt="Profile"
            className="size-24 rounded-full object-cover border-4 border-white shadow-sm"
            onError={() => setAvatarLoadFailed(true)}
          />
          <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white border-2 border-white hover:bg-blue-700 transition-all shadow-md cursor-pointer">
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
        <div>
          <h4 className="font-bold text-gray-900">Profile Picture</h4>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
            JPG, GIF or PNG. Max size of 800K
          </p>
          <label className="mt-2 inline-block text-xs font-black text-blue-600 hover:underline cursor-pointer">
            {isUploading ? "Uploading..." : "Upload new photo"}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-blue-100 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-blue-100 outline-none transition-all"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
            Role
          </label>
          <input
            type="text"
            readOnly
            value={profile?.roleName ?? "Admin"}
            className="w-full px-5 py-3.5 bg-gray-100 border border-transparent rounded-2xl text-sm font-bold text-gray-400 cursor-not-allowed outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSaving || isUploading}
          className="px-8 py-3.5 bg-blue-600 rounded-2xl text-xs font-black text-white shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default ProfileTab;
