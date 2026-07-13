namespace Backend.Models;

public class Asset
{
    public string AssetId { get; set; } = default!;
    public string RoomId { get; set; } = default!;
    public string AssetName { get; set; } = default!;
    public string? Description { get; set; }
    public string Condition { get; set; } = "tot";
}

public class RentalApplication
{
    public string ApplicationId { get; set; } = default!;
    public string CustomerId { get; set; } = default!;
    public string? SalesEmployeeId { get; set; }
    public short NumberOfPeople { get; set; }
    public DateOnly? ExpectedMoveInDate { get; set; }
    public short? ExpectedRentalMonths { get; set; }
    public string? DesiredArea { get; set; }
    public string? DesiredRoomId { get; set; }
    public string? DesiredRoomType { get; set; }
    public decimal? MinimumPrice { get; set; }
    public decimal? MaximumPrice { get; set; }
    public string? Gender { get; set; }
    public string? LivingSchedule { get; set; }
    public bool RequiresQuietLifestyle { get; set; }
    public bool RequiresParking { get; set; }
    public bool RequiresAirConditioner { get; set; }
    public string? OtherRequirements { get; set; }
    public string Status { get; set; } = "moi";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Customer Customer { get; set; } = null!;
    public Employee? SalesEmployee { get; set; }
    public Room? DesiredRoom { get; set; }
    public ICollection<RoomViewingSchedule> RoomViewingSchedules { get; set; } = new List<RoomViewingSchedule>();
    public ICollection<DepositSlip> DepositSlips { get; set; } = new List<DepositSlip>();
    public ICollection<TenantMember> TenantMembers { get; set; } = new List<TenantMember>();
}

public class RoomViewingSchedule
{
    public string ScheduleId { get; set; } = default!;
    public string ApplicationId { get; set; } = default!;
    public string SalesEmployeeId { get; set; } = default!;
    public DateTime AppointmentAt { get; set; }
    public string Status { get; set; } = "sap_den";
    public string? Note { get; set; }
    public RentalApplication Application { get; set; } = null!;
    public Employee SalesEmployee { get; set; } = null!;
    public ICollection<RoomViewingScheduleRoom> Rooms { get; set; } = new List<RoomViewingScheduleRoom>();
}

public class RoomViewingScheduleRoom { public string ScheduleId { get; set; } = default!; public string RoomId { get; set; } = default!; }

public class DepositSlip
{
    public string DepositId { get; set; } = default!;
    public string ApplicationId { get; set; } = default!;
    public string SalesEmployeeId { get; set; } = default!;
    public string? ManagerEmployeeId { get; set; }
    public decimal DepositAmount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime PaymentDueAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public string Status { get; set; } = "cho_thanh_toan";
    public string? RefundReason { get; set; }
    public DateTime? RefundRequestedAt { get; set; }
    public decimal? RefundRate { get; set; }
    public decimal? RefundAmount { get; set; }
    public DateTime? RefundedAt { get; set; }
    public RentalApplication Application { get; set; } = null!;
    public Employee SalesEmployee { get; set; } = null!;
    public Employee? ManagerEmployee { get; set; }
    public ICollection<DepositBed> Beds { get; set; } = new List<DepositBed>();
    public RentalContract? Contract { get; set; }
}

public class DepositBed { public string DepositId { get; set; } = default!; public string BedId { get; set; } = default!; }

