import { useState } from "react";
import { useNavigate } from "react-router-dom";

const DEFAULT_CHECK_IN_HOUR = 14;
const DEFAULT_CHECK_OUT_HOUR = 12;

const createDefaultDateTime = (offsetDays, hour) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hour, 0, 0, 0);
  return date;
};

const toDateTimeInputValue = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

export const useSearchNavigation = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    destination: "",
    checkIn: toDateTimeInputValue(createDefaultDateTime(0, DEFAULT_CHECK_IN_HOUR)),
    checkOut: toDateTimeInputValue(createDefaultDateTime(1, DEFAULT_CHECK_OUT_HOUR)),
    adults: 2,
    children: 0,
  });

  const updateField = (field, value) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    navigate("/booking", { state: searchParams });
  };

  return {
    searchParams,
    updateField,
    handleSearch,
  };
};
