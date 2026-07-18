import type { RouteObject } from "react-router";
import { ManagerDashboard } from "../components/manager/ManagerDashboard";
// Import lại các component từ nhánh HEAD cũ của bạn
import { RoomInspectionStatus } from "../components/manager/RoomInpectionsStatus"; // Nhớ check lại xem chính xác là Inpections hay Inspections nhé bạn, ở HEAD cũ đang gõ thiếu chữ 's' á
import { RoomInspectionConditions } from "../components/manager/RoomInspectionConditions";
import { DepositConfirmation } from "../components/manager/DepositConfirmation";
import { ManagerHandover } from "../components/manager/ManagerHandover";
// Các component hiện tại
import { ContractApproval } from "../components/manager/ContractApproval";
import { TenantVerification } from "../components/manager/TenantVerification";
import { NotificationCenter } from "../components/notifications/NotificationCenter";

export const managerRoutes: RouteObject = { 
  path: "manager", 
  children: [
    { index: true, Component: ManagerDashboard }, 
    
    // Cập nhật lại 2 trang inspection theo đúng nhánh HEAD cũ
    { path: "inspection-status", Component: RoomInspectionStatus },
    { path: "inspection-conditions", Component: RoomInspectionConditions },
    
    // Mang trang xác nhận đặt cọc quay trở lại
    { path: "deposit-confirmation", Component: DepositConfirmation },
    { path: "handovers", Component: ManagerHandover },
    
    // Giữ nguyên các trang còn lại
    //{ path: "contract-approval", Component: ContractApproval }, 
    { path: "tenant-verification", Component: TenantVerification },
    { path: "notifications", Component: NotificationCenter },
  ] 
};
