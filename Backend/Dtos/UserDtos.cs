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

public record UserDetailDto(
    string AccountId,
    string Username,
    string? Email,
    string RoleId,
    string RoleName,
    string Status,
    DateTime? LastLoginAt,
    DateTime CreatedAt,
    string OwnerType, // "employee" | "customer"
    string? EmployeeId,
    string? CustomerId,
    string FullName,
    string? PhoneNumber,
    // Nhân viên
    string? BranchId,
    string? BranchName,
    DateOnly? HireDate,
    // Khách hàng
    string? NationalId,
    string? Gender,
    string? Nationality,
    DateOnly? DateOfBirth,
    string? Address
);

public record CreateUserRequest(
    string FullName,
    string Email,
    string RoleId,
    string Password,
    string? PhoneNumber,
    // Nhân viên
    string? BranchId,
    // Khách hàng
    string? NationalId,
    string? Gender,
    string? Nationality,
    DateOnly? DateOfBirth,
    string? Address
);

public record UpdateUserRequest(
    string FullName,
    string? PhoneNumber,
    string RoleId,
    string Status,
    string? Password,
    // Nhân viên
    string? BranchId,
    DateOnly? HireDate,
    // Khách hàng
    string? NationalId,
    string? Gender,
    string? Nationality,
    DateOnly? DateOfBirth,
    string? Address
);

public record ResetPasswordResponse(string NewPassword);
