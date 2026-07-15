import type { RouteObject } from "react-router";
import { Navigate } from "react-router";
import { RentalRegistration } from "../components/customer/RentalRegistration";
import { CustomerPayments } from "../components/customer/CustomerPayments";
import { CustomerRooms, ViewingAppointment, DepositRequest, DepositTermsConfirmation, DepositPayment, CustomerCheckIn, CheckInPayment, HandoverConfirmation, CheckoutRequestPage, CheckoutReconciliation, CheckoutSettlement, LiquidationConfirmation } from "../components/customer/CustomerWorkflowPages";
import { NotificationCenter } from "../components/notifications/NotificationCenter";

export const customerRoutes: RouteObject = {
  path: "customer",
  children: [
    { index: true, element: <Navigate to="/customer/my-rooms" replace /> },
    { path: "register", Component: RentalRegistration }, { path: "my-rooms", Component: CustomerRooms }, { path: "viewings/:scheduleId", Component: ViewingAppointment },
    { path: "deposit-requests/:depositRequestId", Component: DepositRequest }, { path: "deposit-terms/:depositTermsId", Component: DepositTermsConfirmation }, { path: "deposit-payments/:paymentRequestId", Component: DepositPayment },
    { path: "check-ins/:checkInId", Component: CustomerCheckIn }, { path: "check-in-payments/:paymentRequestId", Component: CheckInPayment },
    { path: "handovers/:handoverId", Component: HandoverConfirmation }, { path: "checkouts/:checkoutId/request", Component: CheckoutRequestPage }, { path: "checkouts/:checkoutId/reconciliation", Component: CheckoutReconciliation },
    { path: "checkout-payments/:settlementId", Component: CheckoutSettlement }, { path: "checkouts/:checkoutId/liquidation", Component: LiquidationConfirmation },
    { path: "payments", Component: CustomerPayments }, { path: "notifications", Component: NotificationCenter },
  ],
};