public class RentalContract
{
    public string ContractId { get; set; } = default!;
    public string DepositId { get; set; } = default!;
    public string CustomerId { get; set; } = default!;
    public string SalesEmployeeId { get; set; } = default!;
    public string RoomId { get; set; } = default!;
    public short NumberOfBeds { get; set; }
    public decimal MonthlyRent { get; set; }
    public string PaymentCycle { get; set; } = "hang_thang";
    public DateOnly SignedDate { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string Status { get; set; } = "hieu_luc";
    public DepositSlip Deposit { get; set; } = null!;
    public Customer Customer { get; set; } = null!;
    public Employee SalesEmployee { get; set; } = null!;
    public Room Room { get; set; } = null!;
    public ICollection<TenantMember> TenantMembers { get; set; } = new List<TenantMember>();
}

public class ResidenceRule
{
    public string ResidenceRuleId { get; set; } = default!;
    public string BranchId { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string Content { get; set; } = default!;
    public string RuleType { get; set; } = default!;
    public string ViolationLevel { get; set; } = "nhac_nho";
    public decimal? DefaultPenaltyAmount { get; set; }
    public DateOnly EffectiveFrom { get; set; }
    public DateOnly? EffectiveTo { get; set; }
    public string Status { get; set; } = "hieu_luc";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

public class TenantMember
{
    public string TenantMemberId { get; set; } = default!;
    public string? ApplicationId { get; set; }
    public string? CustomerId { get; set; }
    public string? ContractId { get; set; }
    public string FullName { get; set; } = default!;
    public string? NationalId { get; set; }
    public string? Gender { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Nationality { get; set; }
    public string? DocumentType { get; set; }
    public string? DocumentImageUrl { get; set; }
    public string? PermanentAddress { get; set; }
    public string? OccupationOrSchool { get; set; }
    public string? FinancialDocumentUrl { get; set; }
    public bool IsPrimaryTenant { get; set; }
    public string? RelationshipToPrimary { get; set; }
    public bool IsEligible { get; set; } = true;
    public string? Note { get; set; }
}

public class HandoverReport
{
    public string HandoverId { get; set; } = default!;
    public string ContractId { get; set; } = default!;
    public string ManagerEmployeeId { get; set; } = default!;
    public DateOnly HandoverDate { get; set; }
    public string? RoomCondition { get; set; }
    public decimal? InitialElectricityReading { get; set; }
    public decimal? InitialWaterReading { get; set; }
    public string? Note { get; set; }
    public ICollection<HandoverDetail> AssetDetails { get; set; } = new List<HandoverDetail>();
}

public class HandoverDetail
{
    public string HandoverId { get; set; } = default!;
    public string AssetId { get; set; } = default!;
    public short Quantity { get; set; } = 1;
    public string? Condition { get; set; }
    public string? Note { get; set; }
}

public class Reconciliation
{
    public string ReconciliationId { get; set; } = default!;
    public string ContractId { get; set; } = default!;
    public string AccountantEmployeeId { get; set; } = default!;
    public string? ManagerEmployeeId { get; set; }
    public DateOnly CreatedDate { get; set; }
    public decimal RefundRate { get; set; }
    public decimal OriginalDeposit { get; set; }
    public decimal BaseRefund { get; set; }
    public decimal TotalDeductions { get; set; }
    public decimal? RefundAmount { get; set; }
    public decimal? AdditionalPaymentAmount { get; set; }
    public string Status { get; set; } = "cho_xac_nhan";
}

public class AdditionalCost
{
    public string AdditionalCostId { get; set; } = default!;
    public string ReconciliationId { get; set; } = default!;
    public string CostType { get; set; } = default!;
    public decimal Amount { get; set; }
    public string? Description { get; set; }
}

public class CheckoutReport
{
    public string CheckoutReportId { get; set; } = default!;
    public string ReconciliationId { get; set; } = default!;
    public string ManagerEmployeeId { get; set; } = default!;
    public DateOnly CheckoutDate { get; set; }
    public string? RoomCondition { get; set; }
    public decimal? FinalElectricityReading { get; set; }
    public decimal? FinalWaterReading { get; set; }
    public bool KeysReturned { get; set; }
    public string? Note { get; set; }
}

public class CheckoutRequest
{
    public string CheckoutRequestId { get; set; } = default!;
    public string ContractId { get; set; } = default!;
    public string CustomerId { get; set; } = default!;
    public string? SalesEmployeeId { get; set; }
    public string? ManagerEmployeeId { get; set; }
    public string? ReconciliationId { get; set; }
    public DateTime RequestedCheckoutAt { get; set; }
    public DateTime? ConfirmedInspectionAt { get; set; }
    public string Reason { get; set; } = default!;
    public string Status { get; set; } = "cho_tiep_nhan";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? Note { get; set; }
}

public class Invoice
{
    public string InvoiceId { get; set; } = default!;
    public string CustomerId { get; set; } = default!;
    public string? AccountantEmployeeId { get; set; }
    public string? DepositId { get; set; }
    public string? ContractId { get; set; }
    public string? ReconciliationId { get; set; }
    public string InvoiceType { get; set; } = default!;
    public string DocumentType { get; set; } = "thu";
    public decimal TotalAmount { get; set; }
    public string PaymentMethod { get; set; } = "chuyen_khoan";
    public string? BankName { get; set; }
    public string? BankAccountNumber { get; set; }
    public string? BankAccountHolder { get; set; }
    public string? TransactionId { get; set; }
    public string? ProofImageUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PaidAt { get; set; }
    public string Status { get; set; } = "cho_thanh_toan";
    public DateOnly? BillingPeriod { get; set; }
    public string? Note { get; set; }
}

public class InvoiceServiceDetail
{
    public string InvoiceId { get; set; } = default!;
    public string ServiceId { get; set; } = default!;
    public decimal Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public decimal Amount { get; set; }
    public string? Note { get; set; }
}

public class AdminAuditLog
{
    public string AuditLogId { get; set; } = default!;
    public string ActorAccountId { get; set; } = default!;
    public string? TargetAccountId { get; set; }
    public string ActionType { get; set; } = default!;
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
    public string? Note { get; set; }
}

public class Notification
{
    public string NotificationId { get; set; } = default!;
    public string? SenderAccountId { get; set; }
    public string RecipientAccountId { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string Content { get; set; } = default!;
    public string NotificationType { get; set; } = "he_thong";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
}
