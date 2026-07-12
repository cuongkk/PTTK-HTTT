namespace Backend.Dtos;

public record InitialRentalInformationDto(
    string FullName,
    string Phone,
    string? Email,
    string? Nationality,
    string? DocumentType,
    string? DocumentNumber,
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

public record PrimaryTenantRequest(
    string Gender,
    string DocumentNumber,
    string OccupationOrSchool,
    string? DocumentImageUrl);

public record AccompanyingTenantRequest(string FullName, string Gender, string DocumentNumber, string? DocumentImageUrl, string OccupationOrSchool);

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
    string Status);
