import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ellipsis, PencilLine, Search, ShieldCheck, Trash2 } from "lucide-react";
import { deleteRole, getRoles, shouldHideRoleFromAdminSettings } from "../../../api/admin/roleApi";
import { hasPermission } from "../../../utils/permissions";

const readMessage = (error, fallbackMessage) => {
  const responseMessage = error.response?.data?.message || error.response?.data;

  if (typeof responseMessage === "string" && responseMessage.trim()) {
    return responseMessage;
  }

  return fallbackMessage;
};

const TeamManagementTab = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [roleSearchKeyword, setRoleSearchKeyword] = useState("");
  const [message, setMessage] = useState("");
  const [activeMenuRoleId, setActiveMenuRoleId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingRoleId, setIsDeletingRoleId] = useState(null);

  const canEditRoles = hasPermission("EDIT_ROLES");
  const canDeleteRoles = hasPermission("DELETE_ROLES");

  const visibleRoles = useMemo(() => {
    const normalizedKeyword = roleSearchKeyword.trim().toLowerCase();
    const adminRoles = roles.filter((role) => !shouldHideRoleFromAdminSettings(role));

    if (!normalizedKeyword) {
      return adminRoles;
    }

    return adminRoles.filter((role) =>
      [role.name, role.description, role.userCount]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedKeyword)),
    );
  }, [roleSearchKeyword, roles]);

  useEffect(() => {
    let isMounted = true;

    const loadRoles = async () => {
      setIsLoading(true);
      setMessage("");

      try {
        const rolesResponse = await getRoles();

        if (isMounted) {
          setRoles(rolesResponse);
        }
      } catch (error) {
        if (isMounted) {
          setMessage(readMessage(error, "Không thể tải danh sách vai trò."));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadRoles();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDeleteRole = async (role) => {
    const shouldDelete = window.confirm(
      `Xóa vai trò "${role.name}"? Hành động này không thể hoàn tác.`,
    );

    if (!shouldDelete) {
      return;
    }

    setIsDeletingRoleId(role.id);
    setMessage("");

    try {
      await deleteRole(role.id);
      setRoles((current) => current.filter((item) => item.id !== role.id));
      setActiveMenuRoleId(null);
    } catch (error) {
      setMessage(readMessage(error, "Không thể xóa vai trò."));
    } finally {
      setIsDeletingRoleId(null);
    }
  };

  return (
    <div className="space-y-6">
      {message ? (
        <div className="rounded-3xl border border-sky-100 bg-sky-50 px-5 py-4 text-sm font-semibold text-sky-700">
          {message}
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
            Danh sách vai trò hiện có, số thành viên của từng vai trò và trang sửa riêng cho từng role.
          </p>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={roleSearchKeyword}
            onChange={(event) => setRoleSearchKeyword(event.target.value)}
            placeholder="Tìm vai trò..."
            className="w-full rounded-2xl border border-sky-100 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-xl shadow-sky-100/50">
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full">
            <thead className="border-b border-sky-100 bg-sky-50/80">
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
            <tbody className="divide-y divide-sky-50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-sm font-semibold text-slate-400">
                    Đang tải danh sách vai trò...
                  </td>
                </tr>
              ) : visibleRoles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-sm font-semibold text-slate-400">
                    Không tìm thấy vai trò phù hợp.
                  </td>
                </tr>
              ) : (
                visibleRoles.map((role) => {
                  const isDeleting = isDeletingRoleId === role.id;
                  const isMenuOpen = activeMenuRoleId === role.id;

                  return (
                    <tr key={role.id} className="transition hover:bg-sky-50/40">
                      <td className="px-8 py-5">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                            <ShieldCheck className="size-5" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{role.name}</p>
                            <p className="mt-1 text-xs font-medium text-slate-400">
                              {role.description || "Chưa có mô tả vai trò."}
                            </p>
                          </div>
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
                          onClick={() => navigate(`/admin/settings/roles/${role.id}`)}
                          disabled={!canEditRoles}
                          className="inline-flex rounded-2xl border border-sky-100 p-2.5 text-sky-600 transition hover:border-sky-200 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
                          title={canEditRoles ? "Chỉnh sửa vai trò" : "Bạn không có quyền sửa vai trò"}
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
                            disabled={!canDeleteRoles}
                            className="rounded-2xl border border-sky-100 p-2.5 text-sky-600 transition hover:border-sky-200 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
                            title={canDeleteRoles ? "Tùy chọn vai trò" : "Bạn không có quyền xóa vai trò"}
                          >
                            <Ellipsis className="size-4" />
                          </button>

                          {isMenuOpen && canDeleteRoles ? (
                            <div className="absolute right-0 top-14 z-10 min-w-40 rounded-2xl border border-sky-100 bg-white p-2 shadow-xl shadow-sky-100">
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
};

export default TeamManagementTab;
