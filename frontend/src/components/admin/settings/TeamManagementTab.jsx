import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Ellipsis,
  PencilLine,
  Save,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  assignRolePermissions,
  deleteRole,
  getPermissions,
  getRolePermissions,
  getRoles,
  updateRole,
} from "../../../api/admin/roleApi";
import { buildPermissionSidebar } from "../../../utils/permissionCatalog";

const TEAM_TAB_QUERY_KEY = "settingsTab";
const ROLE_QUERY_KEY = "teamRoleId";
const SECTION_QUERY_KEY = "teamSection";
const TEAM_TAB_VALUE = "team-management";

const readMessage = (error, fallbackMessage) => {
  const responseMessage = error.response?.data?.message || error.response?.data;

  if (typeof responseMessage === "string" && responseMessage.trim()) {
    return responseMessage;
  }

  return fallbackMessage;
};

const TeamManagementTab = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [roleSearchKeyword, setRoleSearchKeyword] = useState("");
  const [permissionSearchKeyword, setPermissionSearchKeyword] = useState("");
  const [listMessage, setListMessage] = useState("");
  const [editorMessage, setEditorMessage] = useState("");
  const [roleForm, setRoleForm] = useState({ name: "", description: "" });
  const [selectedPermissionIds, setSelectedPermissionIds] = useState(new Set());
  const [activeMenuRoleId, setActiveMenuRoleId] = useState(null);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingRoleDetail, setIsLoadingRoleDetail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingRoleId, setIsDeletingRoleId] = useState(null);

  const selectedRoleId = searchParams.get(ROLE_QUERY_KEY);
  const isEditorView = Boolean(selectedRoleId);

  const permissionSidebar = useMemo(
    () => buildPermissionSidebar(permissions),
    [permissions],
  );

  const selectedSidebarId =
    searchParams.get(SECTION_QUERY_KEY) ?? permissionSidebar[0]?.id ?? null;

  const selectedSidebarGroup =
    permissionSidebar.find((group) => group.id === selectedSidebarId) ??
    permissionSidebar[0] ??
    null;

  const allPermissionIds = useMemo(
    () => permissions.map((permission) => permission.id),
    [permissions],
  );

  const visibleRoles = useMemo(() => {
    const normalizedKeyword = roleSearchKeyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      return roles;
    }

    return roles.filter((role) =>
      [role.name, role.description, role.userCount]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedKeyword)),
    );
  }, [roleSearchKeyword, roles]);

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

  const selectedRole = roles.find((role) => String(role.id) === selectedRoleId) ?? null;
  const isAllEnabled =
    allPermissionIds.length > 0 && selectedPermissionIds.size === allPermissionIds.length;

  const updateSearch = (updates) => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);

      nextParams.set(TEAM_TAB_QUERY_KEY, TEAM_TAB_VALUE);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          nextParams.delete(key);
          return;
        }

        nextParams.set(key, String(value));
      });

      return nextParams;
    });
  };

  useEffect(() => {
    let isMounted = true;

    const loadRoleManagementData = async () => {
      setIsLoadingList(true);
      setListMessage("");

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
      } catch (error) {
        if (isMounted) {
          setListMessage(readMessage(error, "Không thể tải danh sách vai trò và quyền."));
        }
      } finally {
        if (isMounted) {
          setIsLoadingList(false);
        }
      }
    };

    loadRoleManagementData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isEditorView) {
      setEditorMessage("");
      setPermissionSearchKeyword("");
      setRoleForm({ name: "", description: "" });
      setSelectedPermissionIds(new Set());
      return;
    }

    let isMounted = true;

    const loadRoleDetail = async () => {
      setIsLoadingRoleDetail(true);
      setEditorMessage("");

      try {
        const roleDetail = await getRolePermissions(selectedRoleId);

        if (!isMounted) {
          return;
        }

        setRoleForm({
          name: roleDetail.roleName ?? "",
          description: roleDetail.description ?? "",
        });
        setSelectedPermissionIds(new Set(roleDetail.permissionIds ?? []));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setEditorMessage(readMessage(error, "Không thể tải chi tiết vai trò."));
      } finally {
        if (isMounted) {
          setIsLoadingRoleDetail(false);
        }
      }
    };

    loadRoleDetail();

    return () => {
      isMounted = false;
    };
  }, [isEditorView, selectedRoleId]);

  useEffect(() => {
    if (isEditorView && !selectedSidebarGroup && permissionSidebar[0]) {
      setSearchParams((currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        nextParams.set(TEAM_TAB_QUERY_KEY, TEAM_TAB_VALUE);
        nextParams.set(SECTION_QUERY_KEY, permissionSidebar[0].id);
        return nextParams;
      });
    }
  }, [isEditorView, permissionSidebar, selectedSidebarGroup, setSearchParams]);

  const openRoleEditor = (roleId) => {
    const nextSection = selectedSidebarGroup?.id ?? permissionSidebar[0]?.id ?? null;

    updateSearch({
      [ROLE_QUERY_KEY]: roleId,
      [SECTION_QUERY_KEY]: nextSection,
    });
    setActiveMenuRoleId(null);
  };

  const closeRoleEditor = () => {
    updateSearch({
      [ROLE_QUERY_KEY]: null,
      [SECTION_QUERY_KEY]: null,
    });
    setEditorMessage("");
  };

  const handleRoleFieldChange = (event) => {
    const { name, value } = event.target;
    setRoleForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const toggleSectionPermission = (section, permission) => {
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
    setSelectedPermissionIds((current) => {
      const next = new Set(current);
      section.permissions.forEach((permission) => {
        next.delete(permission.id);
      });
      return next;
    });
  };

  const handleToggleAll = () => {
    setSelectedPermissionIds(
      isAllEnabled ? new Set() : new Set(allPermissionIds),
    );
  };

  const handleSaveRole = async () => {
    if (!selectedRoleId) {
      return;
    }

    const normalizedName = roleForm.name.trim();

    if (!normalizedName) {
      setEditorMessage("Tên vai trò không được để trống.");
      return;
    }

    setIsSaving(true);
    setEditorMessage("");

    try {
      await Promise.all([
        updateRole(selectedRoleId, {
          name: normalizedName,
          description: roleForm.description.trim(),
        }),
        assignRolePermissions({
          roleId: Number(selectedRoleId),
          permissionIds: [...selectedPermissionIds],
        }),
      ]);

      setRoles((current) =>
        current.map((role) =>
          String(role.id) === selectedRoleId
            ? {
                ...role,
                name: normalizedName,
                description: roleForm.description.trim(),
              }
            : role,
        ),
      );

      setEditorMessage("Đã lưu thay đổi vai trò.");
    } catch (error) {
      setEditorMessage(readMessage(error, "Không thể lưu thay đổi vai trò."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRole = async (role) => {
    const shouldDelete = window.confirm(
      `Xóa vai trò "${role.name}"? Hành động này không thể hoàn tác.`,
    );

    if (!shouldDelete) {
      return;
    }

    setIsDeletingRoleId(role.id);
    setListMessage("");
    setEditorMessage("");

    try {
      await deleteRole(role.id);
      setRoles((current) => current.filter((item) => item.id !== role.id));
      setActiveMenuRoleId(null);

      if (String(role.id) === selectedRoleId) {
        closeRoleEditor();
      }
    } catch (error) {
      const message = readMessage(error, "Không thể xóa vai trò.");
      setListMessage(message);
      setEditorMessage(message);
    } finally {
      setIsDeletingRoleId(null);
    }
  };

  if (!isEditorView) {
    return (
      <div className="space-y-6">
        {listMessage ? (
          <div className="rounded-3xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-600">
            {listMessage}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-500">
              Team Management
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              Phân quyền theo vai trò
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500">
              Xem danh sách vai trò hiện có, số lượng thành viên đang dùng từng vai trò, và
              mở trang chỉnh sửa quyền chi tiết.
            </p>
          </div>

          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={roleSearchKeyword}
              onChange={(event) => setRoleSearchKeyword(event.target.value)}
              placeholder="Tìm vai trò..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full">
              <thead className="border-b border-slate-200 bg-slate-50/80">
                <tr>
                  <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Vai trò
                  </th>
                  <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Thành viên
                  </th>
                  <th className="px-6 py-5 text-center text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Chỉnh sửa
                  </th>
                  <th className="px-8 py-5 text-right text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Tùy chọn
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingList ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-8 py-12 text-center text-sm font-semibold text-slate-400"
                    >
                      Đang tải danh sách vai trò...
                    </td>
                  </tr>
                ) : visibleRoles.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-8 py-12 text-center text-sm font-semibold text-slate-400"
                    >
                      Không tìm thấy vai trò phù hợp.
                    </td>
                  </tr>
                ) : (
                  visibleRoles.map((role) => {
                    const isDeleting = isDeletingRoleId === role.id;
                    const isMenuOpen = activeMenuRoleId === role.id;

                    return (
                      <tr key={role.id} className="transition hover:bg-slate-50/70">
                        <td className="px-8 py-5">
                          <div>
                            <p className="text-sm font-black text-slate-900">{role.name}</p>
                            <p className="mt-1 text-xs font-medium text-slate-400">
                              {role.description || "Chưa có mô tả vai trò."}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="inline-flex rounded-full bg-sky-50 px-3 py-1.5 text-xs font-black text-sky-700">
                            {role.userCount ?? 0} thành viên
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <button
                            type="button"
                            onClick={() => openRoleEditor(role.id)}
                            className="inline-flex rounded-2xl border border-slate-200 p-2.5 text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600"
                            title="Chỉnh sửa vai trò"
                          >
                            <PencilLine className="size-4" />
                          </button>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="relative inline-flex">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveMenuRoleId((current) =>
                                  current === role.id ? null : role.id,
                                )
                              }
                              className="rounded-2xl border border-slate-200 p-2.5 text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700"
                              title="Tùy chọn vai trò"
                            >
                              <Ellipsis className="size-4" />
                            </button>

                            {isMenuOpen ? (
                              <div className="absolute right-0 top-14 z-10 min-w-40 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRole(role)}
                                  disabled={isDeleting}
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <Trash2 className="size-4" />
                                  {isDeleting ? "Đang xóa..." : "Xóa quyền"}
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[#101218] text-white shadow-2xl shadow-slate-200/60">
      <div className="grid min-h-[780px] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-[#0b0d12] p-5 lg:border-b-0 lg:border-r">
          <button
            type="button"
            onClick={closeRoleEditor}
            className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Trở lại
          </button>

          <div className="mt-8 space-y-2">
            {roles.map((role) => {
              const isActive = String(role.id) === selectedRoleId;

              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => openRoleEditor(role.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                  }`}
                >
                  <span
                    className={`size-2.5 rounded-full ${
                      isActive ? "bg-sky-400" : "bg-slate-500"
                    }`}
                  />
                  <span className="truncate text-sm font-bold">{role.name}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="bg-[#151821]">
          <div className="border-b border-white/10 px-6 py-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-300">
                  Team Management
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                  Sửa đổi vai trò
                  {selectedRole ? ` - ${selectedRole.name}` : ""}
                </h2>
                <p className="mt-2 max-w-2xl text-sm font-medium text-slate-400">
                  Chỉnh tên vai trò và bật hoặc tắt các quyền theo từng tab sidebar giống luồng
                  phân quyền bạn yêu cầu.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleAll}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-100 transition hover:bg-white/10"
                >
                  {isAllEnabled ? "Bỏ chọn tất cả" : "Bật tất cả"}
                </button>
                <button
                  type="button"
                  onClick={handleSaveRole}
                  disabled={isSaving || isLoadingRoleDetail}
                  className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="size-4" />
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>

            {editorMessage ? (
              <div className="mt-4 rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm font-semibold text-sky-100">
                {editorMessage}
              </div>
            ) : null}
          </div>

          <div className="border-b border-white/10 px-6 py-5">
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
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10"
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
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10"
                />
              </label>
            </div>
          </div>

          <div className="grid min-h-[560px] lg:grid-cols-[240px_minmax(0,1fr)]">
            <div className="border-b border-white/10 px-4 py-5 lg:border-b-0 lg:border-r">
              <p className="px-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Tab sidebar
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
                      onClick={() => updateSearch({ [SECTION_QUERY_KEY]: group.id })}
                      className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                        isActive
                          ? "bg-sky-500 text-slate-950"
                          : "bg-transparent text-slate-300 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-black">{group.label}</span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
                            isActive ? "bg-slate-950/10" : "bg-white/10 text-slate-300"
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
              <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white">
                    {selectedSidebarGroup?.label ?? "Quyền hạn"}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-slate-400">
                    Quyền xem luôn nằm đầu tiên. Nếu tắt quyền xem, các quyền liên quan trong
                    cùng mục sẽ tự tắt theo.
                  </p>
                </div>

                <div className="relative w-full max-w-md">
                  <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={permissionSearchKeyword}
                    onChange={(event) => setPermissionSearchKeyword(event.target.value)}
                    placeholder="Tìm permission..."
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10"
                  />
                </div>
              </div>

              {isLoadingRoleDetail ? (
                <div className="flex min-h-[360px] items-center justify-center text-sm font-semibold text-slate-400">
                  Đang tải quyền của vai trò...
                </div>
              ) : filteredSections.length === 0 ? (
                <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 text-center">
                  <ShieldCheck className="size-10 text-slate-600" />
                  <p className="text-sm font-semibold text-slate-300">
                    Không có permission phù hợp với từ khóa tìm kiếm.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {filteredSections.map((section) => {
                    const fullSection =
                      selectedSidebarGroup?.sections.find(
                        (sidebarSection) => sidebarSection.id === section.id,
                      ) ?? section;

                    return (
                    <div key={section.id} className="py-6">
                      <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                          <h4 className="text-xl font-black text-white">{section.title}</h4>
                          <p className="mt-1 text-sm font-medium text-slate-400">
                            {fullSection.permissions.filter((permission) =>
                              selectedPermissionIds.has(permission.id),
                            ).length}
                            {" "}quyền đang bật
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => clearSectionPermissions(fullSection)}
                          className="text-sm font-bold text-sky-300 transition hover:text-sky-200"
                        >
                          Xóa quyền
                        </button>
                      </div>

                      <div className="space-y-4">
                        {section.permissions.map((permission) => {
                          const isEnabled = selectedPermissionIds.has(permission.id);

                          return (
                            <div
                              key={permission.id}
                              className="flex items-start justify-between gap-6 rounded-3xl border border-white/5 bg-white/[0.03] px-5 py-5"
                            >
                              <div className="max-w-2xl">
                                <p className="text-lg font-black text-white">
                                  {permission.displayName}
                                </p>
                                <p className="mt-2 text-sm font-medium leading-6 text-slate-400">
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
                                    ? "border-sky-400 bg-sky-400"
                                    : "border-white/10 bg-white/5"
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
    </div>
  );
};

export default TeamManagementTab;
