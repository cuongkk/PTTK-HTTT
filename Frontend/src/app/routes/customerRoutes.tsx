import type { RouteObject } from "react-router";
import { CustomerDashboard } from "../components/customer/CustomerDashboard";
import { RoomSearch } from "../components/customer/RoomSearch";
import { RentalRegistration } from "../components/customer/RentalRegistration";
import { CustomerPayments } from "../components/customer/CustomerPayments";
import { CustomerRooms, DepositRequest, DepositPayment, CustomerCheckIn, CheckInPayment, HandoverConfirmation, CheckoutRequestPage, CheckoutReconciliation, CheckoutSettlement, LiquidationConfirmation } from "../components/customer/CustomerWorkflowPages";
import { NotificationCenter } from "../components/notifications/NotificationCenter";

export const customerRoutes: RouteObject = {
  path: "customer",
  children: [
    { index: true, Component: CustomerDashboard }, { path: "rooms", Component: RoomSearch },
    { path: "rooms/:roomId/register", Component: RentalRegistration }, { path: "my-rooms", Component: CustomerRooms },
    { path: "deposit-requests/:depositRequestId", Component: DepositRequest }, { path: "deposit-payments/:paymentRequestId", Component: DepositPayment },
    { path: "check-ins/:checkInId", Component: CustomerCheckIn }, { path: "check-in-payments/:paymentRequestId", Component: CheckInPayment },
    { path: "handovers/:handoverId", Component: HandoverConfirmation }, { path: "checkouts/:checkoutId/request", Component: CheckoutRequestPage }, { path: "checkouts/:checkoutId/reconciliation", Component: CheckoutReconciliation },
    { path: "checkout-payments/:settlementId", Component: CheckoutSettlement }, { path: "checkouts/:checkoutId/liquidation", Component: LiquidationConfirmation },
    { path: "payments", Component: CustomerPayments }, { path: "notifications", Component: NotificationCenter },
  ],
};
