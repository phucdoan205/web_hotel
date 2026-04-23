const FAVORITE_ROOM_TYPES_KEY = "user-favorite-room-types";

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const getFavoriteRoomTypes = () => {
  if (!canUseStorage()) return [];

  try {
    const rawValue = window.localStorage.getItem(FAVORITE_ROOM_TYPES_KEY);
    if (!rawValue) return [];

    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveFavoriteRoomTypes = (items) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(FAVORITE_ROOM_TYPES_KEY, JSON.stringify(items));
};

export const isFavoriteRoomType = (roomTypeId) =>
  getFavoriteRoomTypes().some((item) => String(item.roomTypeId) === String(roomTypeId));

export const toggleFavoriteRoomType = (roomType) => {
  const currentItems = getFavoriteRoomTypes();
  const exists = currentItems.some((item) => String(item.roomTypeId) === String(roomType.roomTypeId));

  if (exists) {
    const nextItems = currentItems.filter(
      (item) => String(item.roomTypeId) !== String(roomType.roomTypeId),
    );
    saveFavoriteRoomTypes(nextItems);
    return { favorites: nextItems, isFavorite: false };
  }

  const nextItem = {
    roomTypeId: roomType.roomTypeId,
    roomTypeName: roomType.roomTypeName,
    basePrice: roomType.basePrice,
    capacityAdults: roomType.capacityAdults,
    capacityChildren: roomType.capacityChildren,
    bedType: roomType.bedType,
    size: roomType.size,
    imageUrl: roomType.imageUrls?.[0] || "",
    savedAt: new Date().toISOString(),
  };

  const nextItems = [nextItem, ...currentItems];
  saveFavoriteRoomTypes(nextItems);
  return { favorites: nextItems, isFavorite: true };
};

export const clearFavoriteRoomTypes = () => {
  saveFavoriteRoomTypes([]);
};
