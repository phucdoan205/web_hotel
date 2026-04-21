import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Save, Search, ShieldCheck, X } from "lucide-react";
import {
  assignRolePermissions,
  createRole,
  getPermissions,
  getRolePermissions,
  getRoles,
  shouldHideRoleFromAdminSettings,
  deleteRole,
  updateRole,
} from "../../../api/admin/roleApi";
import { createDefaultRole } from "../../../utils/roleHelpers";
import { buildPermissionSidebar } from "../../../utils/permissionCatalog";
import { hasPermission } from "../../../utils/permissions";

const readMessage = (error, fallbackMessage) => {
  const responseMessage = error.response?.data?.message || error.response?.data;

  if (typeof responseMessage === "string" && responseMessage.trim()) {
    return responseMessage;
  }

  return fallbackMessage;
};

const RolePermissionEditor = () => {
  const navigate = useNavigate();
  const { roleId } = useParams();
  const isCreatingRole = roleId === "new";

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedSidebarId, setSelectedSidebarId] = useState(null);
  const [permissionSearchKeyword, setPermissionSearchKeyword] = useState("");
  const [message, setMessage] = useState("");
  const [roleForm, setRoleForm] = useState({ name: "", description: "" });
  const [selectedPermissionIds, setSelectedPermissionIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingNewRole, setIsCreatingNewRole] = useState(false);
  const canCreateRoles = hasPermission("CREATE_ROLES");
  const canEditRoles = hasPermission("EDIT_ROLES");
  const canDeleteRoles = hasPermission("DELETE_ROLES");
  const [inUseModal, setInUseModal] = useState({ open: false, roleName: "", message: "" });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, roleId: null, roleName: "" });

  const permissionSidebar = useMemo(() => buildPermissionSidebar(permissions), [permissions]);
  const visibleRoles = useMemo(
    () => roles.filter((role) => !shouldHideRoleFromAdminSettings(role)),
    [roles],
  );

  const selectedSidebarGroup =
    permissionSidebar.find((group) => group.id === selectedSidebarId) ??
    permissionSidebar[0] ??
    null;

  const allPermissionIds = useMemo(
    () => permissions.map((permission) => permission.id),
    [permissions],
  );

  const isAllEnabled =
    allPermissionIds.length > 0 && selectedPermissionIds.size === allPermissionIds.length;

  const filteredSections = useMemo(() => {
    if (!selectedSidebarGroup) {
      return [];
    }

    const normalizedKeyword = permissionSearchKeyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      return selectedSidebarGroup.sections;
    }

    return selectedSidebarGroup.sections
      .map((section) => ({
        ...section,
        permissions: section.permissions.filter((permission) =>
          [permission.displayName, permission.description, permission.name]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(normalizedKeyword)),
        ),
      }))
      .filter((section) => section.permissions.length > 0);
  }, [permissionSearchKeyword, selectedSidebarGroup]);

  useEffect(() => {
    if (!isCreatingRole) {
      return;
    }

    setMessage("");
    setRoleForm({ name: "", description: "" });
    setSelectedPermissionIds(new Set());
    setPermissionSearchKeyword("");
  }, [isCreatingRole]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setMessage("");

      try {
        const [rolesResponse, permissionsResponse] = await Promise.all([
          getRoles(),
          getPermissions(),
        ]);

        if (!isMounted) {
          return;
        }

        setRoles(rolesResponse);
        setPermissions(permissionsResponse);

        if (isCreatingRole) {
          setRoleForm({ name: "", description: "" });
          setSelectedPermissionIds(new Set());
          setPermissionSearchKeyword("");
          return;
        }

        const roleResponse = await getRolePermissions(roleId);

        if (!isMounted) {
          return;
        }

        setRoleForm({
          name: roleResponse.roleName ?? "",
          description: roleResponse.description ?? "",
        });
        setSelectedPermissionIds(new Set(roleResponse.permissionIds ?? []));
      } catch (error) {
        if (isMounted) {
          setMessage(readMessage(error, "Không thể tải thông tin vai trò."));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isCreatingRole, roleId]);

  useEffect(() => {
    if (!selectedSidebarId && permissionSidebar[0]) {
      setSelectedSidebarId(permissionSidebar[0].id);
    }
  }, [permissionSidebar, selectedSidebarId]);

  const handleRoleFieldChange = (event) => {
    const { name, value } = event.target;
    setRoleForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const toggleSectionPermission = (section, permission) => {
    if (isCreatingRole) {
      return;
    }

    setSelectedPermissionIds((current) => {
      const next = new Set(current);
      const isEnabled = next.has(permission.id);

      if (section.viewPermissionName === permission.name) {
        if (isEnabled) {
          section.permissions.forEach((sectionPermission) => {
            next.delete(sectionPermission.id);
          });
        } else {
          next.add(permission.id);
        }

        return next;
      }

      if (isEnabled) {
        next.delete(permission.id);
        return next;
      }

      next.add(permission.id);

      if (section.viewPermissionName) {
        const viewPermission = section.permissions.find(
          (sectionPermission) => sectionPermission.name === section.viewPermissionName,
        );

        if (viewPermission) {
          next.add(viewPermission.id);
        }
      }

      return next;
    });
  };

  const clearSectionPermissions = (section) => {
    if (isCreatingRole) {
      return;
    }
    setSelectedPermissionIds((current) => {
      const next = new Set(current);
      section.permissions.forEach((permission) => {
        next.delete(permission.id);
      });
      return next;
    });
  };

  const handleToggleAll = () => {
    if (isCreatingRole) {
      return;
    }

    setSelectedPermissionIds(isAllEnabled ? new Set() : new Set(allPermissionIds));
  };

  const handleSave = async () => {
    const normalizedName = roleForm.name.trim();

    if (!normalizedName) {
      setMessage("Tên vai trò không được để trống.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      if (isCreatingRole) {
        const createdRole = await createRole({
          name: normalizedName,
          description: roleForm.description.trim(),
        });

        navigate(`/admin/settings/roles/${createdRole.id}`, { replace: true });
        return;
      }

      await Promise.all([
        updateRole(roleId, {
          name: normalizedName,
          description: roleForm.description.trim(),
        }),
        assignRolePermissions({
          roleId: Number(roleId),
          permissionIds: [...selectedPermissionIds],
        }),
      ]);

      setMessage("Đã lưu thay đổi vai trò.");
    } catch (error) {
      setMessage(readMessage(error, ""));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewRole = async () => {
    if (!canCreateRoles) return;

    setIsCreatingNewRole(true);
    setMessage("");

    try {
      const createdRole = await createDefaultRole();
      navigate(`/admin/settings/roles/${createdRole.id}`);
      return;
    } catch (error) {
      setMessage(readMessage(error, "Không thể tạo vai trò mới."));
    } finally {
      setIsCreatingNewRole(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-xl shadow-sky-100/60">
      <div className="grid min-h-[780px] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-sky-100 bg-sky-50/70 p-5 lg:border-b-0 lg:border-r">
          <button
            type="button"
            onClick={() => navigate("/admin/settings?settingsTab=team-management")}
            className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-black text-sky-700 transition hover:bg-white"
          >
            <ArrowLeft className="size-4" />
            Trở về
          </button>

          {canCreateRoles ? (
            <button
              type="button"
              onClick={handleCreateNewRole}
              disabled={isCreatingNewRole}
              className={`mt-3 flex w-full items-center gap-2 rounded-2xl border px-4 py-3 text-left text-sm font-black transition ${
                isCreatingRole
                  ? "border-sky-600 bg-sky-600 text-white shadow-lg shadow-sky-100"
                  : "border-sky-100 bg-white text-sky-700 hover:bg-sky-100"
              }`}
            >
              <Plus className="size-4" />
              {isCreatingNewRole ? "Đang tạo..." : "Tạo vai trò"}
            </button>
          ) : null}

          <div className="mt-8 space-y-2">
              {visibleRoles.map((role) => {
                const isActive = !isCreatingRole && String(role.id) === String(roleId);

                return (
                  <div key={role.id} className="flex items-center gap-3">
                    <div
                      className={`flex-1 flex items-center gap-3 rounded-2xl px-4 h-12 text-left transition ${
                        isActive
                          ? "bg-sky-600 text-white shadow-lg shadow-sky-100"
                          : "bg-white text-slate-600 hover:bg-sky-100 hover:text-sky-700"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (!canEditRoles) return;
                          navigate(`/admin/settings/roles/${role.id}`);
                        }}
                        disabled={!canEditRoles}
                        className="flex-1 flex items-center gap-3 text-left bg-transparent disabled:cursor-not-allowed disabled:opacity-40"
                        title={canEditRoles ? "Chỉnh sửa vai trò" : "Bạn không có quyền sửa vai trò"}
                      >
                        <span className={`size-2.5 rounded-full ${isActive ? "bg-white" : "bg-sky-400"}`} />
                        <span className="truncate text-sm font-bold">{role.name}</span>
                      </button>

                      {canDeleteRoles && isActive ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete({ open: true, roleId: role.id, roleName: role.name });
                          }}
                          aria-label={`Xóa vai trò ${role.name}`}
                          className={`ml-3 transition ${isActive ? "text-white hover:text-rose-200" : "text-slate-500 hover:text-slate-700"}`}
                          title="Xóa vai trò"
                        >
                          <X className="size-4" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}

            {isCreatingRole ? (
              <div className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-sky-300 bg-white px-4 h-12 text-slate-600">
                <span className="size-2.5 rounded-full bg-sky-400" />
                <span className="truncate text-sm font-bold">Vai trò mới</span>
              </div>
            ) : null}
          </div>
        </aside>

        <section className="bg-white">
          <div className="border-b border-sky-100 px-6 py-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-500">
                  Quản lý nhóm
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                  {isCreatingRole ? "Tạo vai trò mới" : "Chỉnh sửa vai trò"}
                </h2>
                <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500">
                  {isCreatingRole
                    ? "Tạo vai trò mới ở đây. Sau khi lưu, hệ thống sẽ chuyển vào trang chỉnh sửa vai trò vừa tạo."
                    : "Trang sửa riêng cho từng vai trò và phân quyền theo từng tab bên."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {!isCreatingRole ? (
                  <button
                    type="button"
                    onClick={handleToggleAll}
                    className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-bold text-sky-700 transition hover:bg-sky-100"
                  >
                    {isAllEnabled ? "Bỏ chọn tất cả" : "Bật tất cả"}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || isLoading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-black text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="size-4" />
                  {isSaving ? "Đang lưu..." : isCreatingRole ? "Lưu vai trò" : "Lưu thay đổi"}
                </button>
              </div>
            </div>

            {message ? (
              <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700">
                {message}
              </div>
            ) : null}
          </div>

          <div className="border-b border-sky-100 px-6 py-5">
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  Tên vai trò
                </span>
                <input
                  type="text"
                  name="name"
                  value={roleForm.name}
                  onChange={handleRoleFieldChange}
                  placeholder="Nhập tên vai trò"
                  className="w-full rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  Mô tả
                </span>
                <input
                  type="text"
                  name="description"
                  value={roleForm.description}
                  onChange={handleRoleFieldChange}
                  placeholder="Mô tả ngắn cho vai trò"
                  className="w-full rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                />
              </label>
            </div>
          </div>

          <div className="grid min-h-[560px] lg:grid-cols-[240px_minmax(0,1fr)]">
            <div className="border-b border-sky-100 bg-sky-50/40 px-4 py-5 lg:border-b-0 lg:border-r">
              <p className="px-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Thanh bên
              </p>
              <div className="mt-4 space-y-2">
                {permissionSidebar.map((group) => {
                  const isActive = group.id === selectedSidebarGroup?.id;
                  const enabledCount = group.sections.reduce(
                    (total, section) =>
                      total +
                      section.permissions.filter((permission) =>
                        selectedPermissionIds.has(permission.id),
                      ).length,
                    0,
                  );

                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => setSelectedSidebarId(group.id)}
                      className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                        isActive
                          ? "bg-sky-600 text-white shadow-lg shadow-sky-100"
                          : "bg-white text-slate-600 hover:bg-sky-100 hover:text-sky-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-black">{group.label}</span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
                            isActive ? "bg-white/20" : "bg-sky-50 text-sky-700"
                          }`}
                        >
                          {enabledCount}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="flex flex-col gap-4 border-b border-sky-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-950">
                    {selectedSidebarGroup?.label ?? "Quyền hạn"}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Nếu tắt quyền xem thì các quyền liên quan trong cùng nhóm cũng tắt theo.
                  </p>
                </div>

                <div className="relative w-full max-w-md">
                  <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={permissionSearchKeyword}
                    onChange={(event) => setPermissionSearchKeyword(event.target.value)}
                    placeholder="Tìm quyền..."
                    disabled={isCreatingRole}
                    className="w-full rounded-2xl border border-sky-100 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="flex min-h-[360px] items-center justify-center text-sm font-semibold text-slate-400">
                  Đang tải quyền của vai trò...
                </div>
              ) : isCreatingRole ? (
                <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 text-center">
                  <ShieldCheck className="size-10 text-sky-300" />
                  <p className="max-w-lg text-sm font-semibold text-slate-500">
                    Hãy lưu vai trò mới trước. Sau đó bạn sẽ được chuyển sang trang chỉnh sửa để phân quyền cho vai trò này.
                  </p>
                </div>
              ) : filteredSections.length === 0 ? (
                <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 text-center">
                  <ShieldCheck className="size-10 text-sky-300" />
                  <p className="text-sm font-semibold text-slate-500">
                    Không có quyền phù hợp với từ khóa tìm kiếm.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-sky-100">
                  {filteredSections.map((section) => {
                    const fullSection =
                      selectedSidebarGroup?.sections.find(
                        (sidebarSection) => sidebarSection.id === section.id,
                      ) ?? section;

                    return (
                      <div key={section.id} className="py-6">
                        <div className="mb-5 flex items-center justify-between gap-4">
                          <div>
                            <h4 className="text-xl font-black text-slate-950">{section.title}</h4>
                            <p className="mt-1 text-sm font-medium text-slate-500">
                              {
                                fullSection.permissions.filter((permission) =>
                                  selectedPermissionIds.has(permission.id),
                                ).length
                              }{" "}
                              quyền đang bật
                            </p>
                          </div>

                          {/* Removed clear-section "Xóa quyền" button as requested */}
                        </div>

                        <div className="space-y-4">
                          {section.permissions.map((permission) => {
                            const isEnabled = selectedPermissionIds.has(permission.id);

                            return (
                              <div
                                key={permission.id}
                                className="flex items-start justify-between gap-6 rounded-3xl border border-sky-100 bg-sky-50/30 px-5 py-5"
                              >
                                <div className="max-w-2xl">
                                  <p className="text-lg font-black text-slate-950">
                                    {permission.displayName}
                                  </p>
                                  <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                                    {permission.description}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={isEnabled}
                                  onClick={() => toggleSectionPermission(fullSection, permission)}
                                  className={`relative mt-1 h-8 w-14 shrink-0 rounded-full border transition ${
                                    isEnabled
                                      ? "border-sky-600 bg-sky-600"
                                      : "border-sky-200 bg-white"
                                  }`}
                                >
                                  <span
                                    className={`absolute top-1 size-6 rounded-full bg-white shadow-lg transition ${
                                      isEnabled ? "left-7" : "left-1"
                                    }`}
                                  />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
      {inUseModal.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-black text-slate-900">Không thể xóa vai trò</h3>
            <p className="mt-3 text-sm text-slate-600">{inUseModal.message}</p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setInUseModal({ open: false, roleName: "", message: "" })}
                className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-sky-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {confirmDelete.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-black text-slate-900">Xác nhận xóa</h3>
            <p className="mt-3 text-sm text-slate-600">Xóa vai trò "{confirmDelete.roleName}"? Hành động này không thể hoàn tác.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete({ open: false, roleId: null, roleName: "" })}
                className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await deleteRole(confirmDelete.roleId);
                    setRoles((current) => current.filter((r) => r.id !== confirmDelete.roleId));

                    // Keep the editor page visible after deleting a role.
                    if (String(confirmDelete.roleId) === String(roleId)) {
                      setRoleForm({ name: "", description: "" });
                      setSelectedPermissionIds(new Set());
                      setMessage("Vai trò đã bị xóa.");
                    }
                    setConfirmDelete({ open: false, roleId: null, roleName: "" });
                  } catch (error) {
                    const statusMsg = error.response?.data?.message || error.response?.data;
                    setConfirmDelete({ open: false, roleId: null, roleName: "" });
                    setInUseModal({ open: true, roleName: confirmDelete.roleName, message: typeof statusMsg === 'string' && statusMsg ? statusMsg : 'Role đang được sử dụng không thể xóa.' });
                  }
                }}
                className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default RolePermissionEditor;
