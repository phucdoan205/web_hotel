import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchAuditLogs } from "../../../api/admin/audit";

const AuditTable = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openRows, setOpenRows] = useState({});

  const toggleRow = (id) => {
    setOpenRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const res = await fetchAuditLogs();

        // 🔥 parse + map
        const mappedLogs = res.items.map((item) => {
          let parsed = null;

          try {
            parsed = JSON.parse(item.logData);
          } catch {
            parsed = null;
          }

          return {
            id: item.id,
            timestamp: item.logDate,
            user: item.userName || "System",
            role: item.roleName || "",
            events: parsed?.Events || [],
          };
        });

        // 🔥 group theo ngày + user
        const grouped = {};

        mappedLogs.forEach((log) => {
          const date = new Date(log.timestamp).toLocaleDateString();
          const key = `${date}-${log.user}`;

          if (!grouped[key]) {
            grouped[key] = {
              date,
              user: log.user,
              role: log.role,
              logs: [],
            };
          }

          grouped[key].logs.push(log);
        });

        setLogs(Object.values(grouped));
      } catch (err) {
        console.error(err);
        alert("Lỗi khi load audit logs");
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const getColor = (type) => {
    switch (type) {
      case "CREATE":
        return "text-green-500";
      case "DELETE":
        return "text-red-500";
      case "UPDATE":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  if (loading) {
    return <p className="p-6">Loading logs...</p>;
  }

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden mt-6">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b">
          <tr className="text-xs font-bold text-gray-400 uppercase">
            <th className="px-6 py-4">Thời gian</th>
            <th className="px-6 py-4">Hành động</th>
            <th className="px-6 py-4">Nội dung</th>
          </tr>
        </thead>

        <tbody>
          {logs.map((group, i) => (
            <React.Fragment key={i}>
              {/* GROUP HEADER */}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 font-semibold">
                  {group.date}
                </td>
                <td className="px-6 py-4">
                  {group.user}
                  <span className="ml-2 text-xs text-blue-500">
                    {group.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {group.logs.length} logs
                </td>
              </tr>

              {/* LOG */}
              {group.logs.map((log) => {
                const isOpen = openRows[log.id];

                return (
                  <React.Fragment key={log.id}>
                    {/* MAIN ROW */}
                    <tr
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleRow(log.id)}
                    >
                      <td className="px-6 py-3">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>

                      <td className="px-6 py-3 font-semibold">
                        <span className={getColor(log.events[0]?.ActionType)}>
                          {log.events[0]?.ActionType || "N/A"}
                        </span>
                      </td>

                      <td className="px-6 py-3 text-gray-600">
                        {log.events[0]?.Message}
                      </td>
                    </tr>

                    {/* DROPDOWN EVENTS */}
                    {isOpen &&
                      log.events.map((ev) => (
                        <tr key={ev.EventId} className="bg-gray-50">
                          <td className="px-10 py-2 text-xs text-gray-400">
                            {new Date(ev.Timestamp).toLocaleTimeString()}
                          </td>

                          <td className="px-6 py-2">
                            <span className={`text-xs font-bold ${getColor(ev.ActionType)}`}>
                              {ev.ActionType}
                            </span>
                          </td>

                          <td className="px-6 py-2 text-sm text-gray-700">
                            <b>{ev.EntityType}</b> — {ev.Message}
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Pagination giữ nguyên */}
      <div className="px-6 py-4 flex justify-between border-t">
        <span className="text-xs text-gray-400">
          Hiển thị {logs.length} nhóm log
        </span>

        <div className="flex gap-2">
          <button className="p-2 text-gray-400">
            <ChevronLeft size={16} />
          </button>
          <button className="px-3 py-1 bg-orange-500 text-white text-xs rounded">
            1
          </button>
          <button className="p-2 text-gray-400">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditTable;