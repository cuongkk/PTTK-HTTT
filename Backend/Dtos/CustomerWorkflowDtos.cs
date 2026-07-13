namespace Backend.Dtos;

public record CreateCustomerRentalApplicationRequest(
    string RoomId,
    string FullName,
    string Phone,
    string? Email,
    short NumberOfPeople,
    string Gender,
    string Nationality,
    string DocumentType,
    string DocumentNumber,
    string DocumentImageUrl,
    DateOnly? DateOfBirth,
    string? PermanentAddress,
    string? FinancialDocumentUrl,
    DateOnly ExpectedMoveInDate,
    short ExpectedRentalMonths,
    string? LivingSchedule,
    bool RequiresQuietLifestyle,
    bool RequiresParking,
    bool RequiresAirConditioner,
    string? OtherRequirements);

public record CreateCustomerRentalApplicationResponse(string ApplicationId, string Status, string Message);

public record InitialRentalInformationDto(
    string FullName,
    string Phone,
    string? Email,
    string? Nationality,
    string? DocumentType,
    string? DocumentNumber,
    string? DocumentImageUrl,
    DateOnly? DateOfBirth,
    string? PermanentAddress,
    string? OccupationOrSchool,
    string? FinancialDocumentUrl,
    short NumberOfPeople,
    string? Gender,
    string? DesiredArea,
    string? RoomType,
    decimal? MinimumPrice,
    decimal? MaximumPrice,
    DateOnly? ExpectedMoveInDate,
    short? ExpectedRentalMonths,
    string? LivingSchedule,
    bool RequiresQuietLifestyle,
    bool RequiresParking,
    bool RequiresAirConditioner,
    string? OtherRequirements);

public record ViewedRoomDto(
    string ApplicationId,
    string ScheduleId,
    string RoomId,
    string RoomName,
    string? BedId,
    short? BedNumber,
    string BranchName,
    string RoomType,
    decimal MonthlyRent,
    DateTime ViewedAt,
    string ViewingStatus,
    string ApplicationStatus,
    InitialRentalInformationDto Applicant);

public record DepositRequestDetailDto(
    ViewedRoomDto ViewedRoom,
    decimal EstimatedDepositAmount,
    string DepositFormula,
    string PaymentDueDescription);

public record PrimaryTenantRequest(string Gender, string Nationality);

public record AccompanyingTenantRequest(string FullName, string Gender, string Nationality);

public record SubmitDepositRequest(
    PrimaryTenantRequest PrimaryTenant,
    List<AccompanyingTenantRequest> AccompanyingTenants);

public record SubmitDepositResponse(string ApplicationId, string Status, string Message);

public record CustomerRoomSummaryDto(
    string RoomId,
    string RoomName,
    string? BedId,
    short? BedNumber,
    string BranchName,
    decimal MonthlyRent,
    DateTime RelevantAt,
    string ReferenceId,
    string Status,
    string ApplicationStatus);

public record CustomerContractDetailDto(string RoomId, string RoomName, string BranchName, string RoomType, decimal MonthlyRent, short NumberOfBeds, DateOnly StartDate, DateOnly? EndDate, string ContractStatus, string CustomerName, string ApplicationStatus, string? InvoiceStatus, decimal? AmountDue);

public record CustomerCheckoutDetailDto(string RoomId, string RoomName, string ContractId, string ContractStatus, string? RequestStatus, DateTime? RequestedCheckoutAt, DateTime? ConfirmedInspectionAt, string? Reason, string? RoomCondition, decimal? FinalElectricityReading, decimal? FinalWaterReading, decimal? OriginalDeposit, decimal? TotalDeductions, decimal? RefundAmount, decimal? AdditionalPaymentAmount, string? InvoiceStatus);

public record CustomerTenantDto(string FullName, string? Gender, string? Nationality, DateOnly? DateOfBirth, string? NationalId, string? DocumentImageUrl, string? PermanentAddress, string? OccupationOrSchool);
public record CustomerRoomContextDto(string RoomId, string RoomName, string BranchName, string RoomType, decimal MonthlyRent, string RoomStatus, string CustomerName, string Phone, string? Email, string? NationalId, string? Gender, string? Nationality, DateOnly? DateOfBirth, string? Address, string? ApplicationId, string? ApplicationStatus, short? NumberOfPeople, DateOnly? ExpectedMoveInDate, short? ExpectedRentalMonths, string? DepositId, string? DepositStatus, decimal? DepositAmount, string? ContractId, string? ContractStatus, string? InvoiceId, string? InvoiceStatus, decimal? InvoiceAmount, List<CustomerTenantDto> Tenants);
public record CustomerPaymentDto(string InvoiceId, string PaymentType, string RoomId, string RoomName, decimal Amount, DateTime CreatedAt, DateTime? PaidAt, string Status, string PaymentMethod, string? BankName, string? BankAccountNumber, string? BankAccountHolder, string TransferContent, string? ProofImageUrl);
