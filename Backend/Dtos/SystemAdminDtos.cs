namespace Backend.Dtos;

public record AdminDashboardDto(
    int TotalAccounts,
    int ActiveAccounts,
    int TotalRoles,
    int TotalPermissions,
    int TotalRooms,
    int EmptyRooms,
    int RentedRooms,
    int TotalBeds,
    int EmptyBeds,
    int TotalServices,
    int ActiveServices,
    int TotalSystemParameters,
    int ActiveResidenceRules
);

public record PermissionDto(string PermissionId, string PermissionName, string? Description);
public record RoleAccessDto(string RoleId, string RoleName, string? Description, int AccountCount, List<string> PermissionIds);
public record AccessMatrixDto(List<RoleAccessDto> Roles, List<PermissionDto> Permissions);
public record UpdateRolePermissionsRequest(List<string> PermissionIds);

public record AdminResidenceRuleDto(
    string ResidenceRuleId,
    string BranchId,
    string BranchName,
    string Title,
    string Content,
    string RuleType,
    string ViolationLevel,
    decimal? DefaultPenaltyAmount,
    DateOnly EffectiveFrom,
    DateOnly? EffectiveTo,
    string Status
);
public record SaveResidenceRuleRequest(
    string BranchId,
    string Title,
    string Content,
    string RuleType,
    string ViolationLevel,
    decimal? DefaultPenaltyAmount,
    DateOnly EffectiveFrom,
    DateOnly? EffectiveTo,
    string Status
);

public record AdminAmenityDto(string AmenityId, string AmenityName, string? Description, bool IsActive, int RoomCount);
public record SaveAmenityRequest(string AmenityName, string? Description, bool IsActive);
public record RoomAmenityAdminDto(string RoomId, string RoomName, string AmenityId, string AmenityName, short Quantity, string? Note);
public record SaveRoomAmenityRequest(string AmenityId, short Quantity, string? Note);

public record AdminRoomImageDto(string RoomImageId, string RoomId, string RoomName, string ImageUrl, string? Description, short DisplayOrder, bool IsPrimary);
public record SaveRoomImageRequest(string ImageUrl, string? Description, short DisplayOrder, bool IsPrimary);

public record AdminServiceRateDto(
    string ServiceRateId,
    string ServiceId,
    string ServiceName,
    string ScopeType,
    string TargetId,
    string TargetName,
    decimal UnitPrice,
    bool IsActive
);
public record SaveServiceRateRequest(string ServiceId, string ScopeType, string TargetId, decimal UnitPrice, bool IsActive);
