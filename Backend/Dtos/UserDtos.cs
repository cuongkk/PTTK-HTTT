namespace Backend.Dtos;

public record UserListItemDto(
    string AccountId,
    string DisplayName,
    string? Email,
    string RoleId,
    string RoleName,
    string Status,
    DateTime? LastLoginAt,
    string OwnerType // "employee" | "customer"
);

public record CreateUserRequest(
    string FullName,
    string Email,
    string RoleId,
    string? PhoneNumber
);

public record CreateUserResponse(UserListItemDto User, string TemporaryPassword);

public record UpdateUserRequest(
    string FullName,
    string? PhoneNumber,
    string RoleId,
    string Status
);

public record ResetPasswordResponse(string NewPassword);
