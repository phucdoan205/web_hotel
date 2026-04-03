import React from 'react';
import TaskStats from '../../components/housekeeping/taskmanagement/TaskStats';
import TaskFilters from '../../components/housekeeping/taskmanagement/TaskFilters';
import TaskTable from '../../components/housekeeping/taskmanagement/TaskTable';

const HousekeepingTasksPage = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Nhiệm vụ dọn dẹp</h1>
          <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-tight">Thứ Hai, ngày 23 tháng 10 năm 2023</p>
        </div>
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Tìm số phòng, nhân viên..." 
            className="bg-white border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold w-72 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
        </div>
      </header>

      <TaskStats />
      <TaskFilters />
      <TaskTable />
    </div>
  );
};

export default HousekeepingTasksPage;