import type { RouteObject } from "react-router";
import { SalesDashboard } from "../components/sales/SalesDashboard";
import { RoomManagement } from "../components/sales/RoomManagement";
import { RegistrationManagement } from "../components/sales/RegistrationManagement";
import { ContractManagement } from "../components/sales/ContractManagement";
import { CreateDepositContract } from "../components/sales/CreateDepositContract";
import { CreateRentalContract } from "../components/sales/CreateRentalContract";
import { CheckoutContract } from "../components/sales/CheckoutContract";
import { NotificationCenter } from "../components/notifications/NotificationCenter";

export const salesRoutes: RouteObject = { path: "sales", children: [
  { index: true, Component: SalesDashboard }, { path: "rooms", Component: RoomManagement },
  { path: "registrations", Component: RegistrationManagement }, { path: "contracts", Component: ContractManagement },
  { path: "deposit-contract", Component: CreateDepositContract }, { path: "rental-contract", Component: CreateRentalContract },
  { path: "checkout-contract", Component: CheckoutContract }, { path: "notifications", Component: NotificationCenter },
] };
