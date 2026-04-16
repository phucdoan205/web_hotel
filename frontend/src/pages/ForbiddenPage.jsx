import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

const ForbiddenPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sky-50 px-6">
      <div className="w-full max-w-xl rounded-[2rem] border border-sky-100 bg-white p-10 text-center shadow-xl shadow-sky-100/60">
        <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-sky-100 text-sky-600">
          <ShieldAlert className="size-8" />
        </div>
        <h1 className="mt-6 text-4xl font-black text-slate-950">403</h1>
        <p className="mt-3 text-lg font-bold text-slate-800">Bạn không có quyền truy cập.</p>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Tài khoản hiện tại không có permission phù hợp để mở trang này hoặc thực hiện thao tác này.
        </p>
        <Link
          to="/admin/dashboard"
          className="mt-8 inline-flex rounded-2xl bg-sky-600 px-6 py-3 text-sm font-black text-white transition hover:bg-sky-700"
        >
          Quay về dashboard
        </Link>
      </div>
    </div>
  );
};

export default ForbiddenPage;
