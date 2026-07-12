import type { RouteObject } from "react-router";
import { AccountantDashboard } from "../components/accountant/AccountantDashboard";
import { PaymentRequests } from "../components/accountant/PaymentRequests";
import { PaymentConfirmation } from "../components/accountant/PaymentConfirmation";
import { Reconciliation } from "../components/accountant/Reconciliation";
import { CheckInCharges } from "../components/accountant/CheckInCharges";
import { NotificationCenter } from "../components/notifications/NotificationCenter";

export const accountantRoutes: RouteObject = { path: "accountant", children: [
  { index: true, Component: AccountantDashboard }, { path: "payment-requests", Component: PaymentRequests },
  { path: "payment-confirmation", Component: PaymentConfirmation }, { path: "check-in-charges", Component: CheckInCharges },
  { path: "reconciliation", Component: Reconciliation }, { path: "notifications", Component: NotificationCenter },
] };
