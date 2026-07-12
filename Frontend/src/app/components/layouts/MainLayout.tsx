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
    window.addEventListener("notifications-updated", loadUnread);
    return () => window.removeEventListener("notifications-updated", loadUnread);
  }, [location.pathname]);

  const roleNavigation = {
    customer: [
      { name: "Tổng quan", path: "/customer", icon: Home },
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
    ],
    accountant: [
      { name: "Trang chủ", path: "/accountant", icon: Home },
      { name: "Yêu cầu thanh toán", path: "/accountant/payment-requests", icon: DollarSign },
      { name: "Khoản thu nhận phòng", path: "/accountant/check-in-charges", icon: ClipboardList },
      { name: "Xác nhận thanh toán", path: "/accountant/payment-confirmation", icon: CheckCircle },
      { name: "Đối soát trả phòng", path: "/accountant/reconciliation", icon: Calculator },
    ],
    manager: [
      { name: "Trang chủ", path: "/manager", icon: Home },
      { name: "Kiểm tra trạng thái phòng", path: "/manager/inspection-status", icon: ClipboardList },
      { name: "Kiểm tra tình trạng phòng", path: "/manager/inspection-conditions", icon: ClipboardList },
      { name: "Xác nhận tiền cọc", path: "/manager/deposit-confirmation", icon: ClipboardList },
      { name: "Xác nhận thuê phòng", path: "/manager/contract-approval", icon: FileCheck },
      { name: "Ký hợp đồng thuê", path: "/manager/tenant-verification", icon: UserCheck },
      { name: "Thanh lý hợp đồng thuê", path: "/manager/liquidation", icon: ClipboardCheck },
    ],
    "system-admin": [
      { name: "Dashboard", path: "/system-admin", icon: Home },
      { name: "Quản lý người dùng", path: "/system-admin/users", icon: Users },
      { name: "Cài đặt thông số hệ thống", path: "/system-admin/settings", icon: Settings },
      { name: "Quản lý danh mục phòng/giường", path: "/system-admin/rooms", icon: Building2 },
      { name: "Quản lý dịch vụ", path: "/system-admin/services", icon: Sparkles },
    ],
  };

  const navigation = roleNavigation[currentRole];

  const handleLogout = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) return;
    await logout();
    navigate("/login");
    setIsMobileMenuOpen(false);
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
              <button onClick={() => navigate(`/${currentRole}/notifications`)} aria-label="Mở thông báo" className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 relative">
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{unreadNotifications > 9 ? "9+" : unreadNotifications}</span>}
              </button>

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
    </div>
  );
}
