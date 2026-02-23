"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: "LIKE" | "COMMENT" | "FOLLOW";
  isRead: boolean;
  createdAt: string;
  issuer: { id: string; name: string; image: string | null };
  post: { title: string; slug: string } | null;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

const TYPE_LABEL: Record<string, string> = {
  LIKE: "liked your post",
  COMMENT: "commented on your post",
  FOLLOW: "started following you",
};

export default function NotificationBell() {
  const [data, setData] = useState<NotificationsResponse>({
    notifications: [],
    unreadCount: 0,
  });
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleOpen = async () => {
    setOpen((v) => !v);
    if (!open && data.unreadCount > 0) {
      try {
        await fetch("/api/notifications/read", { method: "POST" });
        setData((prev) => ({
          ...prev,
          unreadCount: 0,
          notifications: prev.notifications.map((n) => ({
            ...n,
            isRead: true,
          })),
        }));
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg text-muted hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {data.unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 h-4 w-4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {data.unreadCount > 9 ? "9+" : data.unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">
              Notifications
            </h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {data.notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted">
                No notifications yet
              </div>
            ) : (
              data.notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-border last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                    !n.isRead ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                      {n.issuer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{n.issuer.name}</span>{" "}
                        {TYPE_LABEL[n.type] ?? n.type.toLowerCase()}
                        {n.post && (
                          <>
                            {" "}
                            <a
                              href={`/post/${n.post.slug}`}
                              className="text-primary hover:underline font-medium truncate"
                              onClick={() => setOpen(false)}
                            >
                              &ldquo;{n.post.title}&rdquo;
                            </a>
                          </>
                        )}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {formatDistanceToNow(new Date(n.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    {!n.isRead && (
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
