namespace Backend.Dtos;

public record LoginRequest(string Username, string Password);

public record LoginResponse(
    string Token,
    DateTime ExpiresAt,
    string AccountId,
    string Username,
    string RoleId,
    string RoleName,
    string DisplayName
);
