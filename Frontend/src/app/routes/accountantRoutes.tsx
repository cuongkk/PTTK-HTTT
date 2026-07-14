import type { RouteObject } from "react-router";
import { AccountantDashboard } from "../components/accountant/AccountantDashboard";
import { PaymentRequests } from "../components/accountant/PaymentRequests";
import { PaymentConfirmation } from "../components/accountant/PaymentConfirmation";
import { CreateReconciliation } from "../components/accountant/CreateReconciliation";
import { PerformRefund } from "../components/accountant/PerformRefund";
import { CheckInCharges } from "../components/accountant/CheckInCharges";
import { NotificationCenter } from "../components/notifications/NotificationCenter";

export const accountantRoutes: RouteObject = { path: "accountant", children: [
  { index: true, Component: AccountantDashboard }, { path: "payment-requests", Component: PaymentRequests },
  { path: "payment-confirmation", Component: PaymentConfirmation }, { path: "check-in-charges", Component: CheckInCharges },
  { path: "create-reconciliation", Component: CreateReconciliation }, { path: "perform-refund", Component: PerformRefund },
  { path: "notifications", Component: NotificationCenter },
] };
