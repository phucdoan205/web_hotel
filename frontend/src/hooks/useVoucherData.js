import { useEffect, useMemo, useState } from "react";
import * as vouchersApi from "../api/receptionist/vouchers";

export const generateCode = (prefix = "VCHR") => {
  const r = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}-${r}`;
};

const normalizeVoucher = (voucher = {}) => ({
  id: voucher.id ?? voucher.Id ?? null,
  code: voucher.code ?? voucher.Code ?? "",
  discountType: voucher.discountType ?? voucher.DiscountType ?? "",
  discountValue: voucher.discountValue ?? voucher.DiscountValue ?? 0,
  minBookingValue: voucher.minBookingValue ?? voucher.MinBookingValue ?? null,
  validFrom: voucher.validFrom ?? voucher.ValidFrom ?? null,
  validTo: voucher.validTo ?? voucher.ValidTo ?? null,
  usageLimit: voucher.usageLimit ?? voucher.UsageLimit ?? null,
  usageCount: voucher.usageCount ?? voucher.UsageCount ?? 0,
  isPrivate: voucher.isPrivate ?? voucher.IsPrivate ?? false,
  isActive: voucher.isActive ?? voucher.IsActive ?? false,
  isDeleted: voucher.isDeleted ?? voucher.IsDeleted ?? false,
  deletedAt: voucher.deletedAt ?? voucher.DeletedAt ?? null,
});

export const useVoucherData = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetch = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await vouchersApi.listVouchers({ includeDeleted: true });
      const rawItems = Array.isArray(res.data) ? res.data : [];
      setVouchers(rawItems.map(normalizeVoucher));
    } catch (e) {
      console.error(e);
      setVouchers([]);
      setError(e?.response?.data?.message || e?.message || "Khong tai duoc danh sach voucher");
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

  const sendToUsers = async (payload) => vouchersApi.sendVoucherToUsers(payload);
  const sendToBirthdays = async (payload) => vouchersApi.sendVoucherToBirthdays(payload);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const now = new Date();
    const result = vouchers.filter((voucher) => {
      const matchesSearch =
        !q ||
        String(voucher.code ?? "").toLowerCase().includes(q) ||
        String(voucher.discountValue ?? "").toLowerCase().includes(q) ||
        String(voucher.discountType ?? "").toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (activeTab === "Active") {
        return !voucher.isDeleted && voucher.isActive;
      }

      if (activeTab === "Deactive") {
        return !voucher.isDeleted && !voucher.isActive;
      }

      if (activeTab === "Expired") {
        return !voucher.isDeleted && !!voucher.validTo && new Date(voucher.validTo) < now;
      }

      if (activeTab === "Deleted") {
        return voucher.isDeleted === true;
      }

      if (activeTab === "Private") {
        return !voucher.isDeleted && voucher.isPrivate === true;
      }

      if (activeTab === "Public") {
        return !voucher.isDeleted && !voucher.isPrivate;
      }

      return true;
    });

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
    error,
    create,
    update,
    remove,
    sendToUsers,
    sendToBirthdays,
    generateCode,
  };
};

export default useVoucherData;
