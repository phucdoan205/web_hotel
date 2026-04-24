import React, { useEffect, useState } from "react";
import FavoriteCard from "../../components/user/favorites/FavoriteCard";
import { getFavoriteRoomTypes, saveFavoriteRoomTypes } from "../../utils/userFavorites";

const UserFavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    setFavorites(getFavoriteRoomTypes());
  }, []);

  const handleRemove = (roomTypeId) => {
    const nextItems = getFavoriteRoomTypes().filter(
      (item) => String(item.roomTypeId) !== String(roomTypeId),
    );
    saveFavoriteRoomTypes(nextItems);
    setFavorites(nextItems);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-black text-gray-900">Yêu thích</h1>
          <p className="text-[13px] font-bold text-gray-400">
            Bạn đang lưu <span className="text-[#0085FF]">{favorites.length}</span> loại phòng yêu thích
          </p>
        </div>
      </div>

      {favorites.length ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite) => (
            <FavoriteCard
              key={favorite.roomTypeId}
              favorite={favorite}
              onRemove={() => handleRemove(favorite.roomTypeId)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] bg-white px-6 py-16 text-center shadow-sm ring-1 ring-gray-100">
          <h2 className="text-2xl font-black text-slate-900">Chưa có loại phòng yêu thích</h2>
          <p className="mt-3 text-sm font-medium text-slate-500">
            Bấm vào biểu tượng trái tim ở trang chi tiết loại phòng để lưu vào đây.
          </p>
        </div>
      )}
    </div>
  );
};

export default UserFavoritesPage;
