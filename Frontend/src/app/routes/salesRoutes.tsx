import { Navigate, type RouteObject } from "react-router";
import { RoomManagement } from "../components/sales/RoomManagement";
import { RegistrationManagement } from "../components/sales/RegistrationManagement";
import { CreateDepositContract } from "../components/sales/CreateDepositContract";
import { CreateRentalContract } from "../components/sales/CreateRentalContract";
import { CheckoutContract } from "../components/sales/CheckoutContract";
import { NotificationCenter } from "../components/notifications/NotificationCenter";

export const salesRoutes: RouteObject = { path: "sales", children: [
  { index: true, element: <Navigate to="registrations" replace /> }, { path: "rooms", Component: RoomManagement },
  { path: "registrations", Component: RegistrationManagement }, { path: "contracts", element: <Navigate to="/sales/registrations?tab=contracts" replace /> },
  { path: "deposit-contract", Component: CreateDepositContract }, { path: "rental-contract", Component: CreateRentalContract },
  { path: "checkout-contract", Component: CheckoutContract }, { path: "notifications", Component: NotificationCenter },
] };
