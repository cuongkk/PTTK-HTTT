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

type UserRole = "customer" | "sales" | "accountant" | "manager" | "system-admin";

const getRoleFromPathname = (pathname: string): UserRole => {
  if (pathname.startsWith("/sales")) return "sales";
  if (pathname.startsWith("/accountant")) return "accountant";
  if (pathname.startsWith("/manager")) return "manager";
  if (pathname.startsWith("/system-admin")) return "system-admin";

  return "customer";
};

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>(getRoleFromPathname(location.pathname));

  useEffect(() => {
    setCurrentRole(getRoleFromPathname(location.pathname));
  }, [location.pathname]);

  const roleNavigation = {
    customer: [
      { name: "Dashboard", path: "/customer", icon: Home },
      { name: "Search Rooms", path: "/customer/rooms", icon: Search },
      { name: "Register Rental", path: "/customer/register", icon: FileText },
      { name: "My Payments", path: "/customer/payments", icon: CreditCard },
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
      { name: "Dashboard", path: "/manager", icon: Home },
      { name: "Room Inspection", path: "/manager/inspection", icon: ClipboardList },
      { name: "Contract Approval", path: "/manager/contract-approval", icon: FileCheck },
      { name: "Tenant Verification", path: "/manager/tenant-verification", icon: UserCheck },
      { name: "Liquidation", path: "/manager/liquidation", icon: ClipboardCheck },
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

  const handleRoleSwitch = (role: UserRole) => {
    setCurrentRole(role);
    navigate(`/${role}`);
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
                const isActive = location.pathname === item.path;
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
              {/* Role Switcher (Demo) */}
              <select
                value={currentRole}
                onChange={(e) => handleRoleSwitch(e.target.value as UserRole)}
                className="hidden md:block px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="customer">Customer</option>
                <option value="sales">Sales Staff</option>
                <option value="accountant">Accountant</option>
                <option value="manager">Manager</option>
                <option value="system-admin">System Admin</option>
              </select>

              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <User className="w-5 h-5" />
              </button>

              {/* Logout */}
              <button
                onClick={() => navigate("/login")}
                className="hidden md:flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
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
              {/* Role Switcher Mobile */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Switch Role</label>
                <select
                  value={currentRole}
                  onChange={(e) => handleRoleSwitch(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  <option value="customer">Customer</option>
                  <option value="sales">Sales Staff</option>
                  <option value="accountant">Accountant</option>
                  <option value="manager">Manager</option>
                  <option value="system-admin">System Admin</option>
                </select>
              </div>

              {/* Navigation Links */}
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
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
                onClick={() => {
                  navigate("/login");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-3 text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
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
