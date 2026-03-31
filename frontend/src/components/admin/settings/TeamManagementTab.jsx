import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Edit2, Mail, Search, X } from "lucide-react";
import StaffWidgets from "../staff/StaffWidgets";
import { getRoles } from "../../../api/admin/roleApi";
import { changeStaffRole, getStaffList } from "../../../api/admin/staffApi";
import { getAvatarPreview } from "../../../utils/avatar";

const STAFF_ROLE_IDS = [1, 4, 5];

const roleStyles = {
  1: "bg-amber-50 text-amber-700",
  4: "bg-emerald-50 text-emerald-700",
  5: "bg-blue-50 text-blue-600",
};

const roleLabels = {
  1: "Admin",
  4: "HouseKeeping",
  5: "Receptionist",
};

const TeamManagementTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [editingStaff, setEditingStaff] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const loadData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [staffList, rolesList] = await Promise.all([
        getStaffList(true),
        getRoles(),
      ]);

      setStaff(staffList);
      setRoles(
        rolesList.filter((role) => STAFF_ROLE_IDS.includes(role.id)),
      );
    } catch (fetchError) {
      const responseMessage =
        fetchError.response?.data?.message || fetchError.response?.data;
      const message =
        typeof responseMessage === "string" && responseMessage.trim()
          ? responseMessage
          : "Cannot load team management data.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredStaff = useMemo(() => {
    const normalizedKeyword = deferredSearchTerm.trim().toLowerCase();

    return staff.filter((member) => {
      const matchesKeyword =
        !normalizedKeyword ||
        [member.id, member.fullName, member.email, member.roleName]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(normalizedKeyword),
          );

      const isActive = member.status === true;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isActive) ||
        (statusFilter === "deleted" && !isActive);

      return matchesKeyword && matchesStatus;
    });
  }, [deferredSearchTerm, staff, statusFilter]);

  const activeCount = staff.filter((member) => member.status === true).length;
  const deletedCount = staff.filter((member) => member.status !== true).length;

  const openRoleModal = (member) => {
    setEditingStaff(member);
    setSelectedRoleId(member.roleId ? String(member.roleId) : "");
  };

  const closeRoleModal = () => {
    setEditingStaff(null);
    setSelectedRoleId("");
  };

  const handleSaveRole = async (event) => {
    event.preventDefault();

    if (!editingStaff || !selectedRoleId) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await changeStaffRole(editingStaff.id, Number(selectedRoleId));

      const selectedRole = roles.find((role) => role.id === Number(selectedRoleId));

      setStaff((current) =>
        current.map((member) =>
          member.id === editingStaff.id
            ? {
                ...member,
                roleId: Number(selectedRoleId),
                roleName: selectedRole?.name ?? member.roleName,
              }
            : member,
        ),
      );

      closeRoleModal();
    } catch (submitError) {
      const message =
        submitError.response?.data?.message ||
        submitError.response?.data ||
        "Cannot update role.";

      setError(typeof message === "string" ? message : "Cannot update role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {error ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-600">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search staff members..."
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-blue-100 transition-all"
          />
        </div>
      </div>

      <StaffWidgets
        totalCount={staff.length}
        activeCount={activeCount}
        deletedCount={deletedCount}
      />

      <div className="flex items-center gap-6 border-b border-gray-100">
        {[
          { id: "all", label: "All Staff" },
          { id: "active", label: "Active" },
          { id: "deleted", label: "Deleted" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setStatusFilter(item.id)}
            className={`pb-4 text-[11px] font-black uppercase tracking-[0.15em] transition-all relative ${
              statusFilter === item.id
                ? "text-[#ff5e1f]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {item.label}
            {statusFilter === item.id ? (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#ff5e1f]" />
            ) : null}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[760px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Name
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Role
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-10 text-center text-sm font-semibold text-gray-400"
                  >
                    Loading team members...
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-10 text-center text-sm font-semibold text-gray-400"
                  >
                    No staff found.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staffMember) => {
                  const isActive = staffMember.status === true;
                  const roleLabel =
                    roleLabels[staffMember.roleId] ??
                    staffMember.roleName ??
                    "No Role";

                  return (
                    <tr
                      key={staffMember.id}
                      className="hover:bg-gray-50/30 transition-colors"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={getAvatarPreview(staffMember)}
                            alt={staffMember.fullName}
                            className="size-11 rounded-2xl object-cover shadow-sm"
                          />
                          <div>
                            <h4 className="text-sm font-black text-gray-900">
                              {staffMember.fullName}
                            </h4>
                            <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
                              <Mail className="size-3" /> {staffMember.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black ${
                            roleStyles[staffMember.roleId] ??
                            "bg-gray-50 text-gray-500"
                          }`}
                        >
                          {roleLabel}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div
                            className={`size-2 rounded-full ${
                              isActive ? "bg-emerald-500" : "bg-rose-400"
                            }`}
                          />
                          <span
                            className={`text-[11px] font-black uppercase ${
                              isActive ? "text-emerald-600" : "text-rose-500"
                            }`}
                          >
                            {isActive ? "Active" : "Deleted"}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          type="button"
                          onClick={() => openRoleModal(staffMember)}
                          className="p-2 text-gray-400 hover:text-[#ff5e1f] hover:bg-orange-50 rounded-xl transition-all"
                        >
                          <Edit2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-6 bg-gray-50/30 border-t border-gray-50">
          <p className="text-[11px] font-bold text-gray-400">
            Showing {filteredStaff.length} staff members
          </p>
        </div>
      </div>

      {editingStaff ? (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-[2rem] bg-white shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-black text-gray-900">Update Role</h2>
                <p className="text-sm font-semibold text-gray-400 mt-1">
                  Change role for this staff member only.
                </p>
              </div>
              <button
                type="button"
                onClick={closeRoleModal}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="p-6 space-y-5">
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 flex items-center gap-4">
                <img
                  src={getAvatarPreview(editingStaff)}
                  alt={editingStaff.fullName}
                  className="size-12 rounded-2xl object-cover"
                />
                <div>
                  <p className="text-sm font-black text-gray-900">
                    {editingStaff.fullName}
                  </p>
                  <p className="text-xs font-semibold text-gray-400">
                    {editingStaff.email}
                  </p>
                </div>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-bold text-gray-700">Role</span>
                <select
                  value={selectedRoleId}
                  onChange={(event) => setSelectedRoleId(event.target.value)}
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

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeRoleModal}
                  className="px-5 py-3 rounded-2xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedRoleId}
                  className="px-5 py-3 rounded-2xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Save Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TeamManagementTab;
