using System;
using System.Collections.Generic;

namespace Backend.Dtos;

public record RecentRegistrationDto(
    string ApplicationId,
    string CustomerName,
    string DesiredRoomType,
    string DesiredArea,
    decimal? MinPrice,
    decimal? MaxPrice,
    DateTime CreatedAt,
    string Status
);

public record UpcomingAppointmentDto(
    string ScheduleId,
    string CustomerName,
    string RoomName,
    string BranchName,
    DateTime AppointmentAt,
    string Type
);

public record PendingTaskDto(
    string Text,
    bool Urgent
);

public record SalesDashboardDto(
    int VacantRoomsCount,
    int NewApplicationsTodayCount,
    int PendingDepositsCount,
    int TodayAppointmentsCount,
    List<RecentRegistrationDto> RecentRegistrations,
    List<UpcomingAppointmentDto> UpcomingAppointments,
    List<PendingTaskDto> PendingTasks
);

public record SalesApplicationDto(
    string ApplicationId,
    string CustomerName,
    string PhoneNumber,
    string? Email,
    string Gender,
    string Area,
    int Capacity,
    string PriceRange,
    string RoomName,
    string? RoomId,
    string? ScheduleId,
    DateTime? AppointmentAt,
    bool AppointmentSent,
    string Status,
    DateTime CreatedAt,
    string Note,
    bool HasContract = false,
    List<SalesTenantMemberDto>? Tenants = null,
    string? DesiredRoomType = null,
    DateOnly? ExpectedMoveInDate = null,
    short? ExpectedRentalMonths = null,
    string? LivingSchedule = null,
    bool RequiresQuietLifestyle = false,
    bool RequiresParking = false,
    bool RequiresAirConditioner = false,
    decimal? MinimumPrice = null,
    decimal? MaximumPrice = null,
    string? ScheduleStatus = null
);

public record SalesTenantMemberDto(
    string FullName,
    string? Gender,
    string? Nationality,
    DateOnly? DateOfBirth,
    string? NationalId,
    string? DocumentType,
    string? DocumentImageUrl,
    string? PermanentAddress,
    string? OccupationOrSchool,
    bool IsPrimaryTenant,
    bool IsEligible,
    string? Note
);

public record CreateViewingScheduleRequest(
    string RoomId,
    DateTime AppointmentAt,
    string Note
);

public record CreateDepositRequest(
    string ApplicationId,
    string RoomId,
    decimal DepositAmount,
    DateTime HoldUntil
);

public record CreateRentalRequest(
    string DepositId,
    string RoomId,
    DateTime MoveInDate,
    int DurationMonths,
    decimal MonthlyRent,
    string PaymentCycle,
    List<string> Services
);

public record SalesDepositSlipDto(
    string DepositId,
    string ApplicationId,
    string CustomerName,
    string PhoneNumber,
    string RoomName,
    string Area,
    decimal DepositAmount,
    DateTime HoldUntil,
    string Status,
    DateTime CreatedAt,
    string? RefundReason = null,
    bool HasContract = false,
    string? ApplicationStatus = null,
    bool HasPaymentProof = false,
    DateTime? PaidAt = null,
    DateTime? RefundRequestedAt = null,
    string? RoomStatus = null
);

public record CheckoutRequestDto(
    DateTime RequestedCheckoutAt,
    DateTime ExpectedDate,
    string Note,
    string Status
);

public record SalesRentalContractDto(
    string ContractId,
    string CustomerName,
    string PhoneNumber,
    string RoomName,
    DateTime MoveInDate,
    int DurationMonths,
    decimal MonthlyRent,
    List<string> Services,
    string PaymentCycle,
    string DepositRef,
    string Status,
    DateTime CreatedAt,
    CheckoutRequestDto? CheckoutRequest
);

public record CheckoutContractRequest(
    DateTime ExpectedDate,
    string Note
);

public record SalesStatusReasonRequest(
    string Reason
);
