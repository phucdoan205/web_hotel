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
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[24rem] overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-200/60">
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
              notifications.map((notification) => (
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
                        {notification.title}
                      </p>
                      <span className="shrink-0 text-[11px] font-semibold text-gray-400">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </div>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      {notification.content}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminNotificationBell;
