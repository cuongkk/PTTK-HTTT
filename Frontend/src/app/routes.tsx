import { createBrowserRouter } from "react-router";
import { MainLayout } from "./components/layouts/MainLayout";
import { LoginPage } from "./components/auth/LoginPage";
import { RegisterPage } from "./components/auth/RegisterPage";
import { ForgotPasswordPage } from "./components/auth/ForgotPasswordPage";
import { CustomerDashboard } from "./components/customer/CustomerDashboard";

import { SystemAdminDashboard } from "./components/system-admin/SystemAdminDashboard";
import { UserManagement } from "./components/system-admin/UserManagement";
import { SystemSettings } from "./components/system-admin/SystemSettings";
import { RoomBedCatalog } from "./components/system-admin/RoomBedCatalog";
import { ServiceCatalog } from "./components/system-admin/ServiceCatalog";
import { AccessManagement } from "./components/system-admin/AccessManagement";
import { OperationalCatalogs } from "./components/system-admin/OperationalCatalogs";
import { NotificationCenter } from "./components/notifications/NotificationCenter";
import { NotFound } from "./components/NotFound";

import { customerRoutes } from "./routes/customerRoutes";
import { salesRoutes } from "./routes/salesRoutes";
import { managerRoutes } from "./routes/managerRoutes";
import { accountantRoutes } from "./routes/accountantRoutes";

export const router = createBrowserRouter([
  { path: "/login", Component: LoginPage },
  { path: "/register", Component: RegisterPage },
  { path: "/forgot-password", Component: ForgotPasswordPage },
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: CustomerDashboard },
      customerRoutes,
      salesRoutes,
      managerRoutes,
      accountantRoutes,
      { path: "system-admin", children: [
        { index: true, Component: SystemAdminDashboard }, { path: "users", Component: UserManagement },
        { path: "settings", Component: SystemSettings }, { path: "rooms", Component: RoomBedCatalog },
        { path: "services", Component: ServiceCatalog }, { path: "access", Component: AccessManagement },
        { path: "catalogs", Component: OperationalCatalogs }, { path: "notifications", Component: NotificationCenter },
      ] },
      { path: "*", Component: NotFound },
    ],
  },
]);
