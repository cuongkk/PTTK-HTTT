import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import {
  Home,
  Search,
  FileText,
  CreditCard,
  Users,
  ClipboardList,
  Building2,
  DollarSign,
  CheckCircle,
  Calculator,
  Shield,
  UserCheck,
  FileCheck,
  ClipboardCheck,
  Menu,
  X,
  Bell,
  User,
  LogOut,
  Settings,
  Sparkles,
  FilePlus,
  DoorOpen,
} from "lucide-react";
import { logout } from "../../services/system-admin/authService";
import { getStoredUser, mapRoleIdToPath } from "../../services/authStorage";
import { getStoredToken } from "../../services/apiClient";
import { notificationService } from "../../services/notificationService";
import { ConfirmDialog } from "../ui/ConfirmDialog";

type UserRole = "customer" | "sales" | "accountant" | "manager" | "system-admin";

const getRoleFromPathname = (pathname: string): UserRole => {
  if (pathname.startsWith("/sales")) return "sales";
  if (pathname.startsWith("/accountant")) return "accountant";
  if (pathname.startsWith("/manager")) return "manager";
  if (pathname.startsWith("/system-admin")) return "system-admin";

  return "customer";
};

const isCustomerNavigationActive = (itemPath: string, pathname: string) => {
  if (itemPath === "/customer") return pathname === itemPath;
  if (itemPath === "/customer/rooms") return pathname.startsWith("/customer/rooms");
  if (itemPath === "/customer/my-rooms") {
    return [
      "/customer/my-rooms",
      "/customer/deposit-requests",
      "/customer/check-ins",
      "/customer/handovers",
      "/customer/checkouts",
    ].some((prefix) => pathname.startsWith(prefix));
  }
  if (itemPath === "/customer/payments") {
    return [
      "/customer/payments",
      "/customer/deposit-payments",
      "/customer/check-in-payments",
      "/customer/checkout-payments",
    ].some((prefix) => pathname.startsWith(prefix));
  }
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
};

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>(getRoleFromPathname(location.pathname));
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const toggleNotificationDropdown = async () => {
    if (!showNotificationDropdown) {
      try {
        const data = await notificationService.getMine();
        setNotificationsList(data.items);
      } catch (err) {
        console.error(err);
      }
    }
    setShowNotificationDropdown(!showNotificationDropdown);
  };

  const getNotificationLink = (n: any) => {
    const content = n.content;
    const title = n.title.toLowerCase();
    if (title.includes("nhận phòng") || content.toLowerCase().includes("nhận phòng")) {
      const depositMatch = content.match(/DC[a-zA-Z0-9]+/);
      if (depositMatch) {
        return `/${currentRole}/contracts?action=checkin&ref=${depositMatch[0]}`;
      }
      return `/${currentRole}/contracts`;
    }
    if (title.includes("trả phòng") || content.toLowerCase().includes("trả phòng")) {
      const contractMatch = content.match(/HD[a-zA-Z0-9]+/);
      if (contractMatch) {
        return `/${currentRole}/checkout-contract?contractId=${contractMatch[0]}`;
      }
      return `/${currentRole}/checkout-contract`;
    }
    if (title.includes("cọc") || content.toLowerCase().includes("cọc")) {
      return `/${currentRole}/contracts`;
    }
    if (title.includes("đăng ký") || content.toLowerCase().includes("đăng ký")) {
      return `/${currentRole}/registrations`;
    }
    return `/${currentRole}/notifications`;
  };

  useEffect(() => {
    setShowNotificationDropdown(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!showNotificationDropdown) return;
    const handleClose = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".notification-trigger-container")) {
        setShowNotificationDropdown(false);
      }
    };
    document.addEventListener("click", handleClose);
    return () => document.removeEventListener("click", handleClose);
  }, [showNotificationDropdown]);

  useEffect(() => {
    setCurrentRole(getRoleFromPathname(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    const token = getStoredToken();
    const user = getStoredUser();
    if (!token || !user) {
      navigate("/login", { replace: true });
      return;
    }
    const allowedRoot = `/${mapRoleIdToPath(user.roleId)}`;
    const currentRoot = location.pathname === "/" ? "/customer" : `/${location.pathname.split("/")[1]}`;
    if (currentRoot !== allowedRoot) {
      navigate(allowedRoot, { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    const loadUnread = () => notificationService.getMine().then((data) => setUnreadNotifications(data.unreadCount)).catch(() => undefined);
    loadUnread();
    const refreshTimer = window.setInterval(loadUnread, 10_000);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") loadUnread();
    };
    window.addEventListener("notifications-updated", loadUnread);
    window.addEventListener("focus", loadUnread);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.clearInterval(refreshTimer);
      window.removeEventListener("notifications-updated", loadUnread);
      window.removeEventListener("focus", loadUnread);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [location.pathname]);

  const roleNavigation = {
    customer: [
      { name: "Tìm phòng", path: "/customer/rooms", icon: Search },
      { name: "Phòng của tôi", path: "/customer/my-rooms", icon: Building2 },
      { name: "Thanh toán", path: "/customer/payments", icon: CreditCard },
      { name: "Thông báo", path: "/customer/notifications", icon: Bell },
    ],
    sales: [
      { name: "Trang chủ", path: "/sales", icon: Home },
      { name: "Tra cứu phòng", path: "/sales/rooms", icon: Building2 },
      { name: "Tiếp nhận ĐK", path: "/sales/registrations", icon: Users },
      { name: "Tra cứu HĐ", path: "/sales/contracts", icon: FileText },
      { name: "Lập HĐ cọc", path: "/sales/deposit-contract", icon: FilePlus },
      { name: "Lập HĐ thuê", path: "/sales/rental-contract", icon: FileCheck },
      { name: "Trả phòng", path: "/sales/checkout-contract", icon: DoorOpen },
      { name: "Thông báo", path: "/sales/notifications", icon: Bell },
    ],
    accountant: [
      { name: "Trang chủ", path: "/accountant", icon: Home },
      { name: "Yêu cầu thanh toán", path: "/accountant/payment-requests", icon: DollarSign },
      { name: "Khoản thu nhận phòng", path: "/accountant/check-in-charges", icon: ClipboardList },
      { name: "Xác nhận thanh toán", path: "/accountant/payment-confirmation", icon: CheckCircle },
      { name: "Đối soát trả phòng", path: "/accountant/reconciliation", icon: Calculator },
      { name: "Thông báo", path: "/accountant/notifications", icon: Bell },
    ],
    manager: [

      { name: "Trang chủ", path: "/manager", icon: Home },
      { name: "Kiểm tra trạng thái phòng", path: "/manager/inspection-status", icon: ClipboardList },
      { name: "Kiểm tra tình trạng phòng", path: "/manager/inspection-conditions", icon: ClipboardList },
      { name: "Xác nhận tiền cọc", path: "/manager/deposit-confirmation", icon: ClipboardList },
      //{ name: "Xác nhận thuê phòng", path: "/manager/contract-approval", icon: FileCheck },
      { name: "Ký hợp đồng thuê", path: "/manager/tenant-verification", icon: UserCheck },
      //{ name: "Thanh lý hợp đồng thuê", path: "/manager/liquidation", icon: ClipboardCheck },
    ],
    "system-admin": [
      { name: "Dashboard", path: "/system-admin", icon: Home },
      { name: "Quản lý người dùng", path: "/system-admin/users", icon: Users },
      { name: "Cài đặt thông số hệ thống", path: "/system-admin/settings", icon: Settings },
      { name: "Quản lý danh mục phòng/giường", path: "/system-admin/rooms", icon: Building2 },
      { name: "Quản lý dịch vụ", path: "/system-admin/services", icon: Sparkles },
      { name: "Thông báo", path: "/system-admin/notifications", icon: Bell },
    ],
  };

  const navigation = roleNavigation[currentRole];

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">HomeStay Dorm</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-3">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentRole === "customer"
                  ? isCustomerNavigationActive(item.path, location.pathname)
                  : location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg transition-colors text-sm whitespace-nowrap ${isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden xl:inline lg:inline-block">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative notification-trigger-container">
                <button
                  onClick={toggleNotificationDropdown}
                  aria-label="Mở thông báo"
                  className="p-2 text-gray-400 hover:text-gray-650 rounded-lg hover:bg-gray-100 relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </span>
                  )}
                </button>

                {showNotificationDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-250 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-gray-150 flex justify-between items-center bg-gray-50/50">
                      <span className="font-bold text-xs text-gray-900">Thông báo mới nhất</span>
                      {unreadNotifications > 0 && (
                        <button
                          onClick={async () => {
                            await notificationService.markAllRead();
                            setNotificationsList(prev => prev.map(n => ({ ...n, isRead: true })));
                            setUnreadNotifications(0);
                            window.dispatchEvent(new Event("notifications-updated"));
                          }}
                          className="text-[10px] text-blue-600 hover:text-blue-755 font-semibold"
                        >
                          Đọc tất cả
                        </button>
                      )}
                    </div>
                    <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                      {notificationsList.length === 0 ? (
                        <div className="p-4 text-center text-xs text-gray-500">Chưa có thông báo mới</div>
                      ) : (
                        notificationsList.slice(0, 5).map((n) => (
                          <div
                            key={n.notificationId}
                            onClick={async () => {
                              if (!n.isRead) {
                                await notificationService.markRead(n.notificationId);
                                setNotificationsList(prev =>
                                  prev.map(item =>
                                    item.notificationId === n.notificationId ? { ...item, isRead: true } : item
                                  )
                                );
                                setUnreadNotifications(prev => Math.max(0, prev - 1));
                                window.dispatchEvent(new Event("notifications-updated"));
                              }
                              const link = getNotificationLink(n);
                              navigate(link);
                              setShowNotificationDropdown(false);
                            }}
                            className={`p-3 text-left block cursor-pointer transition-colors text-xs ${
                              n.isRead ? "bg-white hover:bg-gray-50" : "bg-blue-50 hover:bg-blue-100/50"
                            }`}
                          >
                            <p className={`font-semibold ${n.isRead ? "text-gray-800" : "text-gray-955"}`}>{n.title}</p>
                            <p className="text-gray-600 mt-0.5 line-clamp-2">{n.content}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString("vi-VN")}</p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-2 border-t border-gray-150 text-center bg-gray-50/50">
                      <button
                        onClick={() => {
                          navigate(`/${currentRole}/notifications`);
                          setShowNotificationDropdown(false);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-755 font-bold"
                      >
                        Xem tất cả thông báo
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <User className="w-5 h-5" />
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-gray-600"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {/* Navigation Links */}
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentRole === "customer"
                  ? isCustomerNavigationActive(item.path, location.pathname)
                  : location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg ${isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Logout Mobile */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <ConfirmDialog
        open={showLogoutConfirm}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất không?"
        confirmLabel="Đăng xuất"
        cancelLabel="Ở lại"
        variant="warning"
        onConfirm={async () => {
          setShowLogoutConfirm(false);
          await logout();
          navigate("/login");
          setIsMobileMenuOpen(false);
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}
