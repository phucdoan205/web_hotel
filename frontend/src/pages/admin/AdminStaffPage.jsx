import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { RefreshCw, Search, X } from "lucide-react";
import StaffTable from "../../components/admin/staff/StaffTable";
import StaffWidgets from "../../components/admin/staff/StaffWidgets";

const STAFF_ROLE_IDS = [1, 4, 5];
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5291/api";

const emptyForm = {
  fullName: "",
  email: "",
  roleId: "",
  avatarUrl: "",
  status: true,
};

const AdminStaffPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const loadStaffPageData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [staffResponse, rolesResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/UserManagement/staff`, {
          params: { includeInactive: true },
        }),
        axios.get(`${API_BASE_URL}/Roles`),
      ]);

      setStaff(staffResponse.data ?? []);
      setRoles(
        (rolesResponse.data ?? []).filter((role) => STAFF_ROLE_IDS.includes(role.id)),
      );
    } catch (fetchError) {
      const responseMessage =
        fetchError.response?.data?.message || fetchError.response?.data;
      const message =
        typeof responseMessage === "string" && responseMessage.trim()
          ? responseMessage
          : fetchError.message === "Network Error"
            ? `Cannot load staff data from backend. Check backend is running at ${API_BASE_URL}.`
            : "Cannot load staff data from backend.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStaffPageData();
  }, []);

  const filteredStaff = useMemo(() => {
    const normalizedKeyword = deferredSearchTerm.trim().toLowerCase();

    if (!normalizedKeyword) {
      return staff;
    }

    return staff.filter((member) =>
      [member.id, member.fullName, member.email, member.roleName]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(normalizedKeyword),
        ),
    );
  }, [deferredSearchTerm, staff]);

  const activeCount = staff.filter((member) => member.status === true).length;
  const deletedCount = staff.filter((member) => member.status !== true).length;

  const openEditModal = (member) => {
    setEditingStaff(member);
    setFormData({
      fullName: member.fullName ?? "",
      email: member.email ?? "",
      roleId: member.roleId ? String(member.roleId) : "",
      avatarUrl: member.avatarUrl ?? "",
      status: member.status === true,
    });
  };

  const closeEditModal = () => {
    setEditingStaff(null);
    setFormData(emptyForm);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: name === "status" ? value === "true" : value,
    }));
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();

    if (!editingStaff) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        roleId: formData.roleId ? Number(formData.roleId) : null,
        avatarUrl: formData.avatarUrl.trim() || null,
        status: formData.status,
      };

      const response = await axios.put(
        `${API_BASE_URL}/UserManagement/${editingStaff.id}`,
        payload,
      );

      setStaff((current) =>
        current.map((member) =>
          member.id === editingStaff.id ? response.data : member,
        ),
      );
      closeEditModal();
    } catch (submitError) {
      const message =
        submitError.response?.data?.message ||
        submitError.response?.data ||
        "Cannot update this staff member.";

      setError(typeof message === "string" ? message : "Cannot update this staff member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSoftDelete = async (member) => {
    if (member.status !== true) {
      return;
    }

    const confirmed = window.confirm(
      `Soft delete staff "${member.fullName}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/UserManagement/${member.id}`);

      setStaff((current) =>
        current.map((staffMember) =>
          staffMember.id === member.id
            ? { ...staffMember, status: false }
            : staffMember,
        ),
      );
    } catch (deleteError) {
      const message =
        deleteError.response?.data?.message ||
        deleteError.response?.data ||
        "Cannot soft delete this staff member.";

      setError(typeof message === "string" ? message : "Cannot soft delete this staff member.");
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="relative max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-300" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by id, name, email or role..."
                className="w-full pl-11 pr-4 py-3 bg-gray-100/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-100 outline-none transition-all"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={loadStaffPageData}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 rounded-2xl text-sm font-bold text-white hover:bg-orange-700 transition-all shadow-lg shadow-orange-100"
          >
            <RefreshCw className="size-5" />
            Refresh List
          </button>
        </div>

        <div className="mt-8">
          <h1 className="text-3xl font-black text-gray-900">Staff Management</h1>
          <p className="text-sm font-bold text-gray-400 mt-1">
            Quản lý staff.
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-600">
            {error}
          </div>
        ) : null}

        <StaffTable
          staff={filteredStaff}
          isLoading={isLoading}
          error={error && staff.length === 0 ? error : ""}
          onEdit={openEditModal}
          onDelete={handleSoftDelete}
        />

        <StaffWidgets
          totalCount={staff.length}
          activeCount={activeCount}
          deletedCount={deletedCount}
        />
      </div>

      {editingStaff ? (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-[2rem] bg-white shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-black text-gray-900">Edit Staff</h2>
                <p className="text-sm font-semibold text-gray-400 mt-1">
                  Update staff information and role assignment.
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-gray-700">Full Name</span>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleFormChange}
                    required
                    className="rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-gray-700">Email</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    className="rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-gray-700">Role</span>
                  <select
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleFormChange}
                    required
                    className="rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                  >
                    <option value="">Select role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-gray-700">Status</span>
                  <select
                    name="status"
                    value={String(formData.status)}
                    onChange={handleFormChange}
                    className="rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                  >
                    <option value="true">Active</option>
                    <option value="false">Deleted</option>
                  </select>
                </label>

                <label className="md:col-span-2 flex flex-col gap-2">
                  <span className="text-sm font-bold text-gray-700">Avatar URL</span>
                  <input
                    name="avatarUrl"
                    value={formData.avatarUrl}
                    onChange={handleFormChange}
                    placeholder="https://..."
                    className="rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-5 py-3 rounded-2xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-3 rounded-2xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default AdminStaffPage;
