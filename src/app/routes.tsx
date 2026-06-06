import { createBrowserRouter } from "react-router";
import { MainLayout } from "./components/layouts/MainLayout";
import { LoginPage } from "./components/auth/LoginPage";
import { CustomerDashboard } from "./components/customer/CustomerDashboard";
import { RoomSearch } from "./components/customer/RoomSearch";
import { RentalRegistration } from "./components/customer/RentalRegistration";
import { CustomerPayments } from "./components/customer/CustomerPayments";
import { SalesDashboard } from "./components/sales/SalesDashboard";
import { RoomManagement } from "./components/sales/RoomManagement";
import { RegistrationManagement } from "./components/sales/RegistrationManagement";
import { ContractManagement } from "./components/sales/ContractManagement";
import { AccountantDashboard } from "./components/accountant/AccountantDashboard";
import { PaymentRequests } from "./components/accountant/PaymentRequests";
import { PaymentConfirmation } from "./components/accountant/PaymentConfirmation";
import { Reconciliation } from "./components/accountant/Reconciliation";
import { ManagerDashboard } from "./components/manager/ManagerDashboard";
import { RoomInspection } from "./components/manager/RoomInspection";
import { ContractApproval } from "./components/manager/ContractApproval";
import { TenantVerification } from "./components/manager/TenantVerification";
import { ContractLiquidation } from "./components/manager/ContractLiquidation";
import { SystemAdminDashboard } from "./components/system-admin/SystemAdminDashboard";
import { UserManagement } from "./components/system-admin/UserManagement";
import { SystemSettings } from "./components/system-admin/SystemSettings";
import { RoomBedCatalog } from "./components/system-admin/RoomBedCatalog";
import { ServiceCatalog } from "./components/system-admin/ServiceCatalog";
import { NotFound } from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: MainLayout,
    children: [
      // Customer Routes
      {
        path: "",
        Component: CustomerDashboard,
      },
      {
        path: "customer",
        children: [
          { index: true, Component: CustomerDashboard },
          { path: "rooms", Component: RoomSearch },
          { path: "register", Component: RentalRegistration },
          { path: "payments", Component: CustomerPayments },
        ],
      },
      // Sales Staff Routes
      {
        path: "sales",
        children: [
          { index: true, Component: SalesDashboard },
          { path: "rooms", Component: RoomManagement },
          { path: "registrations", Component: RegistrationManagement },
          { path: "contracts", Component: ContractManagement },
        ],
      },
      // Accountant Routes
      {
        path: "accountant",
        children: [
          { index: true, Component: AccountantDashboard },
          { path: "payment-requests", Component: PaymentRequests },
          { path: "payment-confirmation", Component: PaymentConfirmation },
          { path: "reconciliation", Component: Reconciliation },
        ],
      },
      // Manager Routes
      {
        path: "manager",
        children: [
          { index: true, Component: ManagerDashboard },
          { path: "inspection", Component: RoomInspection },
          { path: "contract-approval", Component: ContractApproval },
          { path: "tenant-verification", Component: TenantVerification },
          { path: "liquidation", Component: ContractLiquidation },
        ],
      },
      {
        path: "system-admin",
        children: [
          { index: true, Component: SystemAdminDashboard },
          { path: "users", Component: UserManagement },
          { path: "settings", Component: SystemSettings },
          { path: "rooms", Component: RoomBedCatalog },
          { path: "services", Component: ServiceCatalog },
        ],
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);
