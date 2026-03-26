import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const useSearchNavigation = () => {
  const navigate = useNavigate();

  // Quản lý state của form tìm kiếm
  const [searchParams, setSearchParams] = useState({
    destination: "",
    dates: "",
    guests: "2 khách, 1 phòng",
  });

  // Hàm cập nhật field bất kỳ
  const updateField = (field, value) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Hàm xử lý khi nhấn nút Search
  const handleSearch = () => {
    // Trong thực tế, bạn có thể xử lý validation ở đây
    if (!searchParams.destination) {
      alert("Vui lòng nhập điểm đến!");
      return;
    }

    // Chuyển hướng sang trang /hotels kèm theo dữ liệu (state)
    // Hoặc bạn có thể dùng URL Search Params: /hotels?city=DaNang
    navigate("/hotels", { state: searchParams });
  };

  return {
    searchParams,
    updateField,
    handleSearch,
  };
};
