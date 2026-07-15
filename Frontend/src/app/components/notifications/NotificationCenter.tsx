import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { notificationService, type AppNotification } from "../../services/notificationService";

export function NotificationCenter() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const unreadCount = items.filter((item) => !item.isRead).length;

  useEffect(() => {
    const loadNotifications = () => notificationService.getMine()
      .then((data) => { setItems(data.items); setError(""); })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
    loadNotifications();
    const refreshTimer = window.setInterval(loadNotifications, 10_000);
    window.addEventListener("focus", loadNotifications);
    return () => {
      window.clearInterval(refreshTimer);
      window.removeEventListener("focus", loadNotifications);
    };
  }, []);

  const markRead = async (id: string) => {
    await notificationService.markRead(id);
    setItems((current) => current.map((item) => item.notificationId === id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item));
    window.dispatchEvent(new Event("notifications-updated"));
  };

  const markAll = async () => {
    await notificationService.markAllRead();
    setItems((current) => current.map((item) => ({ ...item, isRead: true, readAt: item.readAt ?? new Date().toISOString() })));
    window.dispatchEvent(new Event("notifications-updated"));
  };

  const handleItemClick = async (item: AppNotification) => {
    if (!item.isRead) {
      await markRead(item.notificationId);
    }
    const text = `${item.title} ${item.content}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    if (window.location.pathname.startsWith("/sales")) {
      if (text.includes("tra phong") || text.includes("hoan coc")) {
        navigate("/sales/registrations?tab=checkout");
        return;
      }
      if (text.includes("lap hop dong") || text.includes("lap hd") || text.includes("du dieu kien nhan phong")) {
        navigate("/sales/registrations?tab=deposits");
        return;
      }
      if (item.notificationType === "dang_ky_thue" || text.includes("nhan phong") || text.includes("dang ky") || /HS[a-zA-Z0-9]+/.test(item.content)) {
        navigate("/sales/registrations?tab=registrations");
        return;
      }
      if (text.includes("coc") || item.notificationType === "dat_coc") {
        navigate(text.includes("qua han") || text.includes("huy phieu") || text.includes("thanh toan")
          ? "/sales/registrations?tab=deposits"
          : "/sales/registrations?tab=registrations");
        return;
      }
      if (text.includes("hop dong") || text.includes("hd thue")) {
        navigate("/sales/registrations?tab=contracts");
        return;
      }
    }
    const parts = item.notificationType.split('|');
    if (parts.length > 1) {
      const typeCode = parts[0];
      const id = parts[1];
      let actionUrl = "";
      switch (typeCode) {
        case "coc":
          actionUrl = `/accountant/payment-requests?search=${id}`;
          break;
        case "checkin":
          actionUrl = `/accountant/check-in-charges?search=${id}`;
          break;
        case "ds":
          actionUrl = `/accountant/create-reconciliation?search=${id}`;
          break;
        case "refund":
          actionUrl = `/accountant/perform-refund?search=${id}`;
          break;
        case "invoice":
          actionUrl = `/customer/payments?search=${id}`;
          break;
        case "manager":
          actionUrl = `/manager/liquidation?search=${id}`;
          break;
      }
      if (actionUrl) {
        navigate(actionUrl);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thông báo</h1>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAll} className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700">
            <CheckCheck className="h-4 w-4" />
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {loading && <p className="text-gray-500">Đang tải thông báo...</p>}
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
      {!loading && !error && items.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">Chưa có thông báo.</div>
      )}

      <div className="space-y-3">
        {items.map((item) => {
          const parts = item.notificationType.split('|');
          const isShortCode = ["coc", "checkin", "ds", "refund", "invoice", "manager"].includes(parts[0]);
          const typeLabel = isShortCode ? "he_thong" : parts[0];
          return (
            <button
              key={item.notificationId}
              onClick={() => handleItemClick(item)}
              className={`w-full rounded-xl border p-5 text-left transition-colors ${item.isRead ? "border-gray-200 bg-white hover:bg-gray-50" : "border-blue-200 bg-blue-50 hover:bg-blue-100/70"
                }`}
            >
              <div className="flex gap-4">
                <div className={`rounded-full p-2.5 ${item.isRead ? "bg-gray-100 text-gray-500" : "bg-blue-100 text-blue-600"}`}>
                  <Bell className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-3">
                    <h2 className="font-bold text-gray-900">{item.title}</h2>
                    {!item.isRead && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{item.content}</p>
                  <div className="mt-2 flex gap-3 text-xs text-gray-400">
                    <span>{new Date(item.createdAt).toLocaleString("vi-VN")}</span>
                    <span>{typeLabel.replaceAll("_", " ")}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

