import { useEffect, useMemo, useState } from "react";
import * as vouchersApi from "../api/receptionist/vouchers";

export const generateCode = (prefix = "VCHR") => {
  const r = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}-${r}`;
};

export const useVoucherData = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await vouchersApi.listVouchers({ includeDeleted: true });
      setVouchers(res.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const create = async (payload) => {
    const res = await vouchersApi.createVoucher(payload);
    await fetch();
    return res;
  };

  const update = async (id, payload) => {
    const res = await vouchersApi.updateVoucher(id, payload);
    await fetch();
    return res;
  };

  const remove = async (id) => {
    const res = await vouchersApi.toggleActiveVoucher(id);
    await fetch();
    return res;
  };

  const sendToUsers = async (payload) => {
    return vouchersApi.sendVoucherToUsers(payload);
  };

  const sendToBirthdays = async (payload) => {
    return vouchersApi.sendVoucherToBirthdays(payload);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = vouchers.filter((v) => {
      if (q) {
        return (
          String(v.code).toLowerCase().includes(q) ||
          String(v.discountValue).toLowerCase().includes(q) ||
          String(v.discountType).toLowerCase().includes(q)
        );
      }

      if (activeTab === "Active") {
        return !v.isDeleted && v.isActive && new Date(v.validFrom) <= new Date() && new Date(v.validTo) >= new Date();
      }

      if (activeTab === "Expired") {
        return !v.isDeleted && v.isActive && new Date(v.validTo) < new Date();
      }

      if (activeTab === "Deleted") {
        return v.isDeleted === true;
      }

      if (activeTab === "Private") {
        return v.isPrivate === true;
      }

      if (activeTab === "Public") {
        return !v.isPrivate;
      }

      return true;
    });

    // sort newest created (higher id) first
    result.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    return result;
  }, [vouchers, search, activeTab]);

  return {
    search,
    setSearch,
    activeTab,
    setActiveTab,
    vouchers,
    filteredVouchers: filtered,
    loading,
    create,
    update,
    remove,
    sendToUsers,
    sendToBirthdays,
    generateCode,
  };
};

export default useVoucherData;
