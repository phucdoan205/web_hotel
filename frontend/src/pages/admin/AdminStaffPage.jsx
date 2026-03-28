import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import { ImageUp, RefreshCw, Search, UserPlus, X } from "lucide-react";
import StaffTable from "../../components/admin/staff/StaffTable";
import StaffWidgets from "../../components/admin/staff/StaffWidgets";
import { API_BASE_URL } from "../../api/client";
import {
  createStaff,
  getStaffById,
  getStaffList,
  updateStaff,
  uploadUserAvatar,
} from "../../api/admin/staffApi";
import { getRoles } from "../../api/admin/roleApi";
import { getAvatarPreview } from "../../utils/avatar";

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  avatarUrl: "",
  dateOfBirth: "",
  roleId: "",
  password: "",
};

const STAFF_ROLE_IDS = [1, 4, 5];

const formatDateForInput = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(normalizedValue)) {
      return normalizedValue.slice(0, 10);
    }
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
};

const AdminStaffPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isLoadingEditDetail, setIsLoadingEditDetail] = useState(false);
  const [error, setError] = useState("");
  const [editingStaff, setEditingStaff] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [pendingAvatarFile, setPendingAvatarFile] = useState(null);
  const [pendingAvatarPreview, setPendingAvatarPreview] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const isCreateMode = modalMode === "create";
  const isEditMode = modalMode === "edit";

  const loadStaffPageData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [staffList, allRoles] = await Promise.all([
        getStaffList(true),
        getRoles(),
      ]);

      setStaff(staffList);
      setRoles(
        allRoles.filter((role) => STAFF_ROLE_IDS.includes(Number(role.id))),
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

  const openEditModal = async (member) => {
    setError("");
    setModalMode("edit");
    setEditingStaff(member);
    setIsLoadingEditDetail(true);
    setFormData({
      fullName: member.fullName ?? "",
      email: member.email ?? "",
      phone: member.phone ?? "",
      avatarUrl: member.avatarUrl ?? "",
      dateOfBirth: formatDateForInput(member.dateOfBirth),
      roleId: member.roleId ? String(member.roleId) : "",
      password: "",
    });

    try {
      const staffDetail = await getStaffById(member.id);

      setEditingStaff(staffDetail);
      setFormData({
        fullName: staffDetail.fullName ?? "",
        email: staffDetail.email ?? "",
        phone: staffDetail.phone ?? "",
        avatarUrl: staffDetail.avatarUrl ?? "",
        dateOfBirth: formatDateForInput(staffDetail.dateOfBirth),
        roleId: staffDetail.roleId ? String(staffDetail.roleId) : "",
        password: "",
      });
    } catch (fetchDetailError) {
      // Keep the modal usable with row data if detail endpoint is unavailable.
    } finally {
      setIsLoadingEditDetail(false);
    }
  };

  const closeEditModal = () => {
    if (pendingAvatarPreview) {
      URL.revokeObjectURL(pendingAvatarPreview);
    }

    setEditingStaff(null);
    setModalMode(null);
    setFormData(emptyForm);
    setIsUploadingAvatar(false);
    setIsLoadingEditDetail(false);
    setPendingAvatarFile(null);
    setPendingAvatarPreview("");
  };

  const openCreateModal = () => {
    setError("");
    setEditingStaff(null);
    setModalMode("create");
    setIsUploadingAvatar(false);
    setIsLoadingEditDetail(false);
    setFormData(emptyForm);
    setPendingAvatarFile(null);
    setPendingAvatarPreview("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file || !editingStaff || !isEditMode) {
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

  const handleCreateAvatarSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (pendingAvatarPreview) {
      URL.revokeObjectURL(pendingAvatarPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setPendingAvatarFile(file);
    setPendingAvatarPreview(previewUrl);
    event.target.value = "";
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();

    if (!isCreateMode && !editingStaff) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        avatarUrl: formData.avatarUrl || null,
        dateOfBirth: formData.dateOfBirth || null,
        roleId: formData.roleId ? Number(formData.roleId) : null,
      };

      if (formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      if (isCreateMode) {
        if (!payload.password) {
          setError("Password is required to create a staff account.");
          setIsSubmitting(false);
          return;
        }

        const response = await createStaff(payload);
        let avatarUrl = response.avatarUrl ?? null;

        if (pendingAvatarFile) {
          const uploadResponse = await uploadUserAvatar(response.id, pendingAvatarFile);
          avatarUrl = uploadResponse?.url ?? avatarUrl;
        }

        const selectedRole = roleOptions.find(
          (role) => String(role.id) === formData.roleId,
        );

        setStaff((current) => [
          {
            ...response,
            avatarUrl,
            roleName: response.roleName ?? selectedRole?.name ?? null,
            phone: response.phone ?? payload.phone,
          },
          ...current,
        ]);
        closeEditModal();
        return;
      }

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

  const handleToggleStatus = async (member) => {
    if (statusUpdatingId === member.id) {
      return;
    }

    setError("");
    setStatusUpdatingId(member.id);
    const nextStatus = member.status !== true;

    setStaff((current) =>
      current.map((staffMember) =>
        staffMember.id === member.id
          ? { ...staffMember, status: nextStatus }
          : staffMember,
      ),
    );

    try {
      const response = await updateStaff(member.id, {
        status: nextStatus,
      });

      setStaff((current) =>
        current.map((staffMember) =>
          staffMember.id === member.id ? response : staffMember,
        ),
      );
    } catch (statusError) {
      const message =
        statusError.response?.data?.message ||
        statusError.response?.data ||
        "Cannot update staff status.";

      setStaff((current) =>
        current.map((staffMember) =>
          staffMember.id === member.id
            ? { ...staffMember, status: member.status }
            : staffMember,
        ),
      );

      setError(
        typeof message === "string" ? message : "Cannot update staff status.",
      );
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const roleOptions = roles.length
    ? roles
    : STAFF_ROLE_IDS.map((roleId) => ({
        id: roleId,
        name:
          roleId === 1
            ? "Admin"
            : roleId === 4
              ? "HouseKeeping"
              : "Receptionist",
      }));

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
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openCreateModal}
              className="flex items-center gap-2 px-6 py-3 bg-sky-600 rounded-2xl text-sm font-bold text-white hover:bg-sky-700 transition-all shadow-lg shadow-sky-100"
            >
              <UserPlus className="size-5" />
              Add Staff Account
            </button>
            <button
              type="button"
              onClick={loadStaffPageData}
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 rounded-2xl text-sm font-bold text-white hover:bg-orange-700 transition-all shadow-lg shadow-orange-100"
            >
              <RefreshCw className="size-5" />
              Refresh List
            </button>
          </div>
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
          statusUpdatingId={statusUpdatingId}
          onEdit={openEditModal}
          onToggleStatus={handleToggleStatus}
        />

        <StaffWidgets
          totalCount={staff.length}
          activeCount={activeCount}
          deletedCount={deletedCount}
        />
      </div>

      {modalMode ? (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-[2rem] bg-white shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  {isCreateMode ? "Add Staff Account" : "Edit Staff"}
                </h2>
                <p className="text-sm font-semibold text-gray-400 mt-1">
                  {isCreateMode
                    ? "Create a new staff account for admin, housekeeping or receptionist."
                    : "Update staff profile, avatar, role and date of birth."}
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
              {isEditMode && isLoadingEditDetail ? (
                <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-600">
                  Loading staff detail...
                </div>
              ) : null}

              <div className="flex flex-col items-center gap-4">
                <img
                  src={getAvatarPreview({
                    fullName: formData.fullName,
                    avatarUrl: isCreateMode
                      ? pendingAvatarPreview || formData.avatarUrl
                      : formData.avatarUrl,
                  })}
                  alt={formData.fullName}
                  className="size-24 rounded-full object-cover ring-4 ring-orange-50"
                />

                {isEditMode ? (
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
                ) : isCreateMode ? (
                  <label className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-all cursor-pointer">
                    <ImageUp className="size-4" />
                    Choose Avatar
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCreateAvatarSelect}
                      className="hidden"
                    />
                  </label>
                ) : null}

                {formData.avatarUrl || pendingAvatarPreview ? (
                  <p className="text-xs font-semibold text-gray-400 text-center break-all">
                    {isEditMode ? "Cloudinary URL updated" : "Avatar preview ready"}
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

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-gray-700">Phone</span>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className="rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-gray-700">Date of Birth</span>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleFormChange}
                    className="rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-gray-700">Role</span>
                  <select
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleFormChange}
                    className="rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                  >
                    <option value="">Select role</option>
                    {roleOptions.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2 md:col-span-2">
                  <span className="text-sm font-bold text-gray-700">
                    {isCreateMode ? "Password" : "New Password"}
                  </span>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    required={isCreateMode}
                    placeholder={
                      isCreateMode
                        ? "Enter initial password"
                        : "Leave blank to keep current password"
                    }
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
                  disabled={isSubmitting || isUploadingAvatar}
                  className="px-5 py-3 rounded-2xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? "Saving..."
                    : isCreateMode
                      ? "Create Account"
                      : "Save Changes"}
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
