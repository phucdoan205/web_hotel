import { useState, useMemo } from "react";
import { MOCK_GUESTS } from "../constants/GuestMockData";

export const useGuestData = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Guests");

  // Logic lọc dữ liệu
  const filteredGuests = useMemo(() => {
    return MOCK_GUESTS.filter((guest) => {
      const matchesSearch =
        guest.name.toLowerCase().includes(search.toLowerCase()) ||
        guest.id.includes(search) ||
        guest.phone.includes(search);

      const matchesTab =
        activeTab === "All Guests" || guest.status === activeTab.toUpperCase();

      return matchesSearch && matchesTab;
    });
  }, [search, activeTab]);

  return {
    search,
    setSearch,
    activeTab,
    setActiveTab,
    filteredGuests,
    totalEntries: MOCK_GUESTS.length,
  };
};
