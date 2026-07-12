import type { RouteObject } from "react-router";
import { ManagerDashboard } from "../components/manager/ManagerDashboard";
import { RoomInspection } from "../components/manager/RoomInspection";
import { ContractApproval } from "../components/manager/ContractApproval";
import { TenantVerification } from "../components/manager/TenantVerification";
import { ContractLiquidation } from "../components/manager/ContractLiquidation";
import { NotificationCenter } from "../components/notifications/NotificationCenter";

export const managerRoutes: RouteObject = { path: "manager", children: [
  { index: true, Component: ManagerDashboard }, { path: "inspection", Component: RoomInspection },
  { path: "contract-approval", Component: ContractApproval }, { path: "tenant-verification", Component: TenantVerification },
  { path: "liquidation", Component: ContractLiquidation }, { path: "notifications", Component: NotificationCenter },
] };
