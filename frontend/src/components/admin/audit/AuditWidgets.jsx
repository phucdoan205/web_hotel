import React from "react";
import { CheckCircle2, AlertTriangle, Users2 } from "lucide-react";

const AuditWidgets = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-500">
          <CheckCircle2 className="size-6" />
        </div>
        <div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Total Success Actions
          </span>
          <p className="text-2xl font-black text-gray-900">1,212</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
        <div className="p-4 rounded-2xl bg-rose-50 text-rose-500">
          <AlertTriangle className="size-6" />
        </div>
        <div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Failed Attempts
          </span>
          <p className="text-2xl font-black text-gray-900">28</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
        <div className="p-4 rounded-2xl bg-orange-50 text-orange-600">
          <Users2 className="size-6" />
        </div>
        <div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Active Admins
          </span>
          <p className="text-2xl font-black text-gray-900">14</p>
        </div>
      </div>
    </div>
  );
};

export default AuditWidgets;
