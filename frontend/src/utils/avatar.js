export const getAvatarPreview = (entity, fallbackName = "User") => {
  if (entity?.avatarUrl) {
    return entity.avatarUrl;
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    entity?.fullName ?? fallbackName,
  )}&background=F3F4F6&color=111827`;
};
