import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const useSearchNavigation = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    destination: "",
    dates: "",
    guests: "2 khách, 1 phòng",
  });

  const updateField = (field, value) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    if (!searchParams.destination.trim()) {
      alert("Vui lòng nhập điểm đến!");
      return;
    }

    navigate("/hotels/search", { state: searchParams });
  };

  return {
    searchParams,
    updateField,
    handleSearch,
  };
};
