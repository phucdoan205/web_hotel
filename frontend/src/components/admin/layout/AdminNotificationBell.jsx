import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  createNotificationStreamUrl,
  getNotifications,
  markAllNotificationsRead,
} from "../../../api/notifications/notificationApi";

const formatTimeAgo = (value) => {
  if (!value) {
    return "Just now";
  }

  const createdAt = new Date(value);

  if (Number.isNaN(createdAt.getTime())) {
    return "Just now";
  }

  const diffInMinutes = Math.max(
    0,
    Math.floor((Date.now() - createdAt.getTime()) / 60000),
  );

  if (diffInMinutes < 1) {
    return "Just now";
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

const typeStyles = {
  Success: "bg-emerald-50 text-emerald-600",
  Warning: "bg-amber-50 text-amber-700",
  Error: "bg-rose-50 text-rose-600",
  Info: "bg-sky-50 text-sky-600",
};

const formatShortageNotification = (title, subtitle) => {
  let formattedTitle = title || "";
  let formattedSubtitle = subtitle || "";

  let eqName = "";
  let qty = 0;
  let hasItems = false;
  let itemsSummary = "";

  if (subtitle && (subtitle.trim().startsWith("{") || subtitle.trim().startsWith("["))) {
    try {
      const data = JSON.parse(subtitle);
      const items = data.Items ?? data.items;
      if (items && Array.isArray(items) && items.length > 0) {
        hasItems = true;
        itemsSummary = items
          .map(item => {
            const name = item.EquipmentName ?? item.equipmentName ?? item.Name ?? item.name ?? 'Vật tư';
            const q = item.ShortageQuantity ?? item.shortageQuantity ?? item.RequestedQuantity ?? item.requestedQuantity ?? item.Quantity ?? item.quantity ?? 0;
            return `${name} (${q} cái)`;
          })
          .join(", ");

        formattedSubtitle = items
          .map(item => {
            const name = item.EquipmentName ?? item.equipmentName ?? item.Name ?? item.name ?? 'Vật tư';
            const q = item.ShortageQuantity ?? item.shortageQuantity ?? item.RequestedQuantity ?? item.requestedQuantity ?? item.Quantity ?? item.quantity ?? 0;
            return `${name}: ${q} cái`;
          })
          .join(", ");
      } else {
        eqName = data.EquipmentName ?? data.equipmentName ?? data.Name ?? data.name ?? "";
        qty = data.ShortageQuantity ?? data.shortageQuantity ?? data.RequestedQuantity ?? data.requestedQuantity ?? data.Quantity ?? data.quantity ?? 0;
        
        if (eqName) {
          formattedSubtitle = `${eqName}: ${qty} cái`;
        } else if (data.ReportType || data.reportType) {
          const reportType = data.ReportType ?? data.reportType;
          const resType = data.ResolutionType ?? data.resolutionType;
          const typeStr = reportType === "loss-damage" ? "Thất thoát/Hư hỏng" : "Thiếu hụt";
          const resStr = resType === "Restocked" ? "Đã bổ sung" : resType;
          formattedSubtitle = `Xử lý báo cáo ${typeStr} #${data.ReportId ?? data.reportId}: ${resStr} ${qty ? `(${qty} cái)` : ""}`;
        }
      }
    } catch (e) {
      try {
        const itemsMatch = subtitle.match(/"Items"\s*:\s*(\[.*?\])/);
        if (itemsMatch && itemsMatch[1]) {
          const decodedItemsStr = itemsMatch[1].replace(/\\u([0-9a-fA-F]{4})/g, (match, grp) =>
            String.fromCharCode(parseInt(grp, 16))
          );
          const items = JSON.parse(decodedItemsStr);
          if (Array.isArray(items) && items.length > 0) {
            hasItems = true;
            itemsSummary = items
              .map(item => {
                const name = item.EquipmentName ?? item.equipmentName ?? item.Name ?? item.name ?? 'Vật tư';
                const q = item.ShortageQuantity ?? item.shortageQuantity ?? item.RequestedQuantity ?? item.requestedQuantity ?? item.Quantity ?? item.quantity ?? 0;
                return `${name} (${q} cái)`;
              })
              .join(", ");

            formattedSubtitle = items
              .map(item => {
                const name = item.EquipmentName ?? item.equipmentName ?? item.Name ?? item.name ?? 'Vật tư';
                const q = item.ShortageQuantity ?? item.shortageQuantity ?? item.RequestedQuantity ?? item.requestedQuantity ?? item.Quantity ?? item.quantity ?? 0;
                return `${name}: ${q} cái`;
              })
              .join(", ");
          }
        } else {
          const nameMatch = subtitle.match(/"EquipmentName"\s*:\s*"([^"]+)"/);
          const qtyMatch = subtitle.match(/"(?:ShortageQuantity|RequestedQuantity)"\s*:\s*(\d+)/);
          if (nameMatch && nameMatch[1]) {
            eqName = nameMatch[1].replace(/\\u([0-9a-fA-F]{4})/g, (match, grp) =>
              String.fromCharCode(parseInt(grp, 16))
            );
            qty = qtyMatch ? Number(qtyMatch[1]) : 1;
            formattedSubtitle = `${eqName}: ${qty} cái`;
          }
        }
      } catch (err) {
        formattedSubtitle = subtitle;
      }
    }
  }

  // 1. Format the Title first (add beautiful accents and item details)
  const titleMatch = formattedTitle.match(/^That thoat vat tu phong\s+(.+)$/i);
  if (titleMatch) {
    const roomNumber = titleMatch[1];
    if (eqName) {
      formattedTitle = `Thất thoát: ${eqName} (${qty} cái) - Phòng ${roomNumber}`;
    } else if (hasItems) {
      formattedTitle = `Thất thoát: ${itemsSummary} - Phòng ${roomNumber}`;
    } else {
      formattedTitle = `Thất thoát vật tư phòng ${roomNumber}`;
    }
  }

  const shortageMatch = formattedTitle.match(/^Bao thieu vat tu phong\s+(.+)$/i);
  if (shortageMatch) {
    const roomNumber = shortageMatch[1];
    if (eqName) {
      formattedTitle = `Báo thiếu: ${eqName} (${qty} cái) - Phòng ${roomNumber}`;
    } else if (hasItems) {
      formattedTitle = `Báo thiếu: ${itemsSummary} - Phòng ${roomNumber}`;
    } else {
      formattedTitle = `Báo thiếu vật tư phòng ${roomNumber}`;
    }
  }

  const thieuMatch = formattedTitle.match(/^(?:Bao\s+)?Thieu vat tu phong\s+(.+)$/i);
  if (thieuMatch) {
    const roomNumber = thieuMatch[1];
    if (eqName) {
      formattedTitle = `Thiếu vật tư: ${eqName} (${qty} cái) - Phòng ${roomNumber}`;
    } else if (hasItems) {
      formattedTitle = `Thiếu vật tư: ${itemsSummary} - Phòng ${roomNumber}`;
    } else {
      formattedTitle = `Thiếu vật tư phòng ${roomNumber}`;
    }
  }

  if (formattedSubtitle.startsWith("{")) {
    formattedSubtitle = formattedSubtitle.replace(/\\u([0-9a-fA-F]{4})/g, (match, grp) =>
      String.fromCharCode(parseInt(grp, 16))
    );
  }

  return { title: formattedTitle, subtitle: formattedSubtitle };
};

const AdminNotificationBell = () => {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const items = await getNotifications(3);
        if (isMounted) {
          setNotifications(items);
        }
      } catch {
        if (isMounted) {
          setNotifications([]);
        }
      }
    };

    loadNotifications();

    const intervalId = window.setInterval(() => {
      loadNotifications();
    }, 3000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const eventSource = new EventSource(createNotificationStreamUrl());

    const handleIncomingNotification = (event) => {
      try {
        const notification = JSON.parse(event.data);

        setNotifications((current) => {
          const next = [
            notification,
            ...current.filter((item) => item.id !== notification.id),
          ];

          return next.slice(0, 3);
        });
      } catch {
        // Ignore malformed events and keep the stream alive.
      }
    };

    eventSource.onmessage = handleIncomingNotification;
    eventSource.addEventListener("notification", handleIncomingNotification);
    eventSource.onerror = () => {
      // Polling fallback above keeps notifications fresh if SSE is unstable.
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.isRead !== true).length,
    [notifications],
  );

  const handleToggle = async () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);

    if (!isOpen && unreadCount > 0) {
      setNotifications((current) =>
        current.map((item) => ({ ...item, isRead: true })),
      );

      try {
        await markAllNotificationsRead();
      } catch {
        // Keep UI responsive even if mark-read fails.
      }
    }
  };

  const handleNotificationClick = (notification) => {
    setIsOpen(false);

    if (notification.referenceLink) {
      navigate(notification.referenceLink);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative rounded-full p-1.5 text-gray-400 transition-colors hover:bg-sky-50 hover:text-sky-600"
      >
        <Bell className="size-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute left-[-2.5rem] sm:left-auto sm:right-0 top-[calc(100%+0.75rem)] z-50 w-[88vw] xs:w-[22rem] sm:w-[24rem] overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-200/60">
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="text-sm font-black text-gray-900">Notifications</h3>
            <p className="mt-1 text-xs font-semibold text-gray-400">
              Realtime activity from the system
            </p>
          </div>

          <div className="max-h-[26rem] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm font-semibold text-gray-400">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notification) => {
                const formatted = formatShortageNotification(notification.title, notification.content);
                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className="flex w-full items-start gap-3 border-b border-gray-50 px-5 py-4 text-left transition-colors hover:bg-gray-50"
                  >
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-[11px] font-black ${
                        typeStyles[notification.type] ?? typeStyles.Info
                      }`}
                    >
                      {(notification.type ?? "Info").slice(0, 1).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-bold text-gray-900">
                          {formatted.title}
                        </p>
                        <span className="shrink-0 text-[11px] font-semibold text-gray-400">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        {formatted.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminNotificationBell;
