import { API_BASE_URL } from "../api/client";

export const getAvatarPreview = (entity, fallbackName = "User") => {
  const avatarUrl = entity?.avatarUrl || entity?.AvatarUrl;
  const fullName = entity?.fullName || entity?.FullName || entity?.user || entity?.userName || entity?.UserName || fallbackName;

  if (avatarUrl) {
    if (avatarUrl.startsWith("http")) {
      return avatarUrl;
    }
    
    // Strip trailing /api or /api/ to get backend base host URL dynamically
    const host = API_BASE_URL.replace(/\/api\/?$/, "");
    const cleanPath = avatarUrl.startsWith("/") ? avatarUrl : `/${avatarUrl}`;
    return `${host}${cleanPath}`;
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    fullName
  )}&background=F3F4F6&color=111827`;
};
