import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ellipsis, PencilLine, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";
import {
  deleteRole,
  getRoles,
  shouldHideRoleFromAdminSettings,
} from "../../../api/admin/roleApi";
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

  const canCreateRoles = hasPermission("CREATE_ROLES");
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
          setMessage(readMessage(error, "Khong the tai danh sach vai tro."));
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
      `Xoa vai tro "${role.name}"? Hanh dong nay khong the hoan tac.`,
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
      setMessage(readMessage(error, "Khong the xoa vai tro."));
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
            Phan quyen theo vai tro
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500">
            Danh sach vai tro hien co, so thanh vien cua tung vai tro va trang sua rieng cho tung role.
          </p>
        </div>

        <div className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row sm:justify-end">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={roleSearchKeyword}
              onChange={(event) => setRoleSearchKeyword(event.target.value)}
              placeholder="Tim vai tro..."
              className="w-full rounded-2xl border border-sky-100 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
            />
          </div>

          {canCreateRoles ? (
            <button
              type="button"
              onClick={() => navigate("/admin/settings/roles/new")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-black text-white transition hover:bg-sky-700"
            >
              <Plus className="size-4" />
              Tao role
            </button>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-xl shadow-sky-100/50">
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full">
            <thead className="border-b border-sky-100 bg-sky-50/80">
              <tr>
                <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Vai tro
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Thanh vien
                </th>
                <th className="px-6 py-5 text-center text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Chinh sua
                </th>
                <th className="px-8 py-5 text-right text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Tuy chon
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-sm font-semibold text-slate-400">
                    Dang tai danh sach vai tro...
                  </td>
                </tr>
              ) : visibleRoles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-sm font-semibold text-slate-400">
                    Khong tim thay vai tro phu hop.
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
                              {role.description || "Chua co mo ta vai tro."}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-full bg-sky-50 px-3 py-1.5 text-xs font-black text-sky-700">
                          {role.userCount ?? 0} thanh vien
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/settings/roles/${role.id}`)}
                          disabled={!canEditRoles}
                          className="inline-flex rounded-2xl border border-sky-100 p-2.5 text-sky-600 transition hover:border-sky-200 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
                          title={canEditRoles ? "Chinh sua vai tro" : "Ban khong co quyen sua vai tro"}
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
                            title={canDeleteRoles ? "Tuy chon vai tro" : "Ban khong co quyen xoa vai tro"}
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
                                {isDeleting ? "Dang xoa..." : "Xoa quyen"}
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
