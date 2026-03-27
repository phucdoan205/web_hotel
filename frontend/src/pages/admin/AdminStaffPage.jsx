import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ImageUp, RefreshCw, Search, X } from "lucide-react";
import StaffTable from "../../components/admin/staff/StaffTable";
import StaffWidgets from "../../components/admin/staff/StaffWidgets";
import { API_BASE_URL } from "../../api/client";
import {
  getStaffList,
  softDeleteStaff,
  updateStaff,
  uploadUserAvatar,
} from "../../api/admin/staffApi";
import { getAvatarPreview } from "../../utils/avatar";

const emptyForm = {
  fullName: "",
  email: "",
  avatarUrl: "",
  status: true,
};

const AdminStaffPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState("");
  const [editingStaff, setEditingStaff] = useState(null);
  const [deletingStaff, setDeletingStaff] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const loadStaffPageData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const staffList = await getStaffList(true);
      setStaff(staffList);
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
      avatarUrl: member.avatarUrl ?? "",
      status: member.status === true,
    });
  };

  const closeEditModal = () => {
    setEditingStaff(null);
    setFormData(emptyForm);
    setIsUploadingAvatar(false);
  };

  const openDeleteModal = (member) => {
    if (member.status !== true) {
      return;
    }

    setDeletingStaff(member);
  };

  const closeDeleteModal = () => {
    setDeletingStaff(null);
    setIsDeleting(false);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: name === "status" ? value === "true" : value,
    }));
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file || !editingStaff) {
      return;
    }

    setIsUploadingAvatar(true);
    setError("");

    try {
      const response = await uploadUserAvatar(editingStaff.id, file);
      const uploadedUrl = response?.url ?? "";

      setFormData((current) => ({
        ...current,
        avatarUrl: uploadedUrl,
      }));

      setStaff((current) =>
        current.map((member) =>
          member.id === editingStaff.id
            ? { ...member, avatarUrl: uploadedUrl }
            : member,
        ),
      );
    } catch (uploadError) {
      const message =
        uploadError.response?.data?.message ||
        uploadError.response?.data ||
        "Cannot upload avatar.";

      setError(typeof message === "string" ? message : "Cannot upload avatar.");
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = "";
    }
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
        avatarUrl: formData.avatarUrl || null,
        status: formData.status,
      };

      const response = await updateStaff(editingStaff.id, payload);

      setStaff((current) =>
        current.map((member) =>
          member.id === editingStaff.id ? response : member,
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

  const handleConfirmDelete = async () => {
    if (!deletingStaff) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      await softDeleteStaff(deletingStaff.id);

      setStaff((current) =>
        current.map((member) =>
          member.id === deletingStaff.id
            ? { ...member, status: false }
            : member,
        ),
      );

      closeDeleteModal();
    } catch (deleteError) {
      const message =
        deleteError.response?.data?.message ||
        deleteError.response?.data ||
        "Cannot soft delete this staff member.";

      setError(typeof message === "string" ? message : "Cannot soft delete this staff member.");
      setIsDeleting(false);
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
            Quan ly staff khach san.
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
          onDelete={openDeleteModal}
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
                  Update name, email, avatar and status.
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

            <form onSubmit={handleSaveEdit} className="p-6 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <img
                  src={getAvatarPreview({
                    fullName: formData.fullName,
                    avatarUrl: formData.avatarUrl,
                  })}
                  alt={formData.fullName}
                  className="size-24 rounded-full object-cover ring-4 ring-orange-50"
                />

                <label className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-all cursor-pointer">
                  <ImageUp className="size-4" />
                  {isUploadingAvatar ? "Uploading..." : "Upload New Avatar"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={isUploadingAvatar}
                  />
                </label>

                {formData.avatarUrl ? (
                  <p className="text-xs font-semibold text-gray-400 text-center break-all">
                    Cloudinary URL updated
                  </p>
                ) : null}
              </div>

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

                <label className="flex flex-col gap-2 md:col-span-2">
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
                  disabled={isSubmitting || isUploadingAvatar}
                  className="px-5 py-3 rounded-2xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deletingStaff ? (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-[2rem] bg-white shadow-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-6 border-b border-gray-100 flex items-start gap-4">
              <div className="shrink-0 size-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="size-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">Confirm Delete</h2>
                <p className="text-sm font-semibold text-gray-400 mt-1">
                  Ban co chac muon soft delete staff nay khong?
                </p>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-sm font-bold text-slate-800">
                  {deletingStaff.fullName}
                </p>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  {deletingStaff.email}
                </p>
              </div>
            </div>

            <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="px-5 py-3 rounded-2xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-3 rounded-2xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default AdminStaffPage;
