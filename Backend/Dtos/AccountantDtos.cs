using System;

namespace Backend.Dtos;

public class ContractInvoiceInfoDto
{
    public string Id { get; set; } = default!;
    public string ContractId { get; set; } = default!;
    public string CustomerId { get; set; } = default!;
    public string CustomerName { get; set; } = default!;
    public string RoomName { get; set; } = default!;
}

public class CreateInvoiceRequest
{
    public string CustomerId { get; set; } = default!;
    public string? DepositId { get; set; }
    public string? ContractId { get; set; }
    public string? ReconciliationId { get; set; }
    public string InvoiceType { get; set; } = default!; // tien_coc, tien_thue, dich_vu, hoan_coc, thu_them
    public decimal TotalAmount { get; set; }
    public DateTime? DueDate { get; set; }
    public DateOnly? BillingCycle { get; set; }
    public string? Notes { get; set; }
}

public class InvoiceDto
{
    public string InvoiceId { get; set; } = default!;
    public string CustomerId { get; set; } = default!;
    public string CustomerName { get; set; } = default!;
    public string RoomName { get; set; } = default!;
    public string InvoiceType { get; set; } = default!;
    public string DocumentType { get; set; } = "thu";
    public decimal TotalAmount { get; set; }
    public string PaymentMethod { get; set; } = "chuyen_khoan";
    public string? BankName { get; set; }
    public string? AccountNumber { get; set; }
    public string? AccountName { get; set; }
    public string? TransactionId { get; set; }
    public string? ProofImage { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public string Status { get; set; } = default!;
    public DateTime? DueDate { get; set; }
    public DateOnly? BillingCycle { get; set; }
    public string? Notes { get; set; }
}

public class CheckInContractDto
{
    public string Id { get; set; } = default!;
    public string ContractId { get; set; } = default!;
    public string CustomerName { get; set; } = default!;
    public string RoomName { get; set; } = default!;
    public string MoveInDate { get; set; } = default!;
    public string EndDate { get; set; } = default!;
    public short BedCount { get; set; }
    public decimal RentPrice { get; set; }
    public string PaymentCycle { get; set; } = default!;
    public decimal DepositAmount { get; set; }
    public decimal FirstMonthRent { get; set; }
    public decimal ServiceFee { get; set; }
    public bool IsComplete { get; set; }
}

public class SaveCheckInChargesDto
{
    public string ContractId { get; set; } = default!;
    public decimal FirstMonthRent { get; set; }
    public decimal OtherFees { get; set; }
    public string? Notes { get; set; }
}

public class ReconciliationListItemDto
{
    public string ReconciliationId { get; set; } = default!;
    public string ContractId { get; set; } = default!;
    public string CustomerId { get; set; } = default!;
    public string CustomerName { get; set; } = default!;
    public string RoomName { get; set; } = default!;
    public string MoveInDate { get; set; } = default!;
    public string MoveOutDate { get; set; } = default!;
    public decimal Deposit { get; set; }
    public decimal MonthlyRent { get; set; }
    public decimal RefundRate { get; set; }
    public decimal BaseRefundAmount { get; set; }
    public decimal Damages { get; set; }
    public decimal UnpaidUtilities { get; set; }
    public decimal RentArrears { get; set; }
    public decimal ViolationFines { get; set; }
    public decimal OtherDeductions { get; set; }
    public string? OtherDeductionsNote { get; set; }
    public decimal RefundAmount { get; set; }
    public string Status { get; set; } = default!;
    public string? RefundMethod { get; set; }
    public string? BankName { get; set; }
    public string? AccountNumber { get; set; }
}

public class SaveReconciliationDeductionsDto
{
    public string ReconciliationId { get; set; } = default!;
    public decimal Damages { get; set; }
    public decimal Utilities { get; set; }
    public decimal RentArrears { get; set; }
    public decimal ViolationFines { get; set; }
    public decimal OtherDeductions { get; set; }
    public string? OtherDeductionsNote { get; set; }
    public string? Notes { get; set; }
}

public class ProcessRefundDto
{
    public string ReconciliationId { get; set; } = default!;
    public string Method { get; set; } = default!; // transfer, cash
    public string? BankName { get; set; }
    public string? AccountNumber { get; set; }
    public string? AccountName { get; set; }
}

public class RejectPaymentRequest
{
    public string Reason { get; set; } = default!;
}
